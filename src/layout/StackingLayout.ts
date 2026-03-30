import { Key } from '../input_method';
import {
  CommittingState,
  EmptyState,
  InputState,
  InputtingState,
  StackingState,
} from '../input_method/InputState';
import { KeyName } from '../input_method/Key';
import Layout from './Layout';

/**
 * Abstract base for all Tibetan stacking-based keyboard layouts.
 *
 * Stacking layouts model the Tibetan orthographic convention of stacking
 * multiple consonants vertically. A dedicated compose key toggles stacking
 * mode; while in stacking mode, consonant key presses are accumulated into a
 * {@link StackingState} until a vowel, space, or compose key commits the
 * composed character.
 *
 * Concrete subclasses supply the key mappings for their specific layout
 * (e.g. Sambhota Keymap #1, TCC Keyboard #1) and may override
 * {@link translateKey} to remap keys before the standard lookup.
 */
export default abstract class StackingLayout extends Layout {
  /** The key that toggles stacking composition mode. */
  abstract readonly composeKey: string;
  /** The key that emits a space character (tsheg `་`). */
  abstract readonly spaceKey: string;
  /** Ordered list of keys that emit Tibetan symbols. */
  abstract readonly symbolKeyMapping: string[];
  /** Ordered list of keys that emit Tibetan consonants. */
  abstract readonly consonantKeyMapping: string[];
  /** Ordered list of keys that emit Tibetan vowel signs. */
  abstract readonly vowelKeyMapping: string[];
  /** Ordered list of keys that emit Tibetan suffix marks (anusvara / visarga). */
  abstract readonly suffixKeyMapping: string[];

  /**
   * Optionally remaps a raw key character before standard lookup.
   *
   * The default implementation is identity. Override to redirect specific keys
   * (e.g. Sambhota Keymap #2 maps `'D'` → `'m'`).
   * @param key The raw ASCII character from the key event.
   * @returns The (possibly remapped) character to look up in the consonant table.
   */
  translateKey(key: string): string {
    return key;
  }

  /**
   * Returns whether the given key is the compose key for this layout.
   * @param key The key character to check.
   */
  isComposeKey(key: string): boolean {
    return this.composeKey === key;
  }

  /**
   * Returns whether the given key is the space key for this layout.
   * @param key The key character to check.
   */
  isSpaceKey(key: string): boolean {
    return this.spaceKey === key;
  }

  /**
   * Checks whether the given key maps to a Tibetan symbol.
   * @param key The key character to look up.
   * @returns A tuple `[isSymbol, index]` where `index` is the position in
   *   {@link symbolKeyMapping}, or `-1` if not found.
   */
  isSymbol(key: string): [boolean, number] {
    const index = this.symbolKeyMapping.indexOf(key);
    return [index >= 0, index];
  }

  /**
   * Checks whether the given key maps to a Tibetan consonant.
   * @param key The key character to look up.
   * @returns A tuple `[isConsonant, index]` where `index` is the position in
   *   {@link consonantKeyMapping}, or `-1` if not found.
   */
  isConsonant(key: string): [boolean, number] {
    const index = this.consonantKeyMapping.indexOf(key);
    return [index >= 0, index];
  }

  /**
   * Checks whether the given key maps to a Tibetan vowel sign.
   * @param key The key character to look up.
   * @returns A tuple `[isVowel, index]` where `index` is the position in
   *   {@link vowelKeyMapping}, or `-1` if not found.
   */
  isVowel(key: string): [boolean, number] {
    const index = this.vowelKeyMapping.indexOf(key);
    return [index >= 0, index];
  }

  /**
   * Checks whether the given key maps to a Tibetan suffix mark.
   * @param key The key character to look up.
   * @returns A tuple `[isSuffix, index]` where `index` is the position in
   *   {@link suffixKeyMapping}, or `-1` if not found.
   */
  isSuffix(key: string): [boolean, number] {
    const index = this.suffixKeyMapping.indexOf(key);
    return [index >= 0, index];
  }

  /** Unicode code points for the Tibetan symbols accessible via {@link symbolKeyMapping}. */
  static SymbolChars = [
    0x0f00, 0x0f0d, 0x0f04, 0x0f05, 0x0f3c, 0x0f3d, 0x0f85, 0x0f7f, 0x0f14, 0x0f11, 0x0f08,
  ];
  /** Unicode code points for the anusvara and visarga suffix marks. */
  static FinalAddChars = [0x0f83, 0x0f7e];
  /**
   * Unicode code points for Tibetan vowel signs.
   * Index 0 is a placeholder (0) meaning "no vowel sign / inherent 'a'".
   */
  static VowelChars = [0, 0x0f72, 0x0f74, 0x0f7c, 0x0f7a, 0x0f7b, 0x0f7d, 0x0f80];
  /** Unicode code points for all 35 Tibetan consonant letters. */
  static ConsonantChars = [
    0x0f40, 0x0f41, 0x0f42, 0x0f44, 0x0f45, 0x0f46, 0x0f47, 0x0f49, 0x0f4f, 0x0f50, 0x0f51, 0x0f53,
    0x0f54, 0x0f55, 0x0f56, 0x0f58, 0x0f59, 0x0f5a, 0x0f5b, 0x0f5d, 0x0f5e, 0x0f5f, 0x0f60, 0x0f61,
    0x0f62, 0x0f63, 0x0f64, 0x0f66, 0x0f67, 0x0f68, 0x0f4a, 0x0f4b, 0x0f4c, 0x0f4e, 0x0f65,
  ];

  /** Maximum number of consonants that can be stacked in a single syllable. */
  static MaxStackingConsonants = 4;
  /** Consonant index for the special "ksa" (ཀྵ) transform key. */
  static KbTransform = 34;
  /** Consonant index for the aspirate (h-transform) key. */
  static Htransform = 28;
  /**
   * Consonant indices that participate in the h-transform (aspirate stacking).
   * Each entry has a corresponding aspirated form in {@link HtransformChars}.
   */
  static HtransformKey = [2, 10, 14, 18, 32];
  /** Precomposed aspirated consonant code points corresponding to {@link HtransformKey}. */
  static HtransformChars = [0x0f43, 0x0f52, 0x0f57, 0x0f5c, 0x0f4d];
  /** Special multi-character sequences accessible by their trigger key. */
  static Extras = new Map<string, string>([
    ['M', 'ཧཱུྃ'],
    ['>', 'ཧཱུྃ'],
    ['+', '༄༅'],
    ['!', '༄༅'],
    ['=', 'ཨཱཿ'],
    ['<', 'ཨོཾ'],
    ['^', '༁ྃ'],
  ]);

  /**
   * Returns whether {@link index} is an h-transform consonant index, and its
   * position within {@link HtransformKey}.
   * @param index The consonant index to check.
   * @returns `[true, position]` if found, `[false, -1]` otherwise.
   */
  static IsHtransformConsonantIndex(index: number): [boolean, number] {
    const idx = StackingLayout.HtransformKey.indexOf(index);
    return [idx >= 0, idx];
  }

  private keyNameUppered_: Map<string, string> | undefined;
  private keyNameLowered_: Map<string, string> | undefined;

  getKeyNames(shift: boolean, ctrl: boolean, alt: boolean): Map<string, string> {
    if (ctrl) {
      return new Map<string, string>();
    }
    if (alt) {
      return new Map<string, string>();
    }
    if (shift) {
      if (this.keyNameUppered_ === undefined) {
        let keyNameUppered_ = new Map<string, string>();
        keyNameUppered_.set(this.composeKey, '⬇️');
        keyNameUppered_.set(this.spaceKey, ' ');
        keyNameUppered_.set(' ', '་');
        this.consonantKeyMapping.forEach((key, index) => {
          if (key === key.toLowerCase()) {
            keyNameUppered_.set(key, String.fromCharCode(StackingLayout.ConsonantChars[index]));
          }
        });
        this.vowelKeyMapping.forEach((key, index) => {
          if (key === key.toLowerCase()) {
            keyNameUppered_.set(key, String.fromCharCode(StackingLayout.VowelChars[index]));
          }
        });
        this.suffixKeyMapping.forEach((key, index) => {
          if (key === key.toLowerCase()) {
            keyNameUppered_.set(key, String.fromCharCode(StackingLayout.FinalAddChars[index]));
          }
        });
        this.symbolKeyMapping.forEach((key, index) => {
          if (key === key.toLowerCase()) {
            keyNameUppered_.set(key, String.fromCharCode(StackingLayout.SymbolChars[index]));
          }
        });
        StackingLayout.Extras.forEach((value, key) => {
          keyNameUppered_.set(key, value);
        });
        keyNameUppered_.set(' ', '་་');
        this.keyNameUppered_ = keyNameUppered_;
      }
      return this.keyNameUppered_;
    }
    if (this.keyNameLowered_ === undefined) {
      let keyNameLowered_ = new Map<string, string>();
      for (let i = 0; i <= 9; i++) {
        const ascii = i.toString();
        const code = i + 0x0f20;
        keyNameLowered_.set(ascii, String.fromCharCode(code));
      }
      keyNameLowered_.set(this.composeKey, '⬇️');
      keyNameLowered_.set(this.spaceKey, ' ');
      this.consonantKeyMapping.forEach((key, index) => {
        if (key === key.toLowerCase()) {
          keyNameLowered_.set(key, String.fromCharCode(StackingLayout.ConsonantChars[index]));
        }
      });
      this.vowelKeyMapping.forEach((key, index) => {
        if (key === key.toLowerCase()) {
          keyNameLowered_.set(key, String.fromCharCode(StackingLayout.VowelChars[index]));
        }
      });
      this.suffixKeyMapping.forEach((key, index) => {
        if (key === key.toLowerCase()) {
          keyNameLowered_.set(key, String.fromCharCode(StackingLayout.FinalAddChars[index]));
        }
      });
      this.symbolKeyMapping.forEach((key, index) => {
        if (key === key.toLowerCase()) {
          keyNameLowered_.set(key, String.fromCharCode(StackingLayout.SymbolChars[index]));
        }
      });
      StackingLayout.Extras.forEach((value, key) => {
        keyNameLowered_.set(key, value);
      });
      keyNameLowered_.set(' ', '་་');
      this.keyNameLowered_ = keyNameLowered_;
    }
    return this.keyNameLowered_;
  }

  handle(
    key: Key,
    state: InputState,
    stateCallback: (newState: InputState) => void,
    errorCallback: () => void,
  ): boolean {
    if (key.ctrlPressed) {
      return false;
    }

    if (key.isCursorKey) {
      if (state instanceof InputtingState) {
        const buffer = state.composingBuffer;
        if (buffer.length > 0) {
          stateCallback(new CommittingState(buffer));
        }
        return false;
      }
    }

    if (key.name === KeyName.RETURN) {
      if (state instanceof InputtingState) {
        const buffer = state.composingBuffer;
        if (buffer.length > 0) {
          stateCallback(new CommittingState(buffer));
        }
        return true;
      }
    }

    if (key.name === KeyName.SPACE) {
      let codes: number[] = [];
      if (state instanceof StackingState) {
        codes = state.utf16Code;
      }
      codes.push(0x0f0b);
      const buffer = String.fromCharCode(...codes);
      stateCallback(new CommittingState(buffer));
      return true;
    }

    if (key.isDeleteKey) {
      if (state instanceof InputtingState) {
        const empty = new EmptyState();
        stateCallback(empty);
        return true;
      }
    }

    let ascii = key.ascii;
    // Directly commit digits as Tibetan numbers.
    if (ascii >= '0' && ascii <= '9') {
      const code = +ascii + 0x0f20;
      const chr = String.fromCharCode(code);
      stateCallback(new CommittingState(chr));
      return true;
    }
    if (this.isSpaceKey(ascii)) {
      stateCallback(new CommittingState(' '));
      return true;
    }
    // The compose key helps to enter or exit the stacking state.
    if (this.isComposeKey(ascii)) {
      if (state instanceof InputtingState) {
        const buffer = state.composingBuffer;
        if (buffer.length > 0) {
          stateCallback(new CommittingState(buffer));
        }
      }
      if (state instanceof StackingState) {
        const empty = new EmptyState();
        stateCallback(empty);
        return true;
      } else {
        const stackingState = new StackingState([], []);
        stateCallback(stackingState);
        return true;
      }
    }

    // Final M or N
    const [isSefffix, suffixIndex] = this.isSuffix(ascii);
    if (isSefffix) {
      if (state instanceof StackingState) {
        const coder = StackingLayout.FinalAddChars[suffixIndex];
        const codes = state.utf16Code.concat(coder);
        const buffer = String.fromCharCode(...codes);
        stateCallback(new CommittingState(buffer));
      }
      return true;
    }

    // Symbols
    const [isSymbol, symbolIndex] = this.isSymbol(ascii);
    if (isSymbol) {
      let codes: number[] = [];
      if (state instanceof StackingState) {
        codes = state.utf16Code;
      }
      const code = StackingLayout.SymbolChars[symbolIndex];
      codes.push(code);
      const buffer = String.fromCharCode(...codes);
      stateCallback(new CommittingState(buffer));
      return true;
    }

    // Vowels
    var [isVowel, vowelIndex] = this.isVowel(ascii);
    if (isVowel) {
      const code = StackingLayout.VowelChars[vowelIndex];
      if (code === 0) {
        return true;
      }
      let codes: number[] = [];
      if (state instanceof StackingState) {
        const codesFromState = state.utf16Code;
        codes = codesFromState;
      }

      codes.push(code);
      const buffer = String.fromCharCode(...codes);
      stateCallback(new CommittingState(buffer));

      return true;
    }

    ascii = this.translateKey(ascii);

    let [isConsonant, consonantIndex] = this.isConsonant(ascii);
    if (isConsonant) {
      if (state instanceof StackingState) {
        if (state.consonantIndexes.length >= StackingLayout.MaxStackingConsonants) {
          errorCallback();
          return true;
        }

        // kb transform
        if (consonantIndex === StackingLayout.KbTransform) {
          let codes: number[] = [];
          let indexes = state.consonantIndexes;
          if (indexes.length < 2) {
            codes.push(0x0f69);
          } else {
            const [isHatransform, htransformIndex] = StackingLayout.IsHtransformConsonantIndex(
              indexes[0],
            );
            if (isHatransform && indexes[1] === StackingLayout.Htransform) {
              const code = StackingLayout.HtransformChars[htransformIndex];
              codes.push(code);
            } else if (
              indexes[0] === 0 && // ka
              indexes[1] === 34 // ssa
            ) {
              codes.push(0x0fb9); // kssa
            } else {
              const firstCode = StackingLayout.ConsonantChars[indexes[0]];
              codes.push(firstCode);
              if (indexes.length === 3) {
                const secondCode = StackingLayout.ConsonantChars[indexes[1]];
                codes.push(secondCode);
              }
              const finalCode = 0x0fb9;
              codes.push(finalCode);
            }
          }
          indexes.push(consonantIndex);
          const newState = new StackingState(codes, indexes);
          stateCallback(newState);
          return true;
        }

        // H transform
        if (consonantIndex === StackingLayout.Htransform) {
          let codes: number[] = [];
          let indexes = state.consonantIndexes;
          const [isHatransform, htransformIndex] = StackingLayout.IsHtransformConsonantIndex(
            indexes[indexes.length - 1],
          );
          if (isHatransform) {
            if (indexes.length < 2) {
              const code = StackingLayout.HtransformChars[htransformIndex];
              codes.push(code);
            } else {
              const [isFirstHatransform, firstHtransformIndex] =
                StackingLayout.IsHtransformConsonantIndex(indexes[0]);
              if (isFirstHatransform && indexes[1] === htransformIndex) {
                const code = StackingLayout.HtransformChars[firstHtransformIndex];
                codes.push(code);
              } else if (
                indexes[0] === 0 && // ka
                indexes[1] === 34 // ssa
              ) {
                const code = 0x0fb9; // kssa
                codes.push(code);
              } else {
                const firstCode = StackingLayout.ConsonantChars[indexes[0]];
                codes.push(firstCode);
                if (indexes.length === 3) {
                  const secondCode = StackingLayout.ConsonantChars[indexes[1]];
                  codes.push(secondCode);
                }
                const finalCode = 0x0fb9;
                codes.push(finalCode);
              }
              let code = StackingLayout.HtransformChars[htransformIndex] + 0x50;
              codes.push(code);
            }
            indexes.push(consonantIndex);
            const newState = new StackingState(codes, indexes);
            stateCallback(newState);
            return true;
          }
        }
        {
          let codes: number[] = state.utf16Code;
          let indexes = state.consonantIndexes;
          let code = StackingLayout.ConsonantChars[consonantIndex];
          if (indexes.length > 0) {
            if (consonantIndex === 22) {
              code = 0x0f71;
            } else {
              code = 0x50 + StackingLayout.ConsonantChars[consonantIndex];
            }
          }
          codes.push(code);
          indexes.push(consonantIndex);
          const newState = new StackingState(codes, indexes);
          stateCallback(newState);
        }
        return true;
      } else {
        let code = StackingLayout.ConsonantChars[consonantIndex];
        const buffer = String.fromCharCode(code);
        stateCallback(new CommittingState(buffer));
        return true;
      }
    }
    const extra = StackingLayout.Extras.get(ascii);
    if (extra) {
      stateCallback(new CommittingState(extra));
      return true;
    }
    return false;
  }
}
