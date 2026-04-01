(function () {
  const { InputController, LayoutManager } = window.mctibetim;

  let composingBuffer = '';

  function onChangeTable(value) {
    window.localStorage.setItem('selectedLayout', value);
    controller.selectLayoutById(value);
    controller.reset();
    screenKeyboard.loadLayout();
  }

  const ui = {
    insertTextAtSelection(text) {
      const textArea = document.getElementById('text_area');
      const { selectionStart, selectionEnd, value } = textArea;
      const head = value.substring(0, selectionStart);
      const tail = value.substring(selectionEnd);
      textArea.value = head + text + tail;
      const cursorPosition = head.length + text.length;
      textArea.setSelectionRange(cursorPosition, cursorPosition);
    },

    removeTextBeforeSelection() {
      const textArea = document.getElementById('text_area');
      const { selectionStart, selectionEnd, value } = textArea;
      const head = value.substring(0, selectionStart);
      const tail = value.substring(selectionEnd);
      textArea.value = head.substring(0, head.length - 1) + tail;
      const cursorPosition = Math.max(0, head.length - 1);
      textArea.setSelectionRange(cursorPosition, cursorPosition);
    },

    reset() {
      document.getElementById('function').style.visibility = 'hidden';
      document.getElementById('candidates').style.visibility = 'hidden';
      document.getElementById('composing_buffer').innerHTML = "<span class='cursor'>|</span>";
      document.getElementById('candidates').innerHTML = '';
      document.getElementById('tooltip').style.visibility = 'hidden';
      composingBuffer = '';
    },

    commitString(string) {
      this.insertTextAtSelection(string);
      composingBuffer = '';
    },

    backspace() {
      this.removeTextBeforeSelection();
      composingBuffer = '';
    },

    update(string) {
      const state = JSON.parse(string);

      // Render composing buffer
      let renderText = '<p>';
      let plainText = '';
      let i = 0;
      for (const item of state.composingBuffer) {
        if (item.style === 'highlighted') {
          renderText += '<span class="marking">';
        }
        for (const c of item.text) {
          if (i === state.cursorIndex) {
            renderText += "<span class='cursor'>|</span>";
          }
          renderText += c;
          i++;
        }
        plainText += item.text;
        if (item.style === 'highlighted') {
          renderText += '</span>';
        }
      }
      if (i === state.cursorIndex) {
        renderText += "<span class='cursor'>|</span>";
      }
      renderText += '</p>';
      document.getElementById('composing_buffer').innerHTML = renderText;
      composingBuffer = plainText;

      // Render candidates
      const candidates = state.candidates ?? [];
      if (candidates.length) {
        let s = '<table>';
        for (const candidate of candidates) {
          s += candidate.selected ? '<tr class="highlighted_candidate">' : '<tr>';
          s += `<td class="keycap">${candidate.keyCap}</td>`;
          s += `<td class="candidate">${candidate.candidate.displayText}</td>`;
          s += `<td class="description">${candidate.candidate.description}</td>`;
          s += '</tr>';
        }
        s += '<tr class="page_info"><td colspan="2">Tab 補完單詞</td><td colspan="1"></td></tr>';
        s += '</table>';
        document.getElementById('candidates').innerHTML = s;
      }
      document.getElementById('candidates').style.visibility = candidates.length
        ? 'visible'
        : 'hidden';

      // Render tooltip
      const tooltipDiv = document.getElementById('tooltip');
      const tooltip = state.tooltip;
      if (tooltip && tooltip.length) {
        tooltipDiv.textContent = tooltip;
        tooltipDiv.style.visibility = 'visible';
      } else {
        tooltipDiv.style.visibility = 'hidden';
      }

      // Position function div near caret
      const textArea = document.getElementById('text_area');
      const functionDiv = document.getElementById('function');
      const editArea = document.getElementById('edit_area');
      const rect = textArea.getBoundingClientRect();
      const editAreaRect = editArea.getBoundingClientRect();
      const textAreaStyle = window.getComputedStyle(textArea);
      const lineHeight = parseInt(textAreaStyle.lineHeight) || 20;

      const mirror = document.createElement('div');
      const mirrorStyleProps = [
        'fontFamily',
        'fontSize',
        'fontWeight',
        'letterSpacing',
        'overflowWrap',
        'whiteSpace',
        'lineHeight',
        'padding',
        'border',
        'boxSizing',
        'width',
      ];
      for (const prop of mirrorStyleProps) {
        mirror.style[prop] = textAreaStyle[prop];
      }
      mirror.style.position = 'absolute';
      mirror.style.visibility = 'hidden';
      mirror.style.whiteSpace = 'pre-wrap';
      mirror.style.overflowWrap = 'break-word';

      mirror.textContent = textArea.value.substring(0, textArea.selectionStart);
      const caretSpan = document.createElement('span');
      caretSpan.textContent = '|';
      mirror.appendChild(caretSpan);
      document.body.appendChild(mirror);

      const caretRect = caretSpan.getBoundingClientRect();
      const mirrorRect = mirror.getBoundingClientRect();
      const relativeTop = caretRect.top - mirrorRect.top;
      const relativeLeft = caretRect.left - mirrorRect.left;
      document.body.removeChild(mirror);

      functionDiv.style.position = 'absolute';
      functionDiv.style.top = `${
        rect.top - editAreaRect.top + relativeTop + lineHeight - textArea.scrollTop
      }px`;
      functionDiv.style.left = `${
        rect.left - editAreaRect.left + relativeLeft - textArea.scrollLeft
      }px`;
      functionDiv.style.visibility = 'visible';
    },
  };

  // Initialize layout selector
  const manager = LayoutManager.getInstance();
  const layouts = manager.layouts;
  const selectedLayout = window.localStorage.getItem('selectedLayout') ?? layouts[0].layoutId;

  const select = document.getElementById('input-table-select');
  select.innerHTML = '';
  for (const layout of layouts) {
    const option = document.createElement('option');
    option.value = layout.layoutId;
    option.textContent = layout.layoutName;
    option.selected = selectedLayout === layout.layoutId;
    select.appendChild(option);
  }
  select.value = selectedLayout;

  const controller = new InputController(ui);
  controller.selectLayoutById(selectedLayout);

  select.addEventListener('change', (event) => {
    onChangeTable(event.target.value);
    document.getElementById('text_area').focus();
  });

  // Textarea event handling
  const textarea = document.getElementById('text_area');
  let isComposing = false;

  textarea.addEventListener('compositionstart', () => {
    isComposing = true;
    const warning = document.getElementById('ime_warning');
    if (warning) {
      warning.style.display = 'block';
    }
  });

  textarea.addEventListener('compositionend', () => {
    isComposing = false;
    const warning = document.getElementById('ime_warning');
    if (warning) {
      warning.style.display = 'none';
    }
  });

  textarea.addEventListener('keydown', (event) => {
    if (isComposing || event.isComposing || event.keyCode === 229) {
      return;
    }
    if (event.metaKey) {
      controller.reset();
      return;
    }
    if (controller.handleKeyboardEvent(event)) {
      event.preventDefault();
    }
  });

  textarea.addEventListener('blur', () => {
    controller.reset();
    ui.reset();
  });

  // Screen keyboard
  const screenKeyboard = (() => {
    const api = {
      isLock: false,
      isShift: false,
      isCtrl: false,
      isAlt: false,
    };

    const Keyboard = window.SimpleKeyboard.default;
    const keyboard = new Keyboard({
      onKeyPress: handleKeyPress,
    });

    const defaultLayout = [
      '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
      '{tab} q w e r t y u i o p [ ] \\',
      "{lock} a s d f g h j k l ; ' {enter}",
      '{shift} z x c v b n m , . / {shift}',
      '{ctrl} {space} {alt}',
    ];
    const shiftLayout = [
      '~ ! @ # $ % ^ & * ( ) _ + {bksp}',
      '{tab} Q W E R T Y U I O P { } |',
      '{lock} A S D F G H J K L : " {enter}',
      '{shift} Z X C V B N M < > ? {shift}',
      '{ctrl} {space} {alt}',
    ];

    const modifierKeys = {
      '{lock}': 'isLock',
      '{shift}': 'isShift',
      '{ctrl}': 'isCtrl',
      '{alt}': 'isAlt',
    };

    function handleModifierButton(button) {
      const key = modifierKeys[button];
      if (!key) return false;
      api[key] = !api[key];
      api.loadLayout();
      return true;
    }

    function handleFallbackButton(button) {
      if (button === '{enter}') {
        ui.commitString('\n');
      } else if (button === '{space}') {
        ui.commitString(' ');
      } else if (button === '{bksp}') {
        ui.backspace();
      }
    }

    function handleKeyPress(button) {
      if (handleModifierButton(button)) return;

      const handled = controller.handleSimpleKeyboardEvent(
        button,
        api.isShift || api.isLock,
        api.isCtrl,
        api.isAlt,
      );
      document.getElementById('text_area').focus();

      if (api.isShift) {
        api.isShift = false;
        api.loadLayout();
      }
      if (api.isCtrl) {
        api.isCtrl = false;
        api.loadLayout();
      }
      if (api.isAlt) {
        api.isAlt = false;
        api.loadLayout();
      }

      if (!handled) handleFallbackButton(button);
    }

    function buildKeyboardDisplay() {
      const names = controller.getCurrentKeyNames(api.isShift || api.isLock, api.isCtrl, api.isAlt);
      const display = {
        '{tab}': '⇥',
        '{lock}': 'Lock',
        '{shift}': '⇧ Shift',
        '{bksp}': '⌫',
        '{enter}': '↵',
        '{space}': '་',
        '{ctrl}': '⌃',
        '{alt}': 'AltGr',
      };
      for (const [key, value] of names.entries()) {
        if (display[key] === undefined) display[key] = value;
      }
      return display;
    }

    function buildButtonTheme() {
      const buttonTheme = [];
      if (api.isLock) buttonTheme.push({ class: 'hg-button-active', buttons: '{lock}' });
      if (api.isShift) buttonTheme.push({ class: 'hg-button-active', buttons: '{shift}' });
      if (api.isCtrl) buttonTheme.push({ class: 'hg-button-active', buttons: '{ctrl}' });
      if (api.isAlt) buttonTheme.push({ class: 'hg-button-active', buttons: '{alt}' });
      return buttonTheme;
    }

    api.loadLayout = () => {
      keyboard.setOptions({
        display: buildKeyboardDisplay(),
        layout: {
          default: api.isShift || api.isLock ? shiftLayout : defaultLayout,
        },
        buttonTheme: buildButtonTheme(),
      });
    };

    return api;
  })();

  screenKeyboard.loadLayout();
})();

document.getElementById('loading').innerText = 'Complete!';
setTimeout(function () {
  document.getElementById('loading').style.display = 'none';
}, 2000);

document.getElementById('text_area').focus();
