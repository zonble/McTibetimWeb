import { KeyHandler } from './KeyHandler';
import { EmptyState, StackingState } from './InputState';
import { Key, KeyName } from './Key';

describe('KeyHandler', () => {
  let handler: KeyHandler;
  let stateCallback: jest.Mock;
  let errorCallback: jest.Mock;

  beforeEach(() => {
    handler = new KeyHandler();
    stateCallback = jest.fn();
    errorCallback = jest.fn();
  });

  describe('selectLayoutById', () => {
    it('switches to sambhota_keymap_one layout', () => {
      handler.selectLayoutById('sambhota_keymap_one');
      const names = handler.getKeyNames(false, false, false);
      expect(names.size).toBeGreaterThan(0);
    });

    it('switches to dzongkha layout', () => {
      handler.selectLayoutById('dzongkha');
      const names = handler.getKeyNames(false, false, false);
      expect(names.size).toBeGreaterThan(0);
    });

    it('ignores unknown layout id', () => {
      handler.selectLayoutById('sambhota_keymap_one');
      const namesBefore = handler.getKeyNames(false, false, false);

      handler.selectLayoutById('nonexistent_layout');
      const namesAfter = handler.getKeyNames(false, false, false);

      // Should still use the previous layout
      expect(namesAfter).toEqual(namesBefore);
    });
  });

  describe('getKeyNames', () => {
    it('returns empty map when ctrl is pressed', () => {
      handler.selectLayoutById('sambhota_keymap_one');
      const names = handler.getKeyNames(false, true, false);
      expect(names.size).toBe(0);
    });

    it('returns key names for shift state', () => {
      handler.selectLayoutById('sambhota_keymap_one');
      const names = handler.getKeyNames(true, false, false);
      expect(names.size).toBeGreaterThan(0);
    });
  });

  describe('handle', () => {
    it('delegates key handling to the layout', () => {
      const state = new EmptyState();
      const key = Key.asciiKey('k');
      const result = handler.handle(key, state, stateCallback, errorCallback);
      expect(result).toBe(true);
      expect(stateCallback).toHaveBeenCalled();
    });

    it('returns false for unrecognized keys in EmptyState', () => {
      const state = new EmptyState();
      // ESC key in EmptyState for stacking layout doesn't call stateCallback
      const key = Key.namedKey(KeyName.ESC);
      const result = handler.handle(key, state, stateCallback, errorCallback);
      expect(result).toBe(false);
    });
  });
});
