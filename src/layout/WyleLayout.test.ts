import { CommittingState, EmptyState, WylieInputtingState } from '../input_method/InputState';
import { Key, KeyName } from '../input_method/Key';
import WyleLayout from './WyleLayout';

// The EwtsConverter is mocked via jest.config.js to return the input as-is.
// So tibetan output will be equal to the input letters in tests.

describe('WyleLayout', () => {
  let layout: WyleLayout;
  let stateCallback: jest.Mock;
  let errorCallback: jest.Mock;

  beforeEach(() => {
    layout = new WyleLayout();
    stateCallback = jest.fn();
    errorCallback = jest.fn();
  });

  describe('layout identity', () => {
    it('should have the correct layoutId', () => {
      expect(layout.layoutId).toBe('wylie');
    });

    it('should have the correct layoutName', () => {
      expect(layout.layoutName).toBe('Wylie');
    });
  });

  describe('getKeyNames', () => {
    it('should return an empty map', () => {
      const keyNames = layout.getKeyNames(false, false, false);
      expect(keyNames).toBeInstanceOf(Map);
      expect(keyNames.size).toBe(0);
    });

    it('should return an empty map for shift', () => {
      expect(layout.getKeyNames(true, false, false).size).toBe(0);
    });

    it('should return an empty map for ctrl', () => {
      expect(layout.getKeyNames(false, true, false).size).toBe(0);
    });
  });

  describe('handle', () => {
    describe('ctrl key', () => {
      it('should return false and not change state if not in WylieInputtingState', () => {
        const key = new Key('a', KeyName.ASCII, false, true);
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(false);
        expect(stateCallback).not.toHaveBeenCalled();
      });

      it('should transition to EmptyState if in WylieInputtingState with ctrl', () => {
        const inputtingState = new WylieInputtingState('ka', 'ka', 2);
        const key = new Key('a', KeyName.ASCII, false, true);
        layout.handle(key, inputtingState, stateCallback, errorCallback);
        expect(stateCallback).toHaveBeenCalledWith(expect.any(EmptyState));
      });
    });

    describe('alt key', () => {
      it('should return false and not change state if not in WylieInputtingState', () => {
        const key = new Key('a', KeyName.ASCII, false, false, false, true);
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(false);
        expect(stateCallback).not.toHaveBeenCalled();
      });

      it('should transition to EmptyState if in WylieInputtingState with alt', () => {
        const inputtingState = new WylieInputtingState('ka', 'ka', 2);
        const key = new Key('a', KeyName.ASCII, false, false, false, true);
        layout.handle(key, inputtingState, stateCallback, errorCallback);
        expect(stateCallback).toHaveBeenCalledWith(expect.any(EmptyState));
      });
    });

    describe('SPACE key', () => {
      it('should commit tsheg in EmptyState', () => {
        const key = Key.namedKey(KeyName.SPACE);
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(true);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe('་');
      });

      it('should commit tibetan text + tsheg in WylieInputtingState', () => {
        const inputtingState = new WylieInputtingState('k', 'k', 1);
        const key = Key.namedKey(KeyName.SPACE);
        layout.handle(key, inputtingState, stateCallback, errorCallback);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe('k་');
      });
    });

    describe('RETURN key', () => {
      it('should commit letters in WylieInputtingState', () => {
        const inputtingState = new WylieInputtingState('ka', 'ཀ', 2);
        const key = Key.namedKey(KeyName.RETURN);
        const result = layout.handle(key, inputtingState, stateCallback, errorCallback);
        expect(result).toBe(true);
        const committed = stateCallback.mock.calls[0][0] as CommittingState;
        expect(committed.commitString).toBe('ka');
      });

      it('should not commit in WylieInputtingState with empty letters', () => {
        const inputtingState = new WylieInputtingState('', '', 0);
        const key = Key.namedKey(KeyName.RETURN);
        layout.handle(key, inputtingState, stateCallback, errorCallback);
        expect(stateCallback).not.toHaveBeenCalled();
      });

      it('should return false in EmptyState', () => {
        const key = Key.namedKey(KeyName.RETURN);
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(false);
      });
    });

    describe('ESC key', () => {
      it('should transition to EmptyState in WylieInputtingState', () => {
        const inputtingState = new WylieInputtingState('ka', 'ཀ', 2);
        const key = Key.namedKey(KeyName.ESC);
        const result = layout.handle(key, inputtingState, stateCallback, errorCallback);
        expect(result).toBe(true);
        expect(stateCallback).toHaveBeenCalledWith(expect.any(EmptyState));
      });

      it('should return true in EmptyState', () => {
        const key = Key.namedKey(KeyName.ESC);
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(true);
        expect(stateCallback).not.toHaveBeenCalled();
      });
    });

    describe('BACKSPACE key', () => {
      it('should remove last character from letters', () => {
        const inputtingState = new WylieInputtingState('ka', 'ka', 2);
        const key = Key.namedKey(KeyName.BACKSPACE);
        layout.handle(key, inputtingState, stateCallback, errorCallback);
        const newState = stateCallback.mock.calls[0][0] as WylieInputtingState;
        expect(newState).toBeInstanceOf(WylieInputtingState);
        expect(newState.letters).toBe('k');
      });

      it('should transition to EmptyState when deleting the last character', () => {
        const inputtingState = new WylieInputtingState('k', 'k', 1);
        const key = Key.namedKey(KeyName.BACKSPACE);
        layout.handle(key, inputtingState, stateCallback, errorCallback);
        expect(stateCallback).toHaveBeenCalledWith(expect.any(EmptyState));
      });

      it('should call errorCallback when cursor is at beginning', () => {
        const inputtingState = new WylieInputtingState('ka', 'ka', 0);
        const key = Key.namedKey(KeyName.BACKSPACE);
        layout.handle(key, inputtingState, stateCallback, errorCallback);
        expect(errorCallback).toHaveBeenCalled();
        expect(stateCallback).not.toHaveBeenCalled();
      });

      it('should return false in EmptyState', () => {
        const key = Key.namedKey(KeyName.BACKSPACE);
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(false);
      });
    });

    describe('DELETE key', () => {
      it('should remove character at cursor position', () => {
        const inputtingState = new WylieInputtingState('ka', 'ka', 1);
        const key = Key.namedKey(KeyName.DELETE);
        layout.handle(key, inputtingState, stateCallback, errorCallback);
        const newState = stateCallback.mock.calls[0][0] as WylieInputtingState;
        expect(newState).toBeInstanceOf(WylieInputtingState);
        expect(newState.letters).toBe('k');
      });

      it('should transition to EmptyState when deleting the last character', () => {
        const inputtingState = new WylieInputtingState('k', 'k', 0);
        const key = Key.namedKey(KeyName.DELETE);
        layout.handle(key, inputtingState, stateCallback, errorCallback);
        expect(stateCallback).toHaveBeenCalledWith(expect.any(EmptyState));
      });

      it('should call errorCallback when cursor is at end', () => {
        const inputtingState = new WylieInputtingState('ka', 'ka', 2);
        const key = Key.namedKey(KeyName.DELETE);
        layout.handle(key, inputtingState, stateCallback, errorCallback);
        expect(errorCallback).toHaveBeenCalled();
        expect(stateCallback).not.toHaveBeenCalled();
      });

      it('should return false in EmptyState', () => {
        const key = Key.namedKey(KeyName.DELETE);
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(false);
      });
    });

    describe('LEFT arrow key', () => {
      it('should move cursor left in WylieInputtingState', () => {
        const inputtingState = new WylieInputtingState('ka', 'ka', 2);
        const key = Key.namedKey(KeyName.LEFT);
        layout.handle(key, inputtingState, stateCallback, errorCallback);
        const newState = stateCallback.mock.calls[0][0] as WylieInputtingState;
        expect(newState.cursorIndex).toBe(1);
      });

      it('should call errorCallback when cursor is already at start', () => {
        const inputtingState = new WylieInputtingState('ka', 'ka', 0);
        const key = Key.namedKey(KeyName.LEFT);
        layout.handle(key, inputtingState, stateCallback, errorCallback);
        expect(errorCallback).toHaveBeenCalled();
        expect(stateCallback).not.toHaveBeenCalled();
      });

      it('should return false in EmptyState', () => {
        const key = Key.namedKey(KeyName.LEFT);
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(false);
      });
    });

    describe('RIGHT arrow key', () => {
      it('should move cursor right in WylieInputtingState', () => {
        const inputtingState = new WylieInputtingState('ka', 'ka', 1);
        const key = Key.namedKey(KeyName.RIGHT);
        layout.handle(key, inputtingState, stateCallback, errorCallback);
        const newState = stateCallback.mock.calls[0][0] as WylieInputtingState;
        expect(newState.cursorIndex).toBe(2);
      });

      it('should call errorCallback when cursor is at end', () => {
        const inputtingState = new WylieInputtingState('ka', 'ka', 2);
        const key = Key.namedKey(KeyName.RIGHT);
        layout.handle(key, inputtingState, stateCallback, errorCallback);
        expect(errorCallback).toHaveBeenCalled();
        expect(stateCallback).not.toHaveBeenCalled();
      });

      it('should return false in EmptyState', () => {
        const key = Key.namedKey(KeyName.RIGHT);
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(false);
      });
    });

    describe('HOME key', () => {
      it('should move cursor to beginning', () => {
        const inputtingState = new WylieInputtingState('ka', 'ka', 2);
        const key = Key.namedKey(KeyName.HOME);
        layout.handle(key, inputtingState, stateCallback, errorCallback);
        const newState = stateCallback.mock.calls[0][0] as WylieInputtingState;
        expect(newState.cursorIndex).toBe(0);
      });

      it('should return false in EmptyState', () => {
        const key = Key.namedKey(KeyName.HOME);
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(false);
      });
    });

    describe('END key', () => {
      it('should move cursor to end of letters', () => {
        const inputtingState = new WylieInputtingState('ka', 'ka', 0);
        const key = Key.namedKey(KeyName.END);
        layout.handle(key, inputtingState, stateCallback, errorCallback);
        const newState = stateCallback.mock.calls[0][0] as WylieInputtingState;
        expect(newState.cursorIndex).toBe(2);
      });

      it('should return false in EmptyState', () => {
        const key = Key.namedKey(KeyName.END);
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(false);
      });
    });

    describe('typing ASCII characters', () => {
      it('should create WylieInputtingState when typing in EmptyState', () => {
        const key = Key.asciiKey('k');
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(true);
        const newState = stateCallback.mock.calls[0][0] as WylieInputtingState;
        expect(newState).toBeInstanceOf(WylieInputtingState);
        expect(newState.letters).toBe('k');
        expect(newState.cursorIndex).toBe(1);
      });

      it('should append character to existing letters', () => {
        const inputtingState = new WylieInputtingState('k', 'k', 1);
        const key = Key.asciiKey('a');
        layout.handle(key, inputtingState, stateCallback, errorCallback);
        const newState = stateCallback.mock.calls[0][0] as WylieInputtingState;
        expect(newState.letters).toBe('ka');
        expect(newState.cursorIndex).toBe(2);
      });

      it('should insert character at cursor position', () => {
        const inputtingState = new WylieInputtingState('ka', 'ka', 1);
        const key = Key.asciiKey('x');
        layout.handle(key, inputtingState, stateCallback, errorCallback);
        const newState = stateCallback.mock.calls[0][0] as WylieInputtingState;
        expect(newState.letters).toBe('kxa');
        expect(newState.cursorIndex).toBe(2);
      });

      it('should update tibetan field from ewts converter', () => {
        const key = Key.asciiKey('k');
        layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        const newState = stateCallback.mock.calls[0][0] as WylieInputtingState;
        // Mock returns input as-is
        expect(newState.tibetan).toBe('k');
      });

      it('should not handle non-single-character keys', () => {
        const key = new Key('', KeyName.UNKNOWN);
        const result = layout.handle(key, new EmptyState(), stateCallback, errorCallback);
        expect(result).toBe(false);
      });
    });
  });
});
