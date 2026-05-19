import React from 'react';
import ReactDOM from 'react-dom/client';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import './styles.css';

type PlayerAction = 'previous' | 'play_pause' | 'next';
type SizeLabel = 'small' | 'medium' | 'large';
type PlaybackStatus = 'playing' | 'paused' | 'stopped' | 'unknown';

type NowPlayingInfo = {
  title?: string | null;
  artist?: string | null;
  album?: string | null;
  playbackStatus?: PlaybackStatus | null;
  source?: string | null;
  artworkDataUrl?: string | null;
};

type ItunesSong = {
  artistName?: string;
  artworkUrl100?: string;
  collectionName?: string;
  trackName?: string;
};

const SIZE_CONFIG = {
  small: { width: 260, height: 130 },
  medium: { width: 340, height: 140 },
  large: { width: 420, height: 160 },
} as const;

const SETTINGS_EXTRA_HEIGHT = {
  small: 122,
  medium: 126,
  large: 122,
} as const;

const OPACITY_OPTIONS = [0.6, 0.8, 1] as const;
const SIZE_OPTIONS: Array<{ label: SizeLabel; text: string }> = [
  { label: 'small', text: '小' },
  { label: 'medium', text: '中' },
  { label: 'large', text: '大' },
];

const EMPTY_TITLE = 'LumiTune';
const EMPTY_SUBTITLE = 'Apple Music Web Mini Player';
const EMPTY_STATUS = '在 Apple Music 中开始播放音乐';

const appWindow = getCurrentWindow();
const artworkCache = new Map<string, string | null>();

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

function startDrag(event: React.MouseEvent<HTMLElement>) {
  event.preventDefault();
  void appWindow.startDragging();
}

function normalizeText(value?: string | null) {
  return (value ?? '').trim();
}

function normalizeKey(value?: string | null) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function upscaleArtwork(url: string) {
  return url.replace(/\/\d+x\d+bb\./, '/240x240bb.');
}

async function fetchArtwork(info: NowPlayingInfo, signal: AbortSignal) {
  const title = normalizeText(info.title);
  const artist = normalizeText(info.artist);
  const album = normalizeText(info.album);

  if (info.artworkDataUrl) {
    return info.artworkDataUrl;
  }

  if (!title && !artist) {
    return null;
  }

  const cacheKey = [title, artist, album].join(' | ');
  if (artworkCache.has(cacheKey)) {
    return artworkCache.get(cacheKey) ?? null;
  }

  const query = encodeURIComponent([artist, title, album].filter(Boolean).join(' '));
  const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=5`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Artwork search failed: ${response.status}`);
  }

  const payload = (await response.json()) as { results?: ItunesSong[] };
  const results = payload.results ?? [];
  const normalizedTitle = normalizeKey(title);
  const normalizedArtist = normalizeKey(artist);
  const normalizedAlbum = normalizeKey(album);

  const bestMatch =
    results.find((item) => {
      const itemTitle = normalizeKey(item.trackName);
      const itemArtist = normalizeKey(item.artistName);
      const itemAlbum = normalizeKey(item.collectionName);
      const titleMatches = normalizedTitle ? itemTitle.includes(normalizedTitle) : true;
      const artistMatches = normalizedArtist ? itemArtist.includes(normalizedArtist) : true;
      const albumMatches = normalizedAlbum ? itemAlbum.includes(normalizedAlbum) : true;
      return titleMatches && artistMatches && albumMatches;
    }) ?? results[0];

  const artworkUrl = bestMatch?.artworkUrl100 ? upscaleArtwork(bestMatch.artworkUrl100) : null;
  artworkCache.set(cacheKey, artworkUrl);
  return artworkUrl;
}

function ScrollingLine({
  className,
  text,
  title,
}: {
  className: string;
  text: string;
  title?: string;
}) {
  return (
    <div className={`marquee ${className}`} title={title ?? text}>
      <div className="marquee-track">
        <span className="marquee-copy">{text}</span>
        <span className="marquee-gap" aria-hidden="true">
          {' '}
          {'   '}·{'   '}
        </span>
        <span className="marquee-copy" aria-hidden="true">
          {text}
        </span>
      </div>
    </div>
  );
}

function App() {
  const [opacity, setOpacity] = React.useState(1);
  const [sizeLabel, setSizeLabel] = React.useState<SizeLabel>('medium');
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [nowPlaying, setNowPlaying] = React.useState<NowPlayingInfo>({});
  const [artworkUrl, setArtworkUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const savedOpacity = localStorage.getItem('overlayOpacity');
    const savedSizeLabel = localStorage.getItem('overlaySizeLabel') as SizeLabel | null;

    if (savedOpacity) {
      const value = Number.parseFloat(savedOpacity);
      if (OPACITY_OPTIONS.includes(value as (typeof OPACITY_OPTIONS)[number])) {
        setOpacity(value);
      }
    }

    setSizeLabel(savedSizeLabel && SIZE_CONFIG[savedSizeLabel] ? savedSizeLabel : 'medium');
  }, []);

  React.useEffect(() => {
    void appWindow.setSize(toLogicalSize(sizeLabel, settingsOpen)).catch((error) => {
      console.error('Failed to set overlay size:', error);
    });
  }, [settingsOpen, sizeLabel]);

  React.useEffect(() => {
    let cancelled = false;

    const syncNowPlaying = async () => {
      try {
        const info = await invoke<NowPlayingInfo>('get_now_playing');
        if (!cancelled) {
          setNowPlaying(info);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to get now playing info:', error);
          setNowPlaying({});
        }
      }
    };

    void syncNowPlaying();
    const timer = window.setInterval(() => {
      void syncNowPlaying();
    }, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();

    void fetchArtwork(nowPlaying, controller.signal)
      .then((url) => setArtworkUrl(url))
      .catch((error) => {
        if ((error as Error).name !== 'AbortError') {
          console.error('Failed to resolve artwork:', error);
          setArtworkUrl(null);
        }
      });

    return () => {
      controller.abort();
    };
  }, [nowPlaying.album, nowPlaying.artist, nowPlaying.artworkDataUrl, nowPlaying.title]);

  const changeOpacity = (value: number) => {
    setOpacity(value);
    localStorage.setItem('overlayOpacity', value.toString());
  };

  const changeSize = (label: SizeLabel) => {
    setSizeLabel(label);
    localStorage.setItem('overlaySizeLabel', label);
  };

  const title = normalizeText(nowPlaying.title) || EMPTY_TITLE;
  const artist = normalizeText(nowPlaying.artist);
  const album = normalizeText(nowPlaying.album);
  const isPlaying = nowPlaying.playbackStatus === 'playing';
  const hasTrack = Boolean(artist || normalizeText(nowPlaying.title));
  const secondaryLine = hasTrack
    ? [artist, sizeLabel !== 'small' ? album : ''].filter(Boolean).join(' · ')
    : EMPTY_SUBTITLE;

  return (
    <main className={`overlay-shell size-${sizeLabel}`}>
      <section
        className={`mini-player-card size-${sizeLabel} ${settingsOpen ? 'settings-open' : ''}`}
        style={{ '--overlay-bg-opacity': opacity } as React.CSSProperties}
      >
        <div className="card-glow" aria-hidden="true" />

        <div className="player-body">
          <header className="player-header drag-area" data-tauri-drag-region onMouseDown={startDrag}>
            <p className="eyebrow brand-mark" data-tauri-drag-region>
              LumiTune
            </p>

            <div className="header-actions">
              <button
                className={`icon-button subtle ${settingsOpen ? 'selected' : ''}`}
                aria-label={settingsOpen ? '收起设置' : '打开设置'}
                title={settingsOpen ? '收起设置' : '打开设置'}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={() => setSettingsOpen((open) => !open)}
              >
                ⚙
              </button>
              <button
                className="icon-button subtle"
                aria-label="隐藏悬浮窗"
                title="隐藏悬浮窗"
                onMouseDown={(event) => event.stopPropagation()}
                onClick={() => void appWindow.hide()}
              >
                ×
              </button>
            </div>
          </header>

          <div className="media-panel drag-area" data-tauri-drag-region onMouseDown={startDrag}>
            <div className={`artwork-frame ${artworkUrl ? 'has-artwork' : ''}`} data-tauri-drag-region>
              {artworkUrl ? (
                <img className="artwork-image" src={artworkUrl} alt="" draggable={false} />
              ) : (
                <span className="artwork-placeholder" aria-hidden="true">
                  ♪
                </span>
              )}
            </div>

            <div className="title-block" data-tauri-drag-region>
              <ScrollingLine className={`track-title ${hasTrack ? '' : 'idle-title'}`} text={title} />
              <ScrollingLine className="track-artist" text={secondaryLine || EMPTY_SUBTITLE} />
              {!hasTrack ? (
                <p className="empty-state" data-tauri-drag-region>
                  {EMPTY_STATUS}
                </p>
              ) : null}
            </div>
          </div>

          <div className="footer-stack">
            <div className="control-row">
              <button className="symbol-button" onClick={() => void run('previous')} title="上一首" aria-label="上一首">
                ⏮
              </button>
              <button
                className="primary symbol-button"
                onClick={() => void run('play_pause')}
                title="播放/暂停"
                aria-label="播放/暂停"
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button className="symbol-button" onClick={() => void run('next')} title="下一首" aria-label="下一首">
                ⏭
              </button>
              <button
                className="symbol-button"
                onClick={() => void invoke('show_main')}
                title="显示主窗口"
                aria-label="显示主窗口"
              >
                ◰
              </button>
            </div>

            {settingsOpen ? (
              <div className="settings-panel">
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
