export interface ChordCardKeyboardActivationEvent {
  key: string;
  target: unknown;
  currentTarget: unknown;
  preventDefault: () => void;
  stopPropagation: () => void;
}

export function handleChordCardKeyboardActivation(
  event: ChordCardKeyboardActivationEvent,
  onActivate: () => void
): boolean {
  if (event.target !== event.currentTarget || (event.key !== "Enter" && event.key !== " ")) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  onActivate();
  return true;
}
