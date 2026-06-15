#!/usr/bin/env python3
"""Run the strict GrooveForge base quality gate."""

from __future__ import annotations

import sys

import run_qa


def main() -> int:
    errors = run_qa.run_checks(strict=True)
    if errors:
        print("Quality gate failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("GrooveForge quality gate passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
