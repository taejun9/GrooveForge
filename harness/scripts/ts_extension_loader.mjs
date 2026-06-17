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
