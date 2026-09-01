/**
 * 네이티브 저장·열기·미저장 종료 대화상자의 영어/한국어 옵션을 순수하게 만든다.
 * 호출자는 로케일과 프로젝트 경로만 전달하며, Electron UI에 표시될 전체 문구와 버튼·필터 계약은 이 모듈이 소유한다.
 * 파일 접근이나 대화상자 표시는 수행하지 않아 main 프로세스 밖의 스모크에서도 같은 옵션을 실행 검증할 수 있다.
 */
import type { MessageBoxSyncOptions, OpenDialogOptions, SaveDialogOptions } from "electron";
import path from "node:path";
import { keepEditingChoiceId, saveAndCloseChoiceId } from "./unsavedCloseDialog.js";

export type NativeDialogLocale = "en" | "ko";

type NativeDialogLabelSet = {
  closeWithoutProject: string;
  keepEditing: string;
  openProjectButton: string;
  openProjectTitle: string;
  projectFilter: string;
  saveAndClose: string;
  saveProjectButton: string;
  saveProjectTitle: string;
  unsavedDetail: string;
  unsavedMessage: string;
  unsavedTitle: string;
};

const nativeDialogLabels = {
  en: {
    closeWithoutProject: "Close without a project file",
    keepEditing: "Keep editing",
    openProjectButton: "Open",
    openProjectTitle: "Open GrooveForge Project",
    projectFilter: "GrooveForge Project",
    saveAndClose: "Save and close",
    saveProjectButton: "Save",
    saveProjectTitle: "Save GrooveForge Project",
    unsavedDetail:
      "Save and close creates a durable .grooveforge.json project file. Newer edits or a recovery draft that has not been restored keep GrooveForge open for review.",
    unsavedMessage: "Save this project before closing GrooveForge?",
    unsavedTitle: "Unsaved GrooveForge work"
  },
  ko: {
    closeWithoutProject: "프로젝트 파일 없이 닫기",
    keepEditing: "계속 편집",
    openProjectButton: "열기",
    openProjectTitle: "GrooveForge 프로젝트 열기",
    projectFilter: "GrooveForge 프로젝트",
    saveAndClose: "저장 후 닫기",
    saveProjectButton: "저장",
    saveProjectTitle: "GrooveForge 프로젝트 저장",
    unsavedDetail:
      "저장 후 닫기를 선택하면 영구 보관되는 .grooveforge.json 프로젝트 파일을 만듭니다. 아직 복원하지 않은 최신 편집 내용이나 복구 초안이 있으면 검토할 수 있도록 GrooveForge를 계속 열어 둡니다.",
    unsavedMessage: "GrooveForge를 닫기 전에 이 프로젝트를 저장할까요?",
    unsavedTitle: "저장되지 않은 GrooveForge 작업"
  }
} as const satisfies Record<NativeDialogLocale, NativeDialogLabelSet>;

function localizedProjectFilters(locale: NativeDialogLocale): Electron.FileFilter[] {
  return [{ name: nativeDialogLabels[locale].projectFilter, extensions: ["json"] }];
}

export function createNativeSaveProjectDialogOptions(
  locale: NativeDialogLocale,
  projectsDirectory: string,
  defaultName: string
): SaveDialogOptions {
  const label = nativeDialogLabels[locale];
  return {
    title: label.saveProjectTitle,
    buttonLabel: label.saveProjectButton,
    defaultPath: path.join(projectsDirectory, defaultName),
    filters: localizedProjectFilters(locale)
  };
}

export function createNativeOpenProjectDialogOptions(
  locale: NativeDialogLocale,
  projectsDirectory: string
): OpenDialogOptions {
  const label = nativeDialogLabels[locale];
  return {
    title: label.openProjectTitle,
    buttonLabel: label.openProjectButton,
    defaultPath: projectsDirectory,
    filters: localizedProjectFilters(locale),
    properties: ["openFile"]
  };
}

export function createNativeUnsavedCloseDialogOptions(locale: NativeDialogLocale): MessageBoxSyncOptions {
  const label = nativeDialogLabels[locale];
  return {
    type: "warning",
    buttons: [label.saveAndClose, label.closeWithoutProject, label.keepEditing],
    defaultId: saveAndCloseChoiceId,
    cancelId: keepEditingChoiceId,
    title: label.unsavedTitle,
    message: label.unsavedMessage,
    detail: label.unsavedDetail,
    noLink: true
  };
}
