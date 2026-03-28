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

export abstract class InputtingState extends InputState {
  abstract get composingBuffer(): string;
  abstract get cursorIndex(): number;
  abstract get utf16Code(): number[];
}

export class StackingState extends InputtingState {
  private composingBuffer_: string;
  private _utf16Code: number[];
  get composingBuffer(): string {
    return this.composingBuffer_;
  }

  get utf16Code(): number[] {
    return this._utf16Code;
  }

  constructor(utf16Code: number[], readonly consonantIndexes: number[]) {
    super();
    this._utf16Code = utf16Code;
    this.composingBuffer_ = String.fromCharCode(...utf16Code);
  }

  get cursorIndex(): number {
    return this.composingBuffer.length;
  }

  get tooltip(): string {
    return 'Stacking characters.';
  }
}
