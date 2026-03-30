import SambhotaKeymapTwoLayout from './SambhotaKeymapTwoLayout';
import StackingLayout from './StackingLayout';
import { CommittingState, EmptyState, StackingState } from '../input_method/InputState';
import { Key } from '../input_method/Key';

describe('SambhotaKeymapTwoLayout', () => {
  let layout: SambhotaKeymapTwoLayout;
  let stateCallback: jest.Mock;
  let errorCallback: jest.Mock;

  beforeEach(() => {
    layout = new SambhotaKeymapTwoLayout();
    stateCallback = jest.fn();
    errorCallback = jest.fn();
  });

  describe('layout properties', () => {
    it('has correct layoutId', () => {
      expect(layout.layoutId).toBe('sambhota_keymap_two');
    });

    it('has correct layoutName', () => {
      expect(layout.layoutName).toBe('Sambhota Keymap #2');
    });

    it('has correct composeKey', () => {
      expect(layout.composeKey).toBe('h');
    });

    it('has correct spaceKey', () => {
      expect(layout.spaceKey).toBe('-');
    });
  });

  describe('translateKey', () => {
    it("maps 'D' to 'm'", () => {
      expect(layout.translateKey('D')).toBe('m');
    });

    it("maps 'F' to apostrophe", () => {
      expect(layout.translateKey('F')).toBe("'");
    });

    it('returns other keys unchanged', () => {
      expect(layout.translateKey('a')).toBe('a');
      expect(layout.translateKey('k')).toBe('k');
      expect(layout.translateKey('Q')).toBe('Q');
    });
  });

  describe('translateKey via handle - D key commits consonant m (index 24)', () => {
    it("pressing 'D' in EmptyState commits ConsonantChars[24] via translateKey", () => {
      const key = Key.asciiKey('D');
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
      expect(state.commitString).toBe(String.fromCharCode(StackingLayout.ConsonantChars[24]));
    });

    it("pressing 'F' in EmptyState commits ConsonantChars[19] via translateKey", () => {
      const key = Key.asciiKey('F');
      layout.handle(key, new EmptyState(), stateCallback, errorCallback);
      const state = stateCallback.mock.calls[0][0] as CommittingState;
      expect(state).toBeInstanceOf(CommittingState);
      expect(state.commitString).toBe(String.fromCharCode(StackingLayout.ConsonantChars[19]));
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
});
