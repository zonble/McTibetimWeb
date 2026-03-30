import StackingLayout from './StackingLayout';

export default class TccKeyboardTwoLayout extends StackingLayout {
  readonly layoutId = 'tcc_keyboard_two';
  readonly layoutName = 'TCC Keyboard #2';
  readonly composeKey = 'a';
  readonly spaceKey = '-';
  readonly symbolKeyMapping = ['A', '\\', '!', '@', '(', ')', '$', ':', '%', '+', '|'];
  readonly consonantKeyMapping = [
    'q',
    'w',
    's',
    'e',
    'b',
    'n',
    'm',
    ',',
    'o',
    'p',
    'j',
    'k',
    'r',
    '/',
    'd',
    'f',
    ';',
    "'",
    '[',
    ']',
    'z',
    'x',
    'c',
    'g',
    'h',
    'v',
    '.',
    'l',
    'G',
    'H',
    'O',
    'P',
    'J',
    'K',
    '>',
  ];
  readonly vowelKeyMapping = [' ', 't', 'u', 'i', 'y', 'Y', 'I', 'T'];
  readonly suffixKeyMapping = ['`', '*'];
}
