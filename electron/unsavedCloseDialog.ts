export const closeWithoutProjectFileChoiceId = 0;
export const keepEditingChoiceId = 1;

export function shouldAllowUnsavedClose(choiceId: number): boolean {
  return choiceId === closeWithoutProjectFileChoiceId;
}
