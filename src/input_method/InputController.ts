import { CommittingState, EmptyState, InputState, InputtingState } from './InputState';
import { InputUI } from './InputUI';
import { InputUIStateBuilder } from './InputUIElements';
import { Key } from './Key';
import { KeyHandler } from './KeyHandler';
import { KeyMapping } from './KeyMapping';

export default class InputController {
  private state_: InputState = new EmptyState();
  private keyHandler_: KeyHandler = new KeyHandler();

  /** Gets the current input method state. */
  get state(): InputState {
    return this.state_;
  }

  /** Called when key handling reports an unrecoverable input error. */
  onError: () => void = () => {};

  /**
   * Creates a controller that drives the given UI implementation.
   * @param ui_ The UI adapter used to render composition state and commit text.
   */
  constructor(private ui_: InputUI) {}

  /**
   * Resets the controller to EmptyState.
   *
   * If composition is still active, the current composing buffer is committed
   * before the UI is cleared.
   */
  reset(): void {
    const oldState = this.state_;
    if (oldState instanceof InputtingState) {
      if (oldState.composingBuffer.length > 0) {
        this.ui_.commitString(oldState.composingBuffer);
      }
    }
    this.enterState(this.state_, new EmptyState());
  }

  selectLayoutById(id: string): void {
    this.keyHandler_.selectLayoutById(id);
  }

  /**
   * Converts a DOM keyboard event into an internal Key and handles it.
   * @param event The keyboard event.
   * @returns True if the event was handled.
   */
  handleKeyboardEvent(event: KeyboardEvent): boolean {
    const key = KeyMapping.keyFromKeyboardEvent(event);
    return this.handle(key);
  }

  /**
   * Handles an already translated key input.
   *
   * The key is delegated to KeyHandler, and any resulting state transition is
   * applied through this controller.
   * @param key The key to handle.
   * @returns True if the key was handled.
   */
  handle(key: Key): boolean {
    const handled = this.keyHandler_.handle(
      key,
      this.state_,
      (state) => this.enterState(this.state_, state),
      () => this.onError(),
    );
    return handled;
  }

  private enterState(oldState: InputState, newState: InputState): void {
    if (newState instanceof EmptyState) {
      this.handleEmptyState(oldState, newState);
    } else if (newState instanceof CommittingState) {
      this.handleCommittingState(oldState, newState);
    } else if (newState instanceof InputtingState) {
      this.handleInputtingState(oldState, newState);
    }
  }

  private handleEmptyState(oldState: InputState, newState: EmptyState): void {
    this.ui_.reset();
    this.state_ = newState;
  }

  private handleCommittingState(oldState: InputState, newState: CommittingState): void {
    this.ui_.commitString(newState.commitString);
    this.ui_.reset();
    this.state_ = new EmptyState();
  }

  private handleInputtingState(oldState: InputState, newState: InputtingState): void {
    const builder = new InputUIStateBuilder(newState);
    const uiState = builder.buildJsonString();
    this.ui_.reset();
    this.ui_.update(uiState);
    this.state_ = newState;
  }
}
