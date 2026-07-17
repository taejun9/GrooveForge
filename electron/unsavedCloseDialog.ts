export const saveAndCloseChoiceId = 0;
export const closeWithoutProjectFileChoiceId = 1;
export const keepEditingChoiceId = 2;

export type UnsavedCloseAction = "save-and-close" | "close-without-project-file" | "keep-editing";

export function resolveUnsavedCloseAction(choiceId: number): UnsavedCloseAction {
  if (choiceId === saveAndCloseChoiceId) {
    return "save-and-close";
  }
  if (choiceId === closeWithoutProjectFileChoiceId) {
    return "close-without-project-file";
  }
  return "keep-editing";
}
