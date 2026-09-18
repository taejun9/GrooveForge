/**
 * 화면 정보량 설정을 음악 프로젝트와 분리하여 이 기기에 저장한다.
 * 저장소가 차단되면 현재 세션에서는 계속 전환하며 저장 실패를 호출자에게 돌려준다.
 */
export type WorkspaceDensity = "simple" | "full";
export const workspaceDensityStorageKey = "grooveforge.workspace-density.v1";

export function readWorkspaceDensity(): WorkspaceDensity {
  try {
    return window.localStorage.getItem(workspaceDensityStorageKey) === "simple" ? "simple" : "full";
  } catch {
    return "full";
  }
}

export function saveWorkspaceDensity(density: WorkspaceDensity): boolean {
  try {
    window.localStorage.setItem(workspaceDensityStorageKey, density);
    return true;
  } catch {
    return false;
  }
}
