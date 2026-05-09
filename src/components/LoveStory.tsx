import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COUPLE_1, COUPLE_2 } from '../constants';

export default function LoveStory() {
  const { state } = useApp();
  return (
    <section id="story" className="py-32 bg-ivory text-maroon-dark relative">
      {/* Background patterns */}
      <div className="absolute inset-0 mandala-pattern opacity-5"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-3 items-start gap-12 lg:gap-16">
          {/* Couple 1 Section */}
          <div className="flex flex-col items-center">
            <StoryPhoto couple={state.couples.couple1} reverse={false} fallbackImage={COUPLE_1.imageUrl} />

            <div className="w-full grid grid-cols-2 gap-4 mt-8">
               <FamilyInfo title={state.couples.couple1.name1} family={state.couples.couple1.family1} />
               <FamilyInfo title={state.couples.couple1.name2} family={state.couples.couple1.family2} />
            </div>
          </div>

          {/* Center Royal Monogram */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center mb-12 lg:mb-0 relative lg:sticky lg:top-32"
          >
             <div className="relative w-80 h-80 flex items-center justify-center mt-12">
                {/* Royal Wreath Decoration */}
                <div className="absolute inset-0 z-0 opacity-20 rotate-12 scale-110">
                  <svg viewBox="0 0 200 200" className="w-full h-full text-maroon-deep fill-current">
                     <path d="M100 20C80 20 60 30 50 50C40 70 45 90 60 100C45 110 40 130 50 150C60 170 80 180 100 180C120 180 140 170 150 150C160 130 155 110 140 100C155 90 160 70 150 50C140 30 120 20 100 20Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                     {[...Array(8)].map((_, i) => (
                       <g key={i} transform={`rotate(${i * 45} 100 100)`}>
                          <path d="M100 30 Q110 10 100 5 Q90 10 100 30" />
                       </g>
                     ))}
                  </svg>
                </div>

                {/* Outer Glow & Borders */}
                <div className="absolute inset-2 rounded-full border border-gold-metallic/20 animate-pulse"></div>
                <div className="absolute inset-6 rounded-full border-2 border-gold-metallic/10"></div>

                {/* Main Seal Body */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-60 h-60 rounded-full border-2 border-maroon-deep bg-gradient-to-br from-white via-ivory to-white shadow-[0_40px_80px_rgba(74,4,4,0.15)] z-10 flex flex-col items-center justify-center relative p-8 group border-double border-4"
                >
                    <div className="absolute inset-0 mandala-pattern opacity-[0.05]"></div>
                    
                    <div className="flex flex-col items-center">
                      <span className="font-display text-7xl text-maroon-deep mb-[-10px] leading-tight drop-shadow-sm group-hover:text-gold-dark transition-colors duration-500">SA</span>
                      <div className="flex items-center gap-4 w-32">
                         <div className="h-[1px] flex-1 bg-gold-metallic/40"></div>
                         <Heart size={14} className="text-maroon-deep fill-maroon-deep/20" />
                         <div className="h-[1px] flex-1 bg-gold-metallic/40"></div>
                      </div>
                      <span className="font-display text-7xl text-maroon-deep mt-[-10px] leading-tight drop-shadow-sm group-hover:text-gold-dark transition-colors duration-500">AS</span>
                    </div>

                    <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:left-full transition-all duration-1000 ease-in-out"></div>
                </motion.div>

                {/* Floating Floral Elements */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                   <div className="w-12 h-12 bg-white rounded-full shadow-lg border border-maroon-deep/5 flex items-center justify-center text-2xl">🌹</div>
                   <div className="h-12 w-[1px] bg-gradient-to-b from-maroon-deep/20 to-transparent"></div>
                </div>
                
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                   <div className="h-12 w-[1px] bg-gradient-to-t from-maroon-deep/20 to-transparent"></div>
                   <div className="w-12 h-12 bg-white rounded-full shadow-lg border border-maroon-deep/5 flex items-center justify-center text-2xl">🌹</div>
                </div>

                <div className="absolute top-1/2 -left-12 -translate-y-1/2 flex items-center z-20">
                   <div className="w-10 h-10 bg-white rounded-full shadow-md border border-maroon-deep/5 flex items-center justify-center text-xl">🌸</div>
                   <div className="w-8 h-[1px] bg-gradient-to-r from-maroon-deep/20 to-transparent"></div>
                </div>

                <div className="absolute top-1/2 -right-12 -translate-y-1/2 flex items-center z-20">
                   <div className="w-8 h-[1px] bg-gradient-to-l from-maroon-deep/20 to-transparent"></div>
                   <div className="w-10 h-10 bg-white rounded-full shadow-md border border-maroon-deep/5 flex items-center justify-center text-xl">🌸</div>
                </div>
             </div>
          </motion.div>

          {/* Couple 2 Section */}
          <div className="flex flex-col items-center">
            <StoryPhoto couple={state.couples.couple2} reverse={true} fallbackImage={COUPLE_2.imageUrl} />

            <div className="w-full grid grid-cols-2 gap-4 mt-8">
               <FamilyInfo title={state.couples.couple2.name1} family={state.couples.couple2.family1} />
               <FamilyInfo title={state.couples.couple2.name2} family={state.couples.couple2.family2} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FamilyInfo({ title, family }: { title: string, family: any }) {
  if (!family) return null;
  return (
    <div className="text-center">
      <h4 className="font-display text-xl text-maroon-deep mb-2 border-b border-gold-metallic/30 pb-1">{title}'s Family</h4>
      <div className="text-xs font-sans text-maroon-dark/70 space-y-1 leading-relaxed">
        <p><span className="font-bold text-gold-metallic">P:</span> {family.father} & {family.mother}</p>
        <p><span className="font-bold text-gold-metallic">V:</span> {family.village}</p>
        <p><span className="font-bold text-gold-metallic">PO/PS:</span> {family.po}, {family.ps}</p>
        <p><span className="font-bold text-gold-metallic">Dist:</span> {family.district}</p>
        <p className="text-[10px] text-maroon-dark/50">PIN: {family.pin}</p>
      </div>
    </div>
  );
}

function StoryPhoto({ couple, reverse, fallbackImage }: { couple: any; reverse: boolean; fallbackImage: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, x: reverse ? 50 : -50 }}
      whileInView={{ opacity: 1, scale: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative group cursor-pointer w-full max-w-sm"
    >
      <div className="rounded-[4rem] overflow-hidden shadow-[0_20px_50px_rgba(74,4,4,0.15)] border-4 border-white aspect-[4/5] relative">
        <CoupleImage
          src={couple.imageUrl}
          fallbackImage={fallbackImage}
          alt={`${couple.name1} & ${couple.name2}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-12 text-center">
          <h3 className="font-display text-5xl text-gold-light mb-2">{couple.name1} Weds {couple.name2}</h3>
          <div className="h-[2px] w-24 bg-gold-metallic mx-auto scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-100"></div>
        </div>
      </div>
      
      <div className="absolute -top-6 -left-6 w-20 h-20 border-t-4 border-l-4 border-maroon-deep/20 rounded-tl-[3rem] pointer-events-none"></div>
      <div className="absolute -bottom-6 -right-6 w-20 h-20 border-b-4 border-r-4 border-maroon-deep/20 rounded-br-[3rem] pointer-events-none"></div>
    </motion.div>
  );
}

function CoupleImage({ src, fallbackImage, alt }: { src: string; fallbackImage: string; alt: string }) {
  const imageSrc = src && !src.startsWith('blob:') ? src : fallbackImage;

  return (
    <img
      src={imageSrc}
      alt={alt}
      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 select-none pointer-events-none"
      onContextMenu={(e) => e.preventDefault()}
      onError={(e) => {
        if (e.currentTarget.src !== fallbackImage) {
          e.currentTarget.src = fallbackImage;
        }
      }}
      draggable={false}
    />
  );
}
