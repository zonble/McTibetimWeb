import StackingLayout from './StackingLayout';

export default class SambhotaKeymapOneLayout extends StackingLayout {
  get layoutId(): string {
    return 'sambhota_keymap_one';
  }
  get layoutName(): string {
    return 'Sambhota Keymap #1';
  }
  get composeKey(): string {
    return 'f';
  }
  get spaceKey(): string {
    return '.';
  }
  get symbolKeyMapping(): string[] {
    return ['!', ',', '#', '$', '(', ')', '@', ':', ';', '-', '|'];
  }
  get consonantKeyMapping(): string[] {
    return [
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
  }
  get vowelKeyMapping(): string[] {
    return ['a', 'i', 'u', 'o', 'e', 'E', 'O', 'I'];
  }
  get finalAdditionalKeyMapping(): string[] {
    return ['%', '&'];
  }
}
