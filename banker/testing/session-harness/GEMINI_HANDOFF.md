# Gemini Handoff: 50-Agent Concurrent Validation

Run a 50-agent concurrent validation using the in-repo harness, do not clear DB, and keep all outputs in `banker/testing/session-harness/latest` only.

## Context

- Banker UI: `http://localhost:3000`
- Fraud API: `http://localhost:3001/api/fraud/sessions`
- Harness script: `banker/testing/session-harness/simulate-session-batch.js`

## Tasks

1. Run:
   `node testing/session-harness/simulate-session-batch.js --phase=scale50 --capture=sample`
2. Read `latest/report.json` and summarize:
   - planned/completed/failed
   - observed flagged vs unflagged counts
   - mismatches/missing classifications
3. Query fraud API by `runId` from report:
   `/api/fraud/sessions?testRunId=<runId>`
   Confirm count and risk-status distribution (`Normal` / `Watch` / `High Risk`).
4. If mismatches > 10%, identify top `reasonCodes` causing misses and propose parameterized harness tweaks (no hardcoded demo shortcuts).
5. Do not create extra run folders; keep only latest artifacts.
