# McTibetimWeb - 小麥藏文輸入法 Web/Chrome OS/PIME 版本

![Static Badge](https://img.shields.io/badge/platform-web-green)
![ChromeOS](https://img.shields.io/badge/platform-chrome_os-yellow) ![Static Badge](https://img.shields.io/badge/platform-windows-blue) [![CI](https://github.com/openvanilla/McTibetimWeb/actions/workflows/ci.yml/badge.svg)](https://github.com/openvanilla/McTibetimWeb/actions/workflows/ci.yml) [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/openvanilla/McTibetimWeb) [![codecov](https://codecov.io/github/openvanilla/McTibetimWeb/graph/badge.svg?token=yYDNo649L7)](https://codecov.io/github/openvanilla/McTibetimWeb)

McTibetimWeb 使用 TypeScript/JavaScript 技術，打造一套跨平台的藏文輸入法。可以運行於以下平台：

- Web
- Chrome OS
- Windows (透過 PIME)

支援以下鍵盤配置

- Dzongkha
- Sambhota Keymap #1
- Sambhota Keymap #2
- TCC Keyboard 1
- TCC Keyboard 2
- Wylie

這套輸入法使用 TypeScript 開發，所以在 Windows、macOS、Linux 平台上都可以編譯。請先安裝 [Node.js](https://nodejs.org/) 以及 [Git](https://git-scm.com/)，然後在終端機中執行編譯命令。

大部分的 Node.js 版本應該都可以成功編譯這個專案，您也可以查看我們在 CI/CD 中使用的 Node.js 版本。

### Web 版

小麥藏文輸入法提供 Web 版本，適合在連接網路與實體鍵盤，但是不方便安裝輸入法的環境下使用。例如公共電腦、學校教室、iPad 平板，以及各種有鍵盤的電子紙裝置等。由於不需要額外安裝輸入法，也適合用在教學場合。網頁版本採用簡單的色彩，避免額外的漸層、動畫，以及其他可能會對閱讀造成干擾的元素，讓使用者可以專注在輸入法的使用上，而且特地配合電子紙裝置。

編譯 web 版時，請輸入：

```bash
npm install
npm run build
```

用瀏覽器打開 `output/example/index.html` 就可以使用輸入法了。

您也可以透過參考 `output/example/index.html` 裡頭的方式，將小麥藏文輸入法嵌入到您的網頁中。

### Chrome OS 版

如果要要自行編譯，請在終端機中執行：

```bash
npm install
npm run build:chromeos
```

然後在 Chrome OS 上開啟「chrome://extensions/」，並啟用「開發人員模式」，接著按下「載入已解壓縮的擴充功能」，選擇 `output/chromeos` 目錄，就可以安裝輸入法了。您可以選擇將 `output/chromeos` 傳到你的 Chrome OS 裝置上，或是直接在 Chrome OS 上使用 Linux 子系統（Crostini）編譯。

### Windows (PIME)

在 Windows 的設計中，輸入法是與系統所安裝的語言緊密綁定的。在安裝小麥藏文輸入法 PIME 之前，請先在 Windows 設定中，安裝「藏文」語言包，這樣 Windows 系統才會知道有「藏文」這個語言，進而讓 PIME 能夠使用小麥藏文輸入法。

首先您要在您的 Windows 系統上安裝 PIME，請前往 PIME 的專案頁面下載。請注意，在安裝的過程中，**務必要勾選 Node.js 支援**，否則無法使用這個輸入法— PIME 預設是不安裝 Node.js 支援的。

請在 Windows 的命令提示字元（Command Prompt）或 PowerShell 中執行：

```bash
npm install
npm run build:pime
```

然後將 `output/pime` 目錄下的所有檔案複製到 PIME 安裝目錄下的 `node\input_methods\mcfoxim` 目錄中（通常是 `C:\Program Files (x86)\PIME\node\input_methods\mcfoxim`），您會需要用到系統管理員權限。第一次使用時，請在這個目錄中，執行一次 `run_register_ime.bat`，將小麥藏文輸入法註冊到 Windows 系統中。接著重新啟動 PIME 啟動器（PIME Launcher），就可以在輸入法清單中選擇小麥藏文輸入法了。

如果在系統清單中，沒有看到小麥藏文輸入法，請進入 Windows 的系統設定中，確認「語言」設定中已經加入了小麥藏文輸入法。

## 驗證指令

開發時常用的驗證指令如下：

```bash
npm run ts-build
npm run test -- --runInBand
npm run eslint
```

如果要產生 coverage，可以另外執行：

```bash
npm run test:coverage
```
