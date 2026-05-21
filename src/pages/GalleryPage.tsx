import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowLeft, X, ChevronLeft, ChevronRight, ImageOff, Trash2, Film, Users, Star } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState, type MouseEvent } from 'react';
import { imageService, type GalleryImage } from '../services/imageService';
import { useLiveGallery } from '../hooks/useLiveGallery';
import { useAdminStatus } from '../hooks/useAdminStatus';
import { useLiveReels } from '../hooks/useLiveReels';
import ReelsPlayer from '../components/ReelsPlayer';
import { parseCategory, getCoupleDisplay, type GalleryCouple } from '../lib/galleryHelper';

export default function GalleryPage() {
  const { images: allImages, loading } = useLiveGallery('all');
  const { videos, loading: videosLoading, reload: reloadVideos } = useLiveReels('all');
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const isAdmin = useAdminStatus();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const isReelsMode = activeFolder === '__reels__';

  const [searchParams] = useSearchParams();
  const initialCouple = searchParams.get('couple') as GalleryCouple;
  const [activeCouple, setActiveCouple] = useState<GalleryCouple>(
    initialCouple === 'sandeep_asha' || initialCouple === 'anand_sushila' || initialCouple === 'both'
      ? initialCouple
      : 'both'
  );

  const [showCoupleDropdown, setShowCoupleDropdown] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gallery_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (path: string, e: MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path];
      localStorage.setItem('gallery_favorites', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Map and filter images by active couple
  const coupleImages = allImages
    .map(img => {
      const { couple, folder } = parseCategory(img.folder);
      return { ...img, folder, couple }; // Set folder to the clean name for display
    })
    .filter(img => activeCouple === 'both' || img.couple === activeCouple);

  // Map and filter videos by active couple
  const coupleVideos = videos
    .map(vid => {
      const { couple, folder } = parseCategory(vid.folder);
      return { ...vid, folder, couple };
    })
    .filter(vid => activeCouple === 'both' || vid.couple === activeCouple);

  const folders = [...new Set(coupleImages.map((image) => image.folder))].filter(Boolean).sort();

  const images = activeFolder === 'all' 
    ? coupleImages 
    : coupleImages.filter((image) => image.folder === activeFolder);

  // Reset folder filter when changing couple (unless in reels mode)
  useEffect(() => {
    if (activeFolder !== '__reels__') {
      setActiveFolder('all');
    }
  }, [activeCouple]);

  // Adjust folder view if folder disappears for new couple selection
  useEffect(() => {
    if (activeFolder !== 'all' && activeFolder !== '__reels__' && !folders.includes(activeFolder)) {
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
    <div className="min-h-screen bg-[#f5f0e8] text-gray-800">
      <Navbar />

      {/* Main page wrapper (no card container, content flows directly on page) */}
      <div className="mx-auto max-w-7xl px-3 pt-24 pb-16 sm:px-6 sm:pt-32 md:pt-36 space-y-6 sm:space-y-8">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-maroon-deep leading-tight font-bold">
              Gallery of Love
            </h1>
            <p className="text-gray-400 font-sans mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">
              Cherish our beautiful memories
            </p>
          </div>

          {/* Couple Switcher Tabs */}
          <div className="flex flex-wrap gap-2">
            {(['both', 'sandeep_asha', 'anand_sushila'] as GalleryCouple[]).map((couple) => (
              <button
                key={couple}
                onClick={() => setActiveCouple(couple)}
                className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer border rounded-full ${
                  activeCouple === couple
                    ? 'bg-maroon-deep text-white border-maroon-deep shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {getCoupleDisplay(couple)}
              </button>
            ))}
          </div>
        </div>

        {/* Folder switch pills */}
        {(!loading || coupleVideos.length > 0) && (folders.length > 0 || coupleVideos.length > 0) && (
          <div className="border-b border-gray-200 pb-5 sm:pb-6">
            <div className="flex items-center gap-2 overflow-x-auto py-2" style={{ scrollbarWidth: 'none' }}>
              {['all', ...folders].map((folder) => (
                <button
                  key={folder}
                  onClick={() => setActiveFolder(folder)}
                  className={`flex-shrink-0 border px-4 py-2 sm:px-5 sm:py-2.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer rounded-full ${
                    activeFolder === folder
                      ? 'bg-maroon-deep border-maroon-deep text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {folder === 'all' 
                    ? `All Photos (${coupleImages.length})` 
                    : `${folder} (${coupleImages.filter((image) => image.folder === folder).length})`}
                </button>
              ))}
              {/* Reels tab */}
              {(coupleVideos.length > 0 || videosLoading) && (
                <button
                  onClick={() => setActiveFolder('__reels__')}
                  className={`flex-shrink-0 flex items-center gap-1.5 border px-4 py-2 sm:px-5 sm:py-2.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer rounded-full ${
                    isReelsMode
                      ? 'bg-maroon-deep border-maroon-deep text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Film size={12} />
                  Reels {coupleVideos.length > 0 ? `(${coupleVideos.length})` : ''}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Gallery Content Section */}
        <div className="pt-2">
          {/* Reels Mode */}
          {isReelsMode && (
            <div className="py-2">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-sans text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">
                  Reels ({getCoupleDisplay(activeCouple)})
                </h2>
              </div>
              <ReelsPlayer
                videos={coupleVideos}
                isAdmin={isAdmin}
                onVideoDeleted={() => reloadVideos()}
              />
            </div>
          )}

          {/* Photos Mode */}
          {!isReelsMode && loading ? (
            <div className="columns-2 gap-3 space-y-3 sm:gap-4 sm:space-y-4 md:columns-3 lg:columns-4 xl:columns-5">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-white">
                  <div className={`${i % 3 === 0 ? 'aspect-[3/5]' : i % 3 === 1 ? 'aspect-[4/5]' : 'aspect-square'} animate-pulse bg-gray-100 rounded-2xl`} />
                </div>
              ))}
            </div>
          ) : allImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-maroon-dark/40">
              <ImageOff size={60} className="mb-4 opacity-30 text-gray-400" />
              <p className="mb-2 font-display text-2xl text-maroon-deep">No photos here yet</p>
              <p className="text-xs text-gray-400 text-center">Upload photos from the Admin Dashboard or use Quick Upload</p>
            </div>
          ) : !isReelsMode ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-sans text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">
                  {activeFolder === 'all' 
                    ? `All Photos (${coupleImages.length})` 
                    : `${activeFolder} (${images.length})`}
                </h2>
              </div>

              <div className="columns-2 gap-3 space-y-3 sm:gap-4 sm:space-y-4 md:columns-3 lg:columns-4 xl:columns-5">
                {images.map((img, idx) => (
                  <PinCard
                    key={img.path}
                    img={img}
                    idx={idx}
                    isAdmin={isAdmin}
                    deleting={deleting}
                    isFavorite={favorites.includes(img.path)}
                    onToggleFavorite={toggleFavorite}
                    onOpen={() => openLightbox(idx)}
                    onDelete={(e) => handleDeleteImage(img, e)}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>

        {/* Navigation Back Button */}
        <div className="mt-8 pt-4 flex justify-center border-t border-gray-200">
          <Link to="/">
            <motion.button
              whileHover={{ x: -6 }}
              className="group flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-maroon-deep cursor-pointer"
            >
              <ArrowLeft size={16} />
              Return to Home
            </motion.button>
          </Link>
        </div>

      </div>

      <AnimatePresence>
        {lightboxIndex !== null && images[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute top-6 right-6 text-white/70 transition-colors hover:text-white cursor-pointer">
              <X size={32} />
            </button>
            <div
              className="absolute top-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-white backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => updateZoom(-0.2)}
                disabled={zoom <= 1}
                className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold transition hover:bg-white/20 disabled:opacity-40 cursor-pointer"
              >
                -
              </button>
              <button
                onClick={() => setZoom(1)}
                className="min-w-16 rounded-full bg-white/10 px-3 py-1 text-xs font-bold transition hover:bg-white/20 cursor-pointer"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={() => updateZoom(0.2)}
                disabled={zoom >= 3}
                className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold transition hover:bg-white/20 disabled:opacity-40 cursor-pointer"
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
              className="absolute left-4 text-white/60 transition-colors hover:text-white disabled:opacity-20 md:left-8 cursor-pointer"
            >
              <ChevronLeft size={48} />
            </button>
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-h-[85vh] max-w-[90vw] overflow-auto rounded-none bg-white shadow-2xl"
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
              className="absolute right-4 text-white/60 transition-colors hover:text-white disabled:opacity-20 md:right-8 cursor-pointer"
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
  img: GalleryImage;
  idx: number;
  isAdmin: boolean;
  deleting: string | null;
  isFavorite: boolean;
  onToggleFavorite: (path: string, e: MouseEvent) => void;
  onOpen: () => void;
  onDelete: (e: MouseEvent) => void;
};

function PinCard({ img, idx, isAdmin, deleting, isFavorite, onToggleFavorite, onOpen, onDelete }: PinCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (idx % 5) * 0.05 }}
      className="group relative mb-3 break-inside-avoid cursor-pointer sm:mb-4"
      onClick={onOpen}
    >
      <div className="overflow-hidden rounded-2xl bg-white transition-all duration-300">
        <div className="relative overflow-hidden">
          <img
            src={img.url}
            alt={img.name}
            className="block h-auto w-full rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-700 group-hover:scale-[1.02] group-hover:shadow-[0_20px_50px_rgba(74,4,4,0.12)] select-none"
            loading="lazy"
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
          />
        </div>
        
        {/* Bottom Details Row */}
        <div className="flex items-center justify-between mt-2.5 px-2">
          <span className="text-[10px] sm:text-xs font-bold text-gray-500 font-sans tracking-wide capitalize truncate max-w-[80%]">
            {img.folder}
          </span>
          <button
            onClick={(e) => onToggleFavorite(img.path, e)}
            className="text-gray-400 hover:text-gold-metallic p-1 transition-colors flex items-center justify-center cursor-pointer"
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Star
              size={14}
              className={isFavorite ? "fill-gold-metallic text-gold-metallic" : "text-gray-300"}
            />
          </button>
        </div>
      </div>

      {isAdmin && (
        <button
          onClick={onDelete}
          disabled={deleting === img.path}
          className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-gray-100 bg-white text-red-500 shadow-md transition-all hover:bg-red-50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
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
