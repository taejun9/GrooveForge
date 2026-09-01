/**
 * 로컬 SQLite에 최신 복구 초안과 파일로 저장한 프로젝트 기록을 보관하는 영속성 계층이다.
 * 데이터베이스 소유권·스키마·무결성을 시작 시 확인하고 쓰기는 즉시 트랜잭션과 재조회 검증을 거친다.
 * WAL 체크포인트와 명시적 close를 통해 종료 순서를 관리하며, 다른 앱/버전의 DB는 수정하지 않고 즉시 거부한다.
 */
import { randomUUID } from "node:crypto";
import { chmodSync, closeSync, openSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

export const projectLibrarySchemaVersion = 1;

export type ProjectLibraryRecovery = {
  contents: string;
  savedAt: string;
};

export type SavedProjectRecord = {
  id: string;
  storageKey: string;
  fileName: string;
  contents: string;
  savedAt: string;
};

type RecoveryRow = {
  project_json: string;
  saved_at: string;
};

type SavedProjectRow = {
  id: string;
  storage_key: string;
  file_name: string;
  project_json: string;
  saved_at: string;
};

export class ProjectLibrary {
  readonly #database: DatabaseSync;
  #closed = false;

  constructor(databasePath: string) {
    // 새 파일은 처음부터 소유자 전용으로 만들고, 이미 있으면 덮어쓰지 않은 채 SQLite가 검증하도록 넘긴다.
    let createdDatabaseFile = false;
    try {
      const descriptor = openSync(databasePath, "wx", 0o600);
      closeSync(descriptor);
      createdDatabaseFile = true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
        throw error;
      }
    }
    this.#database = new DatabaseSync(databasePath, { timeout: 5_000 });
    try {
      this.#initialize();
      if (process.platform !== "win32") {
        chmodSync(databasePath, 0o600);
      }
    } catch (error) {
      this.#database.close();
      this.#closed = true;
      if (createdDatabaseFile && process.platform !== "win32") {
        chmodSync(databasePath, 0o600);
      }
      throw error;
    }
  }

  get schemaVersion(): number {
    this.#assertOpen();
    const row = this.#database.prepare("PRAGMA user_version").get() as { user_version: number };
    return row.user_version;
  }

  saveRecovery(contents: string, savedAt = new Date().toISOString()): ProjectLibraryRecovery {
    this.#assertOpen();
    this.#transaction(() => {
      this.#database
        .prepare(`
          INSERT INTO project_recovery (slot, project_json, saved_at)
          VALUES ('latest', ?, ?)
          ON CONFLICT(slot) DO UPDATE SET
            project_json = excluded.project_json,
            saved_at = excluded.saved_at
        `)
        .run(contents, savedAt);
    });

    const recovery = this.loadRecovery();
    if (!recovery || recovery.contents !== contents) {
      throw new Error("SQLite project recovery verification failed.");
    }
    return recovery;
  }

  loadRecovery(): ProjectLibraryRecovery | null {
    this.#assertOpen();
    const row = this.#database
      .prepare("SELECT project_json, saved_at FROM project_recovery WHERE slot = 'latest'")
      .get() as RecoveryRow | undefined;
    return row
      ? {
          contents: row.project_json,
          savedAt: row.saved_at
        }
      : null;
  }

  clearRecovery(): void {
    this.#assertOpen();
    this.#transaction(() => {
      this.#database.prepare("DELETE FROM project_recovery WHERE slot = 'latest'").run();
    });
  }

  recordSavedProject(
    storageKey: string,
    fileName: string,
    contents: string,
    savedAt = new Date().toISOString()
  ): SavedProjectRecord {
    this.#assertOpen();
    const id = randomUUID();
    this.#transaction(() => {
      this.#database
        .prepare(`
          INSERT INTO saved_projects (id, storage_key, file_name, project_json, saved_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(storage_key) DO UPDATE SET
            file_name = excluded.file_name,
            project_json = excluded.project_json,
            saved_at = excluded.saved_at
        `)
        .run(id, storageKey, fileName, contents, savedAt);
    });

    const record = this.savedProject(storageKey);
    if (!record || record.contents !== contents) {
      throw new Error("SQLite saved project verification failed.");
    }
    return record;
  }

  savedProject(storageKey: string): SavedProjectRecord | null {
    this.#assertOpen();
    const row = this.#database
      .prepare(`
        SELECT id, storage_key, file_name, project_json, saved_at
        FROM saved_projects
        WHERE storage_key = ?
      `)
      .get(storageKey) as SavedProjectRow | undefined;
    return row
      ? {
          id: row.id,
          storageKey: row.storage_key,
          fileName: row.file_name,
          contents: row.project_json,
          savedAt: row.saved_at
        }
      : null;
  }

  get savedProjectCount(): number {
    this.#assertOpen();
    const row = this.#database.prepare("SELECT COUNT(*) AS count FROM saved_projects").get() as { count: number };
    return row.count;
  }

  close(): void {
    if (this.#closed) {
      return;
    }
    this.#database.exec("PRAGMA wal_checkpoint(TRUNCATE)");
    this.#database.close();
    this.#closed = true;
  }

  #initialize(): void {
    // application_id와 user_version을 함께 검사해 우연히 같은 경로에 있는 타 DB를 마이그레이션하지 않는다.
    const currentVersion = this.schemaVersion;
    if (currentVersion !== 0 && currentVersion !== projectLibrarySchemaVersion) {
      throw new Error(`Unsupported GrooveForge SQLite schema version: ${currentVersion}.`);
    }
    const applicationId = (
      this.#database.prepare("PRAGMA application_id").get() as { application_id: number }
    ).application_id;
    if (
      (currentVersion === 0 && applicationId !== 0) ||
      (currentVersion === projectLibrarySchemaVersion && applicationId !== 0x47524647)
    ) {
      throw new Error("SQLite database does not belong to GrooveForge.");
    }
    if (currentVersion === 0) {
      const existingSchemaObjects = this.#database
        .prepare(`
          SELECT COUNT(*) AS count
          FROM sqlite_schema
          WHERE name NOT LIKE 'sqlite_%'
        `)
        .get() as { count: number };
      if (existingSchemaObjects.count > 0) {
        throw new Error("Unversioned GrooveForge SQLite database is not empty.");
      }
    }

    this.#database.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = FULL;
      PRAGMA foreign_keys = ON;
      PRAGMA trusted_schema = OFF;
      PRAGMA secure_delete = ON;
    `);
    if (currentVersion === 0) {
      this.#transaction(() => {
        this.#database.exec(`
          CREATE TABLE app_metadata (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
          ) STRICT;

          CREATE TABLE project_recovery (
            slot TEXT PRIMARY KEY CHECK (slot = 'latest'),
            project_json TEXT NOT NULL CHECK (
              length(project_json) BETWEEN 1 AND 1500000
              AND json_valid(project_json)
            ),
            saved_at TEXT NOT NULL
          ) STRICT;

          CREATE TABLE saved_projects (
            id TEXT PRIMARY KEY,
            storage_key TEXT NOT NULL UNIQUE CHECK (length(storage_key) = 64),
            file_name TEXT NOT NULL,
            project_json TEXT NOT NULL CHECK (
              length(project_json) BETWEEN 1 AND 1500000
              AND json_valid(project_json)
            ),
            saved_at TEXT NOT NULL
          ) STRICT;

          PRAGMA application_id = 0x47524647;
          PRAGMA user_version = 1;
        `);
      });
    }

    const initializedApplicationId = (
      this.#database.prepare("PRAGMA application_id").get() as { application_id: number }
    ).application_id;
    if (initializedApplicationId !== 0x47524647) {
      throw new Error("SQLite database does not belong to GrooveForge.");
    }
    const quickCheck = this.#database.prepare("PRAGMA quick_check").get() as { quick_check: string };
    if (quickCheck.quick_check !== "ok") {
      throw new Error("GrooveForge SQLite project library integrity check failed.");
    }
  }

  #transaction(operation: () => void): void {
    // BEGIN IMMEDIATE로 경쟁 쓰기를 초기에 직렬화하고 어느 예외에서도 전체 변경을 롤백한다.
    this.#database.exec("BEGIN IMMEDIATE");
    try {
      operation();
      this.#database.exec("COMMIT");
    } catch (error) {
      this.#database.exec("ROLLBACK");
      throw error;
    }
  }

  #assertOpen(): void {
    if (this.#closed) {
      throw new Error("GrooveForge SQLite project library is closed.");
    }
  }
}
