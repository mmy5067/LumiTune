import React from 'react';
import ReactDOM from 'react-dom/client';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import './styles.css';

type PlayerAction = 'previous' | 'play_pause' | 'next';
type SizeLabel = 'small' | 'medium' | 'large';

const SIZE_CONFIG = {
  small: { width: 260, height: 136 },
  medium: { width: 340, height: 182 },
  large: { width: 420, height: 234 },
} as const;

const SETTINGS_EXTRA_HEIGHT = {
  small: 120,
  medium: 132,
  large: 116,
} as const;

const OPACITY_OPTIONS = [0.6, 0.8, 1] as const;
const SIZE_OPTIONS: Array<{ label: SizeLabel; text: string }> = [
  { label: 'small', text: '小' },
  { label: 'medium', text: '中' },
  { label: 'large', text: '大' },
];

const appWindow = getCurrentWindow();

function toLogicalSize(label: SizeLabel, settingsOpen = false) {
  const { width, height } = SIZE_CONFIG[label];
  return new LogicalSize(width, height + (settingsOpen ? SETTINGS_EXTRA_HEIGHT[label] : 0));
}

async function run(action: PlayerAction) {
  try {
    await invoke('player_action', { action });
  } catch (error) {
    console.error(error);
  }
}

function startDrag(e: React.MouseEvent<HTMLElement>) {
  e.preventDefault();
  appWindow.startDragging();
}

function App() {
  const [opacity, setOpacity] = React.useState(1);
  const [sizeLabel, setSizeLabel] = React.useState<SizeLabel>('medium');
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  React.useEffect(() => {
    const savedOpacity = localStorage.getItem('overlayOpacity');
    const savedSizeLabel = localStorage.getItem('overlaySizeLabel') as SizeLabel | null;

    if (savedOpacity) {
      const value = Number.parseFloat(savedOpacity);
      if (OPACITY_OPTIONS.includes(value as (typeof OPACITY_OPTIONS)[number])) {
        setOpacity(value);
      }
    }

    const initialSize = savedSizeLabel && SIZE_CONFIG[savedSizeLabel] ? savedSizeLabel : 'medium';
    setSizeLabel(initialSize);
  }, []);

  React.useEffect(() => {
    appWindow.setSize(toLogicalSize(sizeLabel, settingsOpen)).catch((error) => {
      console.error('Failed to set overlay size:', error);
    });
  }, [sizeLabel, settingsOpen]);

  const changeOpacity = (value: number) => {
    setOpacity(value);
    localStorage.setItem('overlayOpacity', value.toString());
  };

  const changeSize = (label: SizeLabel) => {
    setSizeLabel(label);
    localStorage.setItem('overlaySizeLabel', label);
  };

  const isSmall = sizeLabel === 'small';
  const isLarge = sizeLabel === 'large';
  const hideStatusBlock = settingsOpen && isSmall;
  const hideSupportingCopy = isSmall || (settingsOpen && !isLarge);

  return (
    <main className={`overlay-shell size-${sizeLabel}`}>
      <section
        className={`mini-player-card size-${sizeLabel} ${settingsOpen ? 'settings-open' : ''}`}
        style={{ '--overlay-bg-opacity': opacity } as React.CSSProperties}
      >
        <div className="card-glow" aria-hidden="true" />

        <header className="player-header drag-area" data-tauri-drag-region onMouseDown={startDrag}>
          <div className="title-block" data-tauri-drag-region>
            <p className="eyebrow" data-tauri-drag-region>LumiTune</p>
            <h1 data-tauri-drag-region>Apple Music Web Mini Player</h1>
          </div>

          <div className="header-actions">
            <button
              className={`icon-button subtle ${settingsOpen ? 'selected' : ''}`}
              aria-label={settingsOpen ? '收起设置' : '打开设置'}
              title={settingsOpen ? '收起设置' : '打开设置'}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setSettingsOpen((open) => !open)}
            >
              ⚙
            </button>
            <button
              className="icon-button subtle"
              aria-label="隐藏悬浮窗"
              title="隐藏悬浮窗"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => appWindow.hide()}
            >
              ×
            </button>
          </div>
        </header>

        {!hideStatusBlock ? (
          <div className="status-copy" data-tauri-drag-region onMouseDown={startDrag}>
            <p className="empty-state" data-tauri-drag-region>
              在 Apple Music 中开始播放音乐
            </p>
            {!hideSupportingCopy ? (
              <p className="supporting-copy" data-tauri-drag-region>
                {isLarge ? '保持主窗口播放，悬浮控制始终在手边。' : '轻巧控制播放，不打断当前工作。'}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="control-row">
          <button className="symbol-button" onClick={() => run('previous')} title="上一首" aria-label="上一首">
            ⏮
          </button>
          <button
            className="primary symbol-button"
            onClick={() => run('play_pause')}
            title="播放/暂停"
            aria-label="播放/暂停"
          >
            ⏯
          </button>
          <button className="symbol-button" onClick={() => run('next')} title="下一首" aria-label="下一首">
            ⏭
          </button>
          {!isSmall ? (
            <button
              className="symbol-button"
              onClick={() => invoke('show_main')}
              title="显示主窗口"
              aria-label="显示主窗口"
            >
              ◰
            </button>
          ) : (
            <button
              className="icon-button compact-open symbol-button"
              onClick={() => invoke('show_main')}
              title="显示主窗口"
              aria-label="显示主窗口"
            >
              ◰
            </button>
          )}
        </div>

        {settingsOpen ? (
          <div className={`settings-panel ${isLarge ? 'expanded' : ''}`}>
            <div className="settings-group">
              <span>透明度</span>
              <div className="chip-row">
                {OPACITY_OPTIONS.map((value) => (
                  <button
                    key={value}
                    className={opacity === value ? 'selected' : ''}
                    onClick={() => changeOpacity(value)}
                  >
                    {Math.round(value * 100)}%
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-group">
              <span>大小</span>
              <div className="chip-row">
                {SIZE_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    className={sizeLabel === option.label ? 'selected' : ''}
                    onClick={() => changeSize(option.label)}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
