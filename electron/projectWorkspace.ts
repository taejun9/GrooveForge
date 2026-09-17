/**
 * 사용자 홈 아래 GrooveForge 작업 공간 경로와 프로젝트 파일의 제한 읽기·원자 저장을 제공하는 파일 시스템 계층이다.
 * Root/Projects/Data 경로를 한곳에서 계산하고 가능한 플랫폼에서는 소유자 전용 권한으로 디렉터리와 임시 파일을 제한한다.
 * 같은 핸들의 읽기 상한, 배타적 임시 파일 생성, fsync 후 rename 순서로 과대 입력·부분 쓰기·임시 파일 충돌을 막는다.
 */
import { randomUUID } from "node:crypto";
import { constants } from "node:fs";
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
    // 기존 디렉터리도 권한을 다시 조여 이전 실행에서 느슨해진 접근 모드를 그대로 두지 않는다.
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
    // 같은 이름의 임시 파일을 덮어쓰지 않고 디스크 동기화까지 끝낸 뒤 최종 경로로 교체한다.
    fileHandle = await open(temporaryPath, "wx", 0o600);
    await fileHandle.writeFile(contents, "utf8");
    await fileHandle.sync();
    await fileHandle.close();
    fileHandle = null;
    await rename(temporaryPath, filePath);
  } finally {
    // rename 전후 어느 단계에서 실패해도 열린 핸들과 고아 임시 파일을 최선 노력으로 정리한다.
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

export async function readBoundedProjectFile(
  filePath: string,
  maxBytes: number,
  maxCharacters: number
): Promise<string> {
  // 비정규 파일(FIFO/장치)이 선택되어도 open에서 무기한 대기하지 않고 같은 핸들로 종류와 크기를 검사한다.
  const fileHandle = await open(filePath, constants.O_RDONLY | constants.O_NONBLOCK);
  try {
    const fileStats = await fileHandle.stat();
    if (!fileStats.isFile()) {
      throw new Error("GrooveForge project path must be a regular file.");
    }
    const oversizeError = () => new Error(
      `GrooveForge project file exceeds the ${maxBytes.toLocaleString("en-US")} byte native read safety limit.`
    );
    if (fileStats.size > maxBytes) {
      throw oversizeError();
    }
    // stat 이후 파일이 커져도 최대 한 바이트만 초과 관측하고 중단한다. 경로 교체도 이미 연 핸들에 영향을 주지 않는다.
    const buffer = Buffer.allocUnsafe(maxBytes + 1);
    let byteLength = 0;
    while (byteLength <= maxBytes) {
      const { bytesRead } = await fileHandle.read(buffer, byteLength, buffer.length - byteLength, byteLength);
      if (bytesRead === 0) {
        break;
      }
      byteLength += bytesRead;
    }
    if (byteLength > maxBytes) {
      throw oversizeError();
    }
    const contents = buffer.subarray(0, byteLength).toString("utf8");
    if (contents.length > maxCharacters) {
      throw new Error(`GrooveForge project text exceeds the ${maxCharacters.toLocaleString("en-US")} character safety limit.`);
    }
    return contents;
  } finally {
    await fileHandle.close();
  }
}
