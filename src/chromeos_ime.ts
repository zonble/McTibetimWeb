/**
 * @license
 * Copyright (c) 2026 and onwards The McTibetim Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 * The main entrance of the IME for ChromeOS.
 */

import { InputController } from './input_method';
import { Key, KeyName } from './input_method/Key';

/**
 * The main class for the mctibetim IME on ChromeOS.
 */
class ChromeMcTibetim {
  // The ID of the current input engine.
  engineID: string | undefined = undefined;

  // The current input context.
  context: chrome.input.ime.InputContext | undefined = undefined;

  inputController: InputController;

  constructor() {
    // chrome.i18n.getAcceptLanguages((langs) => {});
    this.inputController = new InputController(this.makeUI());
    this.inputController.onError = () => {};
  }

  /**
   * Updates the menu items.
   */
  updateMenu() {
    if (this.engineID === undefined) return;
    let menus: chrome.input.ime.MenuItem[] = [
      {
        id: 'mctibetim-help',
        label: chrome.i18n.getMessage('menuHelp'),
        style: 'check' as const,
      },
      {
        id: 'mctibetim-homepage',
        label: chrome.i18n.getMessage('homepage'),
        style: 'check' as const,
      },
    ];

    chrome.input.ime.setMenuItems({ engineID: this.engineID, items: menus });
  }

  /**
   * Tries to open a URL in a new tab, or focuses the tab if it's already open.
   * @param url The URL to open.
   */
  tryOpen(url: string) {
    chrome.windows.getCurrent({}, (win) => {
      if (win === undefined) {
        chrome.windows.create({ url: url, focused: true });
        return;
      }

      chrome.tabs.query({ url: url }).then((tabs) => {
        if (tabs.length === 0) {
          chrome.tabs.create({ active: true, url: url });
          return;
        }

        const tabId = tabs[0].id;
        if (tabId !== undefined) {
          chrome.tabs.update(tabId, { selected: true });
        }
      });
    });
  }

  deferredResetTimeout?: NodeJS.Timeout | null = null;

  // Sometimes onBlur is called unexpectedly. It might be called and then a
  // onFocus comes suddenly when a user is typing contents continuously. Such
  // behaviour causes the input to be interrupted.
  //
  // To prevent the issue, we ignore such event if an onFocus comes very quickly.
  /**
   * Resets the input controller after a short delay.
   * This is to prevent the input from being interrupted by unexpected onBlur events.
   */
  deferredReset() {
    if (this.deferredResetTimeout !== null) {
      clearTimeout(this.deferredResetTimeout);
      this.deferredResetTimeout = null;
    }

    this.deferredResetTimeout = setTimeout(() => {
      this.inputController.reset();
      this.deferredResetTimeout = null;
    }, 5000);
  }

  /**
   * Creates the UI object for the input controller.
   * @returns The UI object.
   */
  makeUI() {
    return {
      reset: () => {
        if (this.context === undefined) return;
        if (this.engineID === undefined) return;
        try {
          // The context might be destroyed by the time we reset it, so we use a
          // try/catch block here.
          chrome.input.ime.clearComposition({
            contextID: this.context.contextID,
          });
          chrome.input.ime.setCandidateWindowProperties({
            engineID: this.engineID,
            properties: {
              auxiliaryText: '',
              auxiliaryTextVisible: false,
              visible: false,
            },
          });
        } catch (e) {}
      },

      commitString: (text: string) => {
        if (this.context === undefined) return;
        chrome.input.ime.commitText({
          contextID: this.context.contextID,
          text: text,
        });
      },

      update: (stateString: string) => {
        if (this.context === undefined) return;
        if (this.engineID === undefined) return;

        const state = JSON.parse(stateString);
        const buffer = state.composingBuffer;
        const candidates = state.candidates;
        const tooltip = state.tooltip;

        const segments = [];
        let text = '';
        let selectionStart: number | undefined = undefined;
        let selectionEnd: number | undefined = undefined;
        let index = 0;
        for (let item of buffer) {
          text += item.text;
          if (item.style === 'highlighted') {
            selectionStart = index;
            selectionEnd = index + item.text.length;
            const segment = {
              start: index,
              end: index + item.text.length,
              style: 'doubleUnderline' as const,
            };
            segments.push(segment);
          } else {
            const segment = {
              start: index,
              end: index + item.text.length,
              style: 'underline' as const,
            };
            segments.push(segment);
          }
          index += item.text.length;
        }

        // This shall not happen, but we make sure the cursor index to be not
        // larger than the text length.
        let localCursorIndex = state.cursorIndex;
        if (localCursorIndex > text.length) {
          localCursorIndex = text.length;
        }

        chrome.input.ime.setComposition({
          contextID: this.context.contextID,
          cursor: localCursorIndex,
          segments: segments,
          text: text,
          selectionStart: selectionStart,
          selectionEnd: selectionEnd,
        });

        if (candidates.length) {
          const chromeCandidates = [];
          let index = 0;
          let selectedIndex = 0;
          for (let candidate of state.candidates) {
            if (candidate.selected) {
              selectedIndex = index;
            }
            const item = {
              candidate: candidate.candidate.displayText,
              annotation: candidate.candidate.description,
              id: index++,
              label: candidate.keyCap,
            };
            chromeCandidates.push(item);
          }

          const candidatePageCount = state.candidatePageCount;
          const candidatePageIndex = state.candidatePageIndex + 1;
          const auxiliaryText = candidatePageIndex + '/' + candidatePageCount;

          chrome.input.ime.setCandidateWindowProperties({
            engineID: this.engineID,
            properties: {
              auxiliaryText: auxiliaryText,
              auxiliaryTextVisible: true,
              visible: true,
              cursorVisible: true,
              vertical: true,
              pageSize: candidates.length,
              windowPosition: 'composition' as const,
            },
          });

          chrome.input.ime.setCandidates({
            contextID: this.context.contextID,
            candidates: chromeCandidates,
          });

          chrome.input.ime.setCursorPosition({
            contextID: this.context.contextID,
            candidateID: selectedIndex,
          });
        } else if (tooltip.length) {
          chrome.input.ime.setCandidateWindowProperties({
            engineID: this.engineID,
            properties: {
              auxiliaryText: tooltip,
              auxiliaryTextVisible: true,
              visible: true,
              cursorVisible: false,
              // Use "cursor" positioning for tooltips so that the candidate
              // window appears near the text cursor..
              windowPosition: 'cursor',
              pageSize: 1, // pageSize has to be at least 1 otherwise ChromeOS crashes.
            },
          });
        } else {
          chrome.input.ime.setCandidateWindowProperties({
            engineID: this.engineID,
            properties: {
              auxiliaryText: '',
              auxiliaryTextVisible: false,
              visible: false,
            },
          });
        }
      },
    };
  }
}

const chromeMcTibetim = new ChromeMcTibetim();

chrome.input?.ime.onActivate.addListener((engineID) => {
  const keyboardLayout = engineID.split('.').pop();
  if (keyboardLayout) {
    chromeMcTibetim.inputController.selectLayoutById(keyboardLayout);
  }

  chromeMcTibetim.engineID = engineID;
  chromeMcTibetim.updateMenu();
});

// Called when the current text input are loses the focus.
chrome.input?.ime.onBlur.addListener((context) => {
  chromeMcTibetim.deferredReset();
});

chrome.input?.ime.onReset.addListener((context) => {
  chromeMcTibetim.deferredReset();
});

// Called when the user switch to another input method.
chrome.input?.ime.onDeactivated.addListener((context) => {
  if (chromeMcTibetim.deferredResetTimeout !== null) {
    clearTimeout(chromeMcTibetim.deferredResetTimeout);
  }
  chromeMcTibetim.context = undefined;
  chromeMcTibetim.inputController.reset();
  chromeMcTibetim.deferredResetTimeout = null;
});

// Called when the current text input is focused. We reload the settings this
// time.
chrome.input?.ime.onFocus.addListener((context) => {
  chromeMcTibetim.context = context;
  if (chromeMcTibetim.deferredResetTimeout !== null) {
    clearTimeout(chromeMcTibetim.deferredResetTimeout);
  }
});

// The main keyboard event handler.
chrome.input?.ime.onKeyEvent.addListener((engineID, keyData) => {
  chromeMcTibetim.engineID = engineID;
  if (keyData.type !== 'keydown') {
    return false;
  }

  // We always prevent handling Ctrl + Space so we can switch input methods.
  if (keyData.ctrlKey) {
    chromeMcTibetim.inputController.reset();
    return false;
  }

  if (keyData.altKey || keyData.altgrKey || keyData.capsLock) {
    chromeMcTibetim.inputController.reset();
    return false;
  }

  const keyEvent = KeyFromKeyboardEvent(keyData);
  return chromeMcTibetim.inputController.handle(keyEvent);
});

chrome.input.ime.onCandidateClicked.addListener((engineID, candidateID, button) => {});

chrome.input?.ime.onMenuItemActivated.addListener((engineID, name) => {
  switch (name) {
    // case 'mctibetim-options':
    //   chromeMcTibetim.tryOpen(chrome.runtime.getURL('options.html'));
    //   break;
    case 'mctibetim-help':
      chromeMcTibetim.tryOpen('https://github.com/openvanilla/McTibetimWeb/wiki');
      break;
    case 'mctibetim-homepage':
      chromeMcTibetim.tryOpen('https://openvanilla.org/');
      break;
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // console.log(request);
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'keepAlive') {
    lifeline = port;
    setTimeout(keepAliveForced, 295e3); // 5 minutes minus 5 seconds
    port.onDisconnect.addListener(keepAliveForced);
  }
});

// A workaround to prevent Chrome to kill the service worker.
let lifeline: chrome.runtime.Port | undefined = undefined;

function keepAliveForced() {
  lifeline?.disconnect();
  lifeline = undefined;
  keepAlive();
}

async function keepAlive() {
  if (lifeline) return;
  for (const tab of await chrome.tabs.query({ url: '*://*/*' })) {
    try {
      const args = {
        target: { tabId: tab.id ?? 9 },
        func: () => chrome.runtime.connect({ name: 'keepAlive' }),
      };
      await chrome.scripting.executeScript(args);
      chrome.tabs.onUpdated.removeListener(retryOnTabUpdate);
      return;
    } catch (e) {}
  }
  chrome.tabs.onUpdated.addListener(retryOnTabUpdate);
}

async function retryOnTabUpdate(
  tabId: number,
  info: chrome.tabs.OnUpdatedInfo,
  tab: chrome.tabs.Tab,
) {
  if (info.url && /^(file|https?):/.test(info.url)) {
    keepAlive();
  }
}

keepAlive();

/**
 * Converts a keyboard event to a Key object.
 * @param event The keyboard event.
 * @returns The Key object.
 */
function KeyFromKeyboardEvent(event: chrome.input.ime.KeyboardEvent) {
  let keyName = KeyName.UNKNOWN;
  switch (event.code) {
    case 'ArrowLeft':
      keyName = KeyName.LEFT;
      break;
    case 'ArrowRight':
      keyName = KeyName.RIGHT;
      break;
    case 'ArrowUp':
      keyName = KeyName.UP;
      break;
    case 'ArrowDown':
      keyName = KeyName.DOWN;
      break;
    case 'Home':
      keyName = KeyName.HOME;
      break;
    case 'End':
      keyName = KeyName.END;
      break;
    case 'Backspace':
      keyName = KeyName.BACKSPACE;
      break;
    case 'Delete':
      keyName = KeyName.DELETE;
      break;
    case 'Enter':
      keyName = KeyName.RETURN;
      break;
    case 'Escape':
      keyName = KeyName.ESC;
      break;
    case 'Space':
      keyName = KeyName.SPACE;
      break;
    case 'Tab':
      keyName = KeyName.TAB;
      break;
    case 'PageUp':
      keyName = KeyName.PAGE_UP;
      break;
    case 'PageDown':
      keyName = KeyName.PAGE_DOWN;
      break;
    default:
      keyName = KeyName.ASCII;
      break;
  }
  const key = new Key(event.key, keyName, event.shiftKey, event.ctrlKey);
  return key;
}
