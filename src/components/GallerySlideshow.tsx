import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Camera, ExternalLink } from 'lucide-react';
import { type GalleryImage } from '../services/imageService';
import { Link } from 'react-router-dom';
import { parseCategory } from '../lib/galleryHelper';

const SLIDE_INTERVAL = 4000; // ms per slide

interface GallerySlideshowProps {
  images: GalleryImage[];
  loading: boolean;
}

export default function GallerySlideshow({ images: liveImages, loading }: GallerySlideshowProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const shuffled = [...liveImages].sort(() => Math.random() - 0.5);
    setImages(shuffled);
    setCurrent(0);
  }, [liveImages]);

  // Auto-advance
  useEffect(() => {
    if (images.length <= 1 || paused) return;
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % images.length);
    }, SLIDE_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [images.length, paused]);

  const prev = () => {
    setCurrent(c => (c - 1 + images.length) % images.length);
    resetTimer();
  };
  const next = () => {
    setCurrent(c => (c + 1) % images.length);
    resetTimer();
  };
  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!paused) {
      timerRef.current = setInterval(() => {
        setCurrent(c => (c + 1) % images.length);
      }, SLIDE_INTERVAL);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[480px] rounded-3xl bg-maroon-deep/40 animate-pulse" />
    );
  }

  if (images.length === 0) return null;

  return (
    <div className="relative w-full">

        {/* Slideshow */}
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl bg-black"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={{ height: 'clamp(320px, 60vw, 560px)' }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={images[current].path}
              src={images[current].url}
              alt={images[current].folder}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
              onContextMenu={(e: any) => e.preventDefault()}
              draggable={false}
            />
          </AnimatePresence>

          {/* Cinematic gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20 pointer-events-none" />

          {/* Category badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={images[current].folder}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-8 left-8"
            >
              <span className="px-4 py-1.5 rounded-full bg-gold-metallic/20 backdrop-blur-sm border border-gold-metallic/30 text-gold-metallic text-[10px] font-bold uppercase tracking-widest capitalize">
                {parseCategory(images[current].folder).folder}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Slide counter */}
          <div className="absolute bottom-8 right-8 text-white/40 text-xs font-sans">
            {current + 1} / {images.length}
          </div>

          {/* Nav buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/50 flex items-center justify-center transition-all"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/50 flex items-center justify-center transition-all"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* Progress dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.slice(0, Math.min(images.length, 12)).map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); resetTimer(); }}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-6 h-1.5 bg-gold-metallic'
                    : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
            {images.length > 12 && <span className="text-white/30 text-[10px] self-center">+{images.length - 12}</span>}
          </div>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {images.map((img, i) => (
              <button
                key={img.path}
                onClick={() => { setCurrent(i); resetTimer(); }}
                className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all duration-300 ${
                  i === current
                    ? 'ring-2 ring-gold-metallic scale-105 opacity-100'
                    : 'opacity-40 hover:opacity-70'
                }`}
              >
                <img 
                  src={img.url} 
                  alt="" 
                  className="w-full h-full object-cover select-none pointer-events-none" 
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                />
              </button>
            ))}
          </div>
        )}

        {/* View all link (mobile) */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link to="/gallery">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 border border-gold-metallic/40 text-gold-metallic rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gold-metallic/10 transition-colors"
            >
              View Full Gallery <ExternalLink size={13} />
            </motion.button>
          </Link>
        </div>
      </div>
  );
}
