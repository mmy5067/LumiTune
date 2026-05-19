import React from 'react';
import ReactDOM from 'react-dom/client';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import './styles.css';

type PlayerAction = 'previous' | 'play_pause' | 'next';
type SizeLabel = 'small' | 'medium' | 'large';

const SIZE_CONFIG = {
  small: { width: 260, height: 88 },
  medium: { width: 340, height: 150 },
  large: { width: 420, height: 170 },
} as const;

const appWindow = getCurrentWindow();

async function run(action: PlayerAction) {
  try {
    await invoke('player_action', { action });
  } catch (error) {
    console.error(error);
  }
}

function startDrag(e: React.MouseEvent<HTMLDivElement>) {
  e.preventDefault();
  appWindow.startDragging();
}

function App() {
  const [opacity, setOpacity] = React.useState(1);
  const [sizeLabel, setSizeLabel] = React.useState<SizeLabel>('medium');

  React.useEffect(() => {
    const savedOpacity = localStorage.getItem('overlayOpacity');
    const savedSizeLabel = localStorage.getItem('overlaySizeLabel') as SizeLabel | null;

    if (savedOpacity) {
      const value = parseFloat(savedOpacity);
      if ([0.6, 0.8, 1].includes(value)) {
        setOpacity(value);
      }
    }

    const initialSize = savedSizeLabel && SIZE_CONFIG[savedSizeLabel] ? savedSizeLabel : 'medium';
    setSizeLabel(initialSize);
    appWindow.setSize(SIZE_CONFIG[initialSize]).catch((error) => {
      console.error('Failed to set overlay size:', error);
    });
  }, []);

  const changeOpacity = (value: number) => {
    setOpacity(value);
    localStorage.setItem('overlayOpacity', value.toString());
  };

  const changeSize = (label: SizeLabel) => {
    setSizeLabel(label);
    localStorage.setItem('overlaySizeLabel', label);
    appWindow.setSize(SIZE_CONFIG[label]).catch((error) => {
      console.error('Failed to set overlay size:', error);
    });
  };

  return (
    <main className="overlay-shell">
      <section className="lyrics-card" data-tauri-drag-region style={{ opacity }}>
        <div className="lyrics-top drag-area" data-tauri-drag-region onMouseDown={startDrag}>
          <div data-tauri-drag-region>
            <p className="eyebrow" data-tauri-drag-region>Apple Music Lite</p>
            <h1 data-tauri-drag-region>悬浮歌词 · 简单版</h1>
          </div>
          <button
            className="ghost-btn close-button"
            aria-label="隐藏悬浮窗"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => appWindow.hide()}
          >
            ×
          </button>
        </div>

        <div className="lyric-line" data-tauri-drag-region>
          当前先显示控制器，下一步接入歌名/歌词读取
        </div>

        <div className="control-row">
          <button onClick={() => run('previous')} title="上一首">⏮</button>
          <button className="primary" onClick={() => run('play_pause')} title="播放/暂停">▶︎ / ⏸</button>
          <button onClick={() => run('next')} title="下一首">⏭</button>
          <button onClick={() => invoke('show_main')} title="显示主窗口">打开</button>
        </div>

        <div className="settings-row">
          <div className="settings-group">
            <span>透明度</span>
            <button className={opacity === 0.6 ? 'selected' : ''} onClick={() => changeOpacity(0.6)}>60%</button>
            <button className={opacity === 0.8 ? 'selected' : ''} onClick={() => changeOpacity(0.8)}>80%</button>
            <button className={opacity === 1 ? 'selected' : ''} onClick={() => changeOpacity(1)}>100%</button>
          </div>
          <div className="settings-group">
            <span>大小</span>
            <button className={sizeLabel === 'small' ? 'selected' : ''} onClick={() => changeSize('small')}>Small</button>
            <button className={sizeLabel === 'medium' ? 'selected' : ''} onClick={() => changeSize('medium')}>Medium</button>
            <button className={sizeLabel === 'large' ? 'selected' : ''} onClick={() => changeSize('large')}>Large</button>
          </div>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
