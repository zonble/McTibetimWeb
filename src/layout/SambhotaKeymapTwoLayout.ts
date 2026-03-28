import StackingLayout from './StackingLayout';

export default class SambhotaKeymapTwoLayout extends StackingLayout {
  get layoutId(): string {
    return 'sambhota_keymap_two';
  }
  get layoutName(): string {
    return 'Sambhota Keymap #2';
  }
  get composeKey(): string {
    return 'h';
  }
  get spaceKey(): string {
    return '-';
  }
  get symbolKeyMapping(): string[] {
    return ['V', 'C', '@', '#', '(', ')', '|', ':', 'K', '{', '&'];
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
    return ['!', '%'];
  }

  translateKey(key: string): string {
    if (key === 'D') return 'm';
    if (key === 'F') return "'";
    return key;
  }
}
