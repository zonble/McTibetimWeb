import Layout from './Layout';
import SambhotaKeymapOneLayout from './SambhotaKeymapOneLayout';
import SambhotaKeymapTwoLayout from './SambhotaKeymapTwoLayout';
import TccKeyboardOneLayout from './TccKeyboardOneLayout';
import TccKeyboardTwoLayout from './TccKeyboardTwoLayout';

export default class LayoutManager {
  private static instance: LayoutManager;

  private constructor() {}

  public static getInstance(): LayoutManager {
    if (!LayoutManager.instance) {
      LayoutManager.instance = new LayoutManager();
    }
    return LayoutManager.instance;
  }

  readonly layouts: Layout[] = [
    new SambhotaKeymapOneLayout(),
    new SambhotaKeymapTwoLayout(),
    new TccKeyboardOneLayout(),
    new TccKeyboardTwoLayout(),
  ];

  getLayoutById(layoutId: string): Layout | undefined {
    return this.layouts.find((layout) => layout.layoutId === layoutId);
  }
}
