import { motion } from 'motion/react';
import { Handshake } from 'lucide-react';

export default function FamilyInvitation() {
  const groom1 = {
    title: "बा़बु संदीप हाँस्दा",
    subtitle: "(ताला होपोन)",
    details: [
      { label: 'आयो', value: 'पर्दावती देवी' },
      { label: 'बाबा', value: '(बोंगा ताला)\nछोटे लाल हाँस्दा' },
      { label: 'आ़तु', value: 'डुंँगरीगोड़ा' },
      { label: 'डाक ओड़ाक्', value: 'घटियाली' },
      { label: 'पुलिस ठांव', value: 'पिन्ड्राजोरा' },
      { label: 'जिला', value: 'बोकारो (झारखण्ड)' },
      { label: 'पिन', value: '827010' }
    ]
  };

  const bride1 = {
    title: "मा़य आशा टुडू",
    subtitle: "(हुडिंञ होपोन एरा)",
    details: [
      { label: 'आयो', value: 'चाँदमुनी टुडू' },
      { label: 'बाबा', value: 'बाबुलाल टुडू' },
      { label: 'आ़तु', value: 'खुटरी (मोंगलाडीह)' },
      { label: 'डाक ओड़ाक्', value: 'तुपकाडीह' },
      { label: 'पुलिस ठांव', value: 'जरीडीह' },
      { label: 'जिला', value: 'बोकारो (झारखण्ड)' },
      { label: 'पिन', value: '827010' }
    ]
  };

  const groom2 = {
    title: "बा़बु आनंद हाँस्दा",
    subtitle: "(हुडिंञ होपोन)",
    details: [
      { label: 'आयो', value: 'पर्दावती देवी' },
      { label: 'बाबा', value: '(बोंगा ताला)\nछोटे लाल हाँस्दा' },
      { label: 'आ़तु', value: 'डुंँगरीगोड़ा' },
      { label: 'डाक ओड़ाक्', value: 'घटियाली' },
      { label: 'पुलिस ठांव', value: 'पिन्ड्राजोरा' },
      { label: 'जिला', value: 'बोकारो (झारखण्ड)' },
      { label: 'पिन', value: '827010' }
    ]
  };

  const bride2 = {
    title: "मा़य सुशीला सोरेन",
    subtitle: "(हुडिंञ सांझली)",
    details: [
      { label: 'आयो', value: 'जगदम्बा देवी' },
      { label: 'बाबा', value: 'रूपचाँद सोरेन' },
      { label: 'आ़तु', value: 'बाँधघुटू' },
      { label: 'डाक ओड़ाक्', value: 'घटियाली' },
      { label: 'पुलिस ठांव', value: 'पिन्ड्राजोरा' },
      { label: 'जिला', value: 'बोकारो (झारखण्ड)' },
      { label: 'पिन', value: '827010' }
    ]
  };

  return (
    <section className="py-20 bg-maroon-dark relative">
      <div className="absolute inset-0 mandala-pattern opacity-10"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
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
            
            {/* Top Heading */}
            <div className="text-center mb-4">
               <h3 className="font-bold text-[22px] md:text-[28px] tracking-wide mb-1">मानोतान ओंकोर,</h3>
               <h3 className="font-bold text-[20px] md:text-[24px] tracking-wide">सिरिसिरियातु आर मिरुस्यातु बेचोते</h3>
            </div>

            {/* Thin ornamental divider below heading */}
            <div className="w-32 h-[1px] bg-gold-metallic/40 mb-12 flex justify-center items-center relative">
               <div className="absolute w-2 h-2 bg-gold-metallic/60 rounded-full rotate-45"></div>
            </div>

            {/* Main Layout - Desktop */}
            <div className="hidden md:flex flex-col gap-12 w-full max-w-[850px] relative mb-12">
               
               {/* Row 1 */}
               <div className="flex items-center justify-between w-full relative">
                  <div className="w-[42%]">
                     <FamilyBox {...groom1} />
                  </div>
                  <div className="flex flex-col items-center bg-transparent z-20 px-2 flex-shrink-0">
                     <span className="font-display text-[26px] mb-1 text-gold-metallic">साँव</span>
                     <Handshake size={52} strokeWidth={1} className="text-gold-metallic/80" />
                  </div>
                  <div className="w-[42%]">
                     <FamilyBox {...bride1} />
                  </div>
               </div>

               {/* Row 2 */}
               <div className="flex items-center justify-between w-full relative">
                  <div className="w-[42%]">
                     <FamilyBox {...groom2} />
                  </div>
                  <div className="flex flex-col items-center bg-transparent z-20 px-2 flex-shrink-0">
                     <span className="font-display text-[26px] mb-1 text-gold-metallic">साँव</span>
                     <Handshake size={52} strokeWidth={1} className="text-gold-metallic/80" />
                  </div>
                  <div className="w-[42%]">
                     <FamilyBox {...bride2} />
                  </div>
               </div>
            </div>

            {/* Main Layout - Mobile Stack */}
            <div className="flex flex-col md:hidden w-full gap-6 relative mb-12">
               <FamilyBox {...groom1} />
               <div className="flex flex-col items-center py-2">
                  <span className="font-display text-2xl mb-1 text-gold-metallic">साँव</span>
                  <Handshake size={48} strokeWidth={1} className="text-gold-metallic/80" />
               </div>
               <FamilyBox {...bride1} />

               <div className="w-full flex justify-center items-center py-4">
                  <div className="text-xl text-gold-metallic opacity-60">❧ ❧ ❧</div>
               </div>

               <FamilyBox {...groom2} />
               <div className="flex flex-col items-center py-2">
                  <span className="font-display text-2xl mb-1 text-gold-metallic">साँव</span>
                  <Handshake size={48} strokeWidth={1} className="text-gold-metallic/80" />
               </div>
               <FamilyBox {...bride2} />
            </div>

            {/* Bottom Invitation Note */}
            <div className="text-center font-bold text-[18px] md:text-[21px] leading-[1.8] mt-4 mb-8">
              <p>सा़गुन बापला ओक्तो रे</p>
              <p>जोतो नेवता पेड़ा आ़शिष दुला़ड़ चाल ला़गित् सेटेरोक् पे ।</p>
            </div>

            {/* Thin divider */}
            <div className="w-64 h-[1px] bg-gold-metallic/30 my-6"></div>

            {/* Family Invitation List */}
            <div className="text-center md:text-left font-bold text-[17px] md:text-[19px] leading-[1.8] max-w-2xl w-full text-gold-light">
              <p className="mb-2">पेड़ा दाराम को :-</p>
              <p>मानोतान - प्रदीप हाँस्दा, लक्ष्मण, लंकैश, हेमलाल, मंजेश,</p>
              <p>राहुल आर जोतो हाँस्दा बाखोल रेन कोड़ा को ।</p>
            </div>

            {/* Decorative bottom divider */}
            <div className="flex items-center justify-center w-full max-w-[280px] md:max-w-md mx-auto mt-12 mb-4 gap-3">
              <div className="h-[1px] flex-1 bg-gold-metallic/50 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-gold-metallic bg-maroon-dark"></div>
              </div>
              <div className="text-2xl md:text-3xl mx-2 text-gold-metallic">❀</div>
              <div className="h-[1px] flex-1 bg-gold-metallic/50 relative">
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-gold-metallic bg-maroon-dark"></div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FamilyBox({ title, subtitle, details }: any) {
  return (
    <div className="relative p-6 md:p-8 border border-gold-metallic/40 bg-maroon-deep/30 flex flex-col items-center w-full rounded-sm">
      {/* Decorative corner accents */}
      <div className="absolute top-1 left-1 w-4 h-4 border-t border-l border-gold-metallic/60"></div>
      <div className="absolute top-1 right-1 w-4 h-4 border-t border-r border-gold-metallic/60"></div>
      <div className="absolute bottom-1 left-1 w-4 h-4 border-b border-l border-gold-metallic/60"></div>
      <div className="absolute bottom-1 right-1 w-4 h-4 border-b border-r border-gold-metallic/60"></div>
      
      {/* Vintage dots styling */}
      <div className="absolute top-2 left-2 w-1 h-1 bg-gold-metallic/60 rounded-full"></div>
      <div className="absolute top-2 right-2 w-1 h-1 bg-gold-metallic/60 rounded-full"></div>
      <div className="absolute bottom-2 left-2 w-1 h-1 bg-gold-metallic/60 rounded-full"></div>
      <div className="absolute bottom-2 right-2 w-1 h-1 bg-gold-metallic/60 rounded-full"></div>

      <div className="relative z-10 flex flex-col items-center w-full mt-2">
        <h4 className="font-bold text-[20px] md:text-[22px] text-center mb-0 leading-tight text-gold-light">{title}</h4>
        <p className="font-bold text-[17px] md:text-[19px] text-center mb-6 text-gold-metallic/80">{subtitle}</p>

        <div className="flex flex-col items-center gap-[6px] w-full text-[16px] md:text-[18px] font-medium text-center text-ivory/90">
          {details.map((row: any, i: number) => (
            <p key={i} className="whitespace-pre-wrap leading-snug">
               {row.label} - {row.value}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
