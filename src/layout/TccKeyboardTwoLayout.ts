import StackingLayout from './StackingLayout';

/**
 * Implements the TCC Keyboard #2 layout.
 *
 * Created by the Tibetan Computer Company (TCC) and associated with early Tibetan
 * word processors like TibetDoc. It is popular among translators, monasteries,
 * and early adopters. Like TCC Keyboard #1, it relies on a specific structural
 * stacking logic utilizing a designated compose key to form complex vertical
 * Tibetan stacks.
 */
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
