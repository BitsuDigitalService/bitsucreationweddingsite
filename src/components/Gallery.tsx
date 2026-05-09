import { motion } from 'motion/react';
import { Camera, ImageOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLiveGallery } from '../hooks/useLiveGallery';
import GallerySlideshow from './GallerySlideshow';

export default function Gallery() {
  const { images, loading } = useLiveGallery('all');

  return (
    <section id="gallery" className="py-32 bg-ivory text-maroon-dark relative">
      <div className="absolute inset-0 mandala-pattern opacity-5"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center mb-20 text-center">
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
            className="font-display text-6xl md:text-7xl text-maroon-deep"
          >
            Memories in Frame
          </motion.h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[300px] rounded-[2rem] bg-maroon-deep/10 animate-pulse" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-maroon-dark/40">
            <ImageOff size={64} className="mb-4 opacity-40" />
            <p className="font-garamond text-2xl italic">No photos yet. Check back soon!</p>
          </div>
        ) : (
          <div className="-mx-6">
            <GallerySlideshow />
          </div>
        )}

        {images.length > 0 && (
          <div className="mt-16 flex justify-center">
            <Link to="/gallery">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-4 rounded-full bg-maroon-deep text-gold-metallic font-semibold uppercase tracking-widest text-xs shadow-2xl hover:shadow-[0_20px_40px_rgba(74,4,4,0.3)] transition-all"
              >
                View Full Gallery ({images.length} photos)
              </motion.button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
