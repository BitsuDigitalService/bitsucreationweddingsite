import { useEffect, useRef, useState, useCallback, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Heart,
  Trash2,
  VideoOff,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { type GalleryVideo, videoService } from '../services/imageService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReelsPlayerProps {
  videos: GalleryVideo[];
  isAdmin?: boolean;
  onVideoDeleted?: (video: GalleryVideo) => void;
}

// ─── Single Reel Card ─────────────────────────────────────────────────────────

interface ReelCardProps {
  video: GalleryVideo;
  isActive: boolean;
  isAdmin: boolean;
  onDelete: (e: MouseEvent) => void;
}

function ReelCard({ video, isActive, isAdmin, onDelete }: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const lastTapRef = useRef(0);

  // Play/pause based on active state
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isActive) {
      el.currentTime = 0;
      el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      el.pause();
      el.currentTime = 0;
      setPlaying(false);
      setProgress(0);
    }
  }, [isActive]);

  // Sync muted state
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  const handleTimeUpdate = () => {
    const el = videoRef.current;
    if (!el || !el.duration) return;
    setProgress(el.currentTime / el.duration);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const handleEnded = () => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.play().catch(() => {});
  };

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  // Double-tap to heart
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 900);
    } else {
      togglePlay();
    }
    lastTapRef.current = now;
  };

  const handleDelete = async (e: MouseEvent) => {
    e.stopPropagation();
    setDeleting(true);
    onDelete(e);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden select-none"
      onClick={handleTap}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={video.url}
        poster={video.thumbnailUrl}
        className="absolute inset-0 w-full h-full object-contain"
        muted={muted}
        playsInline
        loop={false}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
      />

      {/* Gradient overlays */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Double-tap heart */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            key="heart"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.4, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center z-30"
          >
            <Heart size={96} className="text-red-500 drop-shadow-2xl fill-red-500" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play / Pause central indicator */}
      <AnimatePresence>
        {!playing && (
          <motion.div
            key="pause-icon"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute z-20 bg-black/40 backdrop-blur-sm rounded-full p-5"
          >
            <Play size={36} className="text-white fill-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top info bar */}
      <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-4 pt-4 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
            {video.folder}
          </span>
          {video.title && (
            <span className="text-white/90 text-xs font-medium truncate max-w-[180px]">
              {video.title}
            </span>
          )}
        </div>
        {duration > 0 && (
          <span className="text-white/60 text-[10px] font-mono">
            {formatTime(duration * progress)} / {formatTime(duration)}
          </span>
        )}
      </div>

      {/* Right side controls */}
      <div
        className="absolute right-4 bottom-24 z-10 flex flex-col items-center gap-5 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setMuted((m) => !m)}
          className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg hover:bg-white/25 transition-all active:scale-90"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <button
          onClick={togglePlay}
          className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg hover:bg-white/25 transition-all active:scale-90"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause size={20} /> : <Play size={20} />}
        </button>

        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-11 h-11 rounded-full bg-red-500/80 backdrop-blur-md border border-red-400/30 flex items-center justify-center text-white shadow-lg hover:bg-red-600/90 transition-all active:scale-90 disabled:opacity-50"
            aria-label="Delete video"
          >
            {deleting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Trash2 size={18} />
            )}
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 inset-x-0 z-10 h-1 bg-white/20">
        <motion.div
          className="h-full bg-white rounded-full"
          style={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>
    </div>
  );
}

// ─── Main ReelsPlayer ─────────────────────────────────────────────────────────

export default function ReelsPlayer({ videos, isAdmin = false, onVideoDeleted }: ReelsPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const goTo = useCallback((idx: number) => {
    setCurrentIndex(Math.max(0, Math.min(videos.length - 1, idx)));
  }, [videos.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goTo(currentIndex + 1);
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goTo(currentIndex - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentIndex, goTo]);

  // Touch/swipe handling
  const touchStartY = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(delta) > 60) {
      if (delta > 0) goTo(currentIndex + 1);
      else goTo(currentIndex - 1);
    }
  };

  // Wheel/scroll handling (desktop)
  const lastWheelRef = useRef(0);
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastWheelRef.current < 600) return;
    lastWheelRef.current = now;
    if (e.deltaY > 0) goTo(currentIndex + 1);
    else goTo(currentIndex - 1);
  };

  const handleDeleteVideo = async (video: GalleryVideo, e: MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete this reel from "${video.folder}"?`)) return;
    setDeletingId(video.path);
    await videoService.deleteGalleryVideo(video.path, video.id);
    setDeletingId(null);
    onVideoDeleted?.(video);
    // Move to previous if possible
    if (currentIndex >= videos.length - 1) {
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-maroon-dark/40">
        <VideoOff size={80} className="mb-6 opacity-30" />
        <p className="font-garamond text-3xl italic mb-2">No reels yet</p>
        <p className="text-sm">Upload videos from the Admin Dashboard → Gallery → Videos</p>
      </div>
    );
  }

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Reel viewport */}
      <div
        ref={containerRef}
        className="relative w-full max-w-sm mx-auto overflow-hidden rounded-[2rem] shadow-2xl"
        style={{ height: 'min(88vh, 700px)' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={videos[currentIndex]?.path ?? currentIndex}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full h-full"
          >
            <ReelCard
              video={videos[currentIndex]}
              isActive={true}
              isAdmin={isAdmin && deletingId === null}
              onDelete={(e) => handleDeleteVideo(videos[currentIndex], e)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <div className="flex items-center gap-6 mt-6">
        <button
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full bg-maroon-deep/10 border border-maroon-deep/20 flex items-center justify-center text-maroon-deep hover:bg-maroon-deep/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
          aria-label="Previous reel"
        >
          <ChevronUp size={22} />
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-[180px]">
          {videos.slice(0, 12).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'w-5 h-2 bg-maroon-deep'
                  : 'w-2 h-2 bg-maroon-deep/30 hover:bg-maroon-deep/60'
              }`}
              aria-label={`Go to reel ${i + 1}`}
            />
          ))}
          {videos.length > 12 && (
            <span className="text-xs text-maroon-deep/50 font-mono">+{videos.length - 12}</span>
          )}
        </div>

        <button
          onClick={() => goTo(currentIndex + 1)}
          disabled={currentIndex === videos.length - 1}
          className="w-12 h-12 rounded-full bg-maroon-deep/10 border border-maroon-deep/20 flex items-center justify-center text-maroon-deep hover:bg-maroon-deep/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
          aria-label="Next reel"
        >
          <ChevronDown size={22} />
        </button>
      </div>

      {/* Counter */}
      <p className="mt-3 text-xs text-maroon-dark/40 font-mono">
        {currentIndex + 1} / {videos.length}
      </p>
    </div>
  );
}
