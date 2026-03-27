import { LayoutManager } from '../layout';
import Layout from '../layout/Layout';
import SambhotaKeymapOneLayout from '../layout/SambhotaKeymapOneLayout';

import { CommittingState, EmptyState, InputState, InputtingState } from './InputState';
import { Key, KeyName } from './Key';

export class KeyHandler {
  private layout: Layout = new SambhotaKeymapOneLayout();
  selectLayoutById(id: string) {
    const layout = LayoutManager.getInstance().getLayoutById(id);
    if (layout) {
      this.layout = layout;
    }
  }

  handle(
    key: Key,
    state: InputState,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void,
  ): boolean {
    if (key.ctrlPressed) {
      return false;
    }

    if (key.isCursorKey) {
      if (state instanceof InputtingState) {
        const buffer = state.composingBuffer;
        if (buffer.length > 0) {
          stateCallback(new CommittingState(buffer));
        }
        return false;
      }
    }

    if (key.name === KeyName.RETURN) {
      if (state instanceof InputtingState) {
        const buffer = state.composingBuffer;
        if (buffer.length > 0) {
          stateCallback(new CommittingState(buffer));
        }
        return true;
      }
    }

    if (key.name === KeyName.SPACE) {
      let codes: number[] = [];
      if (state instanceof InputtingState) {
        codes = state.utf16Code;
      }
      codes.push(0x0f0b);
      const buffer = String.fromCharCode(...codes);
      stateCallback(new CommittingState(buffer));
      return true;
    }

    if (key.isDeleteKey) {
      if (state instanceof InputtingState) {
        const empty = new EmptyState();
        stateCallback(empty);
        return true;
      }
    }

    return this.layout.handle(key.ascii, state, stateCallback, errorCallback);
  }
}
