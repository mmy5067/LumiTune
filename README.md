# <div align="center"><img src="src-tauri/icons/LumiTune.png" alt="LumiTune logo" width="140" /></div>

# <div align="center">LumiTune</div>

<p align="center">
  A polished desktop wrapper for Apple Music Web with tray controls and a floating mini player.
</p>

<p align="center">
  <a href="#-中文">中文</a> ·
  <a href="#-english">English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-v2-24C8DB?style=for-the-badge&logo=tauri&logoColor=white" alt="Tauri v2" />
  <img src="https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 7" />
  <img src="https://img.shields.io/badge/Rust-Stable-000000?style=for-the-badge&logo=rust&logoColor=white" alt="Rust" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows-0078D4?style=flat-square&logo=windows&logoColor=white" alt="Windows" />
  <img src="https://img.shields.io/badge/WebView2-Required-2F6FED?style=flat-square" alt="WebView2" />
  <img src="https://img.shields.io/badge/Status-Active%20Development-F45B8D?style=flat-square" alt="Active Development" />
</p>

---

## 中文

### 简介

LumiTune 是一个基于 `Tauri v2 + React + Rust` 构建的 Windows 桌面应用。
它直接加载 Apple Music Web，并提供一个更轻、更顺手的悬浮迷你播放器体验。

当前重点是把 Apple Music Web 的桌面使用体验做得更自然，而不是重做一套音乐平台。

### 亮点

- 直接加载 `https://music.apple.com`
- 系统托盘控制：显示主窗口、显示或隐藏悬浮窗、播放控制
- 悬浮迷你播放器：可拖动、可隐藏、始终置顶
- 悬浮窗透明度设置：`60% / 80% / 100%`
- 悬浮窗大小设置：`small / medium / large`
- 悬浮窗位置与尺寸持久化
- 悬浮窗显示当前播放信息：歌名、艺人、专辑
- 悬浮窗支持专辑封面显示

### 技术栈

| Layer | Stack |
| --- | --- |
| Desktop shell | `Tauri v2` |
| Frontend | `React 19` + `Vite 7` + `TypeScript` |
| Native backend | `Rust` |
| Embedded runtime | `WebView2` |
| Media info | Windows system media session |

### 当前能力

| 模块 | 状态 | 说明 |
| --- | --- | --- |
| 主窗口 | 已完成 | 直接承载 Apple Music Web |
| 托盘控制 | 已完成 | 主窗口、悬浮窗、播放控制 |
| 悬浮迷你播放器 | 已完成 | 拖动、隐藏、透明度、大小切换 |
| 正在播放信息 | 已完成 | 歌名、艺人、专辑已接入 |
| 专辑封面 | 已完成 | 悬浮窗左侧展示封面 |
| 歌词同步 | 未实现 | 当前不提供歌词功能 |
| MusicKit / Apple Music API | 未接入 | 当前不依赖官方 API |

### 快速开始

```bash
pnpm install
pnpm tauri:dev
```

### 打包

```bash
pnpm tauri:build
```

### 项目结构

```text
LumiTune/
├─ src/                 # React overlay frontend
├─ src-tauri/           # Tauri + Rust backend
│  ├─ icons/            # App icons and logo
│  └─ src/main.rs       # Window, tray, media session integration
├─ index.html
└─ README.md
```

### 开发说明

- 本项目当前面向 `Windows`。
- 主窗口继续直接加载 Apple Music Web。
- 当前不提供歌词同步、内容下载或 DRM 绕过能力。
- 悬浮窗的视觉与交互仍在持续打磨中。

### 免责声明

LumiTune 是一个独立的开源项目，与 Apple Inc. 没有隶属关系。

Apple Music 是 Apple Inc. 的商标。
本项目不会绕过 DRM，不下载 Apple Music 音频内容，仅对 Apple Music Web 做桌面封装与体验增强。

---

## English

### Overview

LumiTune is a Windows desktop wrapper built with `Tauri v2 + React + Rust`.
It loads Apple Music Web directly and adds a cleaner desktop workflow with tray controls and a floating mini player.

The goal is to improve the Apple Music Web desktop experience, not to replace the music service itself.

### Highlights

- Loads `https://music.apple.com` directly
- System tray controls for main window, overlay visibility, and playback
- Floating mini player with drag, hide, and always-on-top behavior
- Adjustable overlay opacity: `60% / 80% / 100%`
- Adjustable overlay size: `small / medium / large`
- Persistent overlay position and size
- Now playing info in the overlay: title, artist, album
- Album artwork shown in the mini player

### Tech Stack

| Layer | Stack |
| --- | --- |
| Desktop shell | `Tauri v2` |
| Frontend | `React 19` + `Vite 7` + `TypeScript` |
| Native backend | `Rust` |
| Embedded runtime | `WebView2` |
| Media info | Windows system media session |

### Current Scope

| Module | Status | Notes |
| --- | --- | --- |
| Main window | Done | Hosts Apple Music Web directly |
| Tray controls | Done | Main window, overlay, playback actions |
| Floating mini player | Done | Drag, hide, opacity, size switching |
| Now playing info | Done | Title, artist, and album are wired in |
| Album artwork | Done | Artwork appears on the left side of the overlay |
| Lyrics sync | Not implemented | No lyrics feature at this stage |
| MusicKit / Apple Music API | Not integrated | The app does not rely on official Apple APIs yet |

### Quick Start

```bash
pnpm install
pnpm tauri:dev
```

### Build

```bash
pnpm tauri:build
```

### Project Layout

```text
LumiTune/
├─ src/                 # React overlay frontend
├─ src-tauri/           # Tauri + Rust backend
│  ├─ icons/            # App icons and logo
│  └─ src/main.rs       # Window, tray, and media session integration
├─ index.html
└─ README.md
```

### Notes

- This project currently targets `Windows`.
- The main window continues to load Apple Music Web directly.
- There is no lyric sync, content downloading, or DRM bypassing.
- The floating mini player is still being refined visually and interaction-wise.

### Disclaimer

LumiTune is an independent open-source project and is not affiliated with Apple Inc.

Apple Music is a trademark of Apple Inc.
This project does not bypass DRM, does not download Apple Music tracks, and only wraps Apple Music Web with a desktop-oriented experience.
