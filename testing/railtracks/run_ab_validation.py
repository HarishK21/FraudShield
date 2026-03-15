#!/usr/bin/env python3
"""
Best-effort Railtracks-enabled runner for the in-repo session harness.

This script:
1) runs the existing Node harness,
2) reads testing/session-harness/latest/report.json,
3) prints and stores an A/B fraud-model uplift summary.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, Optional


def load_railtracks() -> Optional[Any]:
    try:
        import railtracks  # type: ignore

        version = getattr(railtracks, "__version__", "unknown")
        print(f"[railtracks] loaded (version={version})")
        return railtracks
    except Exception as exc:  # pragma: no cover - informational fallback
        print(f"[railtracks] unavailable ({exc})")
        return None


def emit_event(railtracks_module: Optional[Any], name: str, payload: Dict[str, Any]) -> None:
    if railtracks_module is None:
        return

    # Support multiple plausible public APIs without requiring one exact version.
    for fn_name in ("track_event", "emit", "log_event"):
        fn = getattr(railtracks_module, fn_name, None)
        if not callable(fn):
            continue

        for args, kwargs in (
            ((name, payload), {}),
            ((), {"event": name, "payload": payload}),
            ((name,), {"payload": payload}),
        ):
            try:
                fn(*args, **kwargs)
                return
            except TypeError:
                continue
            except Exception:
                return


def run_command(command: list[str], cwd: Path) -> None:
    print(f"[runner] exec: {' '.join(command)}")
    completed = subprocess.run(command, cwd=str(cwd), check=False)
    if completed.returncode != 0:
        raise RuntimeError(f"Command failed with exit code {completed.returncode}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run fraud A/B validation harness.")
    parser.add_argument("--phase", default="scale50", help="Harness phase preset.")
    parser.add_argument("--total", type=int, default=50, help="Total sessions.")
    parser.add_argument(
        "--concurrency", type=int, default=10, help="Concurrent harness workers."
    )
    parser.add_argument(
        "--capture",
        default="sample",
        choices=["none", "sample", "all"],
        help="Artifact capture mode.",
    )
    parser.add_argument("--run-id", default="", help="Optional explicit run id.")
    parser.add_argument(
        "--repo-root",
        default="",
        help="Override repository root (auto-detected by default).",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    script_path = Path(__file__).resolve()
    repo_root = Path(args.repo_root).resolve() if args.repo_root else script_path.parents[2]
    railtracks_module = load_railtracks()

    emit_event(
        railtracks_module,
        "fraud_ab_validation_started",
        {
            "phase": args.phase,
            "total": args.total,
            "concurrency": args.concurrency,
            "capture": args.capture,
        },
    )

    harness_command = [
        "node",
        "banker/testing/session-harness/simulate-session-batch.js",
        f"--phase={args.phase}",
        f"--total={args.total}",
        f"--concurrency={args.concurrency}",
        f"--capture={args.capture}",
    ]
    if args.run_id:
        harness_command.append(f"--runId={args.run_id}")

    run_command(harness_command, cwd=repo_root)

    report_path = repo_root / "banker" / "testing" / "session-harness" / "latest" / "report.json"
    if not report_path.exists():
        raise FileNotFoundError(f"Report not found at {report_path}")

    report = json.loads(report_path.read_text(encoding="utf-8"))
    comparison = (
        report.get("monitoring", {})
        .get("modelComparison", {})
    )

    summary = {
        "runId": report.get("runId"),
        "phase": report.get("phase"),
        "planned": report.get("execution", {}).get("planned"),
        "completed": report.get("execution", {}).get("completed"),
        "failed": report.get("execution", {}).get("failed"),
        "matchedClassifications": report.get("assertions", {}).get("matchedClassifications"),
        "mismatchedClassifications": report.get("assertions", {}).get("mismatchedClassifications"),
        "comparison": comparison,
    }

    output_dir = repo_root / "testing" / "railtracks"
    output_dir.mkdir(parents=True, exist_ok=True)
    summary_path = output_dir / "latest-ab-summary.json"
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    print(f"[runner] summary saved: {summary_path}")
    print(json.dumps(summary, indent=2))

    emit_event(
        railtracks_module,
        "fraud_ab_validation_completed",
        {
            "runId": summary.get("runId"),
            "planned": summary.get("planned"),
            "completed": summary.get("completed"),
            "failed": summary.get("failed"),
            "comparisonPresent": bool(summary.get("comparison")),
        },
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"[runner] failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
