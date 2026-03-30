import LayoutManager from './LayoutManager';

describe('LayoutManager', () => {
  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = LayoutManager.getInstance();
      const instance2 = LayoutManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('layouts', () => {
    it('should contain all six layouts', () => {
      const manager = LayoutManager.getInstance();
      expect(manager.layouts).toHaveLength(6);
    });

    it('should include the dzongkha layout', () => {
      const manager = LayoutManager.getInstance();
      const layout = manager.layouts.find((l) => l.layoutId === 'dzongkha');
      expect(layout).toBeDefined();
      expect(layout?.layoutName).toBe('Dzongkha');
    });

    it('should include sambhota_keymap_one layout', () => {
      const manager = LayoutManager.getInstance();
      const layout = manager.layouts.find((l) => l.layoutId === 'sambhota_keymap_one');
      expect(layout).toBeDefined();
      expect(layout?.layoutName).toBe('Sambhota Keymap #1');
    });

    it('should include sambhota_keymap_two layout', () => {
      const manager = LayoutManager.getInstance();
      const layout = manager.layouts.find((l) => l.layoutId === 'sambhota_keymap_two');
      expect(layout).toBeDefined();
    });

    it('should include tcc_keyboard_one layout', () => {
      const manager = LayoutManager.getInstance();
      const layout = manager.layouts.find((l) => l.layoutId === 'tcc_keyboard_one');
      expect(layout).toBeDefined();
    });

    it('should include tcc_keyboard_two layout', () => {
      const manager = LayoutManager.getInstance();
      const layout = manager.layouts.find((l) => l.layoutId === 'tcc_keyboard_two');
      expect(layout).toBeDefined();
    });

    it('should include wylie layout', () => {
      const manager = LayoutManager.getInstance();
      const layout = manager.layouts.find((l) => l.layoutId === 'wylie');
      expect(layout).toBeDefined();
      expect(layout?.layoutName).toBe('Wylie');
    });
  });

  describe('getLayoutById', () => {
    it('should return the dzongkha layout by id', () => {
      const manager = LayoutManager.getInstance();
      const layout = manager.getLayoutById('dzongkha');
      expect(layout).toBeDefined();
      expect(layout?.layoutId).toBe('dzongkha');
    });

    it('should return the wylie layout by id', () => {
      const manager = LayoutManager.getInstance();
      const layout = manager.getLayoutById('wylie');
      expect(layout).toBeDefined();
      expect(layout?.layoutId).toBe('wylie');
    });

    it('should return undefined for an unknown id', () => {
      const manager = LayoutManager.getInstance();
      const layout = manager.getLayoutById('nonexistent');
      expect(layout).toBeUndefined();
    });
  });
});
