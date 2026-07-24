import { randomUUID } from "node:crypto";
import { chmod, mkdir, open, rename, unlink } from "node:fs/promises";
import path from "node:path";

type PathApi = Pick<typeof path, "join" | "resolve">;

export type ProjectWorkspacePaths = {
  root: string;
  projects: string;
  data: string;
  databaseFile: string;
};

export function resolveProjectWorkspacePaths(
  userHome: string,
  rootOverride?: string,
  pathApi: PathApi = path
): ProjectWorkspacePaths {
  const root = pathApi.resolve(rootOverride ?? pathApi.join(userHome, "GrooveForge"));
  const projects = pathApi.join(root, "Projects");
  const data = pathApi.join(root, "Data");
  return {
    root,
    projects,
    data,
    databaseFile: pathApi.join(data, "grooveforge.db")
  };
}

export async function ensureProjectWorkspace(paths: ProjectWorkspacePaths): Promise<void> {
  await mkdir(paths.root, { recursive: true, mode: 0o700 });
  await Promise.all([
    mkdir(paths.projects, { recursive: true, mode: 0o700 }),
    mkdir(paths.data, { recursive: true, mode: 0o700 })
  ]);
  if (process.platform !== "win32") {
    await Promise.all([
      chmod(paths.root, 0o700),
      chmod(paths.projects, 0o700),
      chmod(paths.data, 0o700)
    ]);
  }
}

export async function atomicWriteUtf8File(
  filePath: string,
  contents: string,
  maxCharacters: number
): Promise<void> {
  if (contents.length > maxCharacters) {
    throw new Error(`GrooveForge project text exceeds the ${maxCharacters.toLocaleString("en-US")} character safety limit.`);
  }

  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.${process.pid}.${randomUUID()}.tmp`
  );
  let fileHandle: Awaited<ReturnType<typeof open>> | null = null;

  try {
    fileHandle = await open(temporaryPath, "wx", 0o600);
    await fileHandle.writeFile(contents, "utf8");
    await fileHandle.sync();
    await fileHandle.close();
    fileHandle = null;
    await rename(temporaryPath, filePath);
  } finally {
    if (fileHandle) {
      await fileHandle.close().catch(() => undefined);
    }
    await unlink(temporaryPath).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") {
        throw error;
      }
    });
  }
}
