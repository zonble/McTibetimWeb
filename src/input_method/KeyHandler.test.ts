import { KeyHandler } from './KeyHandler';
import { EmptyState, CommittingState, StackingState } from './InputState';
import { Key, KeyName } from './Key';

describe('KeyHandler', () => {
  let handler: KeyHandler;

  beforeEach(() => {
    handler = new KeyHandler();
  });

  describe('initialization', () => {
    it('should use SambhotaKeymapOne as default layout', () => {
      const keyNames = handler.getKeyNames(false, false, false);
      // SambhotaKeymapOne consonant 'k' maps to ཀ (0x0f40)
      expect(keyNames.get('k')).toBe(String.fromCharCode(0x0f40));
    });
  });

  describe('selectLayoutById', () => {
    it('should switch to wylie layout', () => {
      handler.selectLayoutById('wylie');
      // Wylie layout returns empty key names map
      const keyNames = handler.getKeyNames(false, false, false);
      expect(keyNames.size).toBe(0);
    });

    it('should switch to dzongkha layout', () => {
      handler.selectLayoutById('dzongkha');
      // In Dzongkha, 'a' → ཏ
      const keyNames = handler.getKeyNames(false, false, false);
      expect(keyNames.get('a')).toBe('ཏ');
    });

    it('should not change layout for unknown id', () => {
      const defaultKeyNames = handler.getKeyNames(false, false, false);
      handler.selectLayoutById('nonexistent_layout');
      const afterKeyNames = handler.getKeyNames(false, false, false);
      expect(afterKeyNames).toEqual(defaultKeyNames);
    });
  });

  describe('getKeyNames', () => {
    it('should return a map of key names', () => {
      const keyNames = handler.getKeyNames(false, false, false);
      expect(keyNames).toBeInstanceOf(Map);
    });

    it('should return empty map for ctrl', () => {
      const keyNames = handler.getKeyNames(false, true, false);
      expect(keyNames.size).toBe(0);
    });

    it('should return empty map for alt', () => {
      const keyNames = handler.getKeyNames(false, false, true);
      expect(keyNames.size).toBe(0);
    });
  });

  describe('handle', () => {
    it('should return true when layout handles the key', () => {
      const key = Key.asciiKey('k');
      const state = new EmptyState();
      const stateCallback = jest.fn();
      const errorCallback = jest.fn();
      const result = handler.handle(key, state, stateCallback, errorCallback);
      expect(result).toBe(true);
      expect(stateCallback).toHaveBeenCalled();
    });

    it('should return false for unhandled keys', () => {
      const key = new Key('', KeyName.UNKNOWN);
      const state = new EmptyState();
      const stateCallback = jest.fn();
      const errorCallback = jest.fn();
      const result = handler.handle(key, state, stateCallback, errorCallback);
      expect(result).toBe(false);
    });

    it('should delegate state transitions to the layout', () => {
      const key = Key.asciiKey('k');
      const state = new EmptyState();
      let newState: CommittingState | null = null;
      handler.handle(
        key,
        state,
        (s) => {
          newState = s as CommittingState;
        },
        jest.fn(),
      );
      expect(newState).toBeInstanceOf(CommittingState);
      expect(newState!.commitString).toBe(String.fromCharCode(0x0f40));
    });
  });
});
