import DzongkhaLayout from './DzongkhaLayout';
import LayoutManager from './LayoutManager';
import SambhotaKeymapOneLayout from './SambhotaKeymapOneLayout';
import SambhotaKeymapTwoLayout from './SambhotaKeymapTwoLayout';
import TccKeyboardOneLayout from './TccKeyboardOneLayout';
import TccKeyboardTwoLayout from './TccKeyboardTwoLayout';
import WyleLayout from './WyleLayout';

describe('LayoutManager', () => {
  let manager: LayoutManager;

  beforeEach(() => {
    manager = LayoutManager.getInstance();
  });

  describe('singleton', () => {
    it('returns the same instance', () => {
      const a = LayoutManager.getInstance();
      const b = LayoutManager.getInstance();
      expect(a).toBe(b);
    });
  });

  describe('layouts', () => {
    it('contains all expected layouts', () => {
      const ids = manager.layouts.map((l) => l.layoutId);
      expect(ids).toContain('dzongkha');
      expect(ids).toContain('sambhota_keymap_one');
      expect(ids).toContain('sambhota_keymap_two');
      expect(ids).toContain('tcc_keyboard_one');
      expect(ids).toContain('tcc_keyboard_two');
      expect(ids).toContain('wylie');
    });

    it('has 6 layouts', () => {
      expect(manager.layouts).toHaveLength(6);
    });

    it('layouts have unique ids', () => {
      const ids = manager.layouts.map((l) => l.layoutId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('layouts have non-empty names', () => {
      for (const layout of manager.layouts) {
        expect(layout.layoutName.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getLayoutById', () => {
    it('returns dzongkha layout', () => {
      const layout = manager.getLayoutById('dzongkha');
      expect(layout).toBeInstanceOf(DzongkhaLayout);
    });

    it('returns sambhota_keymap_one layout', () => {
      const layout = manager.getLayoutById('sambhota_keymap_one');
      expect(layout).toBeInstanceOf(SambhotaKeymapOneLayout);
    });

    it('returns sambhota_keymap_two layout', () => {
      const layout = manager.getLayoutById('sambhota_keymap_two');
      expect(layout).toBeInstanceOf(SambhotaKeymapTwoLayout);
    });

    it('returns tcc_keyboard_one layout', () => {
      const layout = manager.getLayoutById('tcc_keyboard_one');
      expect(layout).toBeInstanceOf(TccKeyboardOneLayout);
    });

    it('returns tcc_keyboard_two layout', () => {
      const layout = manager.getLayoutById('tcc_keyboard_two');
      expect(layout).toBeInstanceOf(TccKeyboardTwoLayout);
    });

    it('returns wylie layout', () => {
      const layout = manager.getLayoutById('wylie');
      expect(layout).toBeInstanceOf(WyleLayout);
    });

    it('returns undefined for unknown id', () => {
      const layout = manager.getLayoutById('nonexistent');
      expect(layout).toBeUndefined();
    });
  });
});
