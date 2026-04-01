import StackingLayout from './StackingLayout';

/**
 * Implements the Sambhota Keymap #1 keyboard layout.
 *
 * Originates from the legacy "Sambhota Tibetan" software suite widely used before
 * Unicode became universal. It is heavily used by the Tibetan diaspora, exile
 * communities in India, and older generations accustomed to legacy software.
 * It uses a structural "stacking" mechanism where users type consonants
 * sequentially and use a dedicated "compose" key to trigger vertical stacking.
 */
export default class SambhotaKeymapOneLayout extends StackingLayout {
  readonly layoutId = 'sambhota_keymap_one';
  readonly layoutName = 'Sambhota Keymap #1';
  readonly composeKey = 'f';
  readonly spaceKey = '.';
  readonly symbolKeyMapping = ['!', ',', '#', '$', '(', ')', '@', ':', ';', '-', '|'];
  readonly consonantKeyMapping = [
    'k',
    'K',
    'g',
    'G',
    'c',
    'C',
    'j',
    'N',
    't',
    'T',
    'd',
    'n',
    'p',
    'P',
    'b',
    'm',
    'x',
    'X',
    'D',
    'w',
    'Z',
    'z',
    "'",
    'y',
    'r',
    'l',
    'S',
    's',
    'h',
    'A',
    'q',
    'Q',
    'v',
    'V',
    'B',
  ];
  readonly vowelKeyMapping = ['a', 'i', 'u', 'o', 'e', 'E', 'O', 'I'];
  readonly suffixKeyMapping = ['%', '&'];
}
