# LumiTune

[中文](#中文) · [English](#english)

轻量 Apple Music Web 桌面壳，带托盘控制与悬浮小窗。
A lightweight desktop wrapper for Apple Music Web with tray controls and a floating mini player.

## 中文

### 亮点

- ✅ 直接加载 Apple Music Web 主站
- ✅ 系统托盘控制，支持显示/隐藏悬浮窗
- ✅ 悬浮窗可拖动、可设置透明度、可切换大小
- ✅ 悬浮窗位置和大小持久化
- ✅ 播放控制支持上一首 / 播放暂停 / 下一首

### 技术栈

- Tauri v2
- React
- Vite
- Rust
- WebView2

### 快速开始

```bash
pnpm install
pnpm tauri:dev
```

### 打包

```bash
pnpm tauri:build
```

### 当前阶段

- Stage 1：Apple Music Web 主窗口、登录、播放、托盘、悬浮窗、播放控制可用。
- Stage 2：悬浮窗位置记忆、透明度和大小设置、托盘菜单优化已完成。

### 免责声明

LumiTune 是一个独立开源项目，与 Apple Inc. 无关。
Apple Music 是 Apple Inc. 的商标。
本项目不绕过 DRM，不下载 Apple Music 音轨，仅封装 Apple Music Web。

### 说明

- 本项目基于 Windows WebView2，适用于 Windows 平台。
- 主窗口继续直接加载 `https://music.apple.com`，不使用 MusicKit 或 Apple Music API。
- 不会做歌词解析、下载或解密 Apple Music 内容。

## English

### Highlights

- ✅ Loads Apple Music Web directly
- ✅ System tray controls with show/hide overlay support
- ✅ Draggable overlay with opacity and size controls
- ✅ Overlay position and size persistence
- ✅ Playback controls support previous / play-pause / next

### Tech Stack

- Tauri v2
- React
- Vite
- Rust
- WebView2

### Quick Start

```bash
pnpm install
pnpm tauri:dev
```

### Build

```bash
pnpm tauri:build
```

### Current Stage

- Stage 1: Main Apple Music Web window, login, playback, tray, overlay, and playback controls are working.
- Stage 2: Overlay position persistence, opacity and size settings, and tray menu improvements are completed.

### Disclaimer

LumiTune is an independent open-source project and is not affiliated with Apple Inc.
Apple Music is a trademark of Apple Inc.
This project does not bypass DRM, does not download Apple Music tracks, and only wraps Apple Music Web.

### Notes

- This project is built on Windows WebView2 and is intended for Windows.
- The main window continues to load `https://music.apple.com` directly, without MusicKit or Apple Music API.
- It does not parse lyrics, download, or decrypt Apple Music content.
