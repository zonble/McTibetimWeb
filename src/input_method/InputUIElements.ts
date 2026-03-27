import { InputtingState } from './InputState';

enum ComposingBufferTextStyle {
  Normal = 'normal',
  Highlighted = 'highlighted',
}

class ComposingBufferText {
  readonly text: string;
  readonly style: ComposingBufferTextStyle;

  constructor(text: string, style: ComposingBufferTextStyle = ComposingBufferTextStyle.Normal) {
    this.text = text;
    this.style = style;
  }
}

class InputUIState {
  constructor(readonly composingBuffer: ComposingBufferText[], readonly cursorIndex: number) {}
}

/**
 * Builds the serialized UI payload for an InputtingState.
 *
 * This builder converts the internal input-method state into the compact JSON
 * structure expected by concrete UI implementations.
 */
export class InputUIStateBuilder {
  /**
   * Creates a builder for the given inputting state.
   * @param state The inputting state to serialize for the UI layer.
   */
  constructor(readonly state: InputtingState) {}

  /**
   * Builds the UI payload and returns it as a JSON string.
   * @returns The serialized UI payload.
   */
  buildJsonString(): string {
    return JSON.stringify(this.build());
  }

  /**
   * Builds the structured UI payload.
   * @returns The UI payload before JSON serialization.
   */
  build(): InputUIState {
    const composingBufferTexts: ComposingBufferText[] = [];
    const text = this.state.composingBuffer;
    composingBufferTexts.push(new ComposingBufferText(text));
    return new InputUIState(composingBufferTexts, this.state.cursorIndex);
  }
}
