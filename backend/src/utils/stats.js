// Small, dependency-free statistics helpers.
// Kept deliberately simple and readable — every function here maps to a
// concept you could compute by hand in a spreadsheet.

function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stddev(arr, avg = mean(arr)) {
  if (arr.length < 2) return 0;
  const variance = arr.reduce((sum, v) => sum + (v - avg) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

function sorted(arr) {
  return [...arr].sort((a, b) => a - b);
}

function percentile(arrSorted, p) {
  if (!arrSorted.length) return 0;
  const idx = (p / 100) * (arrSorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return arrSorted[lo];
  const frac = idx - lo;
  return arrSorted[lo] + (arrSorted[hi] - arrSorted[lo]) * frac;
}

function median(arr) {
  return percentile(sorted(arr), 50);
}

// Q1, Q3, IQR — used for the "flag stuck items" outlier rule (classic box-plot rule).
function quartiles(arr) {
  const s = sorted(arr);
  const q1 = percentile(s, 25);
  const q3 = percentile(s, 75);
  return { q1, q3, iqr: q3 - q1 };
}

function summarize(arr) {
  const avg = mean(arr);
  const sd = stddev(arr, avg);
  const { q1, q3, iqr } = quartiles(arr);
  return {
    count: arr.length,
    mean: avg,
    median: median(arr),
    stddev: sd,
    min: arr.length ? Math.min(...arr) : 0,
    max: arr.length ? Math.max(...arr) : 0,
    q1,
    q3,
    iqr,
    outlierCeiling: q3 + 1.5 * iqr, // anything above this = "stuck item"
  };
}

module.exports = { mean, stddev, median, percentile, quartiles, summarize };
