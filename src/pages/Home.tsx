import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import LoveStory from '../components/LoveStory';
import WeddingDetails from '../components/WeddingDetails';
import FamilyInvitation from '../components/FamilyInvitation';
import Gallery from '../components/Gallery';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

export default function Home() {
  const { state } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative z-10"
    >
      <Hero />
      <LoveStory />
      <WeddingDetails />
      <FamilyInvitation />
      <Gallery />
      <Footer />
    </motion.div>
  );
}
