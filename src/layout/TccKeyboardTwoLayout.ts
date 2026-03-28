import StackingLayout from './StackingLayout';

export default class TccKeyboardTwoLayout extends StackingLayout {
  get layoutId(): string {
    return 'tcc_keyboard_two';
  }
  get layoutName(): string {
    return 'TCC Keyboard #2';
  }
  get composeKey(): string {
    return 'a';
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
  }
  get vowelKeyMapping(): string[] {
    return [' ', 't', 'u', 'i', 'y', 'Y', 'I', 'T'];
  }
  get finalAdditionalKeyMapping(): string[] {
    return ['`', '*'];
  }
}
