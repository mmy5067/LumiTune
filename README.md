# LumiTune

[中文](#中文) · [English](#english)

轻量的 Apple Music Web 桌面壳，带托盘控制与悬浮迷你播放器。 A lightweight desktop wrapper for Apple Music Web with tray controls and a floating mini player.

## 中文

### 亮点

- 直接加载 Apple Music Web 主站
- 系统托盘控制，支持显示和隐藏悬浮迷你播放器
- 悬浮迷你播放器支持拖动、透明度设置、大小切换
- 悬浮窗位置和大小持久化
- 播放控制支持上一首、播放/暂停、下一首

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

- Stage 1：Apple Music Web 主窗口、登录、播放、托盘、悬浮迷你播放器、播放控制可用。
- Stage 2：悬浮窗位置记忆、透明度设置、大小设置、托盘菜单优化已完成。
- Stage 2.5：悬浮迷你播放器视觉与交互体验持续打磨中。

### 免责声明

LumiTune 是一个独立开源项目，与 Apple Inc. 无关。
Apple Music 是 Apple Inc. 的商标。
本项目不绕过 DRM，不下载 Apple Music 音轨，仅封装 Apple Music Web。

### 说明

- 本项目基于 Windows WebView2，适用于 Windows 平台。
- 主窗口继续直接加载 `https://music.apple.com`，不使用 MusicKit 或 Apple Music API。
- 当前不提供歌曲信息读取、歌词同步或 Apple Music 内容下载功能。

## English

### Highlights

- Loads Apple Music Web directly
- System tray controls with show/hide support for the floating mini player
- Draggable overlay with adjustable overlay opacity and size controls
- Overlay position and size persistence
- Playback controls for previous, play-pause, and next

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

- Stage 1: Main Apple Music Web window, login, playback, tray, floating mini player, and playback controls are working.
- Stage 2: Overlay position persistence, adjustable overlay opacity, size settings, and tray menu improvements are completed.
- Stage 2.5: The floating mini player is being polished for better visual and interaction quality.

### Disclaimer

LumiTune is an independent open-source project and is not affiliated with Apple Inc.
Apple Music is a trademark of Apple Inc.
This project does not bypass DRM, does not download Apple Music tracks, and only wraps Apple Music Web.

### Notes

- This project is built on Windows WebView2 and is intended for Windows.
- The main window continues to load `https://music.apple.com` directly, without MusicKit or Apple Music API.
- It does not provide song metadata sync, lyric sync, or Apple Music content downloading.
