import StackingLayout from './StackingLayout';

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

  translateKey(key: string): string {
    if (key === 'D') return 'm';
    if (key === 'F') return "'";
    return key;
  }
}
