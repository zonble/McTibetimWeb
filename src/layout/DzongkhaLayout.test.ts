import { CommittingState, EmptyState } from '../input_method/InputState';
import { Key, KeyName } from '../input_method/Key';
import DzongkhaLayout from './DzongkhaLayout';

describe('DzongkhaLayout', () => {
  let layout: DzongkhaLayout;
  let stateCallback: jest.Mock;
  let errorCallback: jest.Mock;

  beforeEach(() => {
    layout = new DzongkhaLayout();
    stateCallback = jest.fn();
    errorCallback = jest.fn();
  });

  describe('layout identity', () => {
    it('should have the correct layoutId', () => {
      expect(layout.layoutId).toBe('dzongkha');
    });

    it('should have the correct layoutName', () => {
      expect(layout.layoutName).toBe('Dzongkha');
    });
  });

  describe('handle', () => {
    describe('ctrl key', () => {
      it('should return false for ctrl key', () => {
        const key = Key.asciiKey('a', false, true);
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(false);
        expect(stateCallback).not.toHaveBeenCalled();
      });
    });

    describe('SPACE key', () => {
      it('should commit tibetan tsheg (0x0f0b)', () => {
        const key = Key.namedKey(KeyName.SPACE);
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(true);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe(String.fromCharCode(0x0f0b));
      });
    });

    describe('regular key mappings', () => {
      it('should commit Tibetan character for "a"', () => {
        const key = Key.asciiKey('a');
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(true);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe('ཏ');
      });

      it('should commit Tibetan character for "q"', () => {
        const key = Key.asciiKey('q');
        layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe('ཀ');
      });

      it('should commit Tibetan digit for "1"', () => {
        const key = Key.asciiKey('1');
        layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe('༡');
      });

      it('should commit Tibetan digit for "0"', () => {
        const key = Key.asciiKey('0');
        layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe('༠');
      });

      it('should return false for unmapped key', () => {
        // A key that is not in keymap and not a special key
        const key = new Key('\t', KeyName.TAB);
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(false);
        expect(stateCallback).not.toHaveBeenCalled();
      });
    });

    describe('alt key mappings', () => {
      it('should commit character from altKeyMap for alt + "q"', () => {
        const key = new Key('q', KeyName.ASCII, false, false, false, true, false, 'KeyQ');
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(true);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe('ྈ');
      });

      it('should fall through to regular keymap for alt + key with unmapped code', () => {
        // Use a code not in lowerKeyCodeAsciiMapping; the key 'x' is still in the regular keymap
        const key = new Key('x', KeyName.ASCII, false, false, false, true, false, 'UnknownCode');
        layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        // Falls through to regular keymap: 'x' → ཟ
        expect(stateCallback).toHaveBeenCalledWith(expect.any(CommittingState));
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe('ཟ');
      });

      it('should commit uppercase character from altKeyMap for alt + shift + "Q"', () => {
        const key = new Key('Q', KeyName.ASCII, true, false, false, true, false, 'KeyQ');
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(true);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe('ྍ');
      });
    });

    describe('getKeyNames', () => {
      it('should return lowercase key names for non-modifier', () => {
        const keyNames = layout.getKeyNames(false, false, false);
        expect(keyNames).toBeInstanceOf(Map);
        expect(keyNames.size).toBeGreaterThan(0);
        expect(keyNames.get('a')).toBe('ཏ');
      });

      it('should return uppercase key names for shift', () => {
        const keyNames = layout.getKeyNames(true, false, false);
        expect(keyNames).toBeInstanceOf(Map);
        expect(keyNames.get('A')).toBe('ྟ');
      });

      it('should return empty map for ctrl', () => {
        const keyNames = layout.getKeyNames(false, true, false);
        expect(keyNames.size).toBe(0);
      });

      it('should return alt lowercase key names for alt', () => {
        const keyNames = layout.getKeyNames(false, false, true);
        expect(keyNames).toBeInstanceOf(Map);
        expect(keyNames.size).toBeGreaterThan(0);
      });

      it('should return alt uppercase key names for alt + shift', () => {
        const keyNames = layout.getKeyNames(true, false, true);
        expect(keyNames).toBeInstanceOf(Map);
        expect(keyNames.size).toBeGreaterThan(0);
      });

      it('should cache key names on subsequent calls', () => {
        const keyNames1 = layout.getKeyNames(false, false, false);
        const keyNames2 = layout.getKeyNames(false, false, false);
        expect(keyNames1).toBe(keyNames2);
      });
    });
  });
});
