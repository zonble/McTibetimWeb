import { Key, KeyName } from '../input_method/Key';
import {
  CommittingState,
  EmptyState,
  InputState,
  WylieInputtingState,
} from '../input_method/InputState';
import Layout from './Layout';
// @ts-ignore
import { EwtsConverter } from 'tibetan-ewts-converter/EwtsConverter';
const ewts = new EwtsConverter();

function convertWylieToTibetan(wylie: string): string {
  let result = ewts.to_unicode(wylie);
  console.log(`convertWylieToTibetan: ${wylie} -> ${result}`);
  return result;
}

export default class WyleLayout extends Layout {
  readonly layoutId = 'wylie';
  readonly layoutName = 'Wylie';

  handle(
    key: Key,
    state: InputState,
    stateCallback: (newState: InputState) => void,
    errorCallback: () => void,
  ): boolean {
    if (key.ctrlPressed || key.altPressed) {
      if (state instanceof WylieInputtingState) {
        stateCallback(new EmptyState());
      }
      return false;
    }

    const ascii = key.ascii;

    if (key.name === KeyName.SPACE) {
      let tibetan = '';
      if (state instanceof WylieInputtingState) {
        tibetan = state.tibetan ?? '';
      }
      tibetan += '་';
      stateCallback(new CommittingState(tibetan));
      return true;
    }

    // RETURN key sends letters.
    if (key.name === KeyName.RETURN) {
      if (state instanceof WylieInputtingState) {
        let letters = state.letters;
        if (letters.length > 0) {
          stateCallback(new CommittingState(letters));
        }
        return true;
      } else {
        return false;
      }
    }

    if (key.name === KeyName.ESC) {
      if (state instanceof WylieInputtingState) {
        stateCallback(new EmptyState());
        return true;
      } else {
        return true;
      }
    }

    if (key.name === KeyName.BACKSPACE) {
      if (state instanceof WylieInputtingState) {
        if (state.cursorIndex === 0) {
          errorCallback();
          return true;
        }
        let letters = state.letters;
        let beforeCursor = letters.slice(0, state.cursorIndex - 1);
        let afterCursor = letters.slice(state.cursorIndex);
        letters = beforeCursor + afterCursor;
        if (letters.length === 0) {
          stateCallback(new EmptyState());
          return true;
        }
        let cursorIndex = state.cursorIndex - 1;
        const tibetan = convertWylieToTibetan(letters);
        const newState = new WylieInputtingState(letters, tibetan, cursorIndex);
        stateCallback(newState);
        return true;
      } else {
        return false;
      }
    }

    if (key.name === KeyName.DELETE) {
      if (state instanceof WylieInputtingState) {
        if (state.cursorIndex === state.letters.length) {
          errorCallback();
          return true;
        }
        let letters = state.letters;
        let beforeCursor = letters.slice(0, state.cursorIndex);
        let afterCursor = letters.slice(state.cursorIndex + 1);
        letters = beforeCursor + afterCursor;
        if (letters.length === 0) {
          stateCallback(new EmptyState());
          return true;
        }
        let cursorIndex = state.cursorIndex;
        const tibetan = convertWylieToTibetan(letters);
        const newState = new WylieInputtingState(letters, tibetan, cursorIndex);
        stateCallback(newState);
        return true;
      } else {
        return false;
      }
    }

    if (key.name === KeyName.LEFT) {
      if (state instanceof WylieInputtingState) {
        let cursorIndex = state.cursorIndex;
        if (cursorIndex === 0) {
          errorCallback();
          return true;
        }
        cursorIndex -= 1;
        const newState = new WylieInputtingState(state.letters, state.tibetan, cursorIndex);
        stateCallback(newState);
        return true;
      } else {
        return false;
      }
    }

    if (key.name === KeyName.RIGHT) {
      if (state instanceof WylieInputtingState) {
        let cursorIndex = state.cursorIndex;
        if (cursorIndex === state.letters.length) {
          errorCallback();
          return true;
        }
        cursorIndex += 1;
        const newState = new WylieInputtingState(state.letters, state.tibetan, cursorIndex);
        stateCallback(newState);
        return true;
      } else {
        return false;
      }
    }

    if (key.name === KeyName.HOME) {
      if (state instanceof WylieInputtingState) {
        let cursorIndex = 0;
        const newState = new WylieInputtingState(state.letters, state.tibetan, cursorIndex);
        stateCallback(newState);
        return true;
      } else {
        return false;
      }
    }

    if (key.name === KeyName.END) {
      if (state instanceof WylieInputtingState) {
        let cursorIndex = state.letters.length;
        const newState = new WylieInputtingState(state.letters, state.tibetan, cursorIndex);
        stateCallback(newState);
        return true;
      } else {
        return false;
      }
    }

    if (ascii.length === 1) {
      if (state instanceof WylieInputtingState) {
        let letters = state.letters;
        let beforeCursor = letters.slice(0, state.cursorIndex);
        let afterCursor = letters.slice(state.cursorIndex);
        letters = beforeCursor + ascii + afterCursor;
        let cursorIndex = state.cursorIndex + 1;
        const tibetan = convertWylieToTibetan(letters);
        const newState = new WylieInputtingState(letters, tibetan, cursorIndex);
        stateCallback(newState);
      } else {
        let letters = '';
        letters += ascii;
        let cursorIndex = 1;
        const tibetan = convertWylieToTibetan(letters);
        const newState = new WylieInputtingState(letters, tibetan, cursorIndex);
        stateCallback(newState);
      }
      return true;
    }

    return false;
  }

  getKeyNames(shift: boolean, ctrl: boolean, alt: boolean): Map<string, string> {
    return new Map<string, string>();
  }
}
