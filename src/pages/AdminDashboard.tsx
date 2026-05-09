import React, { Suspense, lazy, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  FolderPlus, 
  Upload, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  CheckCircle2,
  Monitor,
  Package,
  QrCode,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Eye,
  CheckCircle,
  Palette,
  AlertCircle,
  RotateCcw,
  Heart
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { bagService } from '../services/bagService';
import { imageService } from '../services/imageService';
import { WeddingBag, BagStatus } from '../types';
import { getSupabase } from '../lib/supabase';
import { clearAdminAuth, saveAdminAuth } from '../lib/adminAuth';
import { useAdminStatus } from '../hooks/useAdminStatus';

const BagScanner = lazy(() => import('../components/BagScanner'));
const TagDesigner = lazy(() => import('../components/TagDesigner'));

function AdminChunkLoader() {
  return (
    <div className="flex min-h-[16rem] items-center justify-center">
      <div className="h-10 w-10 rounded-full border-4 border-maroon-deep/20 border-t-maroon-deep animate-spin" />
    </div>
  );
}

export default function AdminDashboard() {
  const isAuthenticated = useAdminStatus();
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'hero' | 'our-story' | 'bags' | 'designer'>(() => {
    return 'bags';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const { state, updateHeroImage, toggleCountdown, addGalleryItem, deleteGalleryItem, updateCoupleImage } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('scan') === 'true') {
      searchParams.delete('scan');
      setSearchParams(searchParams, { replace: true });
      setIsScannerOpen(true);
      setActiveTab('bags');
    }
  }, [searchParams, setSearchParams]);

  const handleLogin = () => {
    if (passkey === '1234') { // Default wedding passkey
      const shouldOpenScanner = searchParams.get('scan') === 'true';
      saveAdminAuth();
      setActiveTab('bags');
      setLoginError('');
      setPasskey('');
      if (shouldOpenScanner) {
        setIsScannerOpen(true);
        searchParams.delete('scan');
        setSearchParams(searchParams, { replace: true });
      } else {
        navigate('/');
      }
    } else {
      setLoginError('Wrong password');
    }
  };

  const handleLogout = () => {
     clearAdminAuth();
     navigate('/');
  };

  const [bags, setBags] = useState<WeddingBag[]>([]);
  const [loadingBags, setLoadingBags] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(() => {
    return new URLSearchParams(window.location.search).get('scan') === 'true';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [newHeroUrl, setNewHeroUrl] = useState('');
  const [couple1Url, setCouple1Url] = useState('');
  const [couple2Url, setCouple2Url] = useState('');
  const [isUploadingCouple1, setIsUploadingCouple1] = useState(false);
  const [isUploadingCouple2, setIsUploadingCouple2] = useState(false);
  const [newGalleryItem, setNewGalleryItem] = useState({ url: '', title: '', category: 'Couple' });
  
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [registrationForm, setRegistrationForm] = useState({
    guest_name: '',
    phone_number: '',
    room_name: '',
    bag_image: ''
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isFetchingImages, setIsFetchingImages] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState<'couple1' | 'couple2' | null>(null);

  // ── Gallery management state ──────────────────────────────────────────────
  const [galleryImages, setGalleryImages] = useState<import('../services/imageService').GalleryImage[]>([]);
  const [galleryFolders, setGalleryFolders] = useState<string[]>([]);
  const [galleryActiveFolder, setGalleryActiveFolder] = useState<string>('all');
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [galleryUploadFolder, setGalleryUploadFolder] = useState<string>('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState<string | null>(null);

  const fetchExistingImages = async () => {
    setIsFetchingImages(true);
    try {
      // Fetch specifically uploaded couple images
      const coupleUrls = await imageService.getUploadedImages('couples');
      
      // Also fetch all gallery images so they can reuse any photo
      const galleryImgs = await imageService.getGalleryImages('all');
      const galleryUrls = galleryImgs.map(img => img.url);
      
      // Combine and remove duplicates
      const allUrls = Array.from(new Set([...coupleUrls, ...galleryUrls]));
      setExistingImages(allUrls);
    } catch (e) {
      console.error(e);
      setExistingImages([]);
    }
    setIsFetchingImages(false);
  };

  useEffect(() => {
    if (isAuthenticated && (activeTab === 'bags' || activeTab === 'overview')) {
      fetchBags();
      
      const supabase = getSupabase();
      if (supabase) {
        const channel = supabase
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'bags' },
            () => {
              fetchBags();
            }
          )
          .subscribe();
        
        return () => {
          supabase.removeChannel(channel);
        };
      }
    }
  }, [isAuthenticated, activeTab]);

  // ── Gallery tab: fetch images on tab activation ───────────────────────────
  useEffect(() => {
    if (isAuthenticated && activeTab === 'gallery') {
      loadGalleryImages();
    }
  }, [isAuthenticated, activeTab, galleryActiveFolder]);

  const loadGalleryImages = async () => {
    setGalleryLoading(true);
    const imgs = await imageService.getGalleryImages(galleryActiveFolder);
    setGalleryImages(imgs);
    const unique = [...new Set(imgs.map(i => i.folder))];
    if (galleryActiveFolder === 'all') setGalleryFolders(unique);
    setGalleryLoading(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !galleryUploadFolder) return;
    setGalleryUploading(true);
    await Promise.all(files.map(f => imageService.uploadGalleryImage(f, galleryUploadFolder)));
    await loadGalleryImages();
    setGalleryUploading(false);
    e.target.value = '';
  };

  const handleDeleteGalleryImage = async (path: string, id?: string) => {
    if (!window.confirm('Delete this photo? This cannot be undone.')) return;
    await imageService.deleteGalleryImage(path, id);
    setGalleryImages(prev => prev.filter(i => i.path !== path));
  };

  const handleDeleteGalleryFolder = async (folderName: string) => {
    if (!window.confirm(`Delete the entire "${folderName}" folder and ALL its photos? This cannot be undone.`)) return;
    setDeletingFolder(folderName);
    await imageService.deleteGalleryFolder(folderName);
    setGalleryFolders(prev => prev.filter(f => f !== folderName));
    setGalleryImages(prev => prev.filter(i => i.folder !== folderName));
    if (galleryActiveFolder === folderName) setGalleryActiveFolder('all');
    setDeletingFolder(null);
  };

  const handleCreateFolder = async () => {
    const name = newFolderName.trim().toLowerCase().replace(/\s+/g, '-');
    if (!name) return;
    setCreatingFolder(true);
    const ok = await imageService.createGalleryFolder(name);
    if (ok) {
      setGalleryFolders(prev => [...new Set([...prev, name])]);
      setGalleryUploadFolder(name);
      setNewFolderName('');
      setShowCreateFolder(false);
    }
    setCreatingFolder(false);
  };

  const fetchBags = async () => {
    setLoadingBags(true);
    setDbError(null);
    try {
      const data = await bagService.getAllBags();
      setBags(data);
      if (data.length === 0) {
        // If it's a fresh app, it might be empty, but if we have no connection at all it might return empty too
        const supabase = getSupabase();
        if (!supabase) {
          setDbError('Supabase is not configured. Please add project URL and API key in Settings.');
        }
      }
    } catch (err: any) {
      if (err.message?.includes('Permission') || err.message?.includes('RLS')) {
        setDbError('DATABASE PERMISSION ERROR: Row Level Security is blocking data access. Please check SUPABASE_SCHEMA.sql.');
      } else {
        setDbError('Failed to connect to database.');
      }
    } finally {
      setLoadingBags(false);
    }
  };

  const handleScanSuccess = async (scannedCode: string) => {
    setIsScannerOpen(false);
    
    // Extract ID if it's a URL and trim whitespace
    let code = scannedCode.trim().replace(/[\r\n]+/g, '');
    if (code.includes('/bags/')) {
      code = code.split('/bags/').pop() || code;
    }
    
    // Fallback if split results in something weird
    code = code.trim().replace(/[\r\n]+/g, '');
    
    try {
      // Check if bag already exists
      const existingBag = await bagService.getBagByCode(code);
      
      if (existingBag) {
        // Redirect to bag management/details
        navigate(`/bags/${encodeURIComponent(code)}`);
      } else {
        // Open registration form
        setScannedCode(code);
        setIsRegistrationOpen(true);
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      // If we can't check if the bag exists due to DB error, we can either block it or still try to open registration.
      // Let's alert the error but still open registration as a fallback in case it's a read-only RLS issue that wasn't PGRST116.
      if (confirm(`Warning: Could not verify if bag already exists (${err.message}). Do you still want to try registering it?`)) {
        setScannedCode(code);
        setIsRegistrationOpen(true);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fast path: use local blob for preview, upload happens in background after register
    const localUrl = URL.createObjectURL(file);
    setRegistrationForm({ ...registrationForm, bag_image: localUrl });
    setPendingImageFile(file);
  };

  const handleRegister = async () => {
    if (!scannedCode || !registrationForm.guest_name) {
      alert("Please enter a guest name.");
      return;
    }
    
    setIsRegistering(true);
    try {
      const newBagData = {
        guest_name: registrationForm.guest_name,
        phone_number: registrationForm.phone_number,
        room_name: registrationForm.room_name,
        unique_tag_code: scannedCode,
        bag_image: pendingImageFile ? '' : registrationForm.bag_image,
      };

      const newBag = await bagService.registerBag(newBagData);

      if (newBag) {
        if (pendingImageFile) {
          bagService.uploadImageAndUpdateBag(newBag.id, pendingImageFile);
        }

        setIsRegistrationOpen(false);
        setScannedCode(null);
        setRegistrationForm({ guest_name: '', phone_number: '', room_name: '', bag_image: '' });
        setPendingImageFile(null);
        fetchBags();
      } else {
        alert("Failed to register bag. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred during registration.");
    } finally {
      setIsRegistering(false);
    }
  };

  const updateStatus = async (id: string, status: BagStatus) => {
    const success = await bagService.updateBagStatus(id, status);
    if (success) fetchBags();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to completely delete this bag? This action cannot be undone.")) {
      const success = await bagService.deleteBag(id);
      if (success) fetchBags();
    }
  };

  const handleCoupleUpload = async (e: React.ChangeEvent<HTMLInputElement>, coupleId: 'couple1' | 'couple2') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (coupleId === 'couple1') setIsUploadingCouple1(true);
    else setIsUploadingCouple2(true);

    try {
      const publicUrl = await imageService.uploadImage(file, `couples/${coupleId}`);
      if (publicUrl) {
        if (coupleId === 'couple1') setCouple1Url(publicUrl);
        else setCouple2Url(publicUrl);
        updateCoupleImage(coupleId, publicUrl);
      } else {
        alert('Upload failed. Please check your Supabase Storage policies (Bucket: bag-management).');
      }
    } catch (err) {
      console.error('Failed to upload image', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      if (coupleId === 'couple1') setIsUploadingCouple1(false);
      else setIsUploadingCouple2(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-maroon-dark flex items-center justify-center p-6 relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white max-w-md w-full rounded-[3.5rem] p-12 shadow-2xl relative z-10 border border-gold-metallic/20"
        >
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gold-metallic rounded-3xl mx-auto flex items-center justify-center text-maroon-dark font-display text-4xl mb-6 shadow-xl shadow-gold-metallic/20">A</div>
            <h1 className="font-display text-4xl text-maroon-dark mb-2">Admin Portal</h1>
            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Bridal Management System</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase text-gray-400 px-1">Security Passkey</label>
               <input 
                 type="password"
                 inputMode="numeric"
                 value={passkey}
                 onChange={(e) => {
                   setPasskey(e.target.value);
                   if (loginError) setLoginError('');
                 }}
                 onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                 placeholder="••••"
                 className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-6 py-5 text-center font-sans text-2xl tracking-[0.35em] text-maroon-dark outline-none transition-all placeholder:text-gray-300 focus:ring-2 focus:ring-gold-metallic/20"
               />
               {loginError && (
                 <p className="px-1 text-[11px] font-bold text-red-500">{loginError}</p>
               )}
            </div>
            
            <button 
              onClick={handleLogin}
              className="w-full bg-maroon-dark text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-maroon-deep transition-all shadow-xl shadow-maroon-deep/20"
            >
              Access Dashboard
            </button>
          </div>

          <p className="mt-10 text-center text-[10px] text-gray-300 font-bold uppercase tracking-tighter">
            Authorized Personnel Only
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-900 font-sans relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-maroon-dark text-ivory flex flex-col fixed h-full z-[70] transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gold-metallic flex items-center justify-center text-maroon-dark font-display text-xl">SA</div>
          <div>
            <h1 className="font-bold text-sm tracking-widest uppercase">Kalyanam</h1>
            <p className="text-[10px] text-ivory/40 uppercase tracking-tighter">Admin Portal</p>
          </div>
          <button className="lg:hidden ml-auto text-ivory/60" onClick={() => setIsSidebarOpen(false)}>
            <LogOut size={20} className="rotate-180" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <SidebarLink 
            icon={LayoutDashboard} 
            label="Overview" 
            active={activeTab === 'overview'} 
            onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={ImageIcon} 
            label="Gallery" 
            active={activeTab === 'gallery'} 
            onClick={() => { setActiveTab('gallery'); setIsSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={Monitor} 
            label="Hero Section" 
            active={activeTab === 'hero'} 
            onClick={() => { setActiveTab('hero'); setIsSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={Heart} 
            label="Our Story" 
            active={activeTab === 'our-story'} 
            onClick={() => { setActiveTab('our-story'); setIsSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={Package} 
            label="Wedding Bags" 
            active={activeTab === 'bags'} 
            onClick={() => { setActiveTab('bags'); setIsSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={Palette} 
            label="Tag Designer" 
            active={activeTab === 'designer'} 
            onClick={() => { setActiveTab('designer'); setIsSidebarOpen(false); }} 
          />
          <div className="pt-8 pb-2 px-4 text-[10px] font-bold text-ivory/30 uppercase tracking-widest">Settings</div>
          <SidebarLink icon={Settings} label="General Settings" active={false} onClick={() => {}} />
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-ivory/60 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 lg:ml-64 bg-slate-50 min-h-screen flex flex-col ${activeTab === 'designer' ? 'h-screen overflow-hidden' : 'p-4 md:p-10'}`}>
        {/* Header - Only show for non-designer tabs to save space */}
        {activeTab !== 'designer' && (
          <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4 px-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <button 
                   onClick={() => setIsSidebarOpen(true)}
                   className="p-2 bg-white rounded-lg shadow-sm border lg:hidden"
                 >
                   <Plus size={24} className="rotate-45" />
                 </button>
                 <div>
                    <h2 className="text-xl md:text-3xl font-bold text-gray-800 capitalize">{activeTab}</h2>
                    <p className="text-xs md:text-sm text-gray-500">Kalyanam Website Control Center</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 md:hidden">
                 <div className="w-8 h-8 rounded-full bg-maroon-deep text-white flex items-center justify-center font-bold text-[10px]">AD</div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <div className="bg-white p-2 rounded-full shadow-sm border border-gray-200">
                 <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">AH</div>
              </div>
            </div>
          </header>
        )}

        <div className={`flex-1 ${activeTab === 'designer' ? 'h-full' : ''}`}>
          {dbError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600">
              <AlertCircle size={20} />
              <div className="flex-1">
                <p className="font-bold text-sm">Action Required: Database Permission</p>
                <p className="text-xs opacity-80">{dbError} Make sure you have disabled RLS or added policies in your Supabase dashboard.</p>
              </div>
              <button 
                onClick={() => fetchBags()}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}
          {activeTab === 'overview' && (
          <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
               <StatCard title="Photos" value={state.gallery.length} color="bg-blue-500" />
               <StatCard title="Total Bags" value={bags.length} color="bg-gold-metallic" />
               <StatCard title="Active" value={bags.filter(b => b.bag_status === 'active').length} color="bg-green-500" />
               <StatCard title="Collected" value={bags.filter(b => b.bag_status === 'collected').length} color="bg-maroon-deep" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <h3 className="text-lg font-bold mb-4">Bag Analytics</h3>
                  <div className="flex items-center justify-between py-4 border-b border-gray-50">
                     <span className="text-gray-500 text-sm">Total Page Views (Scans)</span>
                     <span className="font-bold text-maroon-dark">{bags.reduce((acc, curr) => acc + (curr.scan_count || 0), 0)}</span>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-gray-50">
                     <span className="text-gray-500 text-sm">Tags Pending Print</span>
                     <span className="font-bold text-gold-metallic">{bags.filter(b => b.print_status === 'pending').length}</span>
                  </div>
                  <div className="flex items-center justify-between py-4">
                     <span className="text-gray-500 text-sm">Collection Rate</span>
                     <span className="font-bold text-green-500">
                        {bags.length > 0 ? Math.round((bags.filter(b => b.bag_status === 'collected').length / bags.length) * 100) : 0}%
                     </span>
                  </div>
               </div>
               
               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex items-center justify-between">
                  <div>
                     <h3 className="text-lg font-bold text-gray-800">Wedding Countdown</h3>
                     <p className="text-sm text-gray-500">Show or hide the countdown timer on home page.</p>
                  </div>
                  <button 
                  onClick={() => toggleCountdown(!state.showCountdown)}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${
                    state.showCountdown ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  >
                     <span 
                       className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                         state.showCountdown ? 'translate-x-8' : 'translate-x-1'
                       }`} 
                     />
                  </button>
               </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
               <h3 className="text-lg md:text-xl font-bold mb-6">Recent Activity</h3>
               <div className="space-y-4">
                  <ActivityItem label="Hero image updated" time="2 hours ago" />
                  <ActivityItem label="New photo added to Gallery" time="5 hours ago" />
                  <ActivityItem label="RSVP settings modified" time="1 day ago" />
               </div>
            </div>
          </div>
        )}

        {activeTab === 'hero' && (
          <div className="max-w-4xl space-y-6 md:space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h3 className="text-lg md:text-xl font-bold mb-6">Current Hero Image</h3>
              <div className="aspect-video rounded-xl overflow-hidden mb-6 border-2 border-gray-100 shadow-inner">
                <img src={state.heroImage} alt="Hero" className="w-full h-full object-cover" />
              </div>
              
              <div className="flex flex-col gap-2">
                  <input 
                    type="text" 
                    placeholder="Paste external image URL and click outside to auto-save..."
                    value={newHeroUrl}
                    onChange={(e) => setNewHeroUrl(e.target.value)}
                    onBlur={() => {
                      if (newHeroUrl && newHeroUrl.startsWith('http')) {
                        updateHeroImage(newHeroUrl);
                        setNewHeroUrl('');
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newHeroUrl && newHeroUrl.startsWith('http')) {
                        updateHeroImage(newHeroUrl);
                        setNewHeroUrl('');
                      }
                    }}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-maroon-deep/20 transition-all text-sm"
                  />
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] text-gray-400 italic">Preferred aspect ratio is 16:9.</p>
                  </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'our-story' && (
          <div className="max-w-4xl space-y-6 md:space-y-8">
            {/* Couple 1 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h3 className="text-lg md:text-xl font-bold mb-6">Couple 1: {state.couples.couple1.name1} & {state.couples.couple1.name2}</h3>
              <div className="aspect-[4/5] max-w-sm rounded-xl overflow-hidden mb-6 border-2 border-gray-100 shadow-inner">
                <img src={state.couples.couple1.imageUrl} alt="Couple 1" className="w-full h-full object-cover" />
              </div>
              
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 block">External Image URL</label>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <input 
                      type="text" 
                      placeholder="Paste external image URL and click outside to auto-save..."
                      value={couple1Url}
                      onChange={(e) => setCouple1Url(e.target.value)}
                      onBlur={() => {
                        if (couple1Url && couple1Url.startsWith('http')) {
                          updateCoupleImage('couple1', couple1Url);
                          setCouple1Url('');
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && couple1Url && couple1Url.startsWith('http')) {
                          updateCoupleImage('couple1', couple1Url);
                          setCouple1Url('');
                        }
                      }}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-maroon-deep/20 transition-all text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="h-[1px] flex-1 bg-gray-200"></div>
                    <span className="text-xs text-gray-400 font-bold uppercase">OR</span>
                    <div className="h-[1px] flex-1 bg-gray-200"></div>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex flex-1 items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleCoupleUpload(e, 'couple1')}
                        disabled={isUploadingCouple1}
                      />
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Upload size={24} className={isUploadingCouple1 ? "animate-bounce text-maroon-deep" : ""} />
                        <span className="text-sm font-medium">{isUploadingCouple1 ? 'Uploading...' : 'Upload Image'}</span>
                      </div>
                    </label>

                    <button
                      onClick={() => {
                        setShowImageSelector(showImageSelector === 'couple1' ? null : 'couple1');
                        if (existingImages.length === 0) fetchExistingImages();
                      }}
                      className="flex flex-1 flex-col items-center justify-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors text-gray-500"
                    >
                      <FolderPlus size={24} />
                      <span className="text-sm font-medium">Browse Uploaded</span>
                    </button>
                  </div>
                  
                  {showImageSelector === 'couple1' && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-sm text-gray-700">Select an existing image</h4>
                        {isFetchingImages && <span className="text-xs text-gray-500 animate-pulse">Loading...</span>}
                      </div>
                      <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-2">
                        {existingImages.map((url, i) => (
                          <div 
                            key={i} 
                            onClick={() => {
                              updateCoupleImage('couple1', url);
                              setShowImageSelector(null);
                            }}
                            className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-maroon-deep cursor-pointer transition-colors"
                          >
                            <img src={url} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {!isFetchingImages && existingImages.length === 0 && (
                          <div className="col-span-3 text-center text-xs text-gray-500 py-4">No images found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Couple 2 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h3 className="text-lg md:text-xl font-bold mb-6">Couple 2: {state.couples.couple2.name1} & {state.couples.couple2.name2}</h3>
              <div className="aspect-[4/5] max-w-sm rounded-xl overflow-hidden mb-6 border-2 border-gray-100 shadow-inner">
                <img src={state.couples.couple2.imageUrl} alt="Couple 2" className="w-full h-full object-cover" />
              </div>
              
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 block">External Image URL</label>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <input 
                      type="text" 
                      placeholder="https://images.unsplash.com/..."
                      value={couple2Url}
                      onChange={(e) => setCouple2Url(e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-maroon-deep/20 transition-all text-sm"
                    />
                    <button 
                      onClick={() => {
                        if(couple2Url) updateCoupleImage('couple2', couple2Url);
                        setCouple2Url('');
                      }}
                      className="bg-maroon-dark text-white px-8 py-3 rounded-xl hover:bg-maroon-deep transition-all font-bold flex items-center justify-center gap-2 text-sm"
                    >
                      <CheckCircle2 size={18} />
                      Update Photo
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-[1px] flex-1 bg-gray-200"></div>
                    <span className="text-xs text-gray-400 font-bold uppercase">OR</span>
                    <div className="h-[1px] flex-1 bg-gray-200"></div>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex flex-1 items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleCoupleUpload(e, 'couple2')}
                        disabled={isUploadingCouple2}
                      />
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Upload size={24} className={isUploadingCouple2 ? "animate-bounce text-maroon-deep" : ""} />
                        <span className="text-sm font-medium">{isUploadingCouple2 ? 'Uploading...' : 'Upload Image'}</span>
                      </div>
                    </label>

                    <button
                      onClick={() => {
                        setShowImageSelector(showImageSelector === 'couple2' ? null : 'couple2');
                        if (existingImages.length === 0) fetchExistingImages();
                      }}
                      className="flex flex-1 flex-col items-center justify-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors text-gray-500"
                    >
                      <FolderPlus size={24} />
                      <span className="text-sm font-medium">Browse Uploaded</span>
                    </button>
                  </div>

                  {showImageSelector === 'couple2' && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-sm text-gray-700">Select an existing image</h4>
                        {isFetchingImages && <span className="text-xs text-gray-500 animate-pulse">Loading...</span>}
                      </div>
                      <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-2">
                        {existingImages.map((url, i) => (
                          <div 
                            key={i} 
                            onClick={() => {
                              updateCoupleImage('couple2', url);
                              setShowImageSelector(null);
                            }}
                            className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-maroon-deep cursor-pointer transition-colors"
                          >
                            <img src={url} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {!isFetchingImages && existingImages.length === 0 && (
                          <div className="col-span-3 text-center text-xs text-gray-500 py-4">No images found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                {/* Folder selector */}
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-bold uppercase text-gray-400 px-1">Upload to Folder</label>
                  <div className="flex gap-2">
                    <select
                      value={galleryUploadFolder}
                      onChange={e => setGalleryUploadFolder(e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                    >
                      <option value="">— select folder —</option>
                      {galleryFolders.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <button
                      onClick={() => setShowCreateFolder(v => !v)}
                      className="px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-gray-600 flex items-center gap-2 text-sm font-bold"
                    >
                      <FolderPlus size={16} />
                      New Folder
                    </button>
                  </div>
                </div>

                {/* Upload button */}
                <label className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all ${
                  galleryUploadFolder
                    ? 'bg-maroon-dark text-white hover:bg-maroon-deep shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}>
                  <Upload size={16} />
                  {galleryUploading ? 'Uploading...' : 'Upload Photos'}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    disabled={!galleryUploadFolder || galleryUploading}
                    onChange={handleGalleryUpload}
                  />
                </label>
              </div>

              {/* Create Folder inline form */}
              {showCreateFolder && (
                <div className="mt-4 flex gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                    placeholder="folder-name (e.g. haldi, wedding-day)"
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-maroon-deep/20"
                  />
                  <button
                    onClick={handleCreateFolder}
                    disabled={creatingFolder || !newFolderName.trim()}
                    className="px-5 py-3 bg-maroon-dark text-white rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-maroon-deep transition-colors"
                  >
                    {creatingFolder ? 'Creating...' : 'Create'}
                  </button>
                </div>
              )}
            </div>

            {/* Folder filter pills with delete */}
            {galleryFolders.length > 0 && (
              <div className="flex gap-2 flex-wrap items-center">
                {/* All pill */}
                <button
                  onClick={() => setGalleryActiveFolder('all')}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                    galleryActiveFolder === 'all'
                      ? 'bg-maroon-deep text-white shadow'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
                  }`}
                >
                  All ({galleryImages.length})
                </button>

                {/* Per-folder pills */}
                {galleryFolders.map(f => (
                  <div key={f} className={`flex items-center rounded-full border text-xs font-bold uppercase tracking-widest transition-all overflow-hidden ${
                    galleryActiveFolder === f
                      ? 'bg-maroon-deep text-white border-maroon-deep shadow'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}>
                    <button
                      onClick={() => setGalleryActiveFolder(f)}
                      className="px-4 py-2"
                    >
                      {deletingFolder === f ? '…' : f}
                    </button>
                    <button
                      onClick={() => handleDeleteGalleryFolder(f)}
                      disabled={deletingFolder === f}
                      className={`pr-3 pl-1 py-2 transition-colors ${
                        galleryActiveFolder === f
                          ? 'text-white/70 hover:text-white'
                          : 'text-red-400 hover:text-red-600'
                      } disabled:opacity-40`}
                      title={`Delete "${f}" folder`}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}

                <button
                  onClick={loadGalleryImages}
                  className="ml-auto px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-white border border-gray-200 text-gray-400 hover:border-gray-400 transition-all flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Refresh
                </button>
              </div>
            )}

            {/* Gallery Grid */}
            {galleryLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-gray-200 animate-pulse" />
                ))}
              </div>
            ) : galleryImages.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center py-24 text-gray-400">
                <ImageIcon size={48} className="mb-4 opacity-30" />
                <p className="font-bold text-sm">No photos yet</p>
                <p className="text-xs mt-1">Create a folder above, then upload photos</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {galleryImages.map(img => (
                  <div key={img.path} className="relative group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <div className="aspect-square">
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest truncate">{img.folder}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteGalleryImage(img.path, img.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 text-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 shadow"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bags' && (
          <div className="space-y-8">
             {/* Header Actions */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input 
                    type="text" 
                    placeholder="Search tag #, guest name or room..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-maroon-deep/10 shadow-sm"
                   />
                </div>
                <button 
                  onClick={() => setIsScannerOpen(true)}
                  className="bg-gold-metallic text-maroon-dark px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-gold-metallic/20 hover:scale-105 transition-all"
                >
                  <QrCode size={20} />
                  Scan New Bag
                </button>
             </div>

             {/* Bags List (Mobile) & Table (Desktop) */}
             <div className="bg-white md:rounded-[2.5rem] rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="bg-gray-50/50">
                            <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Bag Code</th>
                            <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Guest Details</th>
                            <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Location</th>
                            <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Scans</th>
                            <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                            <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {bags
                          .filter(b => b.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) || b.room_name.toLowerCase().includes(searchQuery.toLowerCase()) || b.unique_tag_code.toLowerCase().includes(searchQuery.replace('#', '').toLowerCase()))
                          .map((bag) => (
                            <tr key={bag.id} className="hover:bg-gray-50/50 transition-colors group">
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-gold-metallic/10 group-hover:text-gold-metallic transition-colors">
                                        <Package size={20} />
                                     </div>
                                     <div>
                                         <span className="font-mono text-xs font-bold text-gray-500 block">#{bag.unique_tag_code.split('/').pop()}</span>
                                        <span className={`text-[8px] font-bold uppercase tracking-tighter ${bag.print_status === 'printed' ? 'text-green-500' : 'text-orange-400'}`}>
                                           {bag.print_status || 'pending'}
                                        </span>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <div>
                                     <p className="font-bold text-gray-800">{bag.guest_name}</p>
                                     <p className="text-xs text-gray-400 font-medium">{bag.phone_number}</p>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-2 text-gray-600 font-medium text-sm">
                                     <Monitor size={14} className="text-gray-300" />
                                     {bag.room_name}
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-1 font-bold text-maroon-dark">
                                     <QrCode size={12} className="opacity-30" />
                                     {bag.scan_count || 0}
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                                     bag.bag_status === 'active' ? 'bg-green-100 text-green-700' : 
                                     bag.bag_status === 'collected' ? 'bg-gray-100 text-gray-500' : 
                                     'bg-red-100 text-red-700'
                                  }`}>
                                     {bag.bag_status}
                                  </span>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-2">
                                     <Link to={`/bags/${encodeURIComponent(bag.unique_tag_code)}`} className="p-2 hover:bg-gold-metallic/10 text-gray-400 hover:text-gold-metallic rounded-lg transition-colors">
                                        <Eye size={18} />
                                     </Link>
                                     {bag.bag_status === 'active' ? (
                                       <button 
                                        onClick={() => updateStatus(bag.id, 'collected')}
                                        className="p-2 hover:bg-green-50 text-gray-400 hover:text-green-500 rounded-lg transition-colors"
                                        title="Mark as Collected"
                                       >
                                          <CheckCircle size={18} />
                                       </button>
                                     ) : bag.bag_status === 'collected' ? (
                                       <button 
                                        onClick={() => updateStatus(bag.id, 'active')}
                                        className="p-2 hover:bg-orange-50 text-gray-400 hover:text-orange-500 rounded-lg transition-colors"
                                        title="Undo (Mark as Active)"
                                       >
                                          <RotateCcw size={18} />
                                       </button>
                                     ) : null}
                                     <button 
                                      onClick={() => handleDelete(bag.id)}
                                      className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                     >
                                        <Trash2 size={18} />
                                     </button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>

                {/* Mobile Cards */}
                <div className="block md:hidden divide-y divide-gray-100">
                  {bags
                    .filter(b => b.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) || b.room_name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((bag) => (
                      <div key={bag.id} className="p-4 flex flex-col gap-3 hover:bg-gray-50/50 transition-colors">
                         <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                  <Package size={20} />
                               </div>
                               <div>
                                  <p className="font-bold text-gray-800">{bag.guest_name}</p>
                                  <p className="text-xs text-gray-400 font-medium">{bag.phone_number}</p>
                               </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                                 bag.bag_status === 'active' ? 'bg-green-100 text-green-700' : 
                                 bag.bag_status === 'collected' ? 'bg-gray-100 text-gray-500' : 
                                 'bg-red-100 text-red-700'
                              }`}>
                                 {bag.bag_status}
                            </span>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-2 text-sm mt-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div>
                               <span className="block text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-1">Room</span>
                               <span className="font-medium text-gray-700 flex items-center gap-1"><Monitor size={12}/> {bag.room_name}</span>
                            </div>
                            <div>
                               <span className="block text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-1">Tag ID</span>
                               <span className="font-mono text-xs font-bold text-gray-500">#{bag.unique_tag_code.split('/').pop()}</span>
                            </div>
                         </div>

                         <div className="flex items-center justify-between mt-2">
                             <div className="flex items-center gap-1 font-bold text-maroon-dark text-xs bg-maroon-deep/5 px-3 py-1.5 rounded-lg">
                                <QrCode size={12} className="opacity-50" />
                                Scans: {bag.scan_count || 0}
                             </div>
                            
                            <div className="flex items-center gap-2">
                               <Link to={`/bags/${encodeURIComponent(bag.unique_tag_code)}`} className="p-2 text-gray-500 rounded-lg bg-white shadow-sm border border-gray-100 active:scale-95 transition-transform">
                                  <Eye size={18} />
                               </Link>
                               {bag.bag_status === 'active' ? (
                                 <button 
                                  onClick={() => updateStatus(bag.id, 'collected')}
                                  className="p-2 text-green-600 rounded-lg bg-green-50 shadow-sm border border-green-100 active:scale-95 transition-transform"
                                  title="Mark as Collected"
                                 >
                                    <CheckCircle size={18} />
                                 </button>
                               ) : bag.bag_status === 'collected' ? (
                                 <button 
                                  onClick={() => updateStatus(bag.id, 'active')}
                                  className="p-2 text-orange-600 rounded-lg bg-orange-50 shadow-sm border border-orange-100 active:scale-95 transition-transform"
                                  title="Undo (Mark as Active)"
                                 >
                                    <RotateCcw size={18} />
                                 </button>
                               ) : null}
                               <button 
                                onClick={() => handleDelete(bag.id)}
                                className="p-2 text-red-600 rounded-lg bg-red-50 shadow-sm border border-red-100 active:scale-95 transition-transform"
                               >
                                  <Trash2 size={18} />
                               </button>
                            </div>
                         </div>
                      </div>
                    ))}
                </div>

                {bags.length === 0 && !loadingBags && (
                   <div className="p-10 md:p-20 text-center text-gray-400 flex flex-col items-center">
                      <Search size={48} className="mb-4 opacity-10" />
                      <p className="font-bold text-sm md:text-base">No bags found matching your criteria</p>
                   </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'designer' && (
          <Suspense fallback={<AdminChunkLoader />}>
            <TagDesigner onSave={() => {}} />
          </Suspense>
        )}

        {/* Modals & Scanning Overlays */}
        <AnimatePresence>
          {isScannerOpen && (
            <Suspense fallback={<AdminChunkLoader />}>
              <BagScanner 
                onScan={handleScanSuccess} 
                onClose={() => setIsScannerOpen(false)} 
              />
            </Suspense>
          )}

          {isRegistrationOpen && (
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-maroon-dark/60 backdrop-blur-md p-0 md:p-6">
               <motion.div 
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                className="bg-white w-full max-w-2xl rounded-t-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.3)] md:shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/20 max-h-[95vh] flex flex-col"
               >
                  <div className="bg-maroon-dark p-6 md:p-10 text-white relative shrink-0">
                     <div className="absolute top-0 right-0 p-6 md:p-10 opacity-10 pointer-events-none">
                        <Package size={80} className="w-16 h-16 md:w-24 md:h-24" />
                     </div>
                     <h2 className="text-2xl md:text-3xl font-display text-gold-metallic mb-1 md:mb-2">Register New Bag</h2>
                     <p className="text-ivory/60 uppercase tracking-widest text-[10px] md:text-xs font-bold">Tag Code: #{scannedCode}</p>
                     
                     <button 
                      onClick={() => setIsRegistrationOpen(false)}
                      className="absolute top-6 right-6 md:top-10 md:right-10 text-white/40 hover:text-white"
                     >
                        <Trash2 size={24} className="rotate-45" />
                     </button>
                  </div>
                  
                  <div className="p-6 md:p-10 space-y-6 md:space-y-8 overflow-y-auto">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-1 md:space-y-2">
                           <label className="text-[10px] font-bold uppercase text-gray-400 px-1">Guest Name *</label>
                           <input 
                            type="text" 
                            value={registrationForm.guest_name}
                            onChange={(e) => setRegistrationForm({...registrationForm, guest_name: e.target.value})}
                            placeholder="Aditya Hansda"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 outline-none focus:ring-2 focus:ring-maroon-deep/10 font-serif"
                           />
                        </div>
                        <div className="space-y-1 md:space-y-2">
                           <label className="text-[10px] font-bold uppercase text-gray-400 px-1">Phone Number</label>
                           <input 
                            type="text" 
                            value={registrationForm.phone_number}
                            onChange={(e) => setRegistrationForm({...registrationForm, phone_number: e.target.value})}
                            placeholder="+91 98765 43210"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 outline-none focus:ring-2 focus:ring-maroon-deep/10"
                           />
                        </div>
                        <div className="space-y-1 md:space-y-2">
                           <label className="text-[10px] font-bold uppercase text-gray-400 px-1">Room / Location</label>
                           <input 
                            type="text" 
                            value={registrationForm.room_name}
                            onChange={(e) => setRegistrationForm({...registrationForm, room_name: e.target.value})}
                            placeholder="Royal Suite 402"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 outline-none focus:ring-2 focus:ring-maroon-deep/10 font-serif"
                           />
                        </div>
                        <div className="space-y-1 md:space-y-2">
                           <label className="text-[10px] font-bold uppercase text-gray-400 px-1">Upload Photo</label>
                           <div className="relative">
                              <input 
                                type="file" 
                                accept="image/*"
                                capture="environment"
                                onChange={handleImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                disabled={isRegistering}
                              />
                              <div className={`w-full bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 flex items-center gap-3 text-gray-400 overflow-hidden ${uploadingImage ? 'opacity-70' : ''}`}>
                                 {uploadingImage ? (
                                   <div className="w-5 h-5 border-2 border-gray-200 border-t-maroon-deep rounded-full animate-spin shrink-0"></div>
                                 ) : (
                                   <Upload size={18} className="shrink-0" />
                                 )}
                                 <span className="text-sm truncate">
                                    {registrationForm.bag_image ? "Image Uploaded ✓" : "Capture Bag Image"}
                                 </span>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="flex gap-3 md:gap-4 pt-2">
                        <button 
                          onClick={handleRegister}
                          disabled={isRegistering}
                          className="flex-1 bg-maroon-dark text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-xs hover:bg-maroon-deep transition-all shadow-xl shadow-maroon-deep/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isRegistering ? (
                             <>
                               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                               Registering...
                             </>
                          ) : (
                             "Complete Registration"
                          )}
                        </button>
                        <button 
                          onClick={() => setIsRegistrationOpen(false)}
                          disabled={isRegistering}
                          className="px-6 md:px-8 bg-gray-100 text-gray-500 rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-xs hover:bg-gray-200 transition-all font-sans disabled:opacity-50"
                        >
                          Cancel
                        </button>
                     </div>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ icon: Icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-gold-metallic text-maroon-dark shadow-lg shadow-gold-metallic/10' 
          : 'text-ivory/60 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={20} />
      <span className="font-semibold text-sm">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-maroon-dark"></div>}
    </button>
  );
}

function StatCard({ title, value, color }: any) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
        <p className="text-4xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`w-12 h-12 ${color} rounded-xl opacity-10`}></div>
    </div>
  );
}

function ActivityItem({ label, time }: any) {
  return (
    <div className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-2 rounded-xl transition-colors">
       <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <span className="font-medium text-sm text-gray-700">{label}</span>
       </div>
       <span className="text-xs text-gray-400">{time}</span>
    </div>
  );
}
