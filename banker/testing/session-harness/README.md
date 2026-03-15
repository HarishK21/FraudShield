# Session Harness

Runs authenticated bank UI sessions with deterministic users, run/agent/scenario tags, and writes one canonical artifact batch in-repo.

## Run

```bash
# 4 sessions, 2-way concurrency, captures 2 flagged + 2 unflagged artifacts
node testing/session-harness/simulate-session-batch.js --phase=smoke

# 20 sessions for ramp testing
node testing/session-harness/simulate-session-batch.js --phase=ramp

# 50 concurrent-agent scale test
node testing/session-harness/simulate-session-batch.js --phase=scale50
```

## Useful Overrides

```bash
node testing/session-harness/simulate-session-batch.js \
  --phase=scale50 \
  --total=50 \
  --concurrency=10 \
  --capture=sample \
  --runId=run-20260314-2200
```

- `--capture=none|sample|all`
- `--headless=true|false`
- `--flaggedRatio=0.4` (portion of sessions that target flagged behavior)
- `--bankUrl=http://localhost:3000`
- `--fraudUrl=http://localhost:3001/api/fraud/sessions`

## Output

Single canonical output folder:

- `testing/session-harness/latest/report.json`
- `testing/session-harness/latest/*.webm`
- `testing/session-harness/latest/*-activity.png`
