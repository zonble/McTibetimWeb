import StackingLayout from './StackingLayout';

/**
 * Implements the TCC Keyboard #1 layout.
 *
 * Created by the Tibetan Computer Company (TCC) and associated with early Tibetan
 * word processors like TibetDoc. It is popular among translators, monasteries,
 * and early adopters of Tibetan digital typing who learned on TCC's proprietary
 * software in the 1990s and 2000s. It features specific key mappings for stacking
 * letters which differ from the Sambhota layouts.
 */
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
