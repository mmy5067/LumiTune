# <div align="center"><img src="src-tauri/icons/LumiTune.png" alt="LumiTune logo" width="148" /></div>

# <div align="center">LumiTune</div>

<p align="center">
  A polished Windows desktop wrapper for Apple Music Web, with tray controls and a floating mini player.
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
  <a href="https://github.com/mmy5067/LumiTune/releases/latest"><strong>Download Latest Build</strong></a> ·
  <a href="https://github.com/mmy5067/LumiTune/releases">All Releases</a>
</p>

---

## Download

If you just want to install LumiTune, go straight to the latest release:

- [Download the latest Windows build](https://github.com/mmy5067/LumiTune/releases/latest)
- Open the newest release and download the `.exe` or `.msi` installer asset

If no public release is available yet, the newest test installers may still be available in GitHub Actions artifacts.

## Overview

LumiTune is a Tauri-based desktop shell for Apple Music Web.
It keeps the main experience close to the web player, then adds desktop-native quality-of-life features on top:

- a floating mini player
- system tray controls
- always-on-top overlay behavior
- now playing info and artwork
- persistent overlay preferences

The project is intentionally scoped.
It does not try to replace Apple Music, rebuild the service, or fake features that are not actually implemented yet.

## What It Does

| Feature | Status | Notes |
| --- | --- | --- |
| Apple Music Web main window | Done | Loads `https://music.apple.com` directly |
| System tray controls | Done | Show main window, show or hide overlay, previous, play or pause, next |
| Floating mini player | Done | Drag, hide, always-on-top, compact overlay workflow |
| Overlay opacity | Done | `60% / 80% / 100%`, stored locally |
| Overlay size presets | Done | `small / medium / large`, stored locally |
| Overlay position persistence | Done | Remembers position and size |
| Now playing metadata | Done | Title, artist, and album |
| Album artwork | Done | Displayed in the floating mini player |
| Lyrics | Not implemented | No lyric sync or lyric display yet |
| MusicKit | Not integrated | Not used at this stage |
| Apple Music API | Not integrated | Not used at this stage |

## Experience Goals

LumiTune is designed around a few simple principles:

- keep Apple Music Web as the source of truth
- make playback controls reachable without tab-hopping
- feel lighter and more desktop-native than a browser tab
- stay honest about current capabilities

## Tech Stack

| Layer | Technology |
| --- | --- |
| Desktop runtime | `Tauri v2` |
| Frontend | `React 19` + `TypeScript` + `Vite 7` |
| Native layer | `Rust` |
| Web runtime | `WebView2` |
| Media metadata | Windows system media session |

## Screens and Behavior

### Main Window

- loads Apple Music Web directly
- keeps sign-in and playback inside the embedded webview

### Floating Mini Player

- stays on top
- can be dragged freely
- can be hidden independently
- supports opacity and size presets
- shows title, artist, album, and artwork

### Tray Controls

- open the main window
- show or hide the overlay
- previous track
- play or pause
- next track

## Quick Start

```bash
pnpm install
pnpm tauri:dev
```

## Production Build

```bash
pnpm tauri:build
```

## Privacy

LumiTune does not run its own telemetry backend or collect Apple account credentials.

It does:

- store overlay preferences locally
- read Windows media session metadata locally for now playing info
- load Apple Music Web directly
- request artwork metadata from Apple endpoints when needed

See [PRIVACY.md](PRIVACY.md) for the full privacy note.

## Release Flow

This repository includes a GitHub Actions workflow for Windows packaging.

### Automatic Windows build

- pushes to `main`
- pull requests
- manual workflow dispatch

These runs build Windows installer artifacts and upload them as GitHub Actions artifacts.

### Draft release build

Pushing a tag like `v0.1.0` will:

- build Windows installers
- create or update a draft GitHub Release
- upload the generated `.msi` and `.exe` installer assets

See [CHANGELOG.md](CHANGELOG.md) for release notes history.

## Project Layout

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

## Current Scope

The current release is focused on:

- Windows desktop packaging
- Apple Music Web as the primary player surface
- overlay polish
- now playing information
- branding and release readiness

It is not focused on:

- lyric synchronization
- downloading tracks
- MusicKit integration
- Apple Music API integration
- offline playback tooling

## Disclaimer

LumiTune is an independent open-source project and is not affiliated with Apple Inc.

Apple Music is a trademark of Apple Inc.
This project does not bypass DRM, does not download Apple Music tracks, and only wraps Apple Music Web in a desktop-oriented experience.
