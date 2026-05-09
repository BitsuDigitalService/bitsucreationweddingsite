import { motion } from 'motion/react';
import { Mail, Check } from 'lucide-react';
import { useState } from 'react';

export default function RSVPSection() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="rsvp" className="py-32 bg-ivory text-maroon-dark relative">
      <div className="absolute inset-0 mandala-pattern opacity-10"></div>
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gold-metallic/10">
          <div className="md:w-1/3 bg-maroon-deep p-12 text-gold-metallic flex flex-col justify-center items-center text-center">
             <Mail size={48} className="mb-6 opacity-50" />
             <h3 className="font-display text-5xl mb-4">RSVP</h3>
             <p className="font-garamond text-xl italic text-gold-light/80">Kindly let us know if you can join us for the celebrations.</p>
          </div>

          <div className="md:w-2/3 p-12 md:p-16">
            {!submitted ? (
              <form 
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-maroon-deep/40">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Your Name"
                      className="w-full bg-ivory/50 border-b-2 border-maroon-deep/10 focus:border-gold-metallic outline-none p-3 transition-colors font-serif italic"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-maroon-deep/40">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="your@email.com"
                      className="w-full bg-ivory/50 border-b-2 border-maroon-deep/10 focus:border-gold-metallic outline-none p-3 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-maroon-deep/40">Will you attend?</label>
                  <select className="w-full bg-ivory/50 border-b-2 border-maroon-deep/10 focus:border-gold-metallic outline-none p-3 transition-colors appearance-none">
                    <option>Yes, I'll be there!</option>
                    <option>Sorry, I can't make it</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-maroon-deep/40">Number of Guests</label>
                  <input 
                    type="number" 
                    min="1"
                    placeholder="1"
                    className="w-full bg-ivory/50 border-b-2 border-maroon-deep/10 focus:border-gold-metallic outline-none p-3 transition-colors"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-maroon-deep text-gold-metallic py-4 rounded-xl uppercase tracking-[0.3em] text-xs font-bold shadow-xl hover:shadow-maroon-deep/20 transition-all mt-4"
                >
                  Send Response
                </motion.button>
              </form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-4">
                  <Check size={40} />
                </div>
                <h4 className="font-display text-4xl text-maroon-deep">Thank You!</h4>
                <p className="text-maroon-dark/60 italic font-garamond text-lg">We have received your RSVP. We can't wait to see you!</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-gold-metallic uppercase tracking-widest text-[10px] font-bold hover:underline underline-offset-8 mt-4"
                >
                  Send another response
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
