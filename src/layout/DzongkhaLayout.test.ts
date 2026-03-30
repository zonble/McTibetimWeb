import DzongkhaLayout from './DzongkhaLayout';
import { CommittingState, EmptyState } from '../input_method/InputState';
import { Key, KeyName } from '../input_method/Key';

describe('DzongkhaLayout', () => {
  let layout: DzongkhaLayout;
  let stateCallback: jest.Mock;
  let errorCallback: jest.Mock;

  beforeEach(() => {
    layout = new DzongkhaLayout();
    stateCallback = jest.fn();
    errorCallback = jest.fn();
  });

  describe('layout properties', () => {
    it('has correct layoutId', () => {
      expect(layout.layoutId).toBe('dzongkha');
    });

    it('has correct layoutName', () => {
      expect(layout.layoutName).toBe('Dzongkha');
    });
  });

  describe('getKeyNames', () => {
    it('returns empty map when ctrl is pressed', () => {
      const names = layout.getKeyNames(false, true, false);
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

    it('returns alt key names for alt state', () => {
      const names = layout.getKeyNames(false, false, true);
      expect(names.size).toBeGreaterThan(0);
    });

    it('returns alt+shift key names', () => {
      const names = layout.getKeyNames(true, false, true);
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

    it('caches alt lowered key names', () => {
      const names1 = layout.getKeyNames(false, false, true);
      const names2 = layout.getKeyNames(false, false, true);
      expect(names1).toBe(names2);
    });

    it('caches alt uppered key names', () => {
      const names1 = layout.getKeyNames(true, false, true);
      const names2 = layout.getKeyNames(true, false, true);
      expect(names1).toBe(names2);
    });
  });

  describe('handle - ctrl key', () => {
    it('returns false for ctrl key', () => {
      const key = Key.asciiKey('a', false, true);
      const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      expect(result).toBe(false);
    });
  });

  describe('handle - space key', () => {
    it('commits tshe (tsheg) for space key', () => {
      const key = Key.namedKey(KeyName.SPACE);
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
      expect(state.commitString).toBe(String.fromCharCode(0x0f0b));
    });
  });

  describe('handle - regular key mappings', () => {
    it('commits mapped character for q -> ཀ', () => {
      const key = Key.asciiKey('q');
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
      expect(state.commitString).toBe('ཀ');
    });

    it('commits mapped character for digit 1 -> ༡', () => {
      const key = Key.asciiKey('1');
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
      expect(state.commitString).toBe('༡');
    });

    it('returns false for unmapped key', () => {
      // Use a key that is not in the keymap
      const key = Key.asciiKey('`');
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      // '`' maps to '༉' in keymap
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
    });
  });

  describe('handle - alt key', () => {
    it('commits alt-mapped character for alt+q', () => {
      // alt+q: lowerKeyCodeAsciiMapping('KeyQ') -> 'q', altKeyMap('q') -> 'ྈ'
      const key = new Key('q', KeyName.ASCII, false, false, false, true, false, 'KeyQ');
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
      expect(state.commitString).toBe('ྈ');
    });

    it('calls errorCallback for alt key with mapped ascii but empty altKeyMap entry', () => {
      // lowerKeyCodeAsciiMapping('KeyG') -> 'g', altKeyMap('g') -> '' (empty = falsy)
      const key = new Key('g', KeyName.ASCII, false, false, false, true, false, 'KeyG');
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      expect(errorCallback).toHaveBeenCalled();
    });
  });
});
