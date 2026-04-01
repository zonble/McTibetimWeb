import { CommittingState, EmptyState, InputState, InputtingState } from './InputState';
import { InputUI } from './InputUI';
import { InputUIStateBuilder } from './InputUIElements';
import { Key } from './Key';
import { KeyHandler } from './KeyHandler';
import { KeyMapping } from './KeyMapping';

/**
 * Acts as the centralized coordinator for input method operations.
 * 
 * It manages the underlying input state, translates raw device events
 * using a `KeyHandler`, mutates state, and updates the `InputUI` appropriately.
 */
export default class InputController {
  private state_: InputState = new EmptyState();
  private keyHandler_: KeyHandler = new KeyHandler();

  /** Gets the current input method state. */
  get state(): InputState {
    return this.state_;
  }

  /**
   * Returns display names for keys in the current layout and modifier state.
   * @param shift Whether the Shift modifier is active.
   * @param ctrl Whether the Control modifier is active.
   * @param alt Whether the Alt modifier is active.
   * @returns A map from key character to its Tibetan display name.
   */
  getCurrentKeyNames(shift: boolean, ctrl: boolean, alt: boolean): Map<string, string> {
    return this.keyHandler_.getKeyNames(shift, ctrl, alt);
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

  /**
   * Switches the active keyboard layout to the one with the given identifier.
   * 
   * Active composition is committed and the controller is reset.
   * @param id The layout identifier (e.g. 'wylie').
   */
  selectLayoutById(id: string): void {
    this.keyHandler_.selectLayoutById(id);
    this.reset();
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
   * Converts simple keyboard state into an internal Key and handles it.
   * @param button The character button pressed.
   * @param isShift Whether Shift is active.
   * @param isCtrl Whether Control is active.
   * @param isAlt Whether Alt is active.
   * @returns True if the key was handled.
   */
  handleSimpleKeyboardEvent(
    button: string,
    isShift: boolean,
    isCtrl: boolean,
    isAlt: boolean,
  ): boolean {
    const key = KeyMapping.keyFromSimpleKeyboardEvent(button, isShift, isCtrl, isAlt);
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
