import { Couple, EventDetail, GalleryItem } from './types';

export const COUPLE_1: Couple = {
  name1: "Sandeep",
  name2: "Asha",
  story: "",
  imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800&h=1000",
  family1: {
    father: "Chhote Lal Hansda (छोटे लाल हाँसदा)",
    mother: "Parbawati Devi (परबावती देवी)",
    village: "Dungrigoda (डुँगरीगोड़ा)",
    po: "Ghatiyali (घटियाली)",
    ps: "Pindrajora (पिन्ड्राजोरा)",
    district: "Bokaro, Jharkhand",
    pin: "827010"
  },
  family2: {
    father: "Chabulal Tudu (चाबुलाल टुडू)",
    mother: "Wokmuni Tudu (वॉकमुनी टुडू)",
    village: "Khutri (Mongladih) (खुटरी (मोंगलाडीह))",
    po: "Tupkadih (तुपकाडीह)",
    ps: "Jaridih (जरीडीह)",
    district: "Bokaro, Jharkhand",
    pin: "827010"
  }
};

export const COUPLE_2: Couple = {
  name1: "Anand",
  name2: "Sushila",
  story: "",
  imageUrl: "https://images.unsplash.com/photo-1595914146118-2e1f488a0110?auto=format&fit=crop&q=80&w=800&h=1000",
  family1: {
    father: "Chhote Lal Hansda (छोटे लाल हाँसदा)",
    mother: "Parbawati Devi (परबावती देवी)",
    village: "Dungrigoda (डुँगरीगोड़ा)",
    po: "Ghatiyali (घटियाली)",
    ps: "Pindrajora (पिन्ड्राजोरा)",
    district: "Bokaro, Jharkhand",
    pin: "827010"
  },
  family2: {
    father: "Roopchand Soren (रूपचाँद सोरेन)",
    mother: "Jagdamba Devi (जगदम्बा देवी)",
    village: "Bandhghutu (बाँधघुटू)",
    po: "Ghatiyali (घटियाली)",
    ps: "Pindrajora (पिन्ड्राजोरा)",
    district: "Bokaro, Jharkhand",
    pin: "827010"
  }
};

export const EVENTS: EventDetail[] = [
  {
    id: "1",
    title: "तेका माटिन",
    date: "10th May 2026",
    time: "Sunday Night",
    venue: "Groom's Residence",
    icon: "music"
  },
  {
    id: "2",
    title: "तेका माटिन",
    date: "11th May 2026",
    time: "Monday Night",
    venue: "Bride's Residence",
    icon: "music"
  },
  {
    id: "3",
    title: "बारात आगमन",
    date: "12th May 2026",
    time: "Tuesday Morning",
    venue: "Bride's Residence",
    icon: "heart"
  },
  {
    id: "4",
    title: "सगुन बपला",
    date: "14th May 2026",
    time: "Thursday Night",
    venue: "Wedding Venue",
    icon: "glass"
  }
];

export const GALLERY: GalleryItem[] = [
  {
    url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200",
    category: "Decor",
    title: "The Royal Mandap"
  },
  {
    url: "https://images.unsplash.com/photo-1623091423319-5087462c161a?auto=format&fit=crop&q=80&w=1200",
    category: "Rituals",
    title: "Haldi Moments"
  },
  {
    url: "https://images.unsplash.com/photo-1604336746033-0fb66ad93678?auto=format&fit=crop&q=80&w=1200",
    category: "Couple",
    title: "Eternal Promise"
  },
  {
    url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=1200",
    category: "Venue",
    title: "Lotus Palace at Night"
  },
  {
    url: "https://images.unsplash.com/photo-1604336745145-21d4df39c9da?auto=format&fit=crop&q=80&w=1200",
    category: "Rituals",
    title: "Mehendi Art"
  }
];

export const WEDDING_DATE = new Date("2024-12-25T10:00:00");
