import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Camera, ArrowLeft, X, ChevronLeft, ChevronRight, ImageOff, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState, type MouseEvent } from 'react';
import { imageService, type GalleryImage } from '../services/imageService';
import { useLiveGallery } from '../hooks/useLiveGallery';
import { useAdminStatus } from '../hooks/useAdminStatus';

export default function GalleryPage() {
  const { images: allImages, loading } = useLiveGallery('all');
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const isAdmin = useAdminStatus();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const folders = [...new Set(allImages.map((image) => image.folder))].filter(Boolean).sort();

  const images = activeFolder === 'all' ? allImages : allImages.filter((image) => image.folder === activeFolder);

  useEffect(() => {
    if (activeFolder !== 'all' && !folders.includes(activeFolder)) {
      setActiveFolder('all');
    }
  }, [activeFolder, folders]);

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
    setLightboxIndex((i) => (i !== null ? Math.max(0, i - 1) : null));
  };
  const nextImg = () => {
    setZoom(1);
    setLightboxIndex((i) => (i !== null ? Math.min(images.length - 1, i + 1) : null));
  };
  const updateZoom = (delta: number) => setZoom((value) => Math.min(3, Math.max(1, +(value + delta).toFixed(1))));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImg();
      if (e.key === 'ArrowRight') nextImg();
      if (e.key === '+' || e.key === '=') updateZoom(0.2);
      if (e.key === '-') updateZoom(-0.2);
      if (e.key === '0') setZoom(1);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [images.length]);

  const handleDeleteImage = async (img: GalleryImage, e: MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete this photo from "${img.folder}"?`)) return;
    setDeleting(img.path);
    await imageService.deleteGalleryImage(img.path, img.id);
    setDeleting(null);
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Navbar />

      <section className="relative overflow-hidden bg-maroon-dark pt-40 pb-20">
        <div className="absolute inset-0 mandala-pattern opacity-10"></div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center justify-center gap-4"
          >
            <div className="h-[1px] w-12 bg-gold-metallic"></div>
            <Camera size={24} className="text-gold-metallic" />
            <div className="h-[1px] w-12 bg-gold-metallic"></div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="mb-6 font-display text-6xl text-gold-metallic md:text-8xl"
          >
            The Gallery of Love
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mx-auto max-w-2xl font-garamond text-xl italic text-gold-light/60 md:text-2xl"
          >
            A flowing wall of moments, designed to feel natural on mobile and dense on desktop.
          </motion.p>
        </div>
      </section>

      {!loading && folders.length > 0 && (
        <div className="sticky top-0 z-20 border-b border-maroon-deep/10 bg-white shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-3 py-3 sm:gap-3 sm:px-6 sm:py-4" style={{ scrollbarWidth: 'none' }}>
            {['all', ...folders].map((folder) => (
              <button
                key={folder}
                onClick={() => setActiveFolder(folder)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 sm:px-5 sm:text-xs sm:tracking-widest ${
                  activeFolder === folder
                    ? 'bg-maroon-deep text-gold-metallic shadow-lg'
                    : 'border border-maroon-deep/20 bg-[#f5f0e8] text-maroon-dark/60 hover:border-maroon-deep/50'
                }`}
              >
                {folder === 'all' ? `All Photos (${allImages.length})` : `${folder} (${allImages.filter((image) => image.folder === folder).length})`}
              </button>
            ))}
          </div>
        </div>
      )}

      <section className="mx-auto max-w-[1600px] px-2 py-6 sm:px-6 sm:py-10 md:py-14">
        {loading ? (
          <div className="columns-2 gap-2 space-y-2 sm:gap-4 sm:space-y-4 md:columns-3 lg:columns-4 xl:columns-5">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="mb-2 break-inside-avoid overflow-hidden rounded-[1.1rem] bg-white shadow-sm sm:mb-4 sm:rounded-[2rem]">
                <div className={`${i % 3 === 0 ? 'aspect-[3/5]' : i % 3 === 1 ? 'aspect-[4/5]' : 'aspect-square'} animate-pulse bg-gray-200`} />
              </div>
            ))}
          </div>
        ) : allImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-maroon-dark/40">
            <ImageOff size={80} className="mb-6 opacity-30" />
            <p className="mb-2 font-garamond text-3xl italic">No photos here yet</p>
            <p className="text-sm">Upload photos from the Admin Dashboard or use Quick Upload</p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-3 sm:mb-8 sm:gap-4">
              <div className="h-[1px] flex-1 bg-maroon-deep/20"></div>
              <h2 className="px-1 font-display text-lg text-maroon-deep sm:px-2 sm:text-2xl md:text-4xl">
                {activeFolder === 'all' ? `All Photos (${allImages.length})` : `${activeFolder} (${images.length})`}
              </h2>
              <div className="h-[1px] flex-1 bg-maroon-deep/20"></div>
            </div>

            <div className="columns-2 gap-2 space-y-2 sm:gap-4 sm:space-y-4 md:columns-3 lg:columns-4 xl:columns-5">
              {images.map((img, idx) => (
                <PinCard
                  key={img.path}
                  img={img}
                  idx={idx}
                  isAdmin={isAdmin}
                  deleting={deleting}
                  onOpen={() => openLightbox(idx)}
                  onDelete={(e) => handleDeleteImage(img, e)}
                />
              ))}
            </div>
          </>
        )}

        <div className="mt-10 flex justify-center sm:mt-20">
          <Link to="/">
            <motion.button
              whileHover={{ x: -10 }}
              className="group flex items-center gap-4 text-sm font-bold uppercase tracking-[0.3em] text-maroon-deep"
            >
              <ArrowLeft size={20} />
              Return to Home
            </motion.button>
          </Link>
        </div>
      </section>

      <AnimatePresence>
        {lightboxIndex !== null && images[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
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
                src={images[lightboxIndex].url}
                alt={images[lightboxIndex].name}
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
              disabled={lightboxIndex === images.length - 1}
              className="absolute right-4 text-white/60 transition-colors hover:text-white disabled:opacity-20 md:right-8"
            >
              <ChevronRight size={48} />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/40">
              {lightboxIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

type PinCardProps = {
  key?: string;
  img: GalleryImage;
  idx: number;
  isAdmin: boolean;
  deleting: string | null;
  onOpen: () => void;
  onDelete: (e: MouseEvent) => void;
};

function PinCard({ img, idx, isAdmin, deleting, onOpen, onDelete }: PinCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (idx % 5) * 0.05 }}
      whileHover={{ y: -6 }}
      onClick={onOpen}
      className="group relative mb-2 break-inside-avoid cursor-pointer sm:mb-4"
    >
      <div className="overflow-hidden rounded-[1rem] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 group-hover:shadow-[0_20px_55px_rgba(0,0,0,0.16)] sm:rounded-[1.75rem] sm:shadow-[0_12px_35px_rgba(0,0,0,0.10)]">
        <div className="relative overflow-hidden">
          <img
            src={img.url}
            alt={img.name}
            className="block h-auto w-full transition-transform duration-700 group-hover:scale-[1.03] select-none"
            loading="lazy"
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute top-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-maroon-deep shadow-sm backdrop-blur-sm sm:top-4 sm:left-4 sm:px-3 sm:text-[10px] sm:tracking-widest">
            {img.folder}
          </div>
        </div>
        <div className="px-2.5 py-2 sm:px-4 sm:py-3">
          <p className="text-[10px] capitalize text-maroon-dark/50 sm:text-xs">{img.folder}</p>
        </div>
      </div>

      {isAdmin && (
        <button
          onClick={onDelete}
          disabled={deleting === img.path}
          className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 opacity-100 shadow-md transition-all hover:bg-red-50 sm:top-4 sm:right-4 sm:h-9 sm:w-9 sm:opacity-0 sm:group-hover:opacity-100"
        >
          {deleting === img.path ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
          ) : (
            <Trash2 size={14} />
          )}
        </button>
      )}
    </motion.div>
  );
}
