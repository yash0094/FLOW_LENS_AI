const { mean, stddev, summarize } = require('../utils/stats');

/**
 * FlowLens Bottleneck Engine
 * ---------------------------------
 * Deliberately simple, explainable logic — no machine learning.
 *
 * Input: array of records { item_id, stage, entry_time, exit_time, duration_seconds }
 *
 * Steps:
 *  1. Group durations by stage.
 *  2. Compute per-stage summary stats (mean, median, stddev, IQR).
 *  3. Compute a z-score for each stage's mean duration relative to the
 *     distribution of *stage means* (i.e. "is this stage slower than a
 *     typical stage in this pipeline?").
 *  4. Flag stages as bottlenecks where zScore >= threshold (default 1.0).
 *  5. Within every stage, flag individual items whose duration exceeds
 *     Q3 + 1.5*IQR (classic box-plot outlier rule) as "stuck items".
 *  6. Classify *why* each bottleneck stage is slow using mean + variance,
 *     and attach a plain-English recommendation.
 */

function classifyCause(stageSummary, overallMean) {
  const cv = stageSummary.mean > 0 ? stageSummary.stddev / stageSummary.mean : 0; // coefficient of variation
  const highMean = stageSummary.mean > overallMean;
  const highVariance = cv > 0.6; // more than 60% relative spread = inconsistent
  const outlierShare = stageSummary.outlierCount / Math.max(stageSummary.count, 1);

  if (highMean && highVariance) {
    return {
      cause: 'Inconsistent process',
      explanation:
        'Most items move through reasonably fast, but a meaningful share get stuck much longer than others. ' +
        'This points to an inconsistent process rather than a hard capacity limit — think manual approvals, ' +
        'missing information, exception handling, or a step that only some cases need.',
      recommendation:
        'Investigate the outlier items specifically (see "Stuck Items" below) — look for a common cause ' +
        '(same approver, same customer type, same missing field) and standardize or automate that path.',
    };
  }

  if (highMean && !highVariance) {
    return {
      cause: 'Capacity constraint',
      explanation:
        'This stage is consistently slow for almost everyone who passes through it, with low variability. ' +
        'That pattern usually means the stage itself is under-resourced or rate-limited, not that specific ' +
        'cases are going wrong.',
      recommendation:
        'Consider adding capacity at this stage — more staff/machines, running it in parallel, or ' +
        'pre-allocating time/resources here, since every item pays the same cost.',
    };
  }

  if (outlierShare > 0.15) {
    return {
      cause: 'Exception handling problem',
      explanation:
        'The average time here is close to normal, but a notable fraction of items are taking far longer ' +
        'than the rest (see "Stuck Items"). The everyday case is fine — it is edge cases that are costly.',
      recommendation:
        'Build a fast-track or escalation path for the recurring edge case instead of optimizing the whole stage.',
    };
  }

  return {
    cause: 'Not a significant bottleneck',
    explanation: 'This stage performs close to or better than the rest of the pipeline on average.',
    recommendation: 'No action needed here right now — focus effort on the flagged stages above.',
  };
}

function runAnalysis(records, zThreshold = 1.0) {
  if (!records.length) {
    return { error: 'No records to analyze.' };
  }

  // 1. Group by stage
  const byStage = {};
  for (const r of records) {
    if (!byStage[r.stage]) byStage[r.stage] = [];
    byStage[r.stage].push(r);
  }

  const stageNames = Object.keys(byStage);

  // 2. Per-stage summary
  const stageSummaries = {};
  for (const stage of stageNames) {
    const durations = byStage[stage].map((r) => r.duration_seconds);
    const summary = summarize(durations);
    stageSummaries[stage] = summary;
  }

  // 3. z-score of each stage's mean relative to distribution of stage means
  const stageMeans = stageNames.map((s) => stageSummaries[s].mean);
  const overallMean = mean(stageMeans);
  const overallStd = stddev(stageMeans, overallMean) || 1e-9; // avoid divide-by-zero

  for (const stage of stageNames) {
    const z = (stageSummaries[stage].mean - overallMean) / overallStd;
    stageSummaries[stage].zScore = Number.isFinite(z) ? z : 0;
    stageSummaries[stage].isBottleneck = stageSummaries[stage].zScore >= zThreshold;
  }

  // 4. Outlier ("stuck") items per stage, using that stage's own IQR ceiling
  const stuckItems = [];
  for (const stage of stageNames) {
    const ceiling = stageSummaries[stage].outlierCeiling;
    let count = 0;
    for (const r of byStage[stage]) {
      if (r.duration_seconds > ceiling) {
        count += 1;
        stuckItems.push({
          item_id: r.item_id,
          stage,
          duration_seconds: r.duration_seconds,
          expected_ceiling_seconds: ceiling,
          exceeded_by_seconds: r.duration_seconds - ceiling,
        });
      }
    }
    stageSummaries[stage].outlierCount = count;
  }
  stuckItems.sort((a, b) => b.exceeded_by_seconds - a.exceeded_by_seconds);

  // 5. Cause classification + recommendation per stage
  const stageReports = stageNames
    .map((stage) => {
      const s = stageSummaries[stage];
      const { cause, explanation, recommendation } = classifyCause(s, overallMean);
      return {
        stage,
        ...s,
        cause,
        explanation,
        recommendation,
      };
    })
    .sort((a, b) => b.mean - a.mean);

  const bottleneckStages = stageReports.filter((s) => s.isBottleneck);
  const primaryBottleneck = bottleneckStages[0] || stageReports[0] || null;

  // Overall process totals (avg total time per item across all its stages)
  const itemTotals = {};
  for (const r of records) {
    itemTotals[r.item_id] = (itemTotals[r.item_id] || 0) + r.duration_seconds;
  }
  const totalDurations = Object.values(itemTotals);
  const overallProcessSummary = summarize(totalDurations);

  return {
    generatedAt: new Date().toISOString(),
    zThreshold,
    totalItems: Object.keys(itemTotals).length,
    totalStages: stageNames.length,
    totalRecords: records.length,
    overallMeanStageDuration: overallMean,
    overallStdStageDuration: overallStd,
    overallProcessSummary,
    stageReports,
    bottleneckStages,
    primaryBottleneck,
    stuckItems: stuckItems.slice(0, 50), // cap for report size
    stuckItemCount: stuckItems.length,
    summaryText: buildSummaryText(primaryBottleneck, bottleneckStages, stuckItems.length, stageNames.length),
  };
}

function buildSummaryText(primary, bottlenecks, stuckCount, totalStages) {
  if (!primary) return 'Not enough data to summarize.';
  const parts = [];
  parts.push(
    `Out of ${totalStages} stage(s) analyzed, "${primary.stage}" is the primary bottleneck, ` +
      `averaging ${Math.round(primary.mean)}s per item versus a pipeline average of ` +
      `${Math.round(primary.mean - primary.zScore * (primary.stddev || 1))}s-scale stages.`
  );
  parts.push(`Root cause: ${primary.cause}. ${primary.explanation}`);
  parts.push(`Recommendation: ${primary.recommendation}`);
  if (bottlenecks.length > 1) {
    parts.push(
      `${bottlenecks.length} stage(s) in total were flagged as bottlenecks: ${bottlenecks
        .map((b) => b.stage)
        .join(', ')}.`
    );
  }
  if (stuckCount > 0) {
    parts.push(`${stuckCount} individual item(s) across all stages were flagged as unusually stuck.`);
  }
  return parts.join(' ');
}

module.exports = { runAnalysis };
