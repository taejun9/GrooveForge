#!/usr/bin/env python3
"""GrooveForge의 엄격한 저장소 품질 gate를 단일 진입점으로 실행한다.

공유 ``run_qa`` 검사기를 strict 모드로 호출하고 누적 오류를 사람이 읽기 좋은 목록으로 출력해 종료 코드로 전달한다.
검사를 건너뛰거나 자동 수정하지 않으며, 오류가 하나라도 있으면 실패 폐쇄하고 외부 작업은 수행하지 않는다.
"""

from __future__ import annotations

import sys

sys.dont_write_bytecode = True

import run_qa


def main() -> int:
    # 품질 gate는 느슨한 QA 경로로 내려가지 않도록 strict=True를 코드에서 고정한다.
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
