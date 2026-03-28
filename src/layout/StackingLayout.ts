import {
  CommittingState,
  EmptyState,
  InputState,
  InputtingState,
  StackingState,
} from '../input_method/InputState';
import Layout from './Layout';

export default abstract class StackingLayout extends Layout {
  abstract get composeKey(): string;
  abstract get spaceKey(): string;
  abstract get symbolKeyMapping(): string[];
  abstract get consonantKeyMapping(): string[];
  abstract get vowelKeyMapping(): string[];
  abstract get finalAdditionalKeyMapping(): string[];

  translateKey(key: string): string {
    return key;
  }

  isComposeKey(key: string): boolean {
    return this.composeKey === key;
  }

  isSpaceKey(key: string): boolean {
    return this.spaceKey === key;
  }

  isSymbol(key: string): [boolean, number] {
    const index = this.symbolKeyMapping.indexOf(key);
    return [index >= 0, index];
  }

  isConsonant(key: string): [boolean, number] {
    const index = this.consonantKeyMapping.indexOf(key);
    return [index >= 0, index];
  }

  isVowel(key: string): [boolean, number] {
    const index = this.vowelKeyMapping.indexOf(key);
    return [index >= 0, index];
  }

  isFinalAdditional(key: string): [boolean, number] {
    const index = this.finalAdditionalKeyMapping.indexOf(key);
    return [index >= 0, index];
  }

  static SymbolChars = [
    0x0f00, 0x0f0d, 0x0f04, 0x0f05, 0x0f3c, 0x0f3d, 0x0f85, 0x0f7f, 0x0f14, 0x0f11, 0x0f08,
  ];
  static FinalAddChars = [0x0f83, 0x0f7e];
  static VowelChars = [0, 0x0f72, 0x0f74, 0x0f7c, 0x0f7a, 0x0f7b, 0x0f7d, 0x0f80];
  static ConsonantChars = [
    0x0f40, 0x0f41, 0x0f42, 0x0f44, 0x0f45, 0x0f46, 0x0f47, 0x0f49, 0x0f4f, 0x0f50, 0x0f51, 0x0f53,
    0x0f54, 0x0f55, 0x0f56, 0x0f58, 0x0f59, 0x0f5a, 0x0f5b, 0x0f5d, 0x0f5e, 0x0f5f, 0x0f60, 0x0f61,
    0x0f62, 0x0f63, 0x0f64, 0x0f66, 0x0f67, 0x0f68, 0x0f4a, 0x0f4b, 0x0f4c, 0x0f4e, 0x0f65,
  ];

  static MaxStackingConsonants = 4;
  static KbTransform = 34;
  static Htransform = 28;
  static HtransformKey = [2, 10, 14, 18, 32];
  static HtransformChars = [0x0f43, 0x0f52, 0x0f57, 0x0f5c, 0x0f4d];
  static Extras = new Map<string, string>([
    ['M', 'ཧཱུྃ'],
    ['>', 'ཧཱུྃ'],
    ['+', '༄༅'],
    ['!', '༄༅'],
    ['=', 'ཨཱཿ'],
    ['<', 'ཨོཾ'],
    ['^', '༁ྃ'],
  ]);

  static IsHtransformConsonantIndex(index: number): [boolean, number] {
    const idx = StackingLayout.HtransformKey.indexOf(index);
    return [idx >= 0, idx];
  }

  handle(
    key: string,
    state: InputState,
    stateCallback: (newState: InputState) => void,
    errorCallback: () => void,
  ): boolean {
    // Directly commit digits as Tibetan numbers.
    if (key >= '0' && key <= '9') {
      const code = +key + 0x0f20;
      const chr = String.fromCharCode(code);
      stateCallback(new CommittingState(chr));
      return true;
    }
    if (this.isSpaceKey(key)) {
      stateCallback(new CommittingState(' '));
      return true;
    }
    // The compose key helps to enter or exit the stacking state.
    if (this.isComposeKey(key)) {
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
    const [isFinalAdditional, finalAdditionalIndex] = this.isFinalAdditional(key);
    if (isFinalAdditional) {
      if (state instanceof StackingState) {
        const coder = StackingLayout.FinalAddChars[finalAdditionalIndex];
        const codes = state.utf16Code.concat(coder);
        const buffer = String.fromCharCode(...codes);
        stateCallback(new CommittingState(buffer));
      }
      return true;
    }

    // Symbols
    const [isSymbol, symbolIndex] = this.isSymbol(key);
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
    var [isVowel, vowelIndex] = this.isVowel(key);
    if (isVowel) {
      const code = StackingLayout.VowelChars[vowelIndex];
      if (code === 0) {
        return true;
      }
      let codes: number[] = [];
      if (state instanceof StackingState) {
        const codesFromState = state.utf16Code;
        if (state.consonantIndexes.length > 2) {
          codes = codesFromState;
        }
      }

      codes.push(code);
      const buffer = String.fromCharCode(...codes);
      stateCallback(new CommittingState(buffer));

      return true;
    }

    key = this.translateKey(key);

    let [isConsonant, consonantIndex] = this.isConsonant(key);
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
    const extra = StackingLayout.Extras.get(key);
    if (extra) {
      stateCallback(new CommittingState(extra));
      return true;
    }
    return false;
  }
}
