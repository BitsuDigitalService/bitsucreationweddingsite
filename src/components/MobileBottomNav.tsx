import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Bell, Plus, Image, User, Crown, X } from 'lucide-react';
import { useAdminStatus } from '../hooks/useAdminStatus';

export default function MobileBottomNav() {
  const isAdmin = useAdminStatus();
  const location = useLocation();
  const navigate = useNavigate();
  const [showGuestAlert, setShowGuestAlert] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'events' | 'upload' | 'gallery' | 'admin'>('home');

  useEffect(() => {
    const path = location.pathname;
    const hash = location.hash;

    if (path === '/gallery') {
      setActiveTab('gallery');
    } else if (path === '/admin') {
      setActiveTab('admin');
    } else if (path === '/' && hash === '#events') {
      setActiveTab('events');
    } else {
      setActiveTab('home');
    }
  }, [location]);

  const handleNav = (tab: typeof activeTab, e: React.MouseEvent) => {
    if (tab === 'home') {
      if (location.pathname === '/') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/');
      }
    } else if (tab === 'events') {
      if (location.pathname === '/') {
        e.preventDefault();
        const el = document.getElementById('events');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          navigate('/#events');
        }
      } else {
        navigate('/#events');
      }
    } else if (tab === 'gallery') {
      navigate('/gallery');
    } else if (tab === 'admin') {
      navigate('/admin');
    }
  };

  const handleUploadClick = () => {
    if (isAdmin) {
      window.dispatchEvent(new CustomEvent('toggle-quick-upload'));
    } else {
      setShowGuestAlert(true);
    }
  };

  // Do not render bottom nav on Admin Dashboard path
  if (location.pathname.startsWith('/admin') && isAdmin) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm h-16 bg-white/95 backdrop-blur-md rounded-full shadow-[0_12px_35px_rgba(74,4,4,0.15)] border border-maroon-deep/5 z-[90] flex items-center justify-around px-2 md:hidden">
        
        {/* Home Link */}
        <button
          onClick={(e) => handleNav('home', e)}
          className="flex flex-col items-center justify-center w-12 h-12 text-maroon-dark/60 hover:text-maroon-deep transition-colors"
        >
          <Home size={20} className={activeTab === 'home' ? 'text-maroon-deep' : ''} />
          {activeTab === 'home' && (
            <motion.div
              layoutId="activeBottomDot"
              className="w-1 h-1 rounded-full bg-maroon-deep mt-1"
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          )}
        </button>

        {/* Events/Bell Link */}
        <button
          onClick={(e) => handleNav('events', e)}
          className="flex flex-col items-center justify-center w-12 h-12 text-maroon-dark/60 hover:text-maroon-deep transition-colors"
        >
          <Bell size={20} className={activeTab === 'events' ? 'text-maroon-deep' : ''} />
          {activeTab === 'events' && (
            <motion.div
              layoutId="activeBottomDot"
              className="w-1 h-1 rounded-full bg-maroon-deep mt-1"
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          )}
        </button>

        {/* Center Elevated Add Button */}
        <button
          onClick={handleUploadClick}
          className="flex items-center justify-center w-12 h-12 bg-maroon-dark text-gold-metallic rounded-2xl shadow-lg hover:bg-maroon-deep transition-all active:scale-95 -translate-y-3 relative"
        >
          <Plus size={24} />
        </button>

        {/* Gallery / Bookmark Link */}
        <button
          onClick={(e) => handleNav('gallery', e)}
          className="flex flex-col items-center justify-center w-12 h-12 text-maroon-dark/60 hover:text-maroon-deep transition-colors"
        >
          <Image size={20} className={activeTab === 'gallery' ? 'text-maroon-deep' : ''} />
          {activeTab === 'gallery' && (
            <motion.div
              layoutId="activeBottomDot"
              className="w-1 h-1 rounded-full bg-maroon-deep mt-1"
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          )}
        </button>

        {/* Profile / Admin Link */}
        <button
          onClick={(e) => handleNav('admin', e)}
          className="flex flex-col items-center justify-center w-12 h-12 text-maroon-dark/60 hover:text-maroon-deep transition-colors"
        >
          <User size={20} className={activeTab === 'admin' ? 'text-maroon-deep' : ''} />
          {activeTab === 'admin' && (
            <motion.div
              layoutId="activeBottomDot"
              className="w-1 h-1 rounded-full bg-maroon-deep mt-1"
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          )}
        </button>
      </div>

      {/* Guest Alert Modal */}
      <AnimatePresence>
        {showGuestAlert && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm md:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-2xl text-maroon-dark relative border border-maroon-deep/5"
            >
              <button
                onClick={() => setShowGuestAlert(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-14 h-14 rounded-full bg-maroon-deep/10 flex items-center justify-center text-maroon-deep mb-4">
                  <Crown size={28} />
                </div>
                
                <h3 className="font-display text-2xl text-maroon-deep mb-2">Admin Upload Mode</h3>
                
                <p className="text-sm text-gray-500 leading-relaxed mb-6 px-2">
                  Quick Upload is restricted to wedding administrators. If you are an administrator, please log in to upload photos.
                </p>

                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={() => {
                      setShowGuestAlert(false);
                      navigate('/admin');
                    }}
                    className="w-full py-3 bg-maroon-deep text-gold-metallic font-semibold rounded-xl text-xs uppercase tracking-widest hover:bg-maroon-dark transition-all active:scale-[0.98]"
                  >
                    Login as Admin
                  </button>
                  <button
                    onClick={() => setShowGuestAlert(false)}
                    className="w-full py-3 bg-gray-50 text-gray-400 font-semibold rounded-xl text-xs uppercase tracking-widest hover:bg-gray-100 hover:text-gray-600 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
