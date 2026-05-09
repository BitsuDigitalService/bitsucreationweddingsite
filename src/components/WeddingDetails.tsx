import { motion } from 'motion/react';
import { Calendar, MapPin, Users, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function WeddingDetails() {
  const { state } = useApp();

  const cards = [
    {
      title: "Date",
      info: "12th - 14th",
      subInfo: "May 2026",
      icon: Calendar,
      delay: 0.1
    },
    {
      title: "Main Venue",
      info: "Dungrigora",
      subInfo: "Bokaro Steel City",
      icon: MapPin,
      delay: 0.2
    },
    {
      title: "Events",
      info: "4 Main Rituals",
      subInfo: "& Celebration",
      icon: Users,
      delay: 0.3
    }
  ];

  return (
    <section id="events" className="py-32 bg-maroon-dark relative">
      <div className="absolute inset-0 mandala-pattern opacity-10"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center mb-20 text-center">
           <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-4"
          >
             <div className="h-[1px] w-12 bg-gold-metallic"></div>
             <Calendar size={20} className="text-gold-metallic" />
             <div className="h-[1px] w-12 bg-gold-metallic"></div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-6xl md:text-7xl text-gold-metallic mb-6"
          >
            Wedding Details
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-ivory/60 max-w-xl font-garamond text-xl italic"
          >
            Families warmly invite relatives and guests to attend the wedding ceremonies and bless the couples.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-32 justify-center max-w-5xl mx-auto">
          {cards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: card.delay, duration: 0.8 }}
              whileHover={{ y: -15 }}
              className="p-10 rounded-[3rem] glass-morphism flex flex-col items-center text-center group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 mandala-pattern opacity-[0.02] group-hover:opacity-[0.08] transition-opacity duration-500"></div>
              <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:left-full transition-all duration-1000 ease-in-out"></div>

              <div className="w-20 h-20 rounded-2xl bg-gold-metallic/5 border border-gold-metallic/20 flex items-center justify-center mb-8 group-hover:bg-gold-metallic group-hover:rotate-[360deg] transition-all duration-1000 shadow-[0_0_0px_rgba(212,175,55,0.4)] group-hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] relative z-10">
                 <card.icon size={32} className="text-gold-metallic group-hover:text-maroon-dark transition-colors duration-500" />
              </div>
              
              <h3 className="uppercase tracking-[0.4em] text-gold-metallic/60 text-[10px] font-bold mb-4 relative z-10">{card.title}</h3>
              <p className="text-ivory text-xl font-serif mb-1 group-hover:text-gold-light transition-colors relative z-10">{card.info}</p>
              <p className="text-ivory/40 font-sans text-xs tracking-[0.2em] uppercase relative z-10">{card.subInfo}</p>
              
              <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-gold-metallic/20 group-hover:border-gold-metallic/100 transition-colors"></div>
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-gold-metallic/20 group-hover:border-gold-metallic/100 transition-colors"></div>
            </motion.div>
          ))}
        </div>

        {/* Traditional Invite Card Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto bg-maroon-deep/40 text-gold-light p-6 md:p-12 rounded-sm shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden font-serif border border-gold-metallic/20 backdrop-blur-sm"
          style={{ backgroundImage: "radial-gradient(rgba(212, 175, 55, 0.15) 1px, transparent 1px)", backgroundSize: "32px 32px", backgroundPosition: "0 0" }}
        >
          {/* Overlay to soften the dot pattern */}
          <div className="absolute inset-0 bg-maroon-dark/60 pointer-events-none"></div>

          {/* Outer Border */}
          <div className="absolute inset-4 border-[2px] border-gold-metallic/50 pointer-events-none"></div>
          {/* Inner Border */}
          <div className="absolute inset-5 border border-gold-metallic/30 pointer-events-none"></div>

          {/* Decorative Corner Ornaments */}
          <div className="absolute top-2 left-2 w-16 h-16 pointer-events-none">
             <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-gold-metallic/60">
                <path d="M0 0 L50 0 C50 20 20 50 0 50 Z" />
                <path d="M0 60 C30 60 60 30 60 0 L70 0 C70 40 40 70 0 70 Z" />
                <circle cx="20" cy="20" r="5" />
             </svg>
          </div>
          <div className="absolute top-2 right-2 w-16 h-16 pointer-events-none rotate-90">
             <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-gold-metallic/60">
                <path d="M0 0 L50 0 C50 20 20 50 0 50 Z" />
                <path d="M0 60 C30 60 60 30 60 0 L70 0 C70 40 40 70 0 70 Z" />
                <circle cx="20" cy="20" r="5" />
             </svg>
          </div>
          <div className="absolute bottom-2 right-2 w-16 h-16 pointer-events-none rotate-180">
             <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-gold-metallic/60">
                <path d="M0 0 L50 0 C50 20 20 50 0 50 Z" />
                <path d="M0 60 C30 60 60 30 60 0 L70 0 C70 40 40 70 0 70 Z" />
                <circle cx="20" cy="20" r="5" />
             </svg>
          </div>
          <div className="absolute bottom-2 left-2 w-16 h-16 pointer-events-none -rotate-90">
             <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-gold-metallic/60">
                <path d="M0 0 L50 0 C50 20 20 50 0 50 Z" />
                <path d="M0 60 C30 60 60 30 60 0 L70 0 C70 40 40 70 0 70 Z" />
                <circle cx="20" cy="20" r="5" />
             </svg>
          </div>

          <div className="relative z-10 py-6 px-2 md:px-8 flex flex-col items-center">
            
            {/* 3. Religious heading text centered */}
            <h3 className="font-bold text-2xl md:text-[28px] mb-8 tracking-wide text-gold-metallic">!! जोहार मराड बुरु !!</h3>

            {/* 4 & 5. Symbol and Side Texts */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-10 w-full mb-8">
              <div className="text-[22px] md:text-[26px] font-bold whitespace-nowrap text-gold-light">जोहार सिंगे चांदो</div>
              
              {/* Emblem */}
              <div className="w-24 h-24 relative flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 text-gold-metallic fill-none stroke-current">
                  <circle cx="50" cy="50" r="46" strokeWidth="2" />
                  <polygon points="50,10 65,38 95,38 72,55 82,85 50,65 18,85 28,55 5,38 35,38" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M50 0 L50 100 M0 50 L100 50 M15 15 L85 85 M15 85 L85 15" strokeWidth="1" />
                </svg>
              </div>

              <div className="text-[22px] md:text-[26px] font-bold whitespace-nowrap text-gold-light">जोहार मिंडू चांदो</div>
            </div>

            {/* 6. Traditional invitation blessing paragraph */}
            <div className="text-center text-[19px] md:text-[22px] font-bold leading-[1.8] max-w-2xl mx-auto mb-6">
              <p>देगो पड़े आले ओंडेर आपकोये वेने विंद केते मिद गेले</p>
              <p>बांदो दोन कुसी-खांदे, समृध बापला नेतेगोन</p>
            </div>

            {/* 7. Decorative flourish divider */}
            <FlourishDivider />

            {/* 8. Main ceremony date details */}
            <div className="text-center font-bold text-[18px] md:text-[21px] space-y-4 my-10 w-full">
              <p>लेखा माहित - 10.05.2026 (सिंगे माहा) गिरा़ तोल (शुभ लगन)</p>
              <p>लेखा माहित - 11.05.2026 (ओते माहा) जावांय होरोक् (वर तिलक)</p>
              <p>लेखा माहित - 12.05.2026 (बाले माहा) माड़वा आर ञिंदा़ सा़गुन बापला (शुभ विवाह)</p>
              <p>लेखा माहित - 14.05.2026 (सा़रदी माहा) माड़वा आर ञिंदा़ सा़गुन बापला (शुभ विवाह)</p>
            </div>

            {/* 9. First framed box */}
            <FramedBox>
              ला़क्तियान काथा - लेखा माहित 12.05.2026 (बाले माहा) संदीप हाँस्दा<br/>
              साँव आशा टुडू ता़किनाक् बापला आर लेखा माहित 14.05.2026<br/>
              (सा़रदी माहा) आनंद हाँस्दा साँव सुशीला सोरेन ता़किनाक् बापला।
            </FramedBox>

            {/* 10. Second framed box */}
            <FramedBox>
              ला़क्तियान काथा - लेखा माहित 12.05.2026 (बाले माहा)<br/>
              आले आ़तु डुँगरीगोड़ा खोन बा़रयात, ओक्तो - ञिंदा 9 बजे<br/>
              खुटरी (मोंगलाडीह) ला़गित् ताड़ाम हुयुक् आ, आर लेखा माहित 14.05.2026<br/>
              (सा़रदी माहा) आ़तु डुँगरीगोड़ा खोन बा़रयात ओक्तो - ञिंदा 9 बजे - बाँधघुटू<br/>
              ला़गित् ताड़ाम हुयुक् - आ।
            </FramedBox>

            {/* 11. Bottom reception section */}
            <div className="text-center font-bold text-[18px] md:text-[21px] leading-[1.8] mt-10 mb-6 max-w-3xl space-y-2">
              <p>आर मित् ला़क्तियान काथा - लेखा माहित 15.05.2026 (जा़रूम माहा)</p>
              <p>बा़हुदाका (प्रीतिभोज) जोम साँव मित ञिंदा दोंङ आर DJ लागड़ें एनेच्।</p>
              <p>ओक्तो - आ़युप् बेड़ा 5 बजे खोन आपे सेटेरोक् धा़बिच्</p>
            </div>

            {/* 12. Decorative flourish divider */}
            <FlourishDivider />

          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FlourishDivider() {
  return (
    <div className="flex items-center justify-center w-full max-w-[280px] md:max-w-md mx-auto my-6 gap-3">
      <div className="h-[1px] flex-1 bg-gold-metallic/50 relative">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-gold-metallic bg-maroon-dark"></div>
      </div>
      <div className="text-2xl md:text-3xl mx-2 text-gold-metallic">❀</div>
      <div className="h-[1px] flex-1 bg-gold-metallic/50 relative">
         <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-gold-metallic bg-maroon-dark"></div>
      </div>
    </div>
  );
}

function FramedBox({ children }: { children: import('react').ReactNode }) {
  return (
    <div className="w-full max-w-3xl mx-auto my-6 relative p-6 md:p-8 flex justify-center items-center bg-maroon-deep/30">
      {/* Complex framed borders */}
      <div className="absolute inset-0 border border-gold-metallic/40 rounded-[1rem]"></div>
      <div className="absolute inset-[6px] border-[0.5px] border-gold-metallic/20 rounded-[0.5rem]"></div>
      
      {/* Decorative side cutouts (simulating traditional Indian bracket frames) */}
      <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-6 h-20 bg-maroon-dark border-y border-r border-gold-metallic/40 rounded-r-[1rem] z-0"></div>
      <div className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-6 h-20 bg-maroon-dark border-y border-l border-gold-metallic/40 rounded-l-[1rem] z-0"></div>

      {/* Inner corner dots for extra detail */}
      <div className="absolute top-3 left-3 w-1.5 h-1.5 bg-gold-metallic/60 rounded-full"></div>
      <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-gold-metallic/60 rounded-full"></div>
      <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-gold-metallic/60 rounded-full"></div>
      <div className="absolute bottom-3 right-3 w-1.5 h-1.5 bg-gold-metallic/60 rounded-full"></div>

      <div className="relative z-10 text-center font-bold text-[17px] md:text-[20px] leading-[1.8] text-ivory/90 w-full">
        {children}
      </div>
    </div>
  );
}
