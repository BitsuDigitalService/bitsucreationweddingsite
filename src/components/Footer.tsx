import { motion } from 'motion/react';
import { Instagram, Facebook, Twitter, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-24 bg-maroon-dark relative text-center border-t border-gold-metallic/10 overflow-hidden">
      <div className="absolute inset-0 mandala-pattern opacity-10 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="w-24 h-24 rounded-full border-2 border-gold-metallic flex items-center justify-center mb-8 bg-maroon-dark/50"
        >
          <span className="font-display text-4xl text-gold-metallic">SA</span>
        </motion.div>

        <motion.h3 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-display text-5xl md:text-6xl text-gold-metallic mb-6"
        >
          Thank you for being a part of our special day!
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-ivory/60 font-garamond text-2xl italic mb-12 max-w-2xl"
        >
          Your presence and blessings means the world to us as we begin our new life together.
        </motion.p>

        <div className="flex items-center gap-8 mb-16">
          <SocialIcon icon={Instagram} href="#" />
          <SocialIcon icon={Facebook} href="#" />
          <SocialIcon icon={Twitter} href="#" />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-ivory/40 uppercase tracking-[0.3em] text-[10px]">
            Made with <Heart size={10} className="text-red-500 fill-red-500" /> for the lovely couples
          </div>
          <p className="text-gold-metallic/30 text-[10px] tracking-widest uppercase">© 2026 Kalyanam Royale. All Rights Reserved.</p>
          
          <div className="mt-6 flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
            <span className="text-[9px] tracking-[0.3em] uppercase text-ivory/40 font-bold">By</span>
            <img src="/bitsu_logo_2.png" alt="bitsuCreation" className="h-8 object-contain" />
          </div>
        </div>
      </div>

      {/* Decorative floral corners */}
      <div className="absolute -bottom-10 -left-10 w-64 h-64 opacity-20 pointer-events-none">
        <img src="https://www.transparenttextures.com/patterns/floral-paper.png" alt="" className="w-full h-full invert" />
      </div>
      <div className="absolute -bottom-10 -right-10 w-64 h-64 opacity-20 pointer-events-none rotate-180">
        <img src="https://www.transparenttextures.com/patterns/floral-paper.png" alt="" className="w-full h-full invert" />
      </div>
    </footer>
  );
}

function SocialIcon({ icon: Icon, href }: { icon: any; href: string }) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.2, rotate: 10 }}
      whileTap={{ scale: 0.9 }}
      className="w-12 h-12 rounded-full border border-gold-metallic/30 flex items-center justify-center text-gold-metallic hover:bg-gold-metallic hover:text-maroon-dark transition-all duration-300"
    >
      <Icon size={20} />
    </motion.a>
  );
}
