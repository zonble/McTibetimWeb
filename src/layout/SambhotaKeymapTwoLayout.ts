import StackingLayout from './StackingLayout';

/**
 * Implements the Sambhota Keymap #2 keyboard layout.
 *
 * Originates from the legacy "Sambhota Tibetan" software suite widely used before
 * Unicode became universal. It is heavily used by the Tibetan diaspora, exile
 * communities, and older generations accustomed to legacy software. Like Keymap #1,
 * it uses a structural "stacking" mechanism where a dedicated "compose" key
 * triggers the vertical stacking of consonants.
 *
 * This layout overrides `translateKey` to map specific characters before stacking processing.
 */
export default class SambhotaKeymapTwoLayout extends StackingLayout {
  readonly layoutId = 'sambhota_keymap_two';
  readonly layoutName = 'Sambhota Keymap #2';
  readonly composeKey = 'h';
  readonly spaceKey = '-';
  readonly symbolKeyMapping = ['V', 'C', '@', '#', '(', ')', '|', ':', 'K', '{', '&'];
  readonly consonantKeyMapping = [
    'q',
    'w',
    'e',
    'r',
    't',
    'y',
    'u',
    'i',
    'o',
    'p',
    '[',
    ']',
    'a',
    's',
    'd',
    'f',
    'k',
    'l',
    ';',
    "'",
    'z',
    'x',
    'c',
    'v',
    'm',
    ',',
    '.',
    '/',
    '>',
    '?',
    'Q',
    'W',
    'E',
    'R',
    'T',
  ];
  readonly vowelKeyMapping = [' ', 'g', 'j', 'n', 'b', 'B', 'N', 'G'];
  readonly suffixKeyMapping = ['!', '%'];

  /**
   * Remaps specific keys before they are handled by the stacking logic.
   * @param key The raw ASCII character from the key event.
   * @returns The remapped character.
   */
  translateKey(key: string): string {
    if (key === 'D') return 'm';
    if (key === 'F') return "'";
    return key;
  }
}
