/**
 * 역할: Node smoke에서 `.ts` 확장자 모듈을 저장소 소스로 해석하고 필요한 import 경로를 안전하게 보정한다.
 * 흐름: resolve/load hook이 로컬 후보 파일을 확인해 TypeScript 소스를 읽고 module 형식으로 Node에 반환한다.
 * 안전 경계: 저장소 파일 해석에만 관여하고 코드를 변환·수정하거나 네트워크에서 모듈을 가져오지 않으며 미해결 import는 상위로 실패시킨다.
 */
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (
      error?.code !== "ERR_MODULE_NOT_FOUND" ||
      !context.parentURL ||
      !(specifier.startsWith("./") || specifier.startsWith("../"))
    ) {
      throw error;
    }

    const candidateUrl = new URL(specifier, context.parentURL);
    if (candidateUrl.pathname.endsWith(".ts")) {
      throw error;
    }

    const candidatePath = `${fileURLToPath(candidateUrl)}.ts`;
    if (!existsSync(candidatePath)) {
      throw error;
    }

    return {
      shortCircuit: true,
      url: pathToFileURL(candidatePath).href
    };
  }
}
