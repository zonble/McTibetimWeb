(function () {
  const { InputController, LayoutManager } = window.mctibetim;

  function resetUI() {
    document.getElementById('function').style.visibility = 'hidden';
    document.getElementById('candidates').style.visibility = 'hidden';
    let renderText = '';
    renderText += "<span class='cursor'>|</span>";
    document.getElementById('composing_buffer').innerHTML = renderText;
    document.getElementById('candidates').innerHTML = '';
    composingBuffer = '';
  }

  function onChangeTable(value) {
    window.localStorage.setItem('selectedLayout', value);
    controller.selectLayoutById(value);
    controller.reset();
  }

  let ui = (function () {
    let that = {};
    that.reset = resetUI;

    that.commitString = function (string) {
      var selectionStart = document.getElementById('text_area').selectionStart;
      var selectionEnd = document.getElementById('text_area').selectionEnd;
      var text = document.getElementById('text_area').value;
      var head = text.substring(0, selectionStart);
      var tail = text.substring(selectionEnd);
      document.getElementById('text_area').value = head + string + tail;
      let start = selectionStart + string.length;
      document.getElementById('text_area').setSelectionRange(start, start);
      composingBuffer = '';
    };

    that.update = function (string) {
      let state = JSON.parse(string);
      {
        let buffer = state.composingBuffer;
        let renderText = '<p>';
        let plainText = '';
        let i = 0;
        for (let item of buffer) {
          if (item.style === 'highlighted') {
            renderText += '<span class="marking">';
          }
          let text = item.text;
          plainText += text;
          for (let c of text) {
            if (i === state.cursorIndex) {
              renderText += "<span class='cursor'>|</span>";
            }
            renderText += c;
            i++;
          }
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
      }

      let candidates = state.candidates;
      if (candidates === undefined) {
        candidates = [];
      }

      if (candidates.length) {
        let s = '<table>';
        for (let candidate of state.candidates) {
          if (candidate.selected) {
            s += '<tr class="highlighted_candidate"> ';
          } else {
            s += '<tr>';
          }
          s += '<td class="keycap">';
          s += candidate.keyCap;
          s += '</td>';
          s += '<td class="candidate">';
          s += candidate.candidate.displayText;
          s += '</td>';
          s += '<td class="description">';
          s += candidate.candidate.description;
          s += '</td>';
          s += '</tr>';
        }
        s += '<tr class="page_info"> ';
        s += '<td colspan="2">';
        s += 'Tab 補完單詞';
        s += '</td>';
        s += '<td colspan="1">';
        // s += '' + (state.candidatePageIndex + 1) + ' / ' + state.candidatePageCount;
        s += '</td>';
        s += '</tr>';
        s += '</table>';

        document.getElementById('candidates').innerHTML = s;
      }

      document.getElementById('candidates').style.visibility = candidates.length
        ? 'visible'
        : 'hidden';

      document.getElementById('function').style.visibility = 'visible';
      const textArea = document.getElementById('text_area');
      const functionDiv = document.getElementById('function');
      const editArea = document.getElementById('edit_area');
      const rect = textArea.getBoundingClientRect();
      const editAreaRect = editArea.getBoundingClientRect();
      const textAreaStyle = window.getComputedStyle(textArea);
      const lineHeight = parseInt(textAreaStyle.lineHeight) || 20;

      // Create a temporary mirror div to measure actual caret position
      const mirror = document.createElement('div');
      const styles = [
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
      styles.forEach((style) => {
        mirror.style[style] = textAreaStyle[style];
      });
      mirror.style.position = 'absolute';
      mirror.style.visibility = 'hidden';
      mirror.style.whiteSpace = 'pre-wrap';
      mirror.style.overflowWrap = 'break-word';

      const caretPos = textArea.selectionStart;
      const textBeforeCaret = textArea.value.substring(0, caretPos);
      mirror.textContent = textBeforeCaret;

      const caretSpan = document.createElement('span');
      caretSpan.textContent = '|';
      mirror.appendChild(caretSpan);

      document.body.appendChild(mirror);

      const caretRect = caretSpan.getBoundingClientRect();
      const mirrorRect = mirror.getBoundingClientRect();

      const relativeTop = caretRect.top - mirrorRect.top;
      const relativeLeft = caretRect.left - mirrorRect.left;

      document.body.removeChild(mirror);

      // Account for textarea scroll position
      const scrollTop = textArea.scrollTop;
      const scrollLeft = textArea.scrollLeft;

      functionDiv.style.position = 'absolute';
      functionDiv.style.top =
        rect.top - editAreaRect.top + relativeTop + lineHeight - scrollTop + 'px';
      functionDiv.style.left = rect.left - editAreaRect.left + relativeLeft - scrollLeft + 'px';
    };

    return that;
  })();

  const controller = new InputController(ui);
  const manager = LayoutManager.getInstance();
  const layouts = manager.layouts;
  let selectedLayout = window.localStorage.getItem('selectedLayout');
  console.log('Selected layout from localStorage:', selectedLayout);
  if (selectedLayout === undefined) {
    selectedLayout = layouts[0].layoutId;
  }
  controller.selectLayoutById(selectedLayout);
  console.log('Selected layout', selectedLayout);

  const select = document.getElementById('input-table-select');
  select.innerHTML = '';
  for (const layout of layouts) {
    const option = document.createElement('option');
    option.value = layout.layoutId;
    option.textContent = layout.layoutName;
    if (selectedLayout === layout.layoutId) {
      option.selected = true;
    }
    select.appendChild(option);
  }

  select.value = selectedLayout;

  select.addEventListener('change', (event) => {
    onChangeTable(event.target.value);
    document.getElementById('text_area').focus();
  });

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
    // console.log(event);

    if (isComposing || event.isComposing || event.keyCode === 229) {
      return;
    }

    if (event.metaKey || event.altKey || event.ctrlKey) {
      controller.reset();
      return;
    }

    let accepted = controller.handleKeyboardEvent(event);
    if (accepted) {
      event.preventDefault();
    }
  });
  textarea.addEventListener('blur', () => {
    controller.reset();
    resetUI();
  });

  const screenKeyboard = (() => {
    const api = {
      isLock: false,
      isShift: false,
      isCtrl: false,
    };

    const Keyboard = window.SimpleKeyboard.default;
    const keyboard = new Keyboard({
      onKeyPress: (button) => handleKeyPress(button),
    });

    const defaultLayout = [
      '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
      '{tab} q w e r t y u i o p [ ] \\',
      "{lock} a s d f g h j k l ; ' {enter}",
      '{shift} z x c v b n m , . / {shift}',
      '{ctrl} {space}',
    ];
    const shiftLayout = [
      '~ ! @ # $ % ^ & * ( ) _ + {bksp}',
      '{tab} Q W E R T Y U I O P { } |',
      '{lock} A S D F G H J K L : " {enter}',
      '{shift} Z X C V B N M < > ? {shift}',
      '{ctrl} {space}',
    ];

    function handleModifierButton(button) {
      if (button === '{lock}') {
        api.isLock = !api.isLock;
      } else if (button === '{shift}') {
        api.isShift = !api.isShift;
      } else if (button === '{ctrl}') {
        api.isCtrl = !api.isCtrl;
      } else {
        return false;
      }
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
      if (handleModifierButton(button)) {
        return;
      }

      const handled = inputMethod.controller.handleSimpleKeyboardEvent(
        button,
        api.isShift || api.isLock,
        api.isCtrl,
      );
      focusTextArea();

      if (api.isShift) {
        api.isShift = false;
        api.loadLayout();
      }
      if (api.isCtrl) {
        api.isCtrl = false;
        api.loadLayout();
      }
      if (!handled) {
        handleFallbackButton(button);
      }
    }

    function buildKeyboardDisplay() {
      const names = controller.getCurrentKeyNames(api.isShift || api.isLock, api.isCtrl, false);
      console.log('Key names for current layout:', names);
      const display = {
        '{tab}': '⇥',
        '{lock}': 'Lock',
        '{shift}': '⇧ Shift',
        '{bksp}': '⌫',
        '{enter}': '↵',
        '{space}': 'Space',
        '{ctrl}': '⌃',
      };
      for (const [key, value] of names.entries()) {
        console.log(key);
        if (display[key] === undefined) {
          display[key] = value;
        }
      }
      return display;
    }

    function buildButtonTheme() {
      const buttonTheme = [];
      if (api.isLock) {
        buttonTheme.push({ class: 'hg-button-active', buttons: '{lock}' });
      }
      if (api.isShift) {
        buttonTheme.push({ class: 'hg-button-active', buttons: '{shift}' });
      }
      if (api.isCtrl) {
        buttonTheme.push({ class: 'hg-button-active', buttons: '{ctrl}' });
      }
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

document.getElementById('loading').innerText = '載入完畢！';
setTimeout(function () {
  document.getElementById('loading').style.display = 'none';
}, 2000);

document.getElementById('text_area').focus();
