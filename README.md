# FraudShield

Fraud-detection hackathon project with:
- `banker` (synthetic banking UI + telemetry source)
- `fraudshield` (fraud analyst dashboard + scoring/risk APIs)

## Proof-Driven Validation

Use the in-repo harness to generate concurrent sessions and evidence artifacts:

```bash
cd banker
node testing/session-harness/simulate-session-batch.js --phase=scale50
```

Generated output is written to:
- `banker/testing/session-harness/latest/report.json`
- `banker/testing/session-harness/latest/*.webm`
- `banker/testing/session-harness/latest/*-activity.png`

`report.json` now includes monitoring comparison fields (rules-only vs rules+AI),
including precision/recall/F1 deltas and additional AI latency cost.

## Run Modes

For stable high-concurrency judging runs (recommended):

```bash
# fraudshield/.env
FRAUD_AI_ENABLED=false
```
Restart fraudshield after env changes.

Then run:

```bash
node banker/testing/session-harness/simulate-session-batch.js --phase=scale50 --total=50 --concurrency=10
```

For small AI-path proof runs:

```bash
# fraudshield/.env
FRAUD_AI_ENABLED=true
FRAUD_AI_API_KEY=test
```
Restart fraudshield after env changes.

Then run:

```bash
node banker/testing/session-harness/simulate-session-batch.js --phase=smoke --total=4 --concurrency=1
```

## Railtracks

Built with **railtracks** support for validation orchestration and event emission.

Install Python dependency:

```bash
pip install -r requirements.txt
```

Run the Railtracks-enabled wrapper:

```bash
python testing/railtracks/run_ab_validation.py --phase=scale50 --total=50 --concurrency=10
```
