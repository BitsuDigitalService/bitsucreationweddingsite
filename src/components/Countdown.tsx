import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

export default function Countdown() {
  const { state } = useApp();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(state.weddingDate));

  function calculateTimeLeft(weddingDate: string) {
    const targetDate = new Date(weddingDate);
    const difference = +targetDate - +new Date();
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(state.weddingDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [state.weddingDate]);

  const items = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <section className="py-24 bg-maroon-deep relative overflow-hidden">
      {/* Decorative center mandala */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 mandala-pattern opacity-10 rounded-full scale-150"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="flex flex-col items-center gap-12"
        >
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-8 md:w-16 bg-gold-metallic"></div>
            <h2 className="text-gold-metallic uppercase tracking-[0.4em] text-sm md:text-lg font-semibold">The Journey Begins In</h2>
            <div className="h-[1px] w-8 md:w-16 bg-gold-metallic"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 w-full max-w-4xl">
            {items.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center p-8 glass-morphism rounded-3xl relative group transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]"
              >
                {/* Glow border on hover */}
                <div className="absolute inset-0 rounded-3xl border border-transparent group-hover:border-gold-metallic/30 transition-colors pointer-events-none"></div>
                
                <span className="text-4xl md:text-6xl font-serif text-gold-metallic mb-2">
                  {item.value < 10 ? `0${item.value}` : item.value}
                </span>
                <span className="text-ivory/60 uppercase tracking-[0.2em] text-[10px] md:text-xs">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
