import WyleLayout from './WyleLayout';
import { CommittingState, EmptyState, WylieInputtingState } from '../input_method/InputState';
import { Key, KeyName } from '../input_method/Key';

describe('WyleLayout', () => {
  let layout: WyleLayout;
  let stateCallback: jest.Mock;
  let errorCallback: jest.Mock;

  beforeEach(() => {
    layout = new WyleLayout();
    stateCallback = jest.fn();
    errorCallback = jest.fn();
  });

  describe('layout properties', () => {
    it('has correct layoutId', () => {
      expect(layout.layoutId).toBe('wylie');
    });

    it('has correct layoutName', () => {
      expect(layout.layoutName).toBe('Wylie');
    });
  });

  describe('getKeyNames', () => {
    it('returns empty map', () => {
      const names = layout.getKeyNames(false, false, false);
      expect(names.size).toBe(0);
    });
  });

  describe('handle - ctrl/alt key', () => {
    it('clears WylieInputtingState on ctrl key', () => {
      const state = new WylieInputtingState('ka', 'ཀ', 2);
      const key = Key.asciiKey('a', false, true);
      layout.handle(key, state, stateCallback, errorCallback);
      const newState = stateCallback.mock.calls[0][0];
      expect(newState).toBeInstanceOf(EmptyState);
    });

    it('returns false on ctrl key in EmptyState', () => {
      const key = Key.asciiKey('a', false, true);
      const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      expect(result).toBe(false);
      expect(stateCallback).not.toHaveBeenCalled();
    });

    it('clears WylieInputtingState on alt key', () => {
      const state = new WylieInputtingState('ka', 'ཀ', 2);
      const key = new Key('a', KeyName.ASCII, false, false, false, true);
      layout.handle(key, state, stateCallback, errorCallback);
      const newState = stateCallback.mock.calls[0][0];
      expect(newState).toBeInstanceOf(EmptyState);
    });
  });

  describe('handle - space key', () => {
    it('commits tsheg in EmptyState', () => {
      const key = Key.namedKey(KeyName.SPACE);
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
      expect(state.commitString).toBe('་');
    });

    it('appends tsheg to tibetan in WylieInputtingState', () => {
      const wylie = new WylieInputtingState('ka', 'ཀ', 2);
      const key = Key.namedKey(KeyName.SPACE);
      layout.handle(key, wylie, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
      expect(state.commitString).toBe('ཀ་');
    });
  });

  describe('handle - return key', () => {
    it('commits letters in WylieInputtingState', () => {
      const wylie = new WylieInputtingState('ka', 'ཀ', 2);
      const key = Key.namedKey(KeyName.RETURN);
      const result = layout.handle(key, wylie, stateCallback, errorCallback);
      expect(result).toBe(true);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
      expect(state.commitString).toBe('ka');
    });

    it('returns false in EmptyState', () => {
      const key = Key.namedKey(KeyName.RETURN);
      const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      expect(result).toBe(false);
      expect(stateCallback).not.toHaveBeenCalled();
    });
  });

  describe('handle - escape key', () => {
    it('clears WylieInputtingState', () => {
      const wylie = new WylieInputtingState('ka', 'ཀ', 2);
      const key = Key.namedKey(KeyName.ESC);
      const result = layout.handle(key, wylie, stateCallback, errorCallback);
      expect(result).toBe(true);
      expect(stateCallback.mock.calls[0][0]).toBeInstanceOf(EmptyState);
    });

    it('returns true in EmptyState', () => {
      const key = Key.namedKey(KeyName.ESC);
      const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      expect(result).toBe(true);
    });
  });

  describe('handle - backspace key', () => {
    it('removes character before cursor in WylieInputtingState', () => {
      const wylie = new WylieInputtingState('ka', 'ཀ', 2);
      const key = Key.namedKey(KeyName.BACKSPACE);
      layout.handle(key, wylie, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as WylieInputtingState;
      expect(state).toBeInstanceOf(WylieInputtingState);
      expect(state.letters).toBe('k');
      expect(state.cursorIndex).toBe(1);
    });

    it('transitions to EmptyState when last character deleted', () => {
      const wylie = new WylieInputtingState('k', 'ཀ', 1);
      const key = Key.namedKey(KeyName.BACKSPACE);
      layout.handle(key, wylie, stateCallback, errorCallback);
      expect(stateCallback.mock.calls[0][0]).toBeInstanceOf(EmptyState);
    });

    it('calls errorCallback when cursor at beginning', () => {
      const wylie = new WylieInputtingState('ka', 'ཀ', 0);
      const key = Key.namedKey(KeyName.BACKSPACE);
      layout.handle(key, wylie, stateCallback, errorCallback);
      expect(errorCallback).toHaveBeenCalled();
    });

    it('returns false in EmptyState', () => {
      const key = Key.namedKey(KeyName.BACKSPACE);
      const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      expect(result).toBe(false);
    });
  });

  describe('handle - delete key', () => {
    it('removes character after cursor in WylieInputtingState', () => {
      const wylie = new WylieInputtingState('ka', 'ཀ', 0);
      const key = Key.namedKey(KeyName.DELETE);
      layout.handle(key, wylie, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as WylieInputtingState;
      expect(state).toBeInstanceOf(WylieInputtingState);
      expect(state.letters).toBe('a');
      expect(state.cursorIndex).toBe(0);
    });

    it('transitions to EmptyState when last character deleted', () => {
      const wylie = new WylieInputtingState('k', 'ཀ', 0);
      const key = Key.namedKey(KeyName.DELETE);
      layout.handle(key, wylie, stateCallback, errorCallback);
      expect(stateCallback.mock.calls[0][0]).toBeInstanceOf(EmptyState);
    });

    it('calls errorCallback when cursor at end', () => {
      const wylie = new WylieInputtingState('ka', 'ཀ', 2);
      const key = Key.namedKey(KeyName.DELETE);
      layout.handle(key, wylie, stateCallback, errorCallback);
      expect(errorCallback).toHaveBeenCalled();
    });

    it('returns false in EmptyState', () => {
      const key = Key.namedKey(KeyName.DELETE);
      const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      expect(result).toBe(false);
    });
  });

  describe('handle - left arrow key', () => {
    it('moves cursor left in WylieInputtingState', () => {
      const wylie = new WylieInputtingState('ka', 'ཀ', 2);
      const key = Key.namedKey(KeyName.LEFT);
      layout.handle(key, wylie, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as WylieInputtingState;
      expect(state).toBeInstanceOf(WylieInputtingState);
      expect(state.cursorIndex).toBe(1);
    });

    it('calls errorCallback when cursor at start', () => {
      const wylie = new WylieInputtingState('ka', 'ཀ', 0);
      const key = Key.namedKey(KeyName.LEFT);
      layout.handle(key, wylie, stateCallback, errorCallback);
      expect(errorCallback).toHaveBeenCalled();
    });

    it('returns false in EmptyState', () => {
      const key = Key.namedKey(KeyName.LEFT);
      const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      expect(result).toBe(false);
    });
  });

  describe('handle - right arrow key', () => {
    it('moves cursor right in WylieInputtingState', () => {
      const wylie = new WylieInputtingState('ka', 'ཀ', 0);
      const key = Key.namedKey(KeyName.RIGHT);
      layout.handle(key, wylie, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as WylieInputtingState;
      expect(state).toBeInstanceOf(WylieInputtingState);
      expect(state.cursorIndex).toBe(1);
    });

    it('calls errorCallback when cursor at end', () => {
      const wylie = new WylieInputtingState('ka', 'ཀ', 2);
      const key = Key.namedKey(KeyName.RIGHT);
      layout.handle(key, wylie, stateCallback, errorCallback);
      expect(errorCallback).toHaveBeenCalled();
    });

    it('returns false in EmptyState', () => {
      const key = Key.namedKey(KeyName.RIGHT);
      const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      expect(result).toBe(false);
    });
  });

  describe('handle - home key', () => {
    it('moves cursor to start in WylieInputtingState', () => {
      const wylie = new WylieInputtingState('ka', 'ཀ', 2);
      const key = Key.namedKey(KeyName.HOME);
      layout.handle(key, wylie, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as WylieInputtingState;
      expect(state.cursorIndex).toBe(0);
    });

    it('returns false in EmptyState', () => {
      const key = Key.namedKey(KeyName.HOME);
      const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      expect(result).toBe(false);
    });
  });

  describe('handle - end key', () => {
    it('moves cursor to end in WylieInputtingState', () => {
      const wylie = new WylieInputtingState('ka', 'ཀ', 0);
      const key = Key.namedKey(KeyName.END);
      layout.handle(key, wylie, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as WylieInputtingState;
      expect(state.cursorIndex).toBe(2);
    });

    it('returns false in EmptyState', () => {
      const key = Key.namedKey(KeyName.END);
      const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      expect(result).toBe(false);
    });
  });

  describe('handle - ascii character', () => {
    it('creates WylieInputtingState from EmptyState', () => {
      const key = Key.asciiKey('k');
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as WylieInputtingState;
      expect(state).toBeInstanceOf(WylieInputtingState);
      expect(state.letters).toBe('k');
      expect(state.cursorIndex).toBe(1);
    });

    it('inserts character at cursor in WylieInputtingState', () => {
      const wylie = new WylieInputtingState('ka', 'ཀ', 1);
      const key = Key.asciiKey('x');
      layout.handle(key, wylie, stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as WylieInputtingState;
      expect(state).toBeInstanceOf(WylieInputtingState);
      expect(state.letters).toBe('kxa');
      expect(state.cursorIndex).toBe(2);
    });

    it('returns false for non-single-char ascii', () => {
      const key = Key.namedKey(KeyName.UNKNOWN);
      const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      expect(result).toBe(false);
    });
  });
});
