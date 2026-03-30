import StackingLayout from './StackingLayout';

export default class TccKeyboardOneLayout extends StackingLayout {
  readonly layoutId = 'tcc_keyboard_one';
  readonly layoutName = 'TCC Keyboard #1';
  readonly composeKey = 'h';
  readonly spaceKey = '-';
  readonly symbolKeyMapping = ['A', '\\', '!', '@', '(', ')', '$', ':', '%', '+', '|'];
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
  readonly suffixKeyMapping = ['`', '*'];
}
