import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, ImageOff, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLiveGallery } from '../hooks/useLiveGallery';
import GallerySlideshow from './GallerySlideshow';
import { parseCategory, getCoupleDisplay, type GalleryCouple } from '../lib/galleryHelper';

export default function Gallery() {
  const { images: allImages, loading } = useLiveGallery('all');
  const [activeTab, setActiveTab] = useState<GalleryCouple>('both');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);

  const filteredImages = allImages.filter(img => {
    const { couple } = parseCategory(img.folder);
    return couple === activeTab;
  });

  const previewImages = filteredImages.slice(0, 6);
  const col1 = previewImages.filter((_, i) => i % 2 === 0);
  const col2 = previewImages.filter((_, i) => i % 2 !== 0);

  const openLightbox = (idx: number) => {
    setZoom(1);
    setLightboxIndex(idx);
  };
  const closeLightbox = () => {
    setZoom(1);
    setLightboxIndex(null);
  };
  const prevImg = () => {
    setZoom(1);
    setLightboxIndex(i => (i !== null ? Math.max(0, i - 1) : null));
  };
  const nextImg = () => {
    setZoom(1);
    setLightboxIndex(i => (i !== null ? Math.min(filteredImages.length - 1, i + 1) : null));
  };
  const updateZoom = (delta: number) => {
    setZoom(z => Math.min(3, Math.max(1, +(z + delta).toFixed(1))));
  };

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImg();
      if (e.key === 'ArrowRight') nextImg();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex]);

  return (
    <section id="gallery" className="py-32 bg-ivory text-maroon-dark relative">
      <div className="absolute inset-0 mandala-pattern opacity-5"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center mb-12 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="h-[1px] w-12 bg-maroon-deep"></div>
            <Camera size={20} className="text-maroon-deep" />
            <div className="h-[1px] w-12 bg-maroon-deep"></div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="font-display text-6xl md:text-7xl text-maroon-deep mb-4"
          >
            Memories in Frame
          </motion.h2>
        </div>

        {/* Responsive Tab Switcher */}
        {/* Desktop Switcher */}
        <div className="hidden md:flex justify-center gap-4 mb-16 flex-wrap">
          {(['both', 'sandeep_asha', 'anand_sushila'] as GalleryCouple[]).map((couple) => (
            <button
              key={couple}
              onClick={() => setActiveTab(couple)}
              className={`relative rounded-full px-7 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                activeTab === couple
                  ? 'bg-maroon-deep text-gold-metallic shadow-lg'
                  : 'border border-maroon-deep/20 bg-ivory text-maroon-dark/60 hover:border-maroon-deep/50'
              }`}
            >
              {getCoupleDisplay(couple)}
            </button>
          ))}
        </div>

        {/* Mobile Switcher (Mockup Style) */}
        <div className="flex md:hidden justify-center items-center gap-6 mb-10 overflow-x-auto pb-2 scrollbar-none">
          {(['both', 'sandeep_asha', 'anand_sushila'] as GalleryCouple[]).map((couple) => (
            <button
              key={couple}
              onClick={() => setActiveTab(couple)}
              className="relative flex flex-col items-center py-2"
            >
              <span className={`text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-300 ${
                activeTab === couple ? 'text-maroon-deep font-extrabold' : 'text-maroon-dark/45 font-semibold'
              }`}>
                {couple === 'both' ? 'Shared' : couple === 'sandeep_asha' ? 'Sandeep & Asha' : 'Anand & Sushila'}
              </span>
              {activeTab === couple && (
                <motion.div
                  layoutId="activeTabDot"
                  className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-maroon-deep"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[300px] rounded-[2rem] bg-maroon-deep/10 animate-pulse" />
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-maroon-dark/40">
            <ImageOff size={64} className="mb-4 opacity-40" />
            <p className="font-garamond text-2xl italic">No photos in this gallery yet.</p>
          </div>
        ) : (
          <>
            {/* Desktop Slideshow View */}
            <div className="hidden md:block -mx-6">
              <GallerySlideshow images={filteredImages} loading={loading} />
            </div>

            {/* Mobile Mockup 2-Column Staggered Masonry View */}
            <div className="grid grid-cols-2 gap-4 px-1 md:hidden">
              <div className="flex flex-col gap-4">
                {col1.map((img) => (
                  <motion.div
                    key={img.path}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openLightbox(filteredImages.indexOf(img))}
                    className="w-full overflow-hidden rounded-[1.75rem] bg-white shadow-[0_10px_25px_rgba(74,4,4,0.06)] border border-maroon-deep/5 transition-all duration-300"
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="block h-auto w-full object-cover select-none pointer-events-none"
                      loading="lazy"
                      onContextMenu={(e) => e.preventDefault()}
                      draggable={false}
                    />
                  </motion.div>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                {col2.map((img) => (
                  <motion.div
                    key={img.path}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openLightbox(filteredImages.indexOf(img))}
                    className="w-full overflow-hidden rounded-[1.75rem] bg-white shadow-[0_10px_25px_rgba(74,4,4,0.06)] border border-maroon-deep/5 transition-all duration-300"
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="block h-auto w-full object-cover select-none pointer-events-none"
                      loading="lazy"
                      onContextMenu={(e) => e.preventDefault()}
                      draggable={false}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}

        {allImages.length > 0 && (
          <div className="mt-16 flex justify-center">
            <Link to={`/gallery?couple=${activeTab}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-4 rounded-full bg-maroon-deep text-gold-metallic font-semibold uppercase tracking-widest text-xs shadow-2xl hover:shadow-[0_20px_40px_rgba(74,4,4,0.3)] transition-all"
              >
                View Gallery
              </motion.button>
            </Link>
          </div>
        )}
      </div>

      {/* High-Fidelity Homepage Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredImages[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 p-4"
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute top-6 right-6 text-white/70 transition-colors hover:text-white">
              <X size={32} />
            </button>
            
            <div
              className="absolute top-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-white backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => updateZoom(-0.2)}
                disabled={zoom <= 1}
                className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold transition hover:bg-white/20 disabled:opacity-40"
              >
                -
              </button>
              <button
                onClick={() => setZoom(1)}
                className="min-w-16 rounded-full bg-white/10 px-3 py-1 text-xs font-bold transition hover:bg-white/20"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={() => updateZoom(0.2)}
                disabled={zoom >= 3}
                className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold transition hover:bg-white/20 disabled:opacity-40"
              >
                +
              </button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImg();
              }}
              disabled={lightboxIndex === 0}
              className="absolute left-4 text-white/60 transition-colors hover:text-white disabled:opacity-20 md:left-8"
            >
              <ChevronLeft size={48} />
            </button>

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-h-[85vh] max-w-[90vw] overflow-auto rounded-[2rem] bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => {
                e.stopPropagation();
                updateZoom(e.deltaY > 0 ? -0.1 : 0.1);
              }}
            >
              <img
                src={filteredImages[lightboxIndex].url}
                alt=""
                className="max-h-[75vh] max-w-full object-contain select-none transition-transform duration-200"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                onClick={() => setZoom((value) => (value === 1 ? 2 : 1))}
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
              />
            </motion.div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImg();
              }}
              disabled={lightboxIndex === filteredImages.length - 1}
              className="absolute right-4 text-white/60 transition-colors hover:text-white disabled:opacity-20 md:right-8"
            >
              <ChevronRight size={48} />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/40">
              {lightboxIndex + 1} / {filteredImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
