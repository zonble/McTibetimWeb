import { Candidate } from './Candidate';

/** Base class for all input method states. */
export abstract class InputState {}

/** The idle state: no active composition. */
export class EmptyState extends InputState {}

/**
 * Transitional state that carries text to be committed to the host.
 */
export class CommittingState extends InputState {
  /**
   * @param commitString The text string to commit to the host application.
   */
  constructor(readonly commitString: string) {
    super();
  }
}

/** Base class for all states in which the user is actively composing text. */
export abstract class InputtingState extends InputState {
  /** The current composing buffer displayed to the user. */
  abstract get composingBuffer(): string;
  /** The cursor position within the composing buffer. */
  abstract get cursorIndex(): number;
  /** Optional tooltip text shown alongside the composing buffer. */
  abstract get tooltip(): string | undefined;
  /** The list of candidates currently available for selection. */
  abstract get candodates(): Candidate[];
  /** Keys used to directly select a candidate by position. */
  selectionKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
}

/**
 * Inputting state used by the Wylie transliteration layout.
 *
 * Holds the raw Wylie letters and the Tibetan Unicode preview produced by
 * the EWTS converter.
 */
export class WylieInputtingState extends InputtingState {
  /** Candidates are not used in Wylie mode. */
  candodates: Candidate[] = [];
  /**
   * @param letters The raw Wylie romanization typed so far.
   * @param tibetan The Tibetan Unicode string produced by the EWTS converter.
   * @param cursorIndex The cursor position within the composing buffer.
   */
  constructor(readonly letters: string, readonly tibetan: string, readonly cursorIndex: number) {
    super();
  }

  get composingBuffer(): string {
    return this.letters;
  }
  get tooltip(): string | undefined {
    return this.tibetan;
  }
}

/**
 * Inputting state used by stacking-based layouts (Sambhota, TCC, Dzongkha).
 *
 * Stores the composed Unicode code points and the indices of the consonants
 * that have been stacked so far.
 */
export class StackingState extends InputtingState {
  private composingBuffer_: string;
  private _utf16Code: number[];
  get composingBuffer(): string {
    return this.composingBuffer_;
  }

  /** The UTF-16 code units that make up the current composed character. */
  get utf16Code(): number[] {
    return this._utf16Code;
  }

  /** Candidates are not used in stacking mode. */
  candodates: Candidate[] = [];

  /**
   * @param utf16Code The UTF-16 code units of the character being composed.
   * @param consonantIndexes Indices into the layout's consonant mapping for
   *   each consonant that has been added to the stack.
   */
  constructor(utf16Code: number[], readonly consonantIndexes: number[]) {
    super();
    this._utf16Code = utf16Code;
    this.composingBuffer_ = String.fromCharCode(...utf16Code);
  }

  get cursorIndex(): number {
    return this.composingBuffer.length;
  }

  get tooltip(): string | undefined {
    return 'Stacking';
  }
}
