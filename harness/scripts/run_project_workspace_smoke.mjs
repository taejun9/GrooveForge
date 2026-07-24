#!/usr/bin/env node

import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { ProjectLibrary, projectLibrarySchemaVersion } from "../../electron/projectLibrary.ts";
import {
  atomicWriteUtf8File,
  ensureProjectWorkspace,
  resolveProjectWorkspacePaths
} from "../../electron/projectWorkspace.ts";

const syntheticWindows = resolveProjectWorkspacePaths("C:\\Users\\Alice", undefined, path.win32);
assert.equal(syntheticWindows.root, "C:\\Users\\Alice\\GrooveForge");
assert.equal(syntheticWindows.projects, "C:\\Users\\Alice\\GrooveForge\\Projects");
assert.equal(syntheticWindows.data, "C:\\Users\\Alice\\GrooveForge\\Data");
assert.equal(syntheticWindows.databaseFile, "C:\\Users\\Alice\\GrooveForge\\Data\\grooveforge.db");

const redirectedWindows = resolveProjectWorkspacePaths("D:\\Profiles\\김하늘", undefined, path.win32);
assert.equal(redirectedWindows.root, "D:\\Profiles\\김하늘\\GrooveForge");

const smokeHome = await mkdtemp(path.join(tmpdir(), "grooveforge-project-workspace-"));
try {
  const workspace = resolveProjectWorkspacePaths(smokeHome);
  const override = resolveProjectWorkspacePaths("/unused-home", path.join(smokeHome, "SmokeOverride"));
  assert.equal(override.root, path.join(smokeHome, "SmokeOverride"));

  await ensureProjectWorkspace(workspace);
  await ensureProjectWorkspace(workspace);
  assert.deepEqual((await readdir(workspace.root)).sort(), ["Data", "Projects"]);
  if (process.platform !== "win32") {
    assert.equal((await stat(workspace.root)).mode & 0o777, 0o700);
    assert.equal((await stat(workspace.projects)).mode & 0o777, 0o700);
    assert.equal((await stat(workspace.data)).mode & 0o777, 0o700);
  }

  const projectFile = path.join(workspace.projects, "sqlite-smoke.grooveforge.json");
  const firstContents = '{"fileVersion":1,"project":{"title":"SQLite 복구 1"}}';
  await atomicWriteUtf8File(projectFile, firstContents, 1_500_000);
  const secondContents = '{"fileVersion":1,"project":{"title":"SQLite 복구 2"}}';
  await atomicWriteUtf8File(projectFile, secondContents, 1_500_000);
  assert.equal(await readFile(projectFile, "utf8"), secondContents);
  if (process.platform !== "win32") {
    assert.equal((await stat(projectFile)).mode & 0o777, 0o600);
  }
  assert.deepEqual(
    (await readdir(workspace.projects)).filter((fileName) => fileName.endsWith(".tmp")),
    []
  );
  await assert.rejects(atomicWriteUtf8File(projectFile, "oversized", 4), /character safety limit/u);
  assert.equal(
    await readFile(projectFile, "utf8"),
    secondContents,
    "a rejected project write must preserve the previous complete file"
  );

  const library = new ProjectLibrary(workspace.databaseFile);
  assert.equal(library.schemaVersion, projectLibrarySchemaVersion);
  if (process.platform !== "win32") {
    assert.equal((await stat(workspace.databaseFile)).mode & 0o777, 0o600);
    for (const sidecarName of (await readdir(workspace.data)).filter((fileName) =>
      /grooveforge\.db-(?:wal|shm)$/u.test(fileName)
    )) {
      assert.equal((await stat(path.join(workspace.data, sidecarName))).mode & 0o777, 0o600);
    }
  }
  const recoveryOne = library.saveRecovery(firstContents, "2026-07-24T01:00:00.000Z");
  assert.deepEqual(recoveryOne, {
    contents: firstContents,
    savedAt: "2026-07-24T01:00:00.000Z"
  });
  const recoveryTwo = library.saveRecovery(secondContents, "2026-07-24T01:01:00.000Z");
  assert.equal(recoveryTwo.contents, secondContents);
  assert.throws(
    () => library.saveRecovery("not-json", "2026-07-24T01:02:00.000Z"),
    /constraint|json/u
  );
  assert.equal(
    library.loadRecovery()?.contents,
    secondContents,
    "a rejected SQLite recovery transaction must preserve the previous row"
  );
  const oversizedRecovery = JSON.stringify({ project: "x".repeat(1_500_000) });
  assert.throws(
    () => library.saveRecovery(oversizedRecovery, "2026-07-24T01:02:30.000Z"),
    /constraint/u
  );
  assert.equal(
    library.loadRecovery()?.contents,
    secondContents,
    "an oversized SQLite recovery transaction must preserve the previous row"
  );

  const firstStorageKey = "1".repeat(64);
  const firstRecord = library.recordSavedProject(
    firstStorageKey,
    "서울 비트.grooveforge.json",
    firstContents,
    "2026-07-24T01:03:00.000Z"
  );
  const updatedRecord = library.recordSavedProject(
    firstStorageKey,
    "서울 비트'; DROP TABLE saved_projects; --.grooveforge.json",
    secondContents,
    "2026-07-24T01:04:00.000Z"
  );
  assert.equal(updatedRecord.id, firstRecord.id);
  assert.equal(updatedRecord.contents, secondContents);
  assert.equal(library.savedProjectCount, 1);
  library.recordSavedProject(
    "2".repeat(64),
    "같은 제목.grooveforge.json",
    firstContents,
    "2026-07-24T01:05:00.000Z"
  );
  assert.equal(library.savedProjectCount, 2);
  library.close();

  const reopenedLibrary = new ProjectLibrary(workspace.databaseFile);
  assert.equal(reopenedLibrary.loadRecovery()?.contents, secondContents);
  assert.equal(reopenedLibrary.savedProject(firstStorageKey)?.contents, secondContents);
  reopenedLibrary.clearRecovery();
  assert.equal(reopenedLibrary.loadRecovery(), null);
  reopenedLibrary.close();

  const inspectionDatabase = new DatabaseSync(workspace.databaseFile, { readOnly: true });
  const sqliteVersion = inspectionDatabase.prepare("SELECT sqlite_version() AS version").get().version;
  assert.match(String(sqliteVersion), /^\d+\.\d+\.\d+$/u);
  assert.equal(inspectionDatabase.prepare("PRAGMA application_id").get().application_id, 0x47524647);
  assert.equal(inspectionDatabase.prepare("PRAGMA user_version").get().user_version, projectLibrarySchemaVersion);
  assert.equal(inspectionDatabase.prepare("PRAGMA journal_mode").get().journal_mode, "wal");
  assert.equal(inspectionDatabase.prepare("PRAGMA quick_check").get().quick_check, "ok");
  inspectionDatabase.close();

  const futureDatabasePath = path.join(workspace.data, "future-schema.db");
  const futureDatabase = new DatabaseSync(futureDatabasePath);
  futureDatabase.exec("PRAGMA user_version = 99");
  futureDatabase.close();
  assert.throws(() => new ProjectLibrary(futureDatabasePath), /Unsupported GrooveForge SQLite schema version/u);

  const unrelatedDatabasePath = path.join(workspace.data, "unrelated-app.db");
  const unrelatedDatabase = new DatabaseSync(unrelatedDatabasePath);
  unrelatedDatabase.exec("PRAGMA application_id = 12345; PRAGMA user_version = 1;");
  unrelatedDatabase.close();
  assert.throws(() => new ProjectLibrary(unrelatedDatabasePath), /does not belong to GrooveForge/u);

  const unidentifiedVersionedDatabasePath = path.join(workspace.data, "versioned-without-app-id.db");
  const unidentifiedVersionedDatabase = new DatabaseSync(unidentifiedVersionedDatabasePath);
  unidentifiedVersionedDatabase.exec("PRAGMA user_version = 1;");
  unidentifiedVersionedDatabase.close();
  assert.throws(() => new ProjectLibrary(unidentifiedVersionedDatabasePath), /does not belong to GrooveForge/u);
  const unidentifiedVersionedInspection = new DatabaseSync(unidentifiedVersionedDatabasePath, { readOnly: true });
  assert.equal(unidentifiedVersionedInspection.prepare("PRAGMA application_id").get().application_id, 0);
  assert.equal(unidentifiedVersionedInspection.prepare("PRAGMA user_version").get().user_version, 1);
  assert.equal(unidentifiedVersionedInspection.prepare("PRAGMA journal_mode").get().journal_mode, "delete");
  assert.equal(
    unidentifiedVersionedInspection
      .prepare("SELECT COUNT(*) AS count FROM sqlite_schema WHERE name NOT LIKE 'sqlite_%'")
      .get().count,
    0
  );
  unidentifiedVersionedInspection.close();

  const unversionedDatabasePath = path.join(workspace.data, "unversioned-non-empty.db");
  const unversionedDatabase = new DatabaseSync(unversionedDatabasePath);
  unversionedDatabase.exec("CREATE TABLE unrelated_data (value TEXT)");
  unversionedDatabase.close();
  assert.throws(() => new ProjectLibrary(unversionedDatabasePath), /Unversioned GrooveForge SQLite database is not empty/u);

  console.log("GrooveForge SQLite project workspace smoke passed.");
  console.log(`- SQLite runtime: ${sqliteVersion}`);
  console.log("- Synthetic Windows current-user and redirected-home paths matched.");
  console.log("- Projects/Data creation was idempotent under a temporary home.");
  console.log("- Managed directories and SQLite/project files use current-user-only POSIX modes.");
  console.log("- Atomic project files and transactional recovery/catalog roundtrips passed.");
  console.log("- STRICT JSON/size constraints, parameter binding, WAL, reopen, and clear passed.");
  console.log("- Foreign/missing application id, unversioned non-empty database, and future schema rejection passed without rewrite.");
} finally {
  await rm(smokeHome, { recursive: true, force: true });
}
