export abstract class InputState {}

export class EmptyState extends InputState {}

/**
 * Transitional state that carries text to be committed to the host.
 */
export class CommittingState extends InputState {
  constructor(readonly commitString: string) {
    super();
  }
}

export class InputtingState extends InputState {
  readonly composingBuffer: string;

  constructor(readonly utf16Code: number[], readonly consonantIndexes: number[]) {
    super();
    this.composingBuffer = String.fromCharCode(...utf16Code);
  }

  get cursorIndex(): number {
    return this.composingBuffer.length;
  }
}

export class StackingState extends InputtingState {
  get tooltip(): string {
    return 'Stacking characters.';
  }
}
