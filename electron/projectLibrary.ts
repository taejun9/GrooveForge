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
