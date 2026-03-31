import { Key, KeyName } from './Key';

/**
 * Maps DOM keyboard events into the internal Key representation.
 */
export class KeyMapping {
  static readonly upperKeyCodeAsciiMapping = new Map<string, string>([
    ['Backquote', '~'],
    ['Backslash', '|'],
    ['BracketLeft', '{'],
    ['BracketRight', '}'],
    ['Comma', '<'],
    ['Digit0', ')'],
    ['Digit1', '!'],
    ['Digit2', '@'],
    ['Digit3', '#'],
    ['Digit4', '$'],
    ['Digit5', '%'],
    ['Digit6', '^'],
    ['Digit7', '&'],
    ['Digit8', '*'],
    ['Digit9', '('],
    ['Equal', '+'],
    ['KeyA', 'A'],
    ['KeyB', 'B'],
    ['KeyC', 'C'],
    ['KeyD', 'D'],
    ['KeyE', 'E'],
    ['KeyF', 'F'],
    ['KeyG', 'G'],
    ['KeyH', 'H'],
    ['KeyI', 'I'],
    ['KeyJ', 'J'],
    ['KeyK', 'K'],
    ['KeyL', 'L'],
    ['KeyM', 'M'],
    ['KeyN', 'N'],
    ['KeyO', 'O'],
    ['KeyP', 'P'],
    ['KeyQ', 'Q'],
    ['KeyR', 'R'],
    ['KeyS', 'S'],
    ['KeyT', 'T'],
    ['KeyU', 'U'],
    ['KeyV', 'V'],
    ['KeyW', 'W'],
    ['KeyX', 'X'],
    ['KeyY', 'Y'],
    ['KeyZ', 'Z'],
    ['Minus', '_'],
    ['Period', '>'],
    ['Quote', '"'],
    ['Semicolon', ':'],
    ['Slash', '?'],
  ]);

  static readonly lowerKeyCodeAsciiMapping = new Map<string, string>([
    ['Backquote', '`'],
    ['Backslash', '\\'],
    ['BracketLeft', '['],
    ['BracketRight', ']'],
    ['Comma', ','],
    ['Digit0', '0'],
    ['Digit1', '1'],
    ['Digit2', '2'],
    ['Digit3', '3'],
    ['Digit4', '4'],
    ['Digit5', '5'],
    ['Digit6', '6'],
    ['Digit7', '7'],
    ['Digit8', '8'],
    ['Digit9', '9'],
    ['Equal', '='],
    ['KeyA', 'a'],
    ['KeyB', 'b'],
    ['KeyC', 'c'],
    ['KeyD', 'd'],
    ['KeyE', 'e'],
    ['KeyF', 'f'],
    ['KeyG', 'g'],
    ['KeyH', 'h'],
    ['KeyI', 'i'],
    ['KeyJ', 'j'],
    ['KeyK', 'k'],
    ['KeyL', 'l'],
    ['KeyM', 'm'],
    ['KeyN', 'n'],
    ['KeyO', 'o'],
    ['KeyP', 'p'],
    ['KeyQ', 'q'],
    ['KeyR', 'r'],
    ['KeyS', 's'],
    ['KeyT', 't'],
    ['KeyU', 'u'],
    ['KeyV', 'v'],
    ['KeyW', 'w'],
    ['KeyX', 'x'],
    ['KeyY', 'y'],
    ['KeyZ', 'z'],
    ['Minus', '-'],
    ['Period', '.'],
    ['Quote', '"'],
    ['Semicolon', ';'],
    ['Slash', '/'],
  ]);

  static keyFromSimpleKeyboardEvent(
    button: string,
    isShift: boolean,
    isCtrl: boolean,
    isAlt: boolean,
  ) {
    let keyName = KeyName.UNKNOWN;
    let ascii = '';

    if (button.length === 1) {
      keyName = KeyName.ASCII;
      ascii = button;
    } else {
      switch (button) {
        case '{bksp}':
          keyName = KeyName.BACKSPACE;
          break;
        case '{enter}':
          keyName = KeyName.RETURN;
          break;
        case '{space}':
          keyName = KeyName.SPACE;
          ascii = ' ';
          break;
        case '{tab}':
          keyName = KeyName.TAB;
          break;
        default:
          break;
      }
    }
    let code = '';
    if (isShift) {
      code = [...KeyMapping.upperKeyCodeAsciiMapping.entries()].find(
        ([, value]) => value === ascii,
      )?.[0] as string;
    } else {
      code = [...KeyMapping.lowerKeyCodeAsciiMapping.entries()].find(
        ([, value]) => value === ascii,
      )?.[0] as string;
    }

    return new Key(ascii, keyName, isShift, isCtrl, false, isAlt, isAlt, code);
  }
  /**
   * Converts a browser keyboard event into a normalized Key.
   * @param event The browser keyboard event.
   * @returns The converted input-method key.
   */
  static keyFromKeyboardEvent(event: KeyboardEvent): Key {
    let isNumpadKey = false;
    let keyName = KeyName.UNKNOWN;
    switch (event.code) {
      case 'ArrowLeft':
        keyName = KeyName.LEFT;
        break;
      case 'ArrowRight':
        keyName = KeyName.RIGHT;
        break;
      case 'ArrowUp':
        keyName = KeyName.UP;
        break;
      case 'ArrowDown':
        keyName = KeyName.DOWN;
        break;
      case 'Home':
        keyName = KeyName.HOME;
        break;
      case 'End':
        keyName = KeyName.END;
        break;
      case 'Backspace':
        keyName = KeyName.BACKSPACE;
        break;
      case 'Delete':
        keyName = KeyName.DELETE;
        break;
      case 'NumpadEnter':
      case 'Enter':
        keyName = KeyName.RETURN;
        break;
      case 'Escape':
        keyName = KeyName.ESC;
        break;
      case 'Space':
        keyName = KeyName.SPACE;
        break;
      case 'Tab':
        keyName = KeyName.TAB;
        break;
      case 'PageUp':
        keyName = KeyName.PAGE_UP;
        break;
      case 'PageDown':
        keyName = KeyName.PAGE_DOWN;
        break;
      case 'NumpadAdd':
      case 'NumpadSubtract':
      case 'NumpadMultiply':
      case 'NumpadDivide':
      case 'NumpadDecimal':
        keyName = KeyName.ASCII;
        isNumpadKey = true;
        break;
      case 'Numpad0':
      case 'Numpad1':
      case 'Numpad2':
      case 'Numpad3':
      case 'Numpad4':
      case 'Numpad5':
      case 'Numpad6':
      case 'Numpad7':
      case 'Numpad8':
      case 'Numpad9':
        if (event.key.length === 1) {
          keyName = KeyName.ASCII;
          isNumpadKey = true;
        } else {
          // console.log(event.key);
          switch (event.key) {
            case 'ArrowLeft':
              keyName = KeyName.LEFT;
              break;
            case 'ArrowRight':
              keyName = KeyName.RIGHT;
              break;
            case 'ArrowUp':
              keyName = KeyName.UP;
              break;
            case 'ArrowDown':
              keyName = KeyName.DOWN;
              break;
            case 'Home':
              keyName = KeyName.HOME;
              break;
            case 'End':
              keyName = KeyName.END;
              break;
            case 'PageUp':
              keyName = KeyName.PAGE_UP;
              break;
            case 'PageDown':
              keyName = KeyName.PAGE_DOWN;
              break;
            default:
              break;
          }
        }
      default:
        break;
    }

    let isAlt = event.altKey;
    let isAltGr = event.altKey;
    try {
      if (typeof event.getModifierState === 'function') {
        isAltGr = event.getModifierState('AltGraph');
      }
    } catch (e) {
      // Some browsers may throw an error if 'AltGraph' is not supported. In that case, we fall back to using altKey.
    }

    const key = new Key(
      event.key,
      keyName,
      event.shiftKey,
      event.ctrlKey,
      isNumpadKey,
      isAlt,
      isAltGr,
      event.code,
    );
    return key;
  }
}
