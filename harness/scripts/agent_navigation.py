#!/usr/bin/env python3
"""변경 경로를 담당 역할과 관련 검사로 연결하는 읽기 전용 탐색 도구다.

실제 명령·문서·역할의 존재를 먼저 확인하고, 미분류 경로에도 전체 최종 게이트를 유지한다.
검사 실행이나 파일 수정은 하지 않으며 출력은 QA 통과 증거가 아닌 작업 계획 자료다.
"""

from __future__ import annotations

import argparse
from fnmatch import fnmatchcase
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[2]
FINAL_GATE = "release:check"
START_DOCS = ("docs/agents/workflow.md", "docs/quality/navigation.md")
ROUTES = (
    {
        "area": "harness", "owners": ["harness_builder", "repo_cartographer"],
        "patterns": ["AGENTS.md", "harness/*", "docs/architecture/harness.md", "docs/agents/*", "docs/quality/*", ".github/*"],
        "docs": ["docs/architecture/harness.md", "docs/quality/rules.md"],
        "checks": ["qa", "comments:ko:check"],
    },
    {
        "area": "domain", "owners": ["project_lead", "privacy_guard"],
        "patterns": ["src/domain/*"],
        "docs": ["docs/architecture/product-architecture.md", "docs/privacy/principles.md"],
        "checks": ["typecheck", "harness:smoke", "workflow:smoke", "sample-audio:qa"],
    },
    {
        "area": "audio", "owners": ["project_lead", "quality_runner"],
        "patterns": ["src/audio/*"],
        "docs": ["docs/architecture/product-architecture.md", "docs/quality/rules.md"],
        "checks": ["typecheck", "harness:smoke", "sample-audio:qa", "delivery:bundle-zip-smoke"],
    },
    {
        "area": "renderer", "owners": ["project_lead", "quality_runner"],
        "patterns": ["src/ui/*", "src/main.*", "index.html"],
        "docs": ["docs/product/product.md", "docs/quality/rules.md"],
        "checks": ["typecheck", "renderer:smoke", "workflow:smoke", "desktop:launch-smoke"],
    },
    {
        "area": "composer-analysis", "owners": ["project_lead", "quality_runner"],
        "patterns": ["src/ui/App.tsx", "src/ui/workstationAppHelpers.tsx", "harness/scripts/run_composer_action_analysis_smoke.mjs"],
        "docs": ["docs/quality/rules.md"],
        "checks": ["composer-action:analysis-smoke"],
    },
    {
        "area": "desktop", "owners": ["privacy_guard", "quality_runner"],
        "patterns": ["electron/*", "src/platform/*", "harness/scripts/*desktop*", "harness/scripts/*installed_app*", "harness/scripts/run_playback_audibility_observation_smoke.mjs"],
        "docs": ["docs/privacy/principles.md", "docs/release/readiness.md"],
        "checks": ["typecheck", "project-workspace:smoke", "desktop:security-smoke", "desktop:audibility-observation-smoke", "desktop:installed-app-qa-smoke", "desktop:project-io-smoke", "desktop:close-flow-smoke"],
    },
    {
        "area": "delivery", "owners": ["quality_runner", "privacy_guard"],
        "patterns": ["harness/scripts/*multigenre*", "harness/scripts/*hiphop*", "harness/scripts/*dual_trap*", "harness/scripts/*delivery*"],
        "docs": ["docs/quality/rules.md", "docs/release/readiness.md"],
        "checks": ["harness:smoke", "sample-audio:qa", "desktop:all-genres-qa", "desktop:requested-hiphop-qa", "desktop:dual-trap-qa"],
    },
    {
        "area": "build-release", "owners": ["harness_builder", "privacy_guard"],
        "patterns": ["package*.json", "tsconfig*.json", "vite.config.*", "harness/scripts/*release*", "harness/scripts/*distribution*", "docs/release/*"],
        "docs": ["docs/release/readiness.md", "docs/privacy/principles.md"],
        "checks": ["qa", "typecheck", "release:private-value-leak-audit-smoke"],
    },
    {
        "area": "documentation", "owners": ["plan_keeper", "doc_gardener"],
        "patterns": ["README.md", "readme-en.md", "docs/*"],
        "docs": ["docs/agents/workflow.md", "docs/quality/rules.md"],
        "checks": ["qa"],
    },
)


def normalize_path(value: str) -> str:
    # 삭제된 파일도 탐색해야 하므로 존재 검사를 하지 않되 저장소 밖 경로는 받아들이지 않는다.
    normalized = value.replace("\\", "/")
    if not normalized or "\x00" in normalized or re.match(r"^[A-Za-z]:", normalized):
        raise ValueError("경로는 비어 있지 않은 저장소 상대 경로여야 합니다.")
    path = PurePosixPath(normalized)
    if path.is_absolute() or ".." in path.parts or str(path) == ".":
        raise ValueError("절대 경로나 저장소 상위 경로는 사용할 수 없습니다.")
    return str(path)


def validate_navigation(root: Path = ROOT) -> list[str]:
    # 문서와 package.json이 바뀌면 정상처럼 보이는 낡은 안내를 출력하기 전에 실패한다.
    errors: list[str] = []
    try:
        scripts = json.loads((root / "package.json").read_text(encoding="utf-8"))["scripts"]
        agents = (root / "AGENTS.md").read_text(encoding="utf-8")
    except (OSError, ValueError, KeyError, TypeError) as error:
        return [f"agent navigation cannot read repository map: {error}"]
    if not isinstance(scripts, dict):
        return ["agent navigation package scripts must be an object"]
    roles = set(re.findall(r"^\|\s*([a-z_]+)\s*\|", agents, re.M))
    commands = {FINAL_GATE}
    documents = set(START_DOCS)
    for route in ROUTES:
        for role in route["owners"]:
            if role not in roles:
                errors.append(f"agent navigation unknown role: {role}")
        commands.update(route["checks"])
        documents.update(route["docs"])
    for command in sorted(commands):
        if not isinstance(scripts.get(command), str) or not scripts[command].strip():
            errors.append(f"agent navigation missing npm command: {command}")
    for document in sorted(documents):
        if not (root / document).is_file():
            errors.append(f"agent navigation missing document: {document}")
    return errors


def build_navigation(paths: list[str]) -> dict:
    normalized = list(dict.fromkeys(normalize_path(path) for path in paths))
    selected = [route for route in ROUTES if any(
        fnmatchcase(path, pattern) for path in normalized for pattern in route["patterns"]
    )]
    unmatched = [path for path in normalized if not any(
        fnmatchcase(path, pattern) for route in ROUTES for pattern in route["patterns"]
    )]
    return {
        "purpose": "planning-only; no checks have been executed",
        "paths": normalized,
        "routes": selected,
        "focusedChecks": list(dict.fromkeys(command for route in selected for command in route["checks"])),
        "unmatchedPaths": unmatched,
        "fallbackOwner": "project_lead" if unmatched or not normalized else None,
        "requiredFinalGate": f"npm run {FINAL_GATE}",
        "additionalEvidence": "Consult docs/quality/navigation.md for installed-app, listening and external-release evidence.",
    }


def changed_paths(root: Path, base: str) -> list[str]:
    # 커밋된 분기 변경, 아직 커밋하지 않은 변경, 새 파일을 합친다. 이름 변경은 양쪽 경로를 검사한다.
    commands = (
        ["diff", "--no-renames", "--name-only", "-z", f"{base}...HEAD", "--"],
        ["diff", "--no-renames", "--name-only", "-z", "HEAD", "--"],
        ["ls-files", "--others", "--exclude-standard", "-z"],
    )
    if not base or base.startswith("-"):
        raise ValueError("기준 ref는 비어 있거나 옵션으로 시작할 수 없습니다.")
    paths: list[str] = []
    for command in commands:
        result = subprocess.run(["git", *command], cwd=root, check=True, capture_output=True, timeout=15)
        paths.extend(value.decode("utf-8") for value in result.stdout.split(b"\x00") if value)
    return list(dict.fromkeys(paths))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="담당 역할과 관련 QA를 찾습니다. 검사를 실행하지 않습니다.")
    parser.add_argument("paths", nargs="*", help="저장소 상대 변경 경로")
    parser.add_argument("--changed", action="store_true", help="기준 ref와 현재 변경·새 파일을 함께 읽기")
    parser.add_argument("--base", default="main", help="--changed의 기준 ref (기본 main)")
    args = parser.parse_args(argv)
    if args.changed and args.paths:
        parser.error("명시적 경로와 --changed 중 하나만 사용하세요.")
    errors = validate_navigation()
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    try:
        paths = changed_paths(ROOT, args.base) if args.changed else args.paths
        report = build_navigation(paths)
    except (ValueError, OSError, subprocess.SubprocessError) as error:
        print(f"agent navigation failed: {error}", file=sys.stderr)
        return 1
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
