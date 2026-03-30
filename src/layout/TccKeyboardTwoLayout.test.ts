import TccKeyboardTwoLayout from './TccKeyboardTwoLayout';
import StackingLayout from './StackingLayout';
import { CommittingState, EmptyState } from '../input_method/InputState';
import { Key, KeyName } from '../input_method/Key';

describe('TccKeyboardTwoLayout', () => {
  let layout: TccKeyboardTwoLayout;
  let stateCallback: jest.Mock;
  let errorCallback: jest.Mock;

  beforeEach(() => {
    layout = new TccKeyboardTwoLayout();
    stateCallback = jest.fn();
    errorCallback = jest.fn();
  });

  describe('layout properties', () => {
    it('has correct layoutId', () => {
      expect(layout.layoutId).toBe('tcc_keyboard_two');
    });

    it('has correct layoutName', () => {
      expect(layout.layoutName).toBe('TCC Keyboard #2');
    });

    it('has correct composeKey', () => {
      expect(layout.composeKey).toBe('a');
    });

    it('has correct spaceKey', () => {
      expect(layout.spaceKey).toBe('-');
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
  });

  describe('handle - digit keys', () => {
    it('commits Tibetan digit for digit key 0', () => {
      const key = Key.asciiKey('0');
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
      expect(state.commitString).toBe(String.fromCharCode(0x0f20));
    });
  });

  describe('handle - consonant key', () => {
    it('commits first consonant (q → ConsonantChars[0]) in EmptyState', () => {
      // TccKeyboardTwoLayout consonantKeyMapping[0] = 'q'
      const key = Key.asciiKey('q');
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
      expect(state.commitString).toBe(String.fromCharCode(StackingLayout.ConsonantChars[0]));
    });
  });

  describe('handle - space key (SPACE)', () => {
    it('commits tsheg (0x0f0b) on SPACE key', () => {
      const key = Key.namedKey(KeyName.SPACE);
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
      expect(state.commitString).toBe(String.fromCharCode(0x0f0b));
    });
  });
});
