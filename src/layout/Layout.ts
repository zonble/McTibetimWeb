import { Key } from '../input_method/Key';
import { InputState } from '../input_method/InputState';

/**
 * Abstract base class for all keyboard layout implementations.
 *
 * Each concrete layout provides a unique identifier, a human-readable name,
 * a key-handling routine that drives the state machine, and a map of key
 * display names for the on-screen keyboard.
 */
export default abstract class Layout {
  /** Unique identifier for this layout (e.g. `'sambhota_keymap_one'`). */
  abstract get layoutId(): string;
  /** Human-readable name for this layout (e.g. `'Sambhota Keymap #1'`). */
  abstract get layoutName(): string;

  /**
   * Handles a key event within the given state.
   * @param key The key to handle.
   * @param state The current input state.
   * @param stateCallback Called with the new state when a transition occurs.
   * @param errorCallback Called when an unrecoverable input error is detected.
   * @returns `true` if the key was consumed by this layout.
   */
  abstract handle(
    key: Key,
    state: InputState,
    stateCallback: (newState: InputState) => void,
    errorCallback: () => void,
  ): boolean;

  /**
   * Returns display names for keys given the current modifier state.
   * @param shift Whether the Shift modifier is active.
   * @param ctrl Whether the Control modifier is active.
   * @param alt Whether the Alt modifier is active.
   * @returns A map from key character to its Tibetan display name.
   */
  abstract getKeyNames(shift: boolean, ctrl: boolean, alt: boolean): Map<string, string>;
}
