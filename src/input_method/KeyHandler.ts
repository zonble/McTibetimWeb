import { LayoutManager } from '../layout';
import Layout from '../layout/Layout';
import SambhotaKeymapOneLayout from '../layout/SambhotaKeymapOneLayout';

import { CommittingState, EmptyState, InputState, InputtingState } from './InputState';
import { Key, KeyName } from './Key';

export class KeyHandler {
  private layout_: Layout = new SambhotaKeymapOneLayout();

  selectLayoutById(id: string) {
    const layout = LayoutManager.getInstance().getLayoutById(id);
    if (layout) {
      this.layout_ = layout;
    }
  }

  getKeyNames(shift: boolean, ctrl: boolean, alt: boolean): Map<string, string> {
    return this.layout_.getKeyNames(shift, ctrl, alt);
  }

  handle(
    key: Key,
    state: InputState,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void,
  ): boolean {
    return this.layout_.handle(key, state, stateCallback, errorCallback);
  }
}
