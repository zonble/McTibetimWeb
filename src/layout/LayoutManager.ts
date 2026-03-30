import DzongkhaLayout from './DzongkhaLayout';
import Layout from './Layout';
import SambhotaKeymapOneLayout from './SambhotaKeymapOneLayout';
import SambhotaKeymapTwoLayout from './SambhotaKeymapTwoLayout';
import TccKeyboardOneLayout from './TccKeyboardOneLayout';
import TccKeyboardTwoLayout from './TccKeyboardTwoLayout';
import WyleLayout from './WyleLayout';

/**
 * Singleton registry of all available keyboard layouts.
 *
 * Call {@link getInstance} to obtain the shared instance and then use
 * {@link getLayoutById} to look up a layout by its identifier.
 */
export default class LayoutManager {
  private static instance: LayoutManager;

  private constructor() {}

  /**
   * Returns the singleton LayoutManager instance, creating it on first call.
   */
  public static getInstance(): LayoutManager {
    if (!LayoutManager.instance) {
      LayoutManager.instance = new LayoutManager();
    }
    return LayoutManager.instance;
  }

  /** The complete set of layouts registered with this manager. */
  readonly layouts: Layout[] = [
    new DzongkhaLayout(),
    new SambhotaKeymapOneLayout(),
    new SambhotaKeymapTwoLayout(),
    new TccKeyboardOneLayout(),
    new TccKeyboardTwoLayout(),
    new WyleLayout(),
  ];

  /**
   * Looks up a layout by its identifier.
   * @param layoutId The identifier of the desired layout.
   * @returns The matching Layout, or `undefined` if none is found.
   */
  getLayoutById(layoutId: string): Layout | undefined {
    return this.layouts.find((layout) => layout.layoutId === layoutId);
  }
}
