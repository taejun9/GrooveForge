/**
 * 렌더러에서 생성한 Blob과 텍스트를 브라우저/Electron 다운로드 흐름으로 전달한다.
 * 임시 object URL의 생명주기를 이 모듈 안에서 끝내 메모리 누수를 방지하며,
 * 저장 위치 선택과 실제 파일 쓰기는 런타임의 다운로드 정책에 맡긴다.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  try {
    // DOM에 영구 노드를 추가할 필요 없이 download 속성이 지정된 임시 링크를 한 번 활성화한다.
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  } finally {
    // 클릭 처리 중 예외가 나더라도 Blob을 붙잡는 URL은 반드시 해제한다.
    URL.revokeObjectURL(url);
  }
}

export function downloadProjectFile(contents: string, fileName: string): void {
  downloadBlob(new Blob([contents], { type: "application/json" }), fileName);
}

export function downloadTextFile(contents: string, fileName: string): void {
  downloadBlob(new Blob([contents], { type: "text/plain;charset=utf-8" }), fileName);
}
