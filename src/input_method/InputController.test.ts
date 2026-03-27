import InputController from './InputController';
import { InputUI } from './InputUI';
import { CommittingState, EmptyState, InputtingState } from './InputState';
import { Key, KeyName } from './Key';
import { KeyHandler } from './KeyHandler';
import { KeyMapping } from './KeyMapping';

jest.mock('./KeyHandler');

describe('InputController', () => {
  let mockUI: jest.Mocked<InputUI>;
  let controller: InputController;
  let mockKeyHandlerHandle: jest.Mock;
  let mockKeyHandlerSelectLayoutById: jest.Mock;

  beforeEach(() => {
    (KeyHandler as jest.Mock).mockClear();

    mockUI = {
      reset: jest.fn(),
      commitString: jest.fn(),
      update: jest.fn(),
    };

    mockKeyHandlerHandle = jest.fn();
    mockKeyHandlerSelectLayoutById = jest.fn();

    (KeyHandler as jest.Mock).mockImplementation(() => {
      return {
        handle: mockKeyHandlerHandle,
        selectLayoutById: mockKeyHandlerSelectLayoutById,
      };
    });

    controller = new InputController(mockUI);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should start with EmptyState', () => {
      expect(controller.state).toBeInstanceOf(EmptyState);
    });
  });

  describe('selectLayoutById', () => {
    it('should delegate to keyHandler', () => {
      controller.selectLayoutById('test_layout');
      expect(mockKeyHandlerSelectLayoutById).toHaveBeenCalledWith('test_layout');
    });
  });

  describe('handleKeyboardEvent', () => {
    it('should map event to Key and call handle', () => {
      const mockKey = Key.asciiKey('a');
      jest.spyOn(KeyMapping, 'keyFromKeyboardEvent').mockReturnValue(mockKey);
      mockKeyHandlerHandle.mockReturnValue(true);

      const event = new KeyboardEvent('keydown', { key: 'a' });
      const result = controller.handleKeyboardEvent(event);

      expect(KeyMapping.keyFromKeyboardEvent).toHaveBeenCalledWith(event);
      expect(mockKeyHandlerHandle).toHaveBeenCalledWith(
        mockKey,
        expect.any(EmptyState),
        expect.any(Function),
        expect.any(Function)
      );
      expect(result).toBe(true);
    });
  });

  describe('handle and state transitions', () => {
    it('should handle transition to EmptyState', () => {
      mockKeyHandlerHandle.mockImplementation((key, state, stateCb) => {
        stateCb(new EmptyState());
        return true;
      });

      controller.handle(Key.asciiKey('a'));

      expect(mockUI.reset).toHaveBeenCalled();
      expect(controller.state).toBeInstanceOf(EmptyState);
    });

    it('should handle transition to CommittingState', () => {
      mockKeyHandlerHandle.mockImplementation((key, state, stateCb) => {
        stateCb(new CommittingState('test_commit'));
        return true;
      });

      controller.handle(Key.asciiKey('a'));

      expect(mockUI.commitString).toHaveBeenCalledWith('test_commit');
      expect(mockUI.reset).toHaveBeenCalled();
      // After committing, it should transition back to EmptyState
      expect(controller.state).toBeInstanceOf(EmptyState);
    });

      it('should handle transition to InputtingState', () => {
        mockKeyHandlerHandle.mockImplementation((key, state, stateCb) => {
          const utf16Code = Array.from('test_buffer').map(c => c.charCodeAt(0));
          const inputtingState = new InputtingState(utf16Code, []);
          stateCb(inputtingState);
          return true;
        });

      controller.handle(Key.asciiKey('a'));

      expect(mockUI.reset).toHaveBeenCalled();
      expect(mockUI.update).toHaveBeenCalled();
      
      // Update should be called with a JSON payload from InputUIStateBuilder
      // Since it's built internally, we just ensure it was called with a string containing the buffer
      const updateArg = mockUI.update.mock.calls[0][0];
      expect(typeof updateArg).toBe('string');
      expect(updateArg).toContain('test_buffer');
      expect(controller.state).toBeInstanceOf(InputtingState);
    });
  });

  describe('reset', () => {
    it('should just reset UI if current state is EmptyState', () => {
      // It's already in EmptyState
      controller.reset();
      expect(mockUI.reset).toHaveBeenCalled();
    });

    it('should commit buffer and then reset UI if current state is InputtingState', () => {
      // Force it into InputtingState first
      mockKeyHandlerHandle.mockImplementation((key, state, stateCb) => {
        const utf16Code = Array.from('pending_commit').map(c => c.charCodeAt(0));
        const inputtingState = new InputtingState(utf16Code, []);
        stateCb(inputtingState);
        return true;
      });
      controller.handle(Key.asciiKey('a'));
      
      // Clear mock calls to focus on reset behavior
      mockUI.reset.mockClear();
      mockUI.commitString.mockClear();
      mockUI.update.mockClear();

      // Now call reset
      controller.reset();

      expect(mockUI.commitString).toHaveBeenCalledWith('pending_commit');
      expect(mockUI.reset).toHaveBeenCalled();
      expect(controller.state).toBeInstanceOf(EmptyState);
    });

    it('should not commit if composing buffer is empty in InputtingState', () => {
      mockKeyHandlerHandle.mockImplementation((key, state, stateCb) => {
        const inputtingState = new InputtingState([], []);
        stateCb(inputtingState);
        return true;
      });
      controller.handle(Key.asciiKey('a'));

      mockUI.reset.mockClear();
      mockUI.commitString.mockClear();

      controller.reset();

      expect(mockUI.commitString).not.toHaveBeenCalled();
      expect(mockUI.reset).toHaveBeenCalled();
      expect(controller.state).toBeInstanceOf(EmptyState);
    });
  });

  describe('onerror callback', () => {
    it('should call controller.onError when errorCallback is fired by KeyHandler', () => {
      const mockOnError = jest.fn();
      controller.onError = mockOnError;

      mockKeyHandlerHandle.mockImplementation((key, state, stateCb, errorCb) => {
        errorCb();
        return true;
      });

      controller.handle(Key.asciiKey('a'));

      expect(mockOnError).toHaveBeenCalled();
    });
  });
});
