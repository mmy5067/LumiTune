# <div align="center"><img src="src-tauri/icons/LumiTune.png" alt="LumiTune logo" width="148" /></div>

# <div align="center">LumiTune</div>

<p align="center">
  为 Apple Music Web 打造的精致 Windows 桌面封装，提供托盘控制与悬浮迷你播放器。<br />
  A polished Windows desktop wrapper for Apple Music Web, with tray controls and a floating mini player.
</p>

<p align="center">
  <a href="#中文">中文</a> ·
  <a href="#english">EN</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-v2-24C8DB?style=for-the-badge&logo=tauri&logoColor=white" alt="Tauri v2" />
  <img src="https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 7" />
  <img src="https://img.shields.io/badge/Rust-Stable-000000?style=for-the-badge&logo=rust&logoColor=white" alt="Rust" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows-0078D4?style=flat-square&logo=windows&logoColor=white" alt="Windows only" />
  <img src="https://img.shields.io/badge/WebView2-Required-2F6FED?style=flat-square" alt="WebView2 required" />
  <img src="https://img.shields.io/badge/Status-Active%20Development-F45B8D?style=flat-square" alt="Active development" />
</p>

<p align="center">
  <a href="https://github.com/mmy5067/LumiTune/releases/latest"><strong>下载最新版本 / Download Latest Build</strong></a> ·
  <a href="https://github.com/mmy5067/LumiTune/releases">Releases</a>
</p>

---

## 中文

### 下载

如果你只是想安装 LumiTune，直接前往：

- [下载最新版本](https://github.com/mmy5067/LumiTune/releases/latest)
- 在最新 Release 中下载 `.exe` 或 `.msi` 安装包

如果当前还没有正式 Release，也可以先到 GitHub Actions 中下载构建产物。

### 项目简介

LumiTune 是一个基于 Tauri 的 Windows 桌面应用，用来承载 Apple Music Web，并补上一些更适合桌面使用的体验层：

- 系统托盘控制
- 悬浮迷你播放器
- 始终置顶的轻量播放控制
- 正在播放信息与专辑封面
- 悬浮窗位置、大小、透明度持久化

它的目标不是重做 Apple Music，而是在尽量保留原始 Web 播放体验的前提下，把桌面端交互做得更顺手。

### 当前功能

| 功能 | 状态 | 说明 |
| --- | --- | --- |
| Apple Music Web 主窗口 | 已完成 | 直接加载 `https://music.apple.com` |
| 托盘控制 | 已完成 | 显示主窗口、显示或隐藏悬浮窗、上一首、播放或暂停、下一首 |
| 悬浮迷你播放器 | 已完成 | 拖动、隐藏、置顶、小窗工作流 |
| 透明度设置 | 已完成 | `60% / 80% / 100%`，本地保存 |
| 大小预设 | 已完成 | `small / medium / large`，本地保存 |
| 悬浮窗位置记忆 | 已完成 | 记住位置和尺寸 |
| 正在播放信息 | 已完成 | 歌名、艺人、专辑 |
| 专辑封面 | 已完成 | 在悬浮窗中显示 |
| 歌词 | 未实现 | 当前没有歌词同步或歌词显示 |
| MusicKit | 未接入 | 当前阶段不使用 |
| Apple Music API | 未接入 | 当前阶段不使用 |

### 体验目标

LumiTune 目前主要围绕这几件事打磨：

- 让 Apple Music Web 保持原本播放能力
- 让播放控制在工作时更容易触达
- 比浏览器标签页更轻、更像桌面应用
- 对功能边界保持诚实，不写超前描述

### 技术栈

| 层级 | 技术 |
| --- | --- |
| 桌面运行时 | `Tauri v2` |
| 前端 | `React 19` + `TypeScript` + `Vite 7` |
| 原生层 | `Rust` |
| Web 运行环境 | `WebView2` |
| 媒体元数据来源 | Windows system media session |

### 使用与构建

开发运行：

```bash
pnpm install
pnpm tauri:dev
```

生产构建：

```bash
pnpm tauri:build
```

### 隐私说明

LumiTune 不运行自己的遥测后端，也不会收集你的 Apple 账号密码。

它会：

- 在本地保存悬浮窗偏好设置
- 在本地读取 Windows 媒体会话元数据，用于显示正在播放信息
- 直接加载 Apple Music Web
- 在需要时请求 Apple 的专辑封面相关元数据

详见 [PRIVACY.md](PRIVACY.md)。

### 发布方式

仓库已经配置好 Windows 自动构建与 Release workflow：

- 推送到 `main` 会自动构建 Windows 安装包 artifacts
- 推送形如 `v0.1.0` 的 tag 会自动创建或更新 draft GitHub Release

详见 [CHANGELOG.md](CHANGELOG.md)。

### 项目结构

```text
LumiTune/
|-- src/                 React overlay frontend
|-- src-tauri/           Tauri + Rust backend
|   |-- icons/           App icons and logo
|   `-- src/main.rs      Window, tray, and media integration
|-- .github/workflows/   Windows build and release automation
|-- CHANGELOG.md
|-- PRIVACY.md
`-- README.md
```

### 当前范围

当前版本重点在：

- Windows 桌面打包
- Apple Music Web 主窗口
- 悬浮播放器体验打磨
- 正在播放信息与专辑封面
- 品牌与发布流程完善

当前不包含：

- 歌词同步
- 音频下载
- MusicKit 集成
- Apple Music API 集成
- 离线播放能力

### 免责声明

LumiTune 是一个独立开源项目，与 Apple Inc. 没有隶属关系。

Apple Music 是 Apple Inc. 的商标。
本项目不会绕过 DRM，不下载 Apple Music 音频内容，仅对 Apple Music Web 做桌面封装与体验增强。

---

## English

### Download

If you just want to install LumiTune, go straight to:

- [Download the latest build](https://github.com/mmy5067/LumiTune/releases/latest)
- Download the `.exe` or `.msi` installer from the latest Release

If no public release is available yet, the newest test build may still be available in GitHub Actions artifacts.

### Overview

LumiTune is a Tauri-based Windows desktop shell for Apple Music Web.
It keeps the main experience close to the web player, then adds desktop-native quality-of-life features on top:

- system tray controls
- a floating mini player
- always-on-top playback controls
- now playing metadata and album artwork
- persistent overlay preferences

The goal is not to rebuild Apple Music.
The goal is to keep the original web playback experience while making the desktop workflow feel lighter and more natural.

### Current Features

| Feature | Status | Notes |
| --- | --- | --- |
| Apple Music Web main window | Done | Loads `https://music.apple.com` directly |
| Tray controls | Done | Show main window, show or hide overlay, previous, play or pause, next |
| Floating mini player | Done | Drag, hide, always-on-top, compact overlay workflow |
| Overlay opacity | Done | `60% / 80% / 100%`, stored locally |
| Overlay size presets | Done | `small / medium / large`, stored locally |
| Overlay position persistence | Done | Remembers position and size |
| Now playing metadata | Done | Title, artist, and album |
| Album artwork | Done | Displayed in the floating mini player |
| Lyrics | Not implemented | No lyric sync or lyric display yet |
| MusicKit | Not integrated | Not used at this stage |
| Apple Music API | Not integrated | Not used at this stage |

### Design Goals

LumiTune is currently shaped around a few simple principles:

- keep Apple Music Web as the source of truth
- make playback controls reachable while you work
- feel lighter and more desktop-native than a browser tab
- stay honest about current feature boundaries

### Tech Stack

| Layer | Technology |
| --- | --- |
| Desktop runtime | `Tauri v2` |
| Frontend | `React 19` + `TypeScript` + `Vite 7` |
| Native layer | `Rust` |
| Web runtime | `WebView2` |
| Media metadata | Windows system media session |

### Run and Build

Development:

```bash
pnpm install
pnpm tauri:dev
```

Production build:

```bash
pnpm tauri:build
```

### Privacy

LumiTune does not run its own telemetry backend and does not collect your Apple account credentials.

It does:

- store overlay preferences locally
- read Windows media session metadata locally for now playing info
- load Apple Music Web directly
- request Apple artwork metadata when needed

See [PRIVACY.md](PRIVACY.md) for full details.

### Release Flow

The repository already includes Windows build and release automation:

- pushes to `main` build Windows installer artifacts
- tags like `v0.1.0` create or update a draft GitHub Release

See [CHANGELOG.md](CHANGELOG.md) for release history.

### Project Layout

```text
LumiTune/
|-- src/                 React overlay frontend
|-- src-tauri/           Tauri + Rust backend
|   |-- icons/           App icons and logo
|   `-- src/main.rs      Window, tray, and media integration
|-- .github/workflows/   Windows build and release automation
|-- CHANGELOG.md
|-- PRIVACY.md
`-- README.md
```

### Current Scope

This release currently focuses on:

- Windows desktop packaging
- Apple Music Web as the main player surface
- floating mini player polish
- now playing metadata and artwork
- branding and release readiness

It does not currently include:

- lyric synchronization
- track downloading
- MusicKit integration
- Apple Music API integration
- offline playback tooling

### Disclaimer

LumiTune is an independent open-source project and is not affiliated with Apple Inc.

Apple Music is a trademark of Apple Inc.
This project does not bypass DRM, does not download Apple Music tracks, and only wraps Apple Music Web in a desktop-oriented experience.
