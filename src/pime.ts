/**
 * @license
 * Copyright (c) 2026 and onwards The McTibetim Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 * The main entrance of the IME for ChromeOS.
 */

import child_process from 'child_process';
import fs from 'fs';
import path from 'path';
import process from 'process';

import { InputController } from './input_method';
import { InputUI } from './input_method/InputUI';
import { LayoutManager } from './layout';
import { KeyFromKeyboardEvent, VK_Keys } from './pime_keys';

interface Settings {
  selected_layout: string;
}

/**
 * A middle data structure between McTibetim input controller and PIME.
 * @interface
 */
interface UiState {
  /** The string to be committed. */
  commitString: string;
  /** The composition string. */
  compositionString: string;
  /** The cursor position in the composition string. */
  compositionCursor: number;
  /** Whether to show the candidate window. */
  showCandidates: boolean;
  /** The list of candidates. */
  candidateList: string[];
  /** The cursor position in the candidate list. */
  candidateCursor: number;
  /** The message to be shown. */
  showMessage: any;
  /** Whether to hide the message. */
  hideMessage: boolean;
}

/**  The default settings. */
const defaultSettings: Settings = {
  selected_layout: '',
};

/**
 * The commands for PIME McTibetim.
 * @enum
 */
enum PimeMcTibetimCommand {
  ModeIcon = 0,
  SwitchLanguage = 1,
  OpenHomepage = 2,
  OpenBugReport = 3,
  InputTable = 10000,
}

/** Wraps InputController and required states.  */
class PimeMcTibetim {
  /** The input controller. */
  readonly inputController: InputController;
  /** The UI state. */
  uiState: UiState = {
    commitString: '',
    compositionString: '',
    compositionCursor: 0,
    showCandidates: false,
    candidateList: [],
    candidateCursor: 0,
    showMessage: {},
    hideMessage: true,
  };
  settings: Settings = defaultSettings;
  constructor() {
    this.inputController = new InputController(this.makeUI(this));
    this.inputController.onError = () => {};
    this.loadSettings(() => {});
  }

  /** Resets the UI state before handling a key. */
  /** Resets the UI state before handling a key. */
  public resetBeforeHandlingKey(): void {
    this.uiState = {
      commitString: '',
      compositionString: '',
      compositionCursor: 0,
      showCandidates: false,
      candidateList: [],
      candidateCursor: 0,
      showMessage: {},
      hideMessage: true,
    };
  }

  /** Resets the input controller. */
  public resetController(): void {
    this.inputController.reset();
  }

  /** Applies the settings to the input controller. */
  public applySettings(): void {
    const selectedLayout = this.settings.selected_layout;
    this.inputController.selectLayoutById(selectedLayout);
  }

  readonly pimeUserDataPath: string = path.join(process.env.APPDATA || '', 'PIME');
  readonly mctibetimUserDataPath: string = path.join(this.pimeUserDataPath, 'mctibetim');
  readonly userSettingsPath: string = path.join(this.mctibetimUserDataPath, 'config.json');

  isOpened: boolean = true;
  lastRequest: any = {};
  isLastFilterKeyDownHandled: boolean = false;
  isCapsLockHold: boolean = false;

  /** Whether the button has been added to the UI. */
  alreadyAddButton: boolean = false;
  /** Whether the OS is Windows 8 or above. */
  isWindows8Above: boolean = false;

  /**
   * Load settings from disk.
   * @param callback The callback function.
   */
  /**
   * Load settings from disk.
   * @param callback The callback function.
   */
  public loadSettings(callback: () => void): void {
    fs.readFile(this.userSettingsPath, (err, data) => {
      if (err) {
        console.log('Unable to read user settings from ' + this.userSettingsPath);
        this.writeSettings();
        return;
      }
      console.log(data);
      try {
        console.log('Try to load settings');
        const newSettings = JSON.parse(data.toString());
        this.settings = Object.assign({}, defaultSettings, newSettings);
        console.log('Loaded settings: ' + JSON.stringify(this.settings, null, 2));
        this.applySettings();
      } catch {
        console.error('Failed to parse settings');
        this.writeSettings();
      }
    });
  }

  /** Write settings to disk */
  public writeSettings() {
    if (!fs.existsSync(this.mctibetimUserDataPath)) {
      console.log('User data folder not found, creating ' + this.mctibetimUserDataPath);
      console.log('Creating one');
      fs.mkdirSync(this.mctibetimUserDataPath);
    }

    console.log('Writing user settings to ' + this.userSettingsPath);
    const string = JSON.stringify(this.settings, null, 2);
    fs.writeFile(this.userSettingsPath, string, (err) => {
      if (err) {
        console.error('Failed to write settings');
        console.error(err);
      }
    });
  }

  /**
   * Creates an InputUI object.
   * @param instance The PimeMcTibetim instance.
   * @returns The InputUI object.
   */
  /**
   * Creates an InputUI object.
   * @param instance The PimeMcTibetim instance.
   * @returns The InputUI object.
   */
  public makeUI(instance: PimeMcTibetim): InputUI {
    const that: InputUI = {
      reset: () => {
        const commitString = instance.uiState.commitString;
        instance.uiState = {
          commitString: commitString,
          compositionString: '',
          compositionCursor: 0,
          showCandidates: false,
          candidateList: [],
          candidateCursor: 0,
          showMessage: {},
          hideMessage: true,
        };
      },
      commitString(text: string) {
        // console.log('commitString: ' + text);
        const joinedCommitString = instance.uiState.compositionString + text;
        // console.log('joinedCommitString: ' + joinedCommitString);
        instance.uiState = {
          commitString: joinedCommitString,
          compositionString: '',
          compositionCursor: 0,
          showCandidates: false,
          candidateList: [],
          candidateCursor: 0,
          showMessage: {},
          hideMessage: true,
        };
      },
      update(stateString: string) {
        const state = JSON.parse(stateString);
        const composingBuffer = state.composingBuffer;
        let candidates = state.candidates;
        if (candidates === undefined) {
          candidates = [];
        }

        let selectedIndex = 0;
        let index = 0;
        const candidateList = [];
        for (let candidate of candidates) {
          if (candidate.selected) {
            selectedIndex = index;
          }
          const joined = candidate.candidate.displayText + ' - ' + candidate.candidate.description;
          candidateList.push(joined);
          index++;
        }

        // Note: McTibetim's composing buffer are composed by segments so
        // it allows an input method framework to draw underlines
        let compositionString = '';
        for (let item of composingBuffer) {
          compositionString += item.text;
        }

        const tooltip = state.tooltip;
        let showMessage = {};
        let hideMessage = true;
        if (tooltip && !candidateList.length) {
          candidateList.push(tooltip);
          selectedIndex = -1;
        }
        const commitString = instance.uiState.commitString;
        instance.uiState = {
          commitString: commitString,
          compositionString: compositionString,
          compositionCursor: state.cursorIndex,
          showCandidates: candidateList.length > 0,
          candidateList: candidateList,
          candidateCursor: selectedIndex,
          showMessage: showMessage,
          hideMessage: hideMessage,
        };
      },
    };
    return that;
  }

  /**
   * Creates the button UI response.
   * @returns The button UI response.
   */
  /**
   * Creates the button UI response.
   * @returns The button UI response.
   */
  public buttonUiResponse(): any {
    const windowsModeIcon = this.isOpened ? 'eng.ico' : 'close.ico';
    const windowsModeIconPath = path.join(__dirname, 'icons', windowsModeIcon);
    const settingsIconPath = path.join(__dirname, 'icons', 'config.ico');
    const object: any = {};
    const changeButton: any[] = [];
    if (this.isWindows8Above) {
      changeButton.push({ icon: windowsModeIconPath, id: 'windows-mode-icon' });
    }
    changeButton.push({ icon: windowsModeIconPath, id: 'switch-lang' });
    object.changeButton = changeButton;

    if (!this.alreadyAddButton) {
      const addButton: any[] = [];
      if (this.isWindows8Above) {
        addButton.push({
          id: 'windows-mode-icon',
          icon: windowsModeIconPath,
          commandId: PimeMcTibetimCommand.ModeIcon,
          tooltip: 'Toggle Input Mode',
        });
      }

      addButton.push({
        id: 'switch-lang',
        icon: windowsModeIconPath,
        commandId: PimeMcTibetimCommand.SwitchLanguage,
        tooltip: 'Toggle Input Mode',
      });
      addButton.push({
        id: 'settings',
        icon: settingsIconPath,
        type: 'menu',
        tooltip: 'Settings',
      });
      object.addButton = addButton;
      this.alreadyAddButton = true;
    }
    return object;
  }

  /**
   * Creates the custom UI response.
   * @returns The custom UI response.
   */
  /**
   * Creates the custom UI response.
   * @returns The custom UI response.
   */
  public customUiResponse(): any {
    let fontSize = 24;

    return {
      openKeyboard: this.isOpened,
      customizeUI: {
        candPerRow: 1,
        candFontSize: fontSize,
        candFontName: 'Microsoft Himalaya',
        candUseCursor: true,
      },
      setSelKeys: '123456789',
      keyboardOpen: this.isOpened,
    };
  }

  /**
   * Handles a command.
   * @param id The command ID.
   */
  public handleCommand(id: PimeMcTibetimCommand): void {
    if (id >= PimeMcTibetimCommand.InputTable) {
      const inputMethodIndex = id - PimeMcTibetimCommand.InputTable;
      const manager = LayoutManager.getInstance();
      const layouts = manager.layouts;
      const layoutId = layouts[inputMethodIndex].layoutId;
      this.settings.selected_layout = layoutId;
      this.inputController.selectLayoutById(layoutId);
      this.writeSettings();
      return;
    }

    switch (id) {
      case PimeMcTibetimCommand.ModeIcon:
        break;
      case PimeMcTibetimCommand.SwitchLanguage:
        break;
      case PimeMcTibetimCommand.OpenHomepage:
        {
          const url = 'https://mctibetim.openvanilla.org/';
          const command = `start ${url}`;
          console.log('Run ' + command);
          child_process.exec(command);
        }
        break;
      case PimeMcTibetimCommand.OpenBugReport:
        {
          const url = 'https://github.com/openvanilla/McTibetimWeb/issues';
          const command = `start ${url}`;
          console.log('Run ' + command);
          child_process.exec(command);
        }
        break;
      default:
        break;
    }
  }
}

const pimeMcTibetim = new PimeMcTibetim();

try {
  if (!fs.existsSync(pimeMcTibetim.userSettingsPath)) {
    fs.writeFileSync(pimeMcTibetim.userSettingsPath, JSON.stringify(defaultSettings));
  }

  fs.watch(pimeMcTibetim.userSettingsPath, (event, filename) => {
    if (filename) {
      pimeMcTibetim.loadSettings(() => {});
    }
  });
} catch (e) {
  console.error(e);
}

module.exports = {
  textReducer(_: any, preState: any) {
    // Note: textReducer and response are the pattern of NIME. Actually, PIME
    // only care about the response. Since we let pimeMcTibetim to do
    // everything, we just left textReducer as an empty implementation to let
    // NIME to call it.
    return preState;
  },

  response(request: any, _: any) {
    const lastRequest = pimeMcTibetim.lastRequest;
    pimeMcTibetim.lastRequest = request;
    const responseTemplate = {
      return: false,
      success: true,
      seqNum: request.seqNum,
    };
    if (request.method === 'init') {
      const { isWindows8Above } = request;
      pimeMcTibetim.isWindows8Above = isWindows8Above;
      const customUi = pimeMcTibetim.customUiResponse();
      const response = Object.assign({}, responseTemplate, customUi, {
        removeButton: ['windows-mode-icon', 'switch-lang', 'settings'],
      });
      return response;
    }
    if (request.method === 'close') {
      const response = Object.assign({}, responseTemplate, {
        removeButton: ['windows-mode-icon', 'switch-lang', 'settings'],
      });
      pimeMcTibetim.alreadyAddButton = false;
      return response;
    }

    if (request.method === 'onActivate') {
      const customUi = pimeMcTibetim.customUiResponse();
      const buttonUi = pimeMcTibetim.buttonUiResponse();
      const response = Object.assign({}, responseTemplate, customUi, buttonUi);
      return response;
    }

    if (request.method === 'onDeactivate') {
      const response = Object.assign({}, responseTemplate, {
        removeButton: ['windows-mode-icon', 'switch-lang', 'settings'],
      });
      pimeMcTibetim.alreadyAddButton = false;
      return response;
    }

    if (request.method === 'onPreservedKey') {
      console.log(request);
      const response = Object.assign({}, responseTemplate);
      return response;
    }

    if (request.method === 'filterKeyUp') {
      let handled = pimeMcTibetim.isLastFilterKeyDownHandled;
      if (
        lastRequest &&
        lastRequest.method === 'filterKeyUp' &&
        lastRequest.keyCode === request.keyCode
      ) {
        // NOTE: Some app, like MS Word, may send repeated key up event.
        // We should ignore such events.
        const response = Object.assign({}, responseTemplate, {
          return: handled,
        });
        return response;
      }
      // Single Shift to toggle alphabet mode.
      const response = Object.assign({}, responseTemplate, { return: handled });
      return response;
    }

    if (request.method === 'filterKeyDown') {
      if (
        lastRequest &&
        lastRequest.method === 'filterKeyDown' &&
        lastRequest.keyCode === request.keyCode
      ) {
        // NOTE: Some app, like MS Word, may send repeated key down event.
        // We should ignore such events.
        let response = Object.assign({}, responseTemplate, {
          return: true,
        });
        return response;
      }

      const { keyCode, charCode, keyStates } = request;

      if ((keyStates[VK_Keys.VK_CAPITAL] & 1) !== 0) {
        // Ignores caps lock.
        pimeMcTibetim.resetBeforeHandlingKey();
        pimeMcTibetim.resetController();
        pimeMcTibetim.isCapsLockHold = true;
        pimeMcTibetim.isLastFilterKeyDownHandled = false;
        const response = Object.assign({}, responseTemplate, {
          return: false,
        });
        return response;
      } else {
        pimeMcTibetim.isCapsLockHold = false;
      }

      const key = KeyFromKeyboardEvent(keyCode, keyStates, String.fromCharCode(charCode), charCode);
      pimeMcTibetim.resetBeforeHandlingKey();

      if (key.ctrlPressed) {
        pimeMcTibetim.resetController();
        const response = Object.assign({}, responseTemplate, {
          return: false,
        });
        return response;
      }

      const handled = pimeMcTibetim.inputController.handle(key);
      pimeMcTibetim.isLastFilterKeyDownHandled = handled;
      const response = Object.assign({}, responseTemplate, {
        return: handled,
      });
      this.isKeyDownHandled = handled;
      return response;
    }

    if (request.method === 'onKeyDown') {
      // Ignore caps lock.
      if (pimeMcTibetim.isCapsLockHold) {
        pimeMcTibetim.resetController();
        const response = Object.assign({}, responseTemplate, {
          return: false,
        });
        return response;
      }

      if (
        lastRequest &&
        lastRequest.method === 'onKeyDown' &&
        lastRequest.keyCode === request.keyCode
      ) {
        // NOTE: Some app, like MS Word, may send repeated key up event.
        // We should ignore such events.
        const response = Object.assign({}, responseTemplate, {
          return: true,
        });
        return response;
      }
      const uiState: any = pimeMcTibetim.uiState;
      let response = Object.assign({}, responseTemplate, uiState, {
        return: pimeMcTibetim.isLastFilterKeyDownHandled,
      });
      return response;
    }

    if (request.method === 'onKeyboardStatusChanged') {
      const { opened } = request;
      pimeMcTibetim.isOpened = opened;
      pimeMcTibetim.resetController();
      const customUi = pimeMcTibetim.customUiResponse();
      const buttonUi = pimeMcTibetim.buttonUiResponse();
      const response = Object.assign({}, responseTemplate, customUi, buttonUi);
      return response;
    }

    if (request.method === 'onCompositionTerminated') {
      pimeMcTibetim.resetController();
      const uiState = pimeMcTibetim.uiState;
      const customUi = pimeMcTibetim.customUiResponse();
      const buttonUi = pimeMcTibetim.buttonUiResponse();
      const response = Object.assign({}, responseTemplate, uiState, customUi, buttonUi);
      pimeMcTibetim.resetBeforeHandlingKey();
      return response;
    }

    if (request.method === 'onCommand') {
      const { id } = request;
      pimeMcTibetim.handleCommand(id);
      const uiState = pimeMcTibetim.uiState;
      const customUi = pimeMcTibetim.customUiResponse();
      const buttonUi = pimeMcTibetim.buttonUiResponse();
      const response = Object.assign({}, responseTemplate, uiState, customUi, buttonUi);
      return response;
    }

    if (request.method === 'onMenu') {
      let menu: any[] = [
        {
          text: 'Homepage',
          id: PimeMcTibetimCommand.OpenHomepage,
        },
        {
          text: 'Issue Tracker',
          id: PimeMcTibetimCommand.OpenBugReport,
        },
        {},
      ];
      const manager = LayoutManager.getInstance();
      const layouts = manager.layouts;

      for (let i = 0; i < layouts.length; i++) {
        const layout = layouts[i];
        const tableId = layout.layoutId;
        const text = layout.layoutName;
        menu.push({
          text: text,
          checked: tableId === pimeMcTibetim.settings.selected_layout,
          id: PimeMcTibetimCommand.InputTable + i,
        });
      }

      menu.push({});
      menu.push({ text: 'McTibetim 0.1.0' });
      const response = Object.assign({}, responseTemplate, { return: menu });
      return response;
    }

    return responseTemplate;
  },
};
