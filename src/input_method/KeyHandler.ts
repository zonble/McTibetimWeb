import Layout from '../layout/Layout';
import LayoutManager from '../layout/LayoutManager';
import { InputState } from './InputState';
import { Key } from './Key';

/**
 * Bridges key events with the active keyboard layout.
 *
 * KeyHandler owns a single Layout instance and delegates all key-handling and
 * key-name queries to it. The active layout can be changed at runtime via
 * {@link selectLayoutById}.
 */
export class KeyHandler {
  private layout_: Layout = LayoutManager.getInstance().layouts[0];

  /**
   * Switches the active layout to the one identified by {@link id}.
   *
   * If no layout with the given id is registered, the current layout is kept.
   * @param id The layout identifier (e.g. `'sambhota_keymap_one'`).
   */
  selectLayoutById(id: string) {
    const layout = LayoutManager.getInstance().getLayoutById(id);
    if (layout) {
      this.layout_ = layout;
    }
  }

  /**
   * Returns the display names for all keys in the given modifier state.
   * @param shift Whether the Shift modifier is active.
   * @param ctrl Whether the Control modifier is active.
   * @param alt Whether the Alt modifier is active.
   * @returns A map from key character to its display name.
   */
  getKeyNames(shift: boolean, ctrl: boolean, alt: boolean): Map<string, string> {
    return this.layout_.getKeyNames(shift, ctrl, alt);
  }

  /**
   * Handles a key event within the given state.
   * @param key The key to handle.
   * @param state The current input state.
   * @param stateCallback Called with the new state when a transition occurs.
   * @param errorCallback Called when an unrecoverable input error is detected.
   * @returns `true` if the key was consumed by the layout.
   */
  handle(
    key: Key,
    state: InputState,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void,
  ): boolean {
    return this.layout_.handle(key, state, stateCallback, errorCallback);
  }
}
