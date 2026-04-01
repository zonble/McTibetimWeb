import { KeyName } from './input_method/Key';
import { KeyFromKeyboardEvent, VK_Keys } from './pime_keys';

/**
 * Helper to build a keyStates array (256 bytes) with optional modifier bits.
 * Bit 7 of each byte signals whether that key is currently pressed.
 */
function makeKeyStates(options: { shift?: boolean; ctrl?: boolean; alt?: boolean } = {}): number[] {
  const states = new Array<number>(256).fill(0);
  if (options.shift) states[VK_Keys.VK_SHIFT] = 0x80;
  if (options.ctrl) states[VK_Keys.VK_CONTROL] = 0x80;
  if (options.alt) states[VK_Keys.VK_MENU] = 0x80;
  return states;
}

describe('KeyFromKeyboardEvent (pime_keys)', () => {
  const noModifiers = makeKeyStates();

  describe('navigation keys', () => {
    it('maps VK_LEFT to KeyName.LEFT', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_LEFT, noModifiers, '', 0);
      expect(key.name).toBe(KeyName.LEFT);
      expect(key.ascii).toBe('ArrowLeft');
    });

    it('maps VK_RIGHT to KeyName.RIGHT', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_RIGHT, noModifiers, '', 0);
      expect(key.name).toBe(KeyName.RIGHT);
      expect(key.ascii).toBe('ArrowRight');
    });

    it('maps VK_UP to KeyName.UP', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_UP, noModifiers, '', 0);
      expect(key.name).toBe(KeyName.UP);
      expect(key.ascii).toBe('ArrowUp');
    });

    it('maps VK_DOWN to KeyName.DOWN', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_DOWN, noModifiers, '', 0);
      expect(key.name).toBe(KeyName.DOWN);
      expect(key.ascii).toBe('ArrowDown');
    });

    it('maps VK_HOME to KeyName.HOME', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_HOME, noModifiers, '', 0);
      expect(key.name).toBe(KeyName.HOME);
      expect(key.ascii).toBe('Home');
    });

    it('maps VK_END to KeyName.END', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_END, noModifiers, '', 0);
      expect(key.name).toBe(KeyName.END);
      expect(key.ascii).toBe('End');
    });
  });

  describe('editing keys', () => {
    it('maps VK_BACK to KeyName.BACKSPACE', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_BACK, noModifiers, '', 0);
      expect(key.name).toBe(KeyName.BACKSPACE);
      expect(key.ascii).toBe('Backspace');
    });

    it('maps VK_DELETE to KeyName.DELETE', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_DELETE, noModifiers, '', 0);
      expect(key.name).toBe(KeyName.DELETE);
      expect(key.ascii).toBe('Delete');
    });
  });

  describe('action keys', () => {
    it('maps VK_RETURN to KeyName.RETURN', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_RETURN, noModifiers, '', 0);
      expect(key.name).toBe(KeyName.RETURN);
      expect(key.ascii).toBe('Enter');
    });

    it('maps VK_ESCAPE to KeyName.ESC', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_ESCAPE, noModifiers, '', 0);
      expect(key.name).toBe(KeyName.ESC);
      expect(key.ascii).toBe('Escape');
    });

    it('maps VK_SPACE to KeyName.SPACE', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_SPACE, noModifiers, '', 0);
      expect(key.name).toBe(KeyName.SPACE);
      expect(key.ascii).toBe('Space');
    });

    it('maps VK_TAB to KeyName.TAB', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_TAB, noModifiers, '', 0);
      expect(key.name).toBe(KeyName.TAB);
      expect(key.ascii).toBe('Tab');
    });

    it('maps VK_PRIOR to KeyName.PAGE_UP', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_PRIOR, noModifiers, '', 0);
      expect(key.name).toBe(KeyName.PAGE_UP);
      expect(key.ascii).toBe('PageUp');
    });

    it('maps VK_NEXT to KeyName.PAGE_DOWN', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_NEXT, noModifiers, '', 0);
      expect(key.name).toBe(KeyName.PAGE_DOWN);
      expect(key.ascii).toBe('PageDown');
    });
  });

  describe('numpad keys', () => {
    it('maps VK_NUMPAD0 to numpad ASCII "0"', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_NUMPAD0, noModifiers, '', 0);
      expect(key.isNumpadKey).toBe(true);
      expect(key.ascii).toBe('0');
    });

    it('maps VK_NUMPAD1 to numpad ASCII "1"', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_NUMPAD1, noModifiers, '', 0);
      expect(key.isNumpadKey).toBe(true);
      expect(key.ascii).toBe('1');
    });

    it('maps VK_NUMPAD2 to numpad ASCII "2"', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_NUMPAD2, noModifiers, '', 0);
      expect(key.isNumpadKey).toBe(true);
      expect(key.ascii).toBe('2');
    });

    it('maps VK_NUMPAD3 to numpad ASCII "3"', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_NUMPAD3, noModifiers, '', 0);
      expect(key.isNumpadKey).toBe(true);
      expect(key.ascii).toBe('3');
    });

    it('maps VK_NUMPAD4 to numpad ASCII "4"', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_NUMPAD4, noModifiers, '', 0);
      expect(key.isNumpadKey).toBe(true);
      expect(key.ascii).toBe('4');
    });

    it('maps VK_NUMPAD5 to numpad ASCII "5"', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_NUMPAD5, noModifiers, '', 0);
      expect(key.isNumpadKey).toBe(true);
      expect(key.ascii).toBe('5');
    });

    it('maps VK_NUMPAD6 to numpad ASCII "6"', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_NUMPAD6, noModifiers, '', 0);
      expect(key.isNumpadKey).toBe(true);
      expect(key.ascii).toBe('6');
    });

    it('maps VK_NUMPAD7 to numpad ASCII "7"', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_NUMPAD7, noModifiers, '', 0);
      expect(key.isNumpadKey).toBe(true);
      expect(key.ascii).toBe('7');
    });

    it('maps VK_NUMPAD8 to numpad ASCII "8"', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_NUMPAD8, noModifiers, '', 0);
      expect(key.isNumpadKey).toBe(true);
      expect(key.ascii).toBe('8');
    });

    it('maps VK_NUMPAD9 to numpad ASCII "9"', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_NUMPAD9, noModifiers, '', 0);
      expect(key.isNumpadKey).toBe(true);
      expect(key.ascii).toBe('9');
    });

    it('maps VK_MULTIPLY to numpad "*"', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_MULTIPLY, noModifiers, '', 0);
      expect(key.isNumpadKey).toBe(true);
      expect(key.ascii).toBe('*');
    });

    it('maps VK_DIVIDE to numpad "/"', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_DIVIDE, noModifiers, '', 0);
      expect(key.isNumpadKey).toBe(true);
      expect(key.ascii).toBe('/');
    });

    it('maps VK_ADD to numpad "+"', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_ADD, noModifiers, '', 0);
      expect(key.isNumpadKey).toBe(true);
      expect(key.ascii).toBe('+');
    });

    it('maps VK_SUBTRACT to numpad "-"', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_SUBTRACT, noModifiers, '', 0);
      expect(key.isNumpadKey).toBe(true);
      expect(key.ascii).toBe('-');
    });

    it('maps VK_DECIMAL to numpad "."', () => {
      const key = KeyFromKeyboardEvent(VK_Keys.VK_DECIMAL, noModifiers, '', 0);
      expect(key.isNumpadKey).toBe(true);
      expect(key.ascii).toBe('.');
    });
  });

  describe('regular ASCII keys', () => {
    it('maps an ASCII letter key code to KeyName.ASCII', () => {
      // 0x41 = 'A' in VK table
      const key = KeyFromKeyboardEvent(0x41, noModifiers, 'a', 97);
      expect(key.name).toBe(KeyName.ASCII);
      expect(key.ascii).toBe('a');
      expect(key.isNumpadKey).toBe(false);
    });

    it('maps an ASCII digit key code to KeyName.ASCII', () => {
      // 0x31 = '1' in VK table
      const key = KeyFromKeyboardEvent(0x31, noModifiers, '1', 49);
      expect(key.name).toBe(KeyName.ASCII);
      expect(key.ascii).toBe('1');
    });
  });

  describe('modifier keys', () => {
    it('sets shiftPressed when Shift is in keyStates', () => {
      const withShift = makeKeyStates({ shift: true });
      const key = KeyFromKeyboardEvent(0x41, withShift, 'a', 97);
      expect(key.shiftPressed).toBe(true);
    });

    it('sets ctrlPressed when Control is in keyStates', () => {
      const withCtrl = makeKeyStates({ ctrl: true });
      const key = KeyFromKeyboardEvent(0x41, withCtrl, 'a', 97);
      expect(key.ctrlPressed).toBe(true);
    });

    it('sets altPressed when Alt is in keyStates', () => {
      const withAlt = makeKeyStates({ alt: true });
      const key = KeyFromKeyboardEvent(0x41, withAlt, 'a', 97);
      expect(key.altPressed).toBe(true);
    });

    it('sets ascii to "Shift" when charCode is 0 and shift is pressed', () => {
      const withShift = makeKeyStates({ shift: true });
      const key = KeyFromKeyboardEvent(0x41, withShift, 'A', 0);
      expect(key.ascii).toBe('Shift');
    });

    it('sets ascii to "Alt" when charCode is 0 and alt is pressed', () => {
      const withAlt = makeKeyStates({ alt: true });
      const key = KeyFromKeyboardEvent(0x41, withAlt, 'a', 0);
      expect(key.ascii).toBe('Alt');
    });
  });
});
