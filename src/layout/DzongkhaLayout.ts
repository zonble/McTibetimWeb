import { CommittingState, InputState } from '../input_method/InputState';
import { Key, KeyName } from '../input_method/Key';
import { KeyMapping } from '../input_method/KeyMapping';
import Layout from './Layout';

/**
 * Implements the Dzongkha keyboard layout.
 *
 * Originating from the Dzongkha Development Commission, this is the official
 * standardized keyboard layout of Bhutan. It is primarily used by the people
 * of Bhutan and those writing in Dzongkha. Because the language requires a
 * massive number of characters, consonants, and symbols, this layout utilizes
 * four layers (Normal, Shift, Alt, Shift+Alt) to map everything onto a standard
 * keyboard.
 */
export default class DzongkhaLayout implements Layout {
  readonly layoutId = 'dzongkha';
  readonly layoutName = 'Dzongkha';

  handle(
    key: Key,
    state: InputState,
    stateCallback: (newState: InputState) => void,
    errorCallback: () => void,
  ): boolean {
    if (key.ctrlPressed) {
      return false;
    }

    if (key.name === KeyName.SPACE) {
      const buffer = String.fromCharCode(0x0f0b);
      stateCallback(new CommittingState(buffer));
      return true;
    }

    if (key.altPressed) {
      const keyCode = key.code;
      let ascii: string | undefined = undefined;
      if (key.shiftPressed) {
        ascii = KeyMapping.upperKeyCodeAsciiMapping.get(keyCode);
      } else {
        ascii = KeyMapping.lowerKeyCodeAsciiMapping.get(keyCode);
      }
      if (ascii) {
        let code = this.altKeyMap.get(ascii);
        if (!code) {
          errorCallback();
          return true;
        }
        stateCallback(new CommittingState(code));
        return true;
      }
    }

    const code = this.keymap.get(key.ascii);
    if (code) {
      stateCallback(new CommittingState(code));
      return true;
    }
    return false;
  }

  private keyNameAltUppered_: Map<string, string> | undefined;
  private keyNameLAltowered_: Map<string, string> | undefined;

  private keyNameUppered_: Map<string, string> | undefined;
  private keyNameLowered_: Map<string, string> | undefined;

  getKeyNames(shift: boolean, ctrl: boolean, alt: boolean): Map<string, string> {
    if (ctrl) {
      return new Map<string, string>();
    }
    if (alt) {
      if (shift) {
        if (this.keyNameAltUppered_ === undefined) {
          this.keyNameAltUppered_ = new Map<string, string>();
          this.altKeyMap.forEach((value, key) => {
            if (key === key.toUpperCase()) {
              this.keyNameAltUppered_!.set(key, value);
            }
          });
        }
        return this.keyNameAltUppered_;
      }
      if (this.keyNameLAltowered_ === undefined) {
        this.keyNameLAltowered_ = new Map<string, string>();
        this.altKeyMap.forEach((value, key) => {
          if (key === key.toLowerCase()) {
            this.keyNameLAltowered_!.set(key, value);
          }
        });
      }
      return this.keyNameLAltowered_;
    }

    if (shift) {
      if (this.keyNameUppered_ === undefined) {
        this.keyNameUppered_ = new Map<string, string>();
        this.keymap.forEach((value, key) => {
          if (key === key.toUpperCase()) {
            this.keyNameUppered_!.set(key, value);
          }
        });
      }
      return this.keyNameUppered_;
    }
    if (this.keyNameLowered_ === undefined) {
      this.keyNameLowered_ = new Map<string, string>();
      this.keymap.forEach((value, key) => {
        if (key === key.toLowerCase()) {
          this.keyNameLowered_!.set(key, value);
        }
      });
    }
    return this.keyNameLowered_;
  }

  readonly altKeyMap = new Map<string, string>([
    ['`', '࿑'],
    ['1', '1'],
    ['2', '2'],
    ['3', '3'],
    ['4', '4'],
    ['5', '5'],
    ['6', '6'],
    ['7', '7'],
    ['8', '8'],
    ['9', '9'],
    ['0', '0'],
    ['-', '-'],
    ['=', '='],
    ['q', 'ྈ'],
    ['w', 'ྉ'],
    ['e', 'ྌ'],
    ['r', 'ྃ'],
    ['t', '༚'],
    ['y', '༛'],
    ['u', '༜'],
    ['i', '༝'],
    ['o', '༞'],
    ['p', '༟'],
    ['[', '('],
    [']', ')'],
    ['\\', '\\'],
    ['a', 'ཊ'],
    ['s', 'ཋ'],
    ['d', 'ཌ'],
    ['f', 'ཎ'],
    ['g', ''],
    ['h', ''],
    ['j', '༷'],
    ['k', 'ཾ'],
    ['l', '༹'],
    [';', ';'],
    ["'", "'"],
    ['z', '༓'],
    ['x', '྾'],
    ['c', '༃'],
    ['v', '༏'],
    ['b', 'ཪ'],
    ['n', '༒'],
    ['m', 'ཥ'],
    [',', ','],
    ['.', '.'],
    ['/', '/'],
    ['~', '࿐'],
    ['!', '࿓'],
    ['@', '࿔'],
    ['#', '༺'],
    ['$', '༻'],
    ['%', '྅'],
    ['^', '༁'],
    ['&', 'ྊ'],
    ['*', '*'],
    ['(', ''],
    [')', ''],
    ['_', '࿒ཏ'],
    ['+', '+'],
    ['Q', 'ྍ'],
    ['W', 'ྎ'],
    ['E', 'ྏ'],
    ['R', 'ྂ'],
    ['T', 'ྋྙ'],
    ['Y', ''],
    ['U', ''],
    ['I', '༗'],
    ['O', '༘'],
    ['P', '༙'],
    ['{', '༿'],
    ['}', '༾'],
    ['A', 'ྚ'],
    ['S', 'ྛ'],
    ['D', 'ྜ'],
    ['F', 'ྞ'],
    ['G', ''],
    ['H', ''],
    ['J', '༷༵'],
    ['K', '྇'],
    ['L', '྆'],
    [':', ':'],
    ['"', '"'],
    ['Z', '༶'],
    ['X', '྿'],
    ['C', 'ྰ'],
    ['V', 'ྻ'],
    ['B', 'ྼ'],
    ['N', ''],
    ['M', 'ྵ'],
    ['<', '࿙'],
    ['>', '࿚'],
    ['?', '࿛'],
  ]);

  readonly keymap = new Map<string, string>([
    ['_', 'ཿ'],
    ['-', '༔'],
    [',', 'ས'],
    [';', 'ཚ'],
    [':', 'ྪ'],
    ['!', '༄'],
    ['?', 'ྸ'],
    ['.', 'ཧ'],
    ['"', 'ྫ'],
    ['(', '༼'],
    [')', '༽'],
    ['[', 'ཇ'],
    [']', 'ཉ'],
    ['{', 'ྗ'],
    ['}', 'ྙ'],
    ['@', '༅'],
    ['*', '༴'],
    ['/', 'ཨ'],
    ['\\', 'ཝ'],
    ['&', '༸'],
    ['#', '༆'],
    ['%', '༎'],
    ['`', '༉'],
    ['^', '༈'],
    ['+', '༑'],
    ['<', 'ྶ'],
    ['=', '།'],
    ['>', 'ྸ'],
    ['|', 'ྭ'],
    ['~', '༊'],
    ['$', ''],
    ['0', '༠'],
    ['1', '༡'],
    ['2', '༢'],
    ['3', '༣'],
    ['4', '༤'],
    ['5', '༥'],
    ['6', '༦'],
    ['7', '༧'],
    ['8', '༨'],
    ['9', '༩'],
    ['A', 'ྟ'],
    ['a', 'ཏ'],
    ['B', 'ྲ'],
    ['b', 'ར'],
    ['C', 'ཱ'],
    ['c', 'འ'],
    ['D', 'ྡ'],
    ['d', 'ད'],
    ['E', 'ྒ'],
    ['e', 'ག'],
    ['F', 'ྣ'],
    ['f', 'ན'],
    ['G', 'ྤ'],
    ['g', 'པ'],
    ['H', 'ྥ'],
    ['h', 'ཕ'],
    ['I', 'ཽ'],
    ['i', 'ོ'],
    ['J', 'ྦ'],
    ['j', 'བ'],
    ['K', 'ྨ'],
    ['k', 'མ'],
    ['L', 'ྩ'],
    ['l', 'ཙ'],
    ['M', 'ྴ'],
    ['m', 'ཤ'],
    ['N', 'ླ'],
    ['n', 'ལ'],
    ['O', 'ྕ'],
    ['o', 'ཅ'],
    ['P', 'ྖ'],
    ['p', 'ཆ'],
    ['Q', 'ྐ'],
    ['q', 'ཀ'],
    ['R', 'ྔ'],
    ['r', 'ང'],
    ['S', 'ྠ'],
    ['s', 'ཐ'],
    ['T', 'ྀ'],
    ['t', 'ི'],
    ['U', 'ཻ'],
    ['u', 'ེ'],
    ['V', 'ྱ'],
    ['v', 'ཡ'],
    ['W', 'ྑ'],
    ['w', 'ཁ'],
    ['X', 'ྯ'],
    ['x', 'ཟ'],
    ['Y', '྄'],
    ['y', 'ུ'],
    ['Z', 'ྮ'],
    ['z', 'ཞ'],
    ["'", 'ཛ'],
  ]);
}
