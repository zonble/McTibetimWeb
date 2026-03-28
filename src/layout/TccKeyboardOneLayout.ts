import StackingLayout from './StackingLayout';

export default class TccKeyboardOneLayout extends StackingLayout {
  get layoutId(): string {
    return 'tcc_keyboard_one';
  }
  get layoutName(): string {
    return 'TCC Keyboard #1';
  }
  get composeKey(): string {
    return 'h';
  }
  get spaceKey(): string {
    return '-';
  }
  get symbolKeyMapping(): string[] {
    return ['A', '\\', '!', '@', '(', ')', '$', ':', '%', '+', '|'];
  }
  get consonantKeyMapping(): string[] {
    return [
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
  }
  get vowelKeyMapping(): string[] {
    return [' ', 'g', 'j', 'n', 'b', 'B', 'N', 'G'];
  }
  get finalAdditionalKeyMapping(): string[] {
    return ['`', '*'];
  }
}
