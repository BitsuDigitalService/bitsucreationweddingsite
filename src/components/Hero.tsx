import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COUPLE_1, COUPLE_2 } from '../constants';

export default function Hero() {
  const { state } = useApp();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: 'easeOut' }}
          src={state.heroImage}
          alt="Palace Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-maroon-dark/80 via-maroon-dark/40 to-maroon-dark"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-dark/60 via-transparent to-maroon-dark/60"></div>
      </div>

      <div className="absolute top-1/4 -left-1/4 h-[1px] w-full rotate-12 bg-gradient-to-r from-transparent via-gold-metallic/20 to-transparent blur-sm"></div>
      <div className="absolute bottom-1/4 -right-1/4 h-[1px] w-full -rotate-12 bg-gradient-to-r from-transparent via-gold-metallic/20 to-transparent blur-sm"></div>

      <div className="relative z-10 mt-20 max-w-5xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          className="mb-4 flex items-center justify-center gap-4"
        >
          <div className="h-[1px] w-8 bg-gold-light/40"></div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-gold-light md:text-xs">
            Sandeep and Anand Wedding
          </p>
          <div className="h-[1px] w-8 bg-gold-light/40"></div>
        </motion.div>

        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="font-display text-4xl text-gold-metallic drop-shadow-[0_10px_30px_rgba(212,175,55,0.3)] md:text-5xl lg:text-6xl"
          >
            Sandeep Weds Asha
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex items-center justify-center gap-8 py-2"
          >
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-gold-metallic/50 md:w-32"></div>
            <span className="font-serif text-3xl italic text-ivory/40 md:text-4xl">and</span>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-gold-metallic/50 md:w-32"></div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 1.2 }}
            className="font-display text-4xl text-gold-metallic drop-shadow-[0_10px_30px_rgba(212,175,55,0.3)] md:text-5xl lg:text-6xl"
          >
            Anand Weds Sushila
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 2 }}
          className="mx-auto mt-12 max-w-3xl font-garamond text-2xl italic leading-relaxed tracking-wide text-ivory/70 md:text-3xl"
        >
          Two hearts, one sacred bond, a celebration of love and togetherness.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.5 }}
          className="mt-16 mb-20"
        >
          <button
            onClick={() => {
              const gallerySection = document.getElementById('gallery');
              if (gallerySection) {
                gallerySection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="relative group overflow-hidden rounded-full bg-gold-metallic px-14 py-5 text-xs font-bold uppercase tracking-[0.3em] text-maroon-dark shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]"
          >
            <span className="relative z-10">View Photos</span>
            <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-500 ease-out group-hover:translate-y-0"></div>
            <div className="gold-shimmer absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"></div>
          </button>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 opacity-60"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll Down</span>
        <ChevronDown size={20} className="text-gold-metallic" />
      </motion.div>

      <div className="absolute left-[-15%] top-1/2 hidden h-[70vh] w-[40%] -translate-y-1/2 skew-y-3 opacity-30 grayscale transition-all duration-700 hover:grayscale-0 lg:block">
        <img
          src={state.couples.couple1.imageUrl || COUPLE_1.imageUrl}
          alt={`${state.couples.couple1.name1} and ${state.couples.couple1.name2}`}
          className="h-full w-full rounded-[100px] object-cover select-none pointer-events-none"
          onContextMenu={(e) => e.preventDefault()}
          onError={(e) => {
            if (e.currentTarget.src !== COUPLE_1.imageUrl) {
              e.currentTarget.src = COUPLE_1.imageUrl;
            }
          }}
          draggable={false}
        />
      </div>
      <div className="absolute right-[-15%] top-1/2 hidden h-[70vh] w-[40%] -translate-y-1/2 -skew-y-3 opacity-30 grayscale transition-all duration-700 hover:grayscale-0 lg:block">
        <img
          src={state.couples.couple2.imageUrl || COUPLE_2.imageUrl}
          alt={`${state.couples.couple2.name1} and ${state.couples.couple2.name2}`}
          className="h-full w-full rounded-[100px] object-cover select-none pointer-events-none"
          onContextMenu={(e) => e.preventDefault()}
          onError={(e) => {
            if (e.currentTarget.src !== COUPLE_2.imageUrl) {
              e.currentTarget.src = COUPLE_2.imageUrl;
            }
          }}
          draggable={false}
        />
      </div>
    </section>
  );
}
