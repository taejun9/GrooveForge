#!/usr/bin/env python3
"""에이전트 경로 안내가 누락이나 잘못된 근거를 조용히 통과시키지 않는지 검사한다.

독립 임시 저장소로 커밋·이름 변경·삭제·새 파일을 검증하고 실제 작업 트리와 사용자 파일은 바꾸지 않는다.
빠른 경로 안내가 최종 전체 QA를 대체하거나 수행된 검사로 오인되지 않는 경계도 확인한다.
"""

from __future__ import annotations

import json
from pathlib import Path
import subprocess
import sys
from tempfile import TemporaryDirectory
import unittest

sys.dont_write_bytecode = True
import agent_navigation as navigation


class AgentNavigationTests(unittest.TestCase):
    def test_composer_render_and_harness_changes_route_pcm_regression(self):
        for path in ("src/ui/App.tsx", "src/ui/workstationAppHelpers.tsx", "harness/scripts/run_composer_action_analysis_smoke.mjs"):
            with self.subTest(path=path):
                report = navigation.build_navigation([path])
                self.assertIn("composer-action:analysis-smoke", report["focusedChecks"])
                self.assertEqual(report["requiredFinalGate"], "npm run release:check")
                self.assertIn("no checks have been executed", report["purpose"])

    def test_cross_domain_changes_combine_checks_without_duplicates(self):
        report = navigation.build_navigation(["src/audio/render.ts", "./src/domain/workstation.ts"])
        self.assertEqual([route["area"] for route in report["routes"]], ["domain", "audio"])
        self.assertEqual(report["focusedChecks"].count("sample-audio:qa"), 1)
        self.assertEqual(report["requiredFinalGate"], "npm run release:check")

    def test_unknown_and_empty_inputs_keep_full_gate_and_owner(self):
        for paths in ([], ["future-engine/removed.rs"]):
            report = navigation.build_navigation(paths)
            self.assertEqual(report["fallbackOwner"], "project_lead")
            self.assertEqual(report["requiredFinalGate"], "npm run release:check")
            self.assertEqual(report["focusedChecks"], [])
            self.assertIn("no checks have been executed", report["purpose"])

    def test_paths_cannot_escape_repository(self):
        for path in ("", ".", "../src/audio/a.ts", "src/../../a", "/tmp/a", "C:\\a", "a\x00b"):
            with self.subTest(path=path), self.assertRaises(ValueError):
                navigation.build_navigation([path])
        self.assertEqual(navigation.normalize_path(".\\src\\audio\\a.ts"), "src/audio/a.ts")

    def test_stale_command_document_and_role_are_rejected(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            commands = {navigation.FINAL_GATE, *(command for route in navigation.ROUTES for command in route["checks"])}
            package = {"scripts": {command: "echo synthetic" for command in commands}}
            (root / "package.json").write_text(json.dumps(package))
            roles = {role for route in navigation.ROUTES for role in route["owners"]}
            (root / "AGENTS.md").write_text("\n".join(f"| {role} | 역할 |" for role in roles))
            for name in {*navigation.START_DOCS, *(name for route in navigation.ROUTES for name in route["docs"])}:
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text("fixture")
            self.assertEqual(navigation.validate_navigation(root), [])
            package["scripts"].pop(navigation.FINAL_GATE)
            (root / "package.json").write_text(json.dumps(package))
            (root / navigation.START_DOCS[0]).unlink()
            (root / "AGENTS.md").write_text("")
            errors = navigation.validate_navigation(root)
            self.assertTrue(any("missing npm command: release:check" in error for error in errors))
            self.assertTrue(any("missing document:" in error for error in errors))
            self.assertTrue(any("unknown role:" in error for error in errors))

    def test_changed_paths_include_committed_renamed_deleted_and_untracked(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)

            def git(*args):
                return subprocess.run(["git", *args], cwd=root, check=True, capture_output=True)

            git("init", "-b", "main")
            git("config", "user.name", "Navigation Fixture")
            git("config", "user.email", "navigation@example.invalid")
            git("config", "commit.gpgsign", "false")
            git("config", "core.hooksPath", str(root / "empty-hooks"))
            for name in ("old name.ts", "removed.ts", "committed.ts"):
                (root / name).write_text("initial")
            git("add", ".")
            git("commit", "-m", "fixture")
            git("checkout", "-b", "codex/fixture")
            (root / "committed.ts").write_text("changed")
            git("commit", "-am", "fixture change")
            git("mv", "old name.ts", "new name.ts")
            (root / "removed.ts").unlink()
            (root / "새 파일.ts").write_text("new")
            self.assertEqual(set(navigation.changed_paths(root, "main")), {
                "committed.ts", "old name.ts", "new name.ts", "removed.ts", "새 파일.ts",
            })
            with self.assertRaises(subprocess.CalledProcessError):
                navigation.changed_paths(root, "missing-ref")


if __name__ == "__main__":
    unittest.main()
