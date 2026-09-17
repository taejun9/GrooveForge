/**
 * 데스크톱 렌더러의 탐색과 외부 링크 권한을 순수 URL 정책으로 한곳에 제한한다.
 * 실행 시 선택한 정확한 진입 문서만 네이티브 IPC를 사용할 수 있고 문서 내부 해시 이동은 허용한다.
 * OS 프로토콜 실행과 다른 로컬 파일 접근을 막기 위해 외부 링크에는 인증 정보 없는 HTTP(S)만 허용한다.
 */
export function isTrustedRendererUrl(candidate: string, entryUrl: string): boolean {
  try {
    const actual = new URL(candidate);
    const expected = new URL(entryUrl);
    if (!["file:", "http:", "https:"].includes(expected.protocol)) {
      return false;
    }
    actual.hash = "";
    expected.hash = "";
    return actual.href === expected.href;
  } catch {
    return false;
  }
}

export function externalBrowserUrl(candidate: string): string | null {
  // URL 파서가 제어문자를 조용히 제거한 뒤 위험한 입력을 정상 링크로 바꾸지 않게 먼저 거부한다.
  if (/[\u0000-\u001f\u007f]/u.test(candidate)) {
    return null;
  }
  try {
    const url = new URL(candidate);
    if ((url.protocol !== "https:" && url.protocol !== "http:") || url.username || url.password) {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}
