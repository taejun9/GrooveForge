export type LocalDraftWriteGate = {
  shouldWrite: boolean;
  skipNextWrite: boolean;
};

export function resolveLocalDraftWriteGate(writeArmed: boolean, skipNextWrite: boolean): LocalDraftWriteGate {
  if (skipNextWrite) {
    return { shouldWrite: false, skipNextWrite: false };
  }
  return { shouldWrite: writeArmed, skipNextWrite: false };
}
