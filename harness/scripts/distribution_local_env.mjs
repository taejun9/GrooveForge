/**
 * 역할: 로컬 배포용 비공개 환경 파일을 읽고 필수 키·placeholder·승인 플래그를 정규화해 후속 릴리스 검사에 제공한다.
 * 흐름: 허용된 파일 경로를 해석하고 key/value를 파싱한 뒤 공개 가능한 요약과 누락·placeholder 진단을 분리한다.
 * 개인정보 경계: 비밀 값은 로그나 증거에 원문으로 싣지 않고 키별 상태만 반환하며, 이 모듈 자체는 외부 작업을 수행하지 않는다.
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const defaultEnvFileName = ".env.distribution.local";
const placeholderPattern = /^(|<[^>]+>|CHANGE_ME|REPLACE_ME|TODO|TBD|example|example-.+|your-.+|https:\/\/example\.com.*)$/i;
export const distributionPrivateInputKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL",
  "GROOVEFORGE_DISTRIBUTION_QA_APPROVED",
  "GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256",
  "GROOVEFORGE_UPDATE_FEED_URL",
  "ELECTRON_UPDATE_FEED_URL",
  "UPDATE_FEED_URL",
  "GROOVEFORGE_UPDATE_CHANNEL",
  "ELECTRON_UPDATE_CHANNEL",
  "UPDATE_CHANNEL",
  "GROOVEFORGE_DEVELOPER_ID_IDENTITY",
  "GROOVEFORGE_NOTARY_SUBMIT",
  "APPLE_ID",
  "APPLE_TEAM_ID",
  "APPLE_APP_SPECIFIC_PASSWORD",
  "ASC_KEY_ID",
  "ASC_ISSUER_ID",
  "ASC_KEY_PATH",
  "APPLE_NOTARY_PROFILE",
  "NOTARYTOOL_KEYCHAIN_PROFILE"
];

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }
  const withoutExport = trimmed.startsWith("export ") ? trimmed.slice("export ".length).trim() : trimmed;
  const separatorIndex = withoutExport.indexOf("=");
  if (separatorIndex <= 0) {
    return null;
  }
  const key = withoutExport.slice(0, separatorIndex).trim();
  let value = withoutExport.slice(separatorIndex + 1).trim();
  if (!/^[A-Z0-9_]+$/.test(key)) {
    return null;
  }
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return { key, value };
}

function isPlaceholderValue(value) {
  return placeholderPattern.test(String(value).trim());
}

function displayPath(root, filePath) {
  const relativePath = path.relative(root, filePath);
  if (!relativePath.startsWith("..") && !path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.basename(filePath);
}

function configuredFilePaths(root) {
  const customPath = process.env.GROOVEFORGE_DISTRIBUTION_ENV_FILE?.trim();
  if (customPath) {
    return [path.isAbsolute(customPath) ? customPath : path.resolve(root, customPath)];
  }
  return [path.join(root, defaultEnvFileName)];
}

export async function loadDistributionLocalEnv(options = {}) {
  const root = options.root ?? process.cwd();
  const allowedKeys = new Set(options.allowedKeys ?? []);
  const files = configuredFilePaths(root);
  const loadedKeys = [];
  const skippedExistingKeys = [];
  const placeholderKeys = [];
  const unknownKeys = [];
  const malformedLines = [];
  const presentFiles = [];

  // 파일에 적힌 값보다 이미 주입된 프로세스 환경을 우선한다. 운영자가 셸에서 승인한 비밀을
  // 로컬 파일이 조용히 덮어쓰지 못하게 하고, 보고서에는 값 대신 키 단위 처리 결과만 남긴다.
  for (const filePath of files) {
    if (!existsSync(filePath)) {
      continue;
    }
    presentFiles.push(displayPath(root, filePath));
    const lines = (await readFile(filePath, "utf8")).split(/\r?\n/);
    for (const [index, line] of lines.entries()) {
      const parsed = parseEnvLine(line);
      if (!parsed) {
        if (line.trim() && !line.trim().startsWith("#")) {
          malformedLines.push(`${displayPath(root, filePath)}:${index + 1}`);
        }
        continue;
      }
      const { key, value } = parsed;
      if (allowedKeys.size > 0 && !allowedKeys.has(key)) {
        unknownKeys.push(key);
        continue;
      }
      if (isPlaceholderValue(value)) {
        placeholderKeys.push(key);
        continue;
      }
      if (process.env[key] && process.env[key].trim().length > 0) {
        skippedExistingKeys.push(key);
        continue;
      }
      // placeholder·미허용 키·형식 오류를 모두 걸러낸 뒤에만 현재 자식 프로세스 범위에 반영한다.
      process.env[key] = value;
      loadedKeys.push(key);
    }
  }

  return {
    enabled: presentFiles.length > 0,
    defaultFileName: defaultEnvFileName,
    configuredFileKey: "GROOVEFORGE_DISTRIBUTION_ENV_FILE",
    filesChecked: files.map((filePath) => displayPath(root, filePath)),
    presentFiles,
    loadedKeys: [...new Set(loadedKeys)],
    skippedExistingKeys: [...new Set(skippedExistingKeys)],
    placeholderKeys: [...new Set(placeholderKeys)],
    unknownKeys: [...new Set(unknownKeys)],
    malformedLines,
    valueRecorded: false
  };
}

export const distributionLocalEnvDefaults = {
  defaultEnvFileName,
  configuredFileKey: "GROOVEFORGE_DISTRIBUTION_ENV_FILE"
};
