# Product Requirements Document (PRD): FlowLens AI

**Version:** 1.0  
**Status:** Production-Ready / Hackathon Standard  
**Product Name:** FlowLens AI  
**Tagline:** Discover. Predict. Optimize.

---

## 1. Executive Summary
FlowLens AI is an AI-powered Operational Intelligence Platform designed to transform raw workflow data into actionable business strategy. Unlike traditional dashboards that merely visualize historical data, FlowLens AI utilizes an **Agentic AI Workflow** to identify bottlenecks, perform root-cause analysis, and simulate "What-if" scenarios. It is built to provide organizations with a clear path from observing operational issues to implementing data-driven optimizations.

## 2. Problem Statement
Organizations across various sectors (Manufacturing, IT, Healthcare, HR) struggle to identify the "why" behind operational delays. Existing tools show that a process is slow but fail to:
*   Pinpoint the exact department or employee causing the clog.
*   Explain the underlying reason (e.g., staffing shortages vs. approval dependencies).
*   Predict how specific changes (e.g., hiring more staff) will impact future performance.
*   Provide actionable, prioritized recommendations for improvement.

## 3. Goals & Objectives
*   **Automated Discovery:** Instantly identify the most significant operational bottlenecks from CSV data.
*   **Intelligent Reasoning:** Use specialized AI agents to explain root causes beyond simple statistics.
*   **Predictive Simulation:** Allow users to test operational changes in a risk-free environment.
*   **Agentic Orchestration:** Implement a stateful AI workflow using LangGraph to ensure high-quality, iterative analysis.
*   **Hackathon Excellence:** Deliver a "National Finale" standard product that demonstrates autonomous AI analyst capabilities.

## 4. Target Users / Stakeholders
*   **Operations Managers:** To monitor and optimize daily workflows.
*   **SMB Owners & Startup Founders:** To improve efficiency with limited resources.
*   **HR & Department Heads:** To manage employee workload and prevent burnout.
*   **Manufacturing Supervisors:** To reduce queue times and SLA violations.

## 5. Functional Requirements

### 5.1 Data Ingestion & Demo Mode
*   **FR-01: Demo Mode:** One-click activation that loads a realistic, pre-populated company dataset for immediate visualization.
*   **FR-02: CSV Upload:** Support for user-provided workflow data.
*   **FR-03: Schema Validation:** The system must support and validate the following columns:
    *   `Task_ID`, `Process_Name`, `Department`, `Assigned_To`, `Priority`, `Created_Time`, `Started_Time`, `Completed_Time`, `Status`.

### 5.2 Workflow Analytics Engine
*   **FR-04: Statistical Calculation:** Automatically calculate Average Processing Time, Waiting Time, Queue Time, Completion Rate, and SLA Violations.
*   **FR-05: Performance Benchmarking:** Compare department and employee performance against organizational averages.

### 5.3 AI Agentic Analysis (The "Analyst" Agent)
*   **FR-06: Bottleneck Detection:** AI identifies the specific stage or department causing the highest percentage of delays.
*   **FR-07: Root Cause Analysis:** AI explains *why* delays occur (e.g., "Approval dependency," "Vendor delays," "Staffing shortage").
*   **FR-08: Recommendation Engine:** AI suggests specific actions (e.g., "Add one reviewer between 2 PM–5 PM") and predicts the % improvement.

### 5.4 What-if Simulator
*   **FR-09: Resource Simulation:** Interactive sliders to adjust variables like "Number of Employees" or "Workload Volume."
*   **FR-10: Predictive Impact:** AI predicts new completion times and efficiency scores based on simulated changes.

### 5.5 Dashboard & Reporting
*   **FR-11: KPI Cards:** Display Total Tasks, Completed, Delayed, Bottleneck Department, Predicted Tomorrow Delay, and Efficiency Score.
*   **FR-12: Visualizations:** Interactive charts including Task Timelines, Department Performance, Delay Distribution, Employee Load, and Heatmaps.
*   **FR-13: PDF Export:** Generate a professional report containing the operational summary, AI insights, and recommendations.

## 6. Non-Functional Requirements
*   **Performance:** Dashboard and AI analysis should load/generate within 5–10 seconds.
*   **Scalability:** Support datasets up to 10,000 workflow records for the MVP.
*   **Usability:** Zero-training interface; intuitive "Detect → Explain → Predict" flow.
*   **Reliability:** 95% success rate for CSV processing and schema mapping.
*   **Responsiveness:** Fully responsive web UI for desktop and tablet viewing.

## 7. System Architecture Overview
The system follows a modern, decoupled architecture with an **Agentic AI Swarm** at its core:
1.  **Client Layer:** React-based dashboard for user interaction.
2.  **Application Layer:** FastAPI backend managing data flow and service orchestration.
3.  **Data Engine:** Pandas/NumPy service for heavy-duty statistical processing.
4.  **AI Agent Swarm:** A **LangGraph Orchestrator** managing two specialized agents:
    *   *Bottleneck Analyzer Agent:* Focuses on operations research and identifying "clogs."
    *   *Recommendation Agent:* Focuses on strategy and "What-if" logic.
5.  **Persistence Layer:** Supabase (PostgreSQL) for storing history, reports, and processed metrics.

## 8. Tech Stack
*   **Frontend:** React, Tailwind CSS, Recharts, Lucide React.
*   **Backend:** FastAPI, Pydantic, Python.
*   **Data Processing:** Pandas, NumPy.
*   **AI Orchestration:** LangGraph, LangChain.
*   **LLM Provider:** Google Gemini Pro 1.5 (via Gemini API).
*   **Database:** Supabase (PostgreSQL).
*   **Deployment:** Vercel (Frontend), Render (Backend).

## 9. Data Requirements
*   **Data Model:** Relational schema in PostgreSQL to track `Uploads`, `ProcessedMetrics`, `AISuggestions`, and `SimulationHistory`.
*   **Data Flow:** 
    1. User uploads CSV → 2. FastAPI validates → 3. Pandas calculates stats → 4. LangGraph orchestrates AI agents → 5. Results stored in Supabase → 6. Frontend fetches for display.

## 10. API Specifications (Key Endpoints)
*   `POST /api/v1/upload`: Accepts CSV, returns unique `upload_id` and initial stats.
*   `GET /api/v1/analysis/{upload_id}`: Triggers the LangGraph agentic workflow for deep analysis.
*   `POST /api/v1/simulate`: Accepts simulation parameters (e.g., staff count) and returns AI-predicted outcomes.
*   `GET /api/v1/report/{upload_id}`: Generates and returns a downloadable PDF report.

## 11. Security Requirements
*   **Authentication:** Managed via Supabase Auth for user-specific data history.
*   **Data Protection:** Secure handling of CSV uploads; data isolation between different users/organizations.
*   **API Security:** Implementation of CORS policies and environment variable protection for API keys (Gemini, Supabase).

## 12. Deployment & Infrastructure
*   **Frontend:** Hosted on **Vercel** for global CDN delivery and fast loading.
*   **Backend:** Hosted on **Render** (Web Service) to handle Python/FastAPI logic.
*   **Database:** **Supabase** managed instance for high availability.
*   **CI/CD:** Automated deployments via GitHub integration for both Frontend and Backend.

## 13. Success Metrics
*   **Processing Speed:** Analysis of 1,000+ rows in under 30 seconds.
*   **Insight Quality:** AI identifies at least one non-obvious bottleneck (e.g., cross-departmental dependency) in test datasets.
*   **User Engagement:** Successful completion of a "What-if" simulation during the demo flow.
*   **Technical Robustness:** Zero failures during the "Demo Mode" presentation.

## 14. Timeline & Milestones (4-Day Sprint)
*   **Day 1: Foundation:** Backend API setup, CSV processing engine (Pandas), and Supabase schema.
*   **Day 2: AI Intelligence:** Implementation of LangGraph orchestrator and specialized Gemini agents.
*   **Day 3: Frontend & Visualization:** React dashboard development, Recharts integration, and Demo Mode.
*   **Day 4: Refinement & Pitch:** What-if simulator logic, PDF export, final deployment, and pitch preparation.

## 15. Open Questions & Risks
*   **LLM Latency:** Complex LangGraph chains may take longer; need to implement frontend loading states/shimmers.
*   **Data Variability:** Users may upload CSVs with slightly different headers; need robust fuzzy-matching for column names.
*   **Simulation Accuracy:** Ensuring the "What-if" predictions remain grounded in the statistical reality of the uploaded data.