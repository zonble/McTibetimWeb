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
      // MaxStackingConsonants is 10, so we need 10 indexes to trigger the error
      const codes = Array(10).fill(0x0f40);
      const indexes = Array(10).fill(0);
      const stackingState = new StackingState(codes, indexes);
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

  describe('handle - cursor key in InputtingState', () => {
    it('commits composing buffer and returns false when buffer is non-empty', () => {
      const stackingState = new StackingState([0x0f40], [0]);
      const key = Key.namedKey(KeyName.LEFT);
      const result = layout.handle(key, stackingState, stateCallback, errorCallback);
      expect(result).toBe(false);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
    });

    it('returns false without committing when composing buffer is empty', () => {
      const emptyStacking = new StackingState([], []);
      const key = Key.namedKey(KeyName.RIGHT);
      const result = layout.handle(key, emptyStacking, stateCallback, errorCallback);
      expect(result).toBe(false);
      expect(stateCallback).not.toHaveBeenCalled();
    });

    it('does nothing and allows pass-through in EmptyState', () => {
      const key = Key.namedKey(KeyName.HOME);
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      expect(stateCallback).not.toHaveBeenCalled();
    });
  });

  describe('handle - return key in InputtingState', () => {
    it('commits composing buffer and returns true when buffer is non-empty', () => {
      const stackingState = new StackingState([0x0f40], [0]);
      const key = Key.namedKey(KeyName.RETURN);
      const result = layout.handle(key, stackingState, stateCallback, errorCallback);
      expect(result).toBe(true);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
    });

    it('does not commit and returns true when buffer is empty', () => {
      const emptyStacking = new StackingState([], []);
      const key = Key.namedKey(KeyName.RETURN);
      const result = layout.handle(key, emptyStacking, stateCallback, errorCallback);
      expect(result).toBe(true);
      expect(stateCallback).not.toHaveBeenCalled();
    });

    it('does nothing in EmptyState', () => {
      const key = Key.namedKey(KeyName.RETURN);
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      expect(stateCallback).not.toHaveBeenCalled();
    });
  });

  describe('handle - space (SPACE key) in StackingState', () => {
    it('appends tsheg to existing stacked codes and commits', () => {
      const stackingState = new StackingState([0x0f40], [0]);
      const key = Key.namedKey(KeyName.SPACE);
      layout.handle(key, stackingState, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
      expect(state.commitString).toBe(String.fromCharCode(0x0f40, 0x0f0b));
    });
  });

  describe('handle - delete key in InputtingState', () => {
    it('transitions to EmptyState and returns true', () => {
      const stackingState = new StackingState([0x0f40], [0]);
      const key = Key.namedKey(KeyName.BACKSPACE);
      const result = layout.handle(key, stackingState, stateCallback, errorCallback);
      expect(result).toBe(true);
      expect(stateCallback.mock.calls[0][0]).toBeInstanceOf(EmptyState);
    });
  });

  describe('handle - symbol key in StackingState', () => {
    it('appends symbol code to existing stacked codes and commits', () => {
      const stackingState = new StackingState([0x0f40], [0]);
      // SambhotaKeymapOneLayout symbolKeyMapping[1] = ','
      const key = Key.asciiKey(',');
      layout.handle(key, stackingState, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
      expect(state.commitString).toBe(
        String.fromCharCode(0x0f40, StackingLayout.SymbolChars[1]),
      );
    });
  });

  describe('handle - vowel in StackingState', () => {
    it('appends vowel code to existing stacked codes and commits', () => {
      // 'i' is vowelKeyMapping[1] in SambhotaKeymapOneLayout → VowelChars[1] = 0x0f72
      const stackingState = new StackingState([0x0f40], [0]);
      const key = Key.asciiKey('i');
      layout.handle(key, stackingState, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
      expect(state.commitString).toBe(String.fromCharCode(0x0f40, 0x0f72));
    });
  });

  describe('handle - KbTransform consonant (index 34 = B)', () => {
    it('produces ksa (0x0f69) when only one consonant is stacked', () => {
      // indexes.length < 2 → push 0x0f69
      const stackingState = new StackingState([0x0f40], [0]);
      const key = Key.asciiKey('B');
      layout.handle(key, stackingState, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as StackingState;
      expect(state).toBeInstanceOf(StackingState);
      expect(state.utf16Code).toContain(0x0f69);
    });

    it('produces aspirated form when two consonants end with h-transform + Htransform', () => {
      // indexes=[2 (g), 28 (h)]: isHatransform=true, indexes[1]=28=Htransform
      const stackingState = new StackingState([0x0f42, 0x0f50 + 0x50], [2, 28]);
      const key = Key.asciiKey('B');
      layout.handle(key, stackingState, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as StackingState;
      expect(state).toBeInstanceOf(StackingState);
      expect(state.utf16Code).toContain(StackingLayout.HtransformChars[0]);
    });

    it('produces kssa (0x0fb9) for k + ssa stack', () => {
      // indexes=[0 (k), 34 (B)]: k + ssa → kssa
      const stackingState = new StackingState([0x0f40, 0x0f65], [0, 34]);
      const key = Key.asciiKey('B');
      layout.handle(key, stackingState, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as StackingState;
      expect(state).toBeInstanceOf(StackingState);
      expect(state.utf16Code).toContain(0x0fb9);
    });

    it('produces general ksa cluster for two non-special consonants', () => {
      // indexes=[4 (c), 5 (C)]: not h-transform, not k+ssa
      const stackingState = new StackingState(
        [StackingLayout.ConsonantChars[4], StackingLayout.ConsonantChars[5]],
        [4, 5],
      );
      const key = Key.asciiKey('B');
      layout.handle(key, stackingState, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as StackingState;
      expect(state).toBeInstanceOf(StackingState);
      expect(state.utf16Code).toContain(0x0fb9);
    });

    it('includes second consonant code when three consonants are stacked', () => {
      // indexes=[4, 5, 6]: indexes.length === 3 → secondCode is added
      const stackingState = new StackingState(
        [
          StackingLayout.ConsonantChars[4],
          StackingLayout.ConsonantChars[5],
          StackingLayout.ConsonantChars[6],
        ],
        [4, 5, 6],
      );
      const key = Key.asciiKey('B');
      layout.handle(key, stackingState, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as StackingState;
      expect(state).toBeInstanceOf(StackingState);
      expect(state.utf16Code).toContain(StackingLayout.ConsonantChars[5]);
    });
  });

  describe('handle - Htransform consonant (index 28 = h)', () => {
    it('produces aspirated consonant when one h-transform consonant is stacked', () => {
      // indexes=[2 (g)]: IsHtransformConsonantIndex(2)=[true,0] → HtransformChars[0]=0x0f43
      const stackingState = new StackingState([StackingLayout.ConsonantChars[2]], [2]);
      const key = Key.asciiKey('h');
      layout.handle(key, stackingState, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as StackingState;
      expect(state).toBeInstanceOf(StackingState);
      expect(state.utf16Code).toContain(StackingLayout.HtransformChars[0]);
    });

    it('uses firstHtransform branch when first consonant is htransform and second index matches', () => {
      // indexes=[2 (g), 0 (k), 2 (g)]: last=g(htransform,pos=0), first=g(htransform),
      // indexes[1]=0 === htransformIndex=0 → use HtransformChars[0]
      const stackingState = new StackingState(
        [StackingLayout.ConsonantChars[2], StackingLayout.ConsonantChars[0], StackingLayout.ConsonantChars[2]],
        [2, 0, 2],
      );
      const key = Key.asciiKey('h');
      layout.handle(key, stackingState, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as StackingState;
      expect(state).toBeInstanceOf(StackingState);
      expect(state.utf16Code).toContain(StackingLayout.HtransformChars[0]);
    });

    it('uses kssa branch when first two consonants are k + ssa', () => {
      // indexes=[0 (k), 34 (B), 2 (g)]: last=g(htransform), indexes[0]=0 && indexes[1]=34 → kssa
      const stackingState = new StackingState(
        [StackingLayout.ConsonantChars[0], StackingLayout.ConsonantChars[34], StackingLayout.ConsonantChars[2]],
        [0, 34, 2],
      );
      const key = Key.asciiKey('h');
      layout.handle(key, stackingState, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as StackingState;
      expect(state).toBeInstanceOf(StackingState);
      expect(state.utf16Code).toContain(0x0fb9);
    });

    it('uses general multi-consonant branch for non-special three-consonant stack', () => {
      // indexes=[3 (G), 4 (c), 2 (g)]: last=g(htransform), first not htransform, not k+ssa
      const stackingState = new StackingState(
        [StackingLayout.ConsonantChars[3], StackingLayout.ConsonantChars[4], StackingLayout.ConsonantChars[2]],
        [3, 4, 2],
      );
      const key = Key.asciiKey('h');
      layout.handle(key, stackingState, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as StackingState;
      expect(state).toBeInstanceOf(StackingState);
      expect(state.utf16Code).toContain(StackingLayout.ConsonantChars[4]);
    });

    it('falls through to regular consonant stacking when last consonant is not h-transform type', () => {
      // indexes=[0 (k)]: IsHtransformConsonantIndex(0)=[false,-1] → stacks h normally
      const stackingState = new StackingState([StackingLayout.ConsonantChars[0]], [0]);
      const key = Key.asciiKey('h');
      layout.handle(key, stackingState, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as StackingState;
      expect(state).toBeInstanceOf(StackingState);
    });
  });

  describe('handle - consonant index 22 (apostrophe) in StackingState', () => {
    it('uses 0x0f71 (aa-chung) code for consonant index 22 when stacking', () => {
      // In SambhotaKeymapOneLayout consonantKeyMapping[22] = "'"
      const stackingState = new StackingState([StackingLayout.ConsonantChars[0]], [0]);
      const key = Key.asciiKey("'");
      layout.handle(key, stackingState, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as StackingState;
      expect(state).toBeInstanceOf(StackingState);
      expect(state.utf16Code).toContain(0x0f71);
    });
  });
});
