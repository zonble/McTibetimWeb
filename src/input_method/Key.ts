/**
 * @license
 * Copyright (c) 2025 and onwards The McTabIM Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { KeyMapping } from './KeyMapping';

/**
 * Logical key names understood by the input method.
 */
export enum KeyName {
  ASCII = 'ASCII',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  HOME = 'HOME',
  END = 'END',
  BACKSPACE = 'BACKSPACE',
  RETURN = 'RETURN',
  UP = 'UP',
  DOWN = 'DOWN',
  ESC = 'ESC',
  SPACE = 'SPACE',
  DELETE = 'DELETE',
  TAB = 'TAB',
  PAGE_UP = 'PAGE_UP',
  PAGE_DOWN = 'PAGE_DOWN',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Encapsulates the keys accepted by KeyHandler. This class never attempts to
 * represent all key states that a generic input method framework desires to
 * handle. Instead, this class only reflects the keys KeyHandler will handle.
 *
 * This is not always a perfect representation (for example, shift muddles the
 * picture), but is sufficient for KeyHandler's needs.
 */
export class Key {
  /**
   * Creates an input-method key value.
   * @param c Printable character carried by the key, if any.
   * @param n Logical key name.
   * @param shiftPressed Whether Shift is pressed.
   * @param ctrlPressed Whether Control is pressed.
   * @param isNumpadKey Whether the key originated from the numpad.
   */
  constructor(
    readonly ascii: string = '',
    readonly name: KeyName = KeyName.UNKNOWN,
    readonly shiftPressed: boolean = false,
    readonly ctrlPressed: boolean = false,
    readonly isNumpadKey: boolean = false,
    readonly altPressed: boolean = false,
    readonly altGraphPressed: boolean = false,
    readonly code: string = '',
  ) {}

  /**
   * Creates a key with an ASCII character.
   * @param c The ASCII character.
   * @param shiftPressed If the shift key is pressed.
   * @param ctrlPressed If the control key is pressed.
   * @returns The key.
   */
  static asciiKey(c: string, shiftPressed: boolean = false, ctrlPressed: boolean = false): Key {
    return new Key(c, KeyName.ASCII, shiftPressed, ctrlPressed);
  }

  /**
   * Creates a key with a name.
   * @param name The name of the key.
   * @param shiftPressed If the shift key is pressed.
   * @param ctrlPressed If the control key is pressed.
   * @returns The key.
   */
  static namedKey(name: KeyName, shiftPressed: boolean = false, ctrlPressed: boolean = false): Key {
    return new Key('', name, shiftPressed, ctrlPressed);
  }

  /** If the key is for moving the input cursor. */
  get isCursorKey(): boolean {
    if (this.ctrlPressed) {
      return this.ascii === 'a' || this.ascii === 'e' || this.ascii === 'f' || this.ascii === 'b';
    }

    return (
      this.name === KeyName.LEFT ||
      this.name === KeyName.RIGHT ||
      this.name === KeyName.HOME ||
      this.name === KeyName.END
    );
  }

  /** If the key is for deleting the previous character. */
  get isDeleteKey(): boolean {
    if (this.ctrlPressed) {
      return this.ascii === 'h' || this.ascii === 'd';
    }
    return this.name === KeyName.BACKSPACE || this.name === KeyName.DELETE;
  }

  /**
   * Returns a string representation of the key.
   * @returns A string representation of the key.
   */
  toString(): string {
    let result = `Key{ascii: ${this.ascii}, name: ${this.name}, shift: ${this.shiftPressed}, ctrl: ${this.ctrlPressed}`;
    if (this.altPressed) {
      result += `, alt: ${this.altPressed}}`;
    }
    result += '}';
    return result;
  }
}

/**
 * Converts a browser keyboard event into the internal Key representation.
 * @param event The browser keyboard event.
 * @returns The converted input-method key.
 */
export function KeyFromKeyboardEvent(event: KeyboardEvent) {
  return KeyMapping.keyFromKeyboardEvent(event);
}

/**
 * Converts a simple virtual keyboard event into the internal Key representation.
 * @param button The button identifier or character.
 * @param isShift Whether Shift is pressed.
 * @param isCtrl Whether Control is pressed.
 * @param isAlt Whether Alt is pressed.
 * @returns The converted input-method key.
 */
export function KeyFromSimpleKeyboardEvent(
  button: string,
  isShift: boolean,
  isCtrl: boolean,
  isAlt: boolean,
) {
  return KeyMapping.keyFromSimpleKeyboardEvent(button, isShift, isCtrl, isAlt);
}
