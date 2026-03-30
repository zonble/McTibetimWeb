import SambhotaKeymapOneLayout from './SambhotaKeymapOneLayout';
import StackingLayout from './StackingLayout';
import { CommittingState, EmptyState, StackingState } from '../input_method/InputState';
import { Key, KeyName } from '../input_method/Key';

describe('StackingLayout (via SambhotaKeymapOneLayout)', () => {
  let layout: SambhotaKeymapOneLayout;
  let stateCallback: jest.Mock;
  let errorCallback: jest.Mock;

  beforeEach(() => {
    layout = new SambhotaKeymapOneLayout();
    stateCallback = jest.fn();
    errorCallback = jest.fn();
  });

  describe('layout properties', () => {
    it('has correct layoutId', () => {
      expect(layout.layoutId).toBe('sambhota_keymap_one');
    });

    it('has correct layoutName', () => {
      expect(layout.layoutName).toBe('Sambhota Keymap #1');
    });
  });

  describe('isComposeKey', () => {
    it('returns true for compose key', () => {
      expect(layout.isComposeKey('f')).toBe(true);
    });

    it('returns false for other keys', () => {
      expect(layout.isComposeKey('a')).toBe(false);
    });
  });

  describe('isSpaceKey', () => {
    it('returns true for space key (.)', () => {
      expect(layout.isSpaceKey('.')).toBe(true);
    });

    it('returns false for other keys', () => {
      expect(layout.isSpaceKey(' ')).toBe(false);
    });
  });

  describe('isSymbol', () => {
    it('detects symbols', () => {
      const [isSymbol, index] = layout.isSymbol('!');
      expect(isSymbol).toBe(true);
      expect(index).toBe(0);
    });

    it('returns false for non-symbol keys', () => {
      const [isSymbol] = layout.isSymbol('a');
      expect(isSymbol).toBe(false);
    });
  });

  describe('isConsonant', () => {
    it('detects consonant k', () => {
      const [isConsonant, index] = layout.isConsonant('k');
      expect(isConsonant).toBe(true);
      expect(index).toBe(0);
    });

    it('returns false for non-consonant keys', () => {
      const [isConsonant] = layout.isConsonant('1');
      expect(isConsonant).toBe(false);
    });
  });

  describe('isVowel', () => {
    it('detects vowel a', () => {
      const [isVowel, index] = layout.isVowel('a');
      expect(isVowel).toBe(true);
      expect(index).toBe(0);
    });

    it('returns false for non-vowel keys', () => {
      const [isVowel] = layout.isVowel('k');
      expect(isVowel).toBe(false);
    });
  });

  describe('isSuffix', () => {
    it('detects suffix %', () => {
      const [isSuffix, index] = layout.isSuffix('%');
      expect(isSuffix).toBe(true);
      expect(index).toBe(0);
    });

    it('returns false for non-suffix keys', () => {
      const [isSuffix] = layout.isSuffix('k');
      expect(isSuffix).toBe(false);
    });
  });

  describe('getKeyNames', () => {
    it('returns empty map when ctrl is pressed', () => {
      const names = layout.getKeyNames(false, true, false);
      expect(names.size).toBe(0);
    });

    it('returns empty map when alt is pressed', () => {
      const names = layout.getKeyNames(false, false, true);
      expect(names.size).toBe(0);
    });

    it('returns key names for normal state', () => {
      const names = layout.getKeyNames(false, false, false);
      expect(names.size).toBeGreaterThan(0);
    });

    it('returns key names for shift state', () => {
      const names = layout.getKeyNames(true, false, false);
      expect(names.size).toBeGreaterThan(0);
    });

    it('caches lowered key names', () => {
      const names1 = layout.getKeyNames(false, false, false);
      const names2 = layout.getKeyNames(false, false, false);
      expect(names1).toBe(names2);
    });

    it('caches uppered key names', () => {
      const names1 = layout.getKeyNames(true, false, false);
      const names2 = layout.getKeyNames(true, false, false);
      expect(names1).toBe(names2);
    });
  });

  describe('handle - digit keys', () => {
    it('commits Tibetan digit for digit key', () => {
      const key = Key.asciiKey('1');
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
      expect(state.commitString).toBe(String.fromCharCode(0x0f21));
    });

    it('commits Tibetan digit 0 as ༠', () => {
      const key = Key.asciiKey('0');
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state.commitString).toBe(String.fromCharCode(0x0f20));
    });
  });

  describe('handle - space key', () => {
    it('commits space character when pressing space key', () => {
      const key = Key.asciiKey('.');
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
      expect(state.commitString).toBe(' ');
    });
  });

  describe('handle - compose key', () => {
    it('enters stacking state when pressing compose key in EmptyState', () => {
      const key = Key.asciiKey('f');
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0];
      expect(state).toBeInstanceOf(StackingState);
    });

    it('commits buffer then enters EmptyState when pressing compose key in StackingState', () => {
      const stackingState = new StackingState([0x0f40], [0]);
      const key = Key.asciiKey('f');
      layout.handle(key, stackingState, stateCallback, errorCallback);
      // First call commits the buffer (CommittingState), second call transitions to EmptyState
      expect(stateCallback).toHaveBeenCalledTimes(2);
      expect(stateCallback.mock.calls[0][0]).toBeInstanceOf(CommittingState);
      expect(stateCallback.mock.calls[1][0]).toBeInstanceOf(EmptyState);
    });
  });

  describe('handle - consonant key', () => {
    it('commits consonant character in EmptyState', () => {
      const key = Key.asciiKey('k');
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
      expect(state.commitString).toBe(String.fromCharCode(StackingLayout.ConsonantChars[0]));
    });

    it('stacks consonants in StackingState', () => {
      const stackingState = new StackingState([0x0f40], [0]);
      const key = Key.asciiKey('g'); // 'g' is index 2 (third consonant)
      layout.handle(key, stackingState, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0];
      expect(state).toBeInstanceOf(StackingState);
    });

    it('calls errorCallback when max consonants exceeded', () => {
      const stackingState = new StackingState([0x0f40, 0x0f50, 0x0f56, 0x0f58], [0, 9, 14, 15]);
      const key = Key.asciiKey('k');
      layout.handle(key, stackingState, stateCallback, errorCallback);
      expect(errorCallback).toHaveBeenCalled();
    });
  });

  describe('handle - vowel key', () => {
    it('commits vowel in StackingState', () => {
      const stackingState = new StackingState([0x0f40], [0]);
      const key = Key.asciiKey('i'); // 'i' is a vowel
      layout.handle(key, stackingState, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
    });

    it("skips vowel with code 0 (vowel 'a' index 0)", () => {
      const stackingState = new StackingState([0x0f40], [0]);
      const key = Key.asciiKey('a'); // vowel index 0 has code 0
      const result = layout.handle(key, stackingState, stateCallback, errorCallback);
      expect(result).toBe(true);
      // stateCallback not called because code is 0
      expect(stateCallback).not.toHaveBeenCalled();
    });
  });

  describe('handle - symbol key', () => {
    it('commits symbol in EmptyState', () => {
      const key = Key.asciiKey(','); // ',' is at index 1 in symbolKeyMapping
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
      expect(state.commitString).toBe(String.fromCharCode(StackingLayout.SymbolChars[1]));
    });
  });

  describe('handle - extras', () => {
    it('commits extra M', () => {
      const key = Key.asciiKey('M');
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
      expect(state.commitString).toBe('ཧཱུྃ');
    });
  });

  describe('handle - ctrl and alt keys', () => {
    it('returns false for ctrl key', () => {
      const key = Key.asciiKey('k', false, true);
      const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      expect(result).toBe(false);
    });
  });

  describe('handle - suffix', () => {
    it('commits suffix % in StackingState', () => {
      const stackingState = new StackingState([0x0f40], [0]);
      const key = Key.asciiKey('%');
      layout.handle(key, stackingState, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
    });
  });

  describe('IsHtransformConsonantIndex', () => {
    it('returns true for htransform consonant indexes', () => {
      const [is, idx] = StackingLayout.IsHtransformConsonantIndex(2);
      expect(is).toBe(true);
      expect(idx).toBe(0);
    });

    it('returns false for non-htransform consonant index', () => {
      const [is] = StackingLayout.IsHtransformConsonantIndex(1);
      expect(is).toBe(false);
    });
  });
});
