import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, LogOut, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminStatus } from '../hooks/useAdminStatus';
import { clearAdminAuth } from '../lib/adminAuth';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = useAdminStatus();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (location.pathname === '/admin') return null;

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Our Story', href: '/#story' },
    { name: 'Events', href: '/#events' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Admin', href: '/admin' },
  ];

  const handleLinkClick = (href: string) => {
    setIsMenuOpen(false);
    if (href.startsWith('/#') && location.pathname === '/') {
      const element = document.getElementById(href.substring(2));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    clearAdminAuth();
    navigate('/');
  };

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-500 ${
        isScrolled ? 'py-2 glass-morphism' : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="min-w-[120px] flex items-center">
          {isAdmin ? (
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-gold-metallic/30 bg-maroon-dark/60 px-3 py-1.5 text-gold-metallic backdrop-blur-sm"
            >
              <Crown size={14} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Admin</span>
            </motion.div>
          ) : null}
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, idx) => (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link
                to={link.href}
                onClick={() => handleLinkClick(link.href)}
                className="text-ivory/80 hover:text-gold-metallic text-sm uppercase tracking-widest font-medium relative group transition-colors px-2 py-1"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-metallic transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {isAdmin ? (
            <button
              onClick={handleLogout}
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-ivory/80 transition-colors hover:border-gold-metallic/40 hover:text-gold-metallic"
            >
              <LogOut size={14} />
              Logout
            </button>
          ) : null}

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-ivory p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed inset-0 top-0 left-0 w-full h-[60vh] glass-morphism z-[-1] flex flex-col items-center justify-center gap-6 pt-16 rounded-b-[40px]"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => handleLinkClick(link.href)}
                className="text-ivory text-xl uppercase tracking-widest font-medium hover:text-gold-metallic transition-colors"
              >
                {link.name}
              </Link>
            ))}
            {isAdmin ? (
              <button
                onClick={handleLogout}
                className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-ivory text-base uppercase tracking-widest font-medium hover:text-gold-metallic transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
