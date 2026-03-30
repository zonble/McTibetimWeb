import { CommittingState, EmptyState, StackingState } from '../input_method/InputState';
import { Key, KeyName } from '../input_method/Key';
import SambhotaKeymapOneLayout from './SambhotaKeymapOneLayout';
import StackingLayout from './StackingLayout';

describe('StackingLayout (via SambhotaKeymapOneLayout)', () => {
  let layout: SambhotaKeymapOneLayout;
  let stateCallback: jest.Mock;
  let errorCallback: jest.Mock;

  beforeEach(() => {
    layout = new SambhotaKeymapOneLayout();
    stateCallback = jest.fn();
    errorCallback = jest.fn();
  });

  describe('layout identity', () => {
    it('should have the correct layoutId', () => {
      expect(layout.layoutId).toBe('sambhota_keymap_one');
    });

    it('should have the correct layoutName', () => {
      expect(layout.layoutName).toBe('Sambhota Keymap #1');
    });
  });

  describe('helper predicates', () => {
    it('isComposeKey should return true for "f"', () => {
      expect(layout.isComposeKey('f')).toBe(true);
    });

    it('isComposeKey should return false for other keys', () => {
      expect(layout.isComposeKey('a')).toBe(false);
    });

    it('isSpaceKey should return true for "."', () => {
      expect(layout.isSpaceKey('.')).toBe(true);
    });

    it('isSpaceKey should return false for other keys', () => {
      expect(layout.isSpaceKey('a')).toBe(false);
    });

    it('isConsonant should return true and correct index for "k"', () => {
      const [isConsonant, index] = layout.isConsonant('k');
      expect(isConsonant).toBe(true);
      expect(index).toBe(0);
    });

    it('isConsonant should return false for non-consonant', () => {
      const [isConsonant] = layout.isConsonant('a');
      expect(isConsonant).toBe(false);
    });

    it('isVowel should return true and correct index for "i"', () => {
      const [isVowel, index] = layout.isVowel('i');
      expect(isVowel).toBe(true);
      expect(index).toBe(1);
    });

    it('isVowel should return false for non-vowel', () => {
      const [isVowel] = layout.isVowel('k');
      expect(isVowel).toBe(false);
    });

    it('isSymbol should return true for "!"', () => {
      const [isSymbol, index] = layout.isSymbol('!');
      expect(isSymbol).toBe(true);
      expect(index).toBe(0);
    });

    it('isSymbol should return false for non-symbol', () => {
      const [isSymbol] = layout.isSymbol('k');
      expect(isSymbol).toBe(false);
    });

    it('isFinalAdditional should return true for "%"', () => {
      const [isFinal, index] = layout.isFinalAdditional('%');
      expect(isFinal).toBe(true);
      expect(index).toBe(0);
    });

    it('isFinalAdditional should return false for non-final', () => {
      const [isFinal] = layout.isFinalAdditional('a');
      expect(isFinal).toBe(false);
    });
  });

  describe('handle', () => {
    describe('ctrl key', () => {
      it('should return false for ctrl key', () => {
        const key = Key.asciiKey('k', false, true);
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(false);
        expect(stateCallback).not.toHaveBeenCalled();
      });
    });

    describe('cursor key in InputtingState', () => {
      it('should commit composingBuffer and return false for cursor key in StackingState', () => {
        const codes = [0x0f40];
        const stackingState = new StackingState(codes, [0]);
        const key = Key.namedKey(KeyName.LEFT);
        const result = layout.handle(key, stackingState, stateCallback, errorCallback);
        expect(result).toBe(false);
        expect(stateCallback).toHaveBeenCalledWith(expect.any(CommittingState));
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe(String.fromCharCode(0x0f40));
      });

      it('should not call stateCallback for cursor key in EmptyState', () => {
        const key = Key.namedKey(KeyName.LEFT);
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(false);
        expect(stateCallback).not.toHaveBeenCalled();
      });
    });

    describe('RETURN key', () => {
      it('should commit composingBuffer for RETURN in StackingState', () => {
        const codes = [0x0f40];
        const stackingState = new StackingState(codes, [0]);
        const key = Key.namedKey(KeyName.RETURN);
        const result = layout.handle(key, stackingState, stateCallback, errorCallback);
        expect(result).toBe(true);
        expect(stateCallback).toHaveBeenCalledWith(expect.any(CommittingState));
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe(String.fromCharCode(0x0f40));
      });

      it('should not commit for RETURN in EmptyState', () => {
        const key = Key.namedKey(KeyName.RETURN);
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(false);
        expect(stateCallback).not.toHaveBeenCalled();
      });
    });

    describe('SPACE key', () => {
      it('should commit tibetan tsheg (0x0f0b) for SPACE in EmptyState', () => {
        const key = Key.namedKey(KeyName.SPACE);
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(true);
        expect(stateCallback).toHaveBeenCalledWith(expect.any(CommittingState));
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe(String.fromCharCode(0x0f0b));
      });

      it('should append tsheg to existing stacking codes for SPACE in StackingState', () => {
        const codes = [0x0f40];
        const stackingState = new StackingState(codes, [0]);
        const key = Key.namedKey(KeyName.SPACE);
        layout.handle(key, stackingState, stateCallback, errorCallback);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe(
          String.fromCharCode(0x0f40) + String.fromCharCode(0x0f0b),
        );
      });
    });

    describe('DELETE/BACKSPACE key', () => {
      it('should transition to EmptyState for BACKSPACE in StackingState', () => {
        const stackingState = new StackingState([0x0f40], [0]);
        const key = Key.namedKey(KeyName.BACKSPACE);
        const result = layout.handle(key, stackingState, stateCallback, errorCallback);
        expect(result).toBe(true);
        expect(stateCallback).toHaveBeenCalledWith(expect.any(EmptyState));
      });

      it('should not affect EmptyState for BACKSPACE', () => {
        const key = Key.namedKey(KeyName.BACKSPACE);
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(false);
        expect(stateCallback).not.toHaveBeenCalled();
      });
    });

    describe('digit keys', () => {
      it('should commit tibetan digit for digit "0"', () => {
        const key = Key.asciiKey('0');
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(true);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe(String.fromCharCode(0x0f20));
      });

      it('should commit tibetan digit for digit "3"', () => {
        const key = Key.asciiKey('3');
        layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe(String.fromCharCode(0x0f23));
      });

      it('should commit tibetan digit for digit "9"', () => {
        const key = Key.asciiKey('9');
        layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe(String.fromCharCode(0x0f29));
      });
    });

    describe('spaceKey "."', () => {
      it('should commit ASCII space for "." key', () => {
        const key = Key.asciiKey('.');
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(true);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe(' ');
      });
    });

    describe('compose key "f"', () => {
      it('should transition to StackingState for compose key in EmptyState', () => {
        const key = Key.asciiKey('f');
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(true);
        expect(stateCallback).toHaveBeenCalledWith(expect.any(StackingState));
        const newState = stateCallback.mock.calls[0][0] as StackingState;
        expect(newState.composingBuffer).toBe('');
      });

      it('should transition to EmptyState for compose key in StackingState with empty buffer', () => {
        const stackingState = new StackingState([], []);
        const key = Key.asciiKey('f');
        layout.handle(key, stackingState, stateCallback, errorCallback);
        expect(stateCallback).toHaveBeenCalledWith(expect.any(EmptyState));
      });

      it('should commit buffer and then transition to StackingState for compose key in StackingState with non-empty buffer', () => {
        const stackingState = new StackingState([0x0f40], [0]);
        const key = Key.asciiKey('f');
        layout.handle(key, stackingState, stateCallback, errorCallback);
        // First call: CommittingState with buffer
        expect(stateCallback.mock.calls[0][0]).toBeInstanceOf(CommittingState);
        // Second call: EmptyState (exits stacking)
        expect(stateCallback.mock.calls[1][0]).toBeInstanceOf(EmptyState);
      });
    });

    describe('consonant key in EmptyState', () => {
      it('should commit consonant character for "k" in EmptyState', () => {
        const key = Key.asciiKey('k');
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(true);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe(String.fromCharCode(0x0f40));
      });

      it('should commit consonant character for "g" in EmptyState', () => {
        const key = Key.asciiKey('g');
        layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe(String.fromCharCode(0x0f42));
      });
    });

    describe('consonant stacking', () => {
      it('should add stacked consonant in StackingState', () => {
        const stackingState = new StackingState([0x0f40], [0]);
        const key = Key.asciiKey('g');
        layout.handle(key, stackingState, stateCallback, errorCallback);
        const newState = stateCallback.mock.calls[0][0] as StackingState;
        expect(newState).toBeInstanceOf(StackingState);
        expect(newState.composingBuffer.length).toBeGreaterThan(0);
      });

      it('should call errorCallback when too many consonants are stacked', () => {
        // MaxStackingConsonants = 4, so add 4 consonants first
        const stackingState = new StackingState([0x0f40, 0x0f42, 0x0f40, 0x0f42], [0, 2, 0, 2]);
        const key = Key.asciiKey('k');
        layout.handle(key, stackingState, stateCallback, errorCallback);
        expect(errorCallback).toHaveBeenCalled();
      });
    });

    describe('vowel key', () => {
      it('should commit with vowel for "i" in StackingState', () => {
        const stackingState = new StackingState([0x0f40], [0]);
        const key = Key.asciiKey('i');
        const result = layout.handle(key, stackingState, stateCallback, errorCallback);
        expect(result).toBe(true);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        // ཀི = 0x0f40 followed by vowel 0x0f72
        expect(committed.commitString).toBe(
          String.fromCharCode(0x0f40) + String.fromCharCode(0x0f72),
        );
      });

      it('should commit with vowel for "u" in EmptyState', () => {
        const key = Key.asciiKey('u');
        layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe(String.fromCharCode(0x0f74));
      });

      it('should return true but not commit for "a" (null vowel)', () => {
        const key = Key.asciiKey('a');
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(true);
        expect(stateCallback).not.toHaveBeenCalled();
      });
    });

    describe('symbol key', () => {
      it('should commit symbol for "!" key', () => {
        const key = Key.asciiKey('!');
        layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe(String.fromCharCode(0x0f00));
      });

      it('should append symbol to existing stacking codes', () => {
        const stackingState = new StackingState([0x0f40], [0]);
        const key = Key.asciiKey('!');
        layout.handle(key, stackingState, stateCallback, errorCallback);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe(
          String.fromCharCode(0x0f40) + String.fromCharCode(0x0f00),
        );
      });
    });

    describe('final additional key', () => {
      it('should commit with final additional for "%" in StackingState', () => {
        const stackingState = new StackingState([0x0f40], [0]);
        const key = Key.asciiKey('%');
        layout.handle(key, stackingState, stateCallback, errorCallback);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe(
          String.fromCharCode(0x0f40) + String.fromCharCode(0x0f83),
        );
      });

      it('should not commit for "%" in EmptyState (not in StackingState)', () => {
        const key = Key.asciiKey('%');
        layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(stateCallback).not.toHaveBeenCalled();
      });
    });

    describe('extra characters', () => {
      it('should commit extra string for "M"', () => {
        const key = Key.asciiKey('M');
        layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe('ཧཱུྃ');
      });

      it('should commit extra string for "+"', () => {
        const key = Key.asciiKey('+');
        layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe('༄༅');
      });
    });

    describe('unhandled keys', () => {
      it('should return false for unrecognized keys', () => {
        const key = Key.asciiKey('~');
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(false);
        expect(stateCallback).not.toHaveBeenCalled();
      });
    });
  });

  describe('getKeyNames', () => {
    it('should return a map for non-modifier keys', () => {
      const keyNames = layout.getKeyNames(false, false, false);
      expect(keyNames).toBeInstanceOf(Map);
      expect(keyNames.size).toBeGreaterThan(0);
    });

    it('should include Tibetan digit mappings for digits 0-9', () => {
      const keyNames = layout.getKeyNames(false, false, false);
      expect(keyNames.get('0')).toBe(String.fromCharCode(0x0f20));
      expect(keyNames.get('9')).toBe(String.fromCharCode(0x0f29));
    });

    it('should include consonant mappings', () => {
      const keyNames = layout.getKeyNames(false, false, false);
      expect(keyNames.get('k')).toBe(String.fromCharCode(0x0f40));
    });

    it('should return empty map for ctrl', () => {
      const keyNames = layout.getKeyNames(false, true, false);
      expect(keyNames.size).toBe(0);
    });

    it('should return empty map for alt', () => {
      const keyNames = layout.getKeyNames(false, false, true);
      expect(keyNames.size).toBe(0);
    });

    it('should return shifted key names', () => {
      const keyNames = layout.getKeyNames(true, false, false);
      expect(keyNames).toBeInstanceOf(Map);
      expect(keyNames.size).toBeGreaterThan(0);
    });

    it('should cache key names on subsequent calls', () => {
      const keyNames1 = layout.getKeyNames(false, false, false);
      const keyNames2 = layout.getKeyNames(false, false, false);
      expect(keyNames1).toBe(keyNames2);
    });
  });

  describe('static constants', () => {
    it('MaxStackingConsonants should be 4', () => {
      expect(StackingLayout.MaxStackingConsonants).toBe(4);
    });

    it('SymbolChars should start with 0x0f00', () => {
      expect(StackingLayout.SymbolChars[0]).toBe(0x0f00);
    });

    it('VowelChars first entry should be 0 (null vowel)', () => {
      expect(StackingLayout.VowelChars[0]).toBe(0);
    });

    it('ConsonantChars first entry should be 0x0f40 (ka)', () => {
      expect(StackingLayout.ConsonantChars[0]).toBe(0x0f40);
    });

    it('IsHtransformConsonantIndex should return true for index 2', () => {
      const [isHtransform, htransformIndex] = StackingLayout.IsHtransformConsonantIndex(2);
      expect(isHtransform).toBe(true);
      expect(htransformIndex).toBe(0);
    });

    it('IsHtransformConsonantIndex should return false for index 0', () => {
      const [isHtransform] = StackingLayout.IsHtransformConsonantIndex(0);
      expect(isHtransform).toBe(false);
    });
  });
});
