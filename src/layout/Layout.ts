import { InputState } from '../input_method/InputState';

export default abstract class Layout {
  abstract get layoutId(): string;
  abstract get layoutName(): string;

  abstract handle(
    key: string,
    state: InputState,
    stateCallback: (newState: InputState) => void,
    errorCallback: () => void,
  ): boolean;
}
