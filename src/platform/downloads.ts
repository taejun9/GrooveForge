export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function downloadProjectFile(contents: string, fileName: string): void {
  downloadBlob(new Blob([contents], { type: "application/json" }), fileName);
}

export function downloadTextFile(contents: string, fileName: string): void {
  downloadBlob(new Blob([contents], { type: "text/plain;charset=utf-8" }), fileName);
}
