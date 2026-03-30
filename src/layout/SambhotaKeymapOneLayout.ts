import StackingLayout from './StackingLayout';

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
