import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, FolderPlus, Upload, X, Check, ChevronDown, Loader2 } from 'lucide-react';
import { imageService } from '../services/imageService';
import { useLocation } from 'react-router-dom';
import { useAdminStatus } from '../hooks/useAdminStatus';
import { parseCategory, formatCategory, type GalleryCouple } from '../lib/galleryHelper';

export default function QuickUpload() {
  const isAdmin = useAdminStatus();
  const [isOpen, setIsOpen] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [newFolder, setNewFolder] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [success, setSuccess] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  const [uploadCouple, setUploadCouple] = useState<GalleryCouple>('sandeep_asha');

  // Load folders from Supabase when panel opens
  useEffect(() => {
    if (isOpen) loadFolders();
  }, [isOpen]);

  // Listen to custom window events to control the panel
  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    window.addEventListener('toggle-quick-upload', handleToggle);
    window.addEventListener('open-quick-upload', handleOpen);
    window.addEventListener('close-quick-upload', handleClose);

    return () => {
      window.removeEventListener('toggle-quick-upload', handleToggle);
      window.removeEventListener('open-quick-upload', handleOpen);
      window.removeEventListener('close-quick-upload', handleClose);
    };
  }, []);

  // Group and parse folders
  const parsedFolders = folders.map(f => {
    const { couple, folder } = parseCategory(f);
    return { raw: f, couple, clean: folder };
  });

  // Filter folders for the selected uploadCouple
  const foldersForCouple = parsedFolders.filter(f => f.couple === uploadCouple);

  // Reset selected folder if active couple folder disappears or changes
  useEffect(() => {
    const match = foldersForCouple.find(f => f.raw === selectedFolder);
    if (!match && foldersForCouple.length > 0) {
      setSelectedFolder(foldersForCouple[0].raw);
    } else if (foldersForCouple.length === 0) {
      setSelectedFolder('');
    }
  }, [uploadCouple, folders]);

  const loadFolders = async () => {
    setLoadingFolders(true);
    try {
      // List items directly under gallery/ to find subfolders
      const { getSupabase } = await import('../lib/supabase');
      const supabase = getSupabase();
      if (!supabase) { setLoadingFolders(false); return; }

      const { data } = await supabase.storage
        .from('bag-management')
        .list('gallery', { limit: 100, sortBy: { column: 'name', order: 'asc' } });

      const subfolders = (data || [])
        .filter((item: any) => item.id === null && item.name !== '.emptyFolderPlaceholder')
        .map((item: any) => item.name as string);

      setFolders(subfolders);
      if (subfolders.length > 0 && !selectedFolder) setSelectedFolder(subfolders[0]);
    } catch (e) {
      console.error('Failed to load folders', e);
    } finally {
      setLoadingFolders(false);
    }
  };

  const handleCreateFolder = async () => {
    const name = newFolder.trim().toLowerCase().replace(/\s+/g, '-');
    if (!name) return;
    setCreatingFolder(true);
    const rawCategory = formatCategory(uploadCouple, name);
    const ok = await imageService.createGalleryFolder(rawCategory);
    if (ok) {
      setFolders(prev => [...new Set([...prev, rawCategory])].sort());
      setSelectedFolder(rawCategory);
      setNewFolder('');
      setShowNewFolder(false);
    }
    setCreatingFolder(false);
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.currentTarget.files;
    const files: File[] = fileList ? Array.from(fileList) : [];
    if (!files.length || !selectedFolder) return;
    setUploading(true);
    setUploadedCount(0);
    setTotalCount(files.length);
    for (const file of files) {
      await imageService.uploadGalleryImage(file, selectedFolder);
      setUploadedCount(c => c + 1);
    }
    setUploading(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setIsOpen(false); }, 2000);
    e.currentTarget.value = '';
  };

  if (!isAdmin || location.pathname.startsWith('/admin')) return null;

  return (
    <div className="fixed bottom-24 right-4 md:bottom-10 md:right-[7rem] z-[100] flex flex-col items-end gap-3">
      
      {/* Upload Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="w-[min(18rem,calc(100vw-1.5rem))] origin-bottom-right rounded-3xl border border-gray-100 bg-white p-5 shadow-2xl text-maroon-dark"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Quick Upload</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Admin · Gallery</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Target Couple selector */}
            <div className="space-y-2 mb-3">
              <label className="text-[10px] font-bold uppercase text-gray-400">Target Couple</label>
              <div className="relative">
                <select
                  value={uploadCouple}
                  onChange={e => setUploadCouple(e.target.value as GalleryCouple)}
                  className="w-full bg-gray-50 border border-gray-200 text-maroon-dark rounded-xl px-4 py-2.5 text-sm outline-none appearance-none pr-8 focus:ring-2 focus:ring-maroon-deep/20"
                >
                  <option value="sandeep_asha" className="text-maroon-dark bg-white">Sandeep & Asha</option>
                  <option value="anand_sushila" className="text-maroon-dark bg-white">Anand & Sushila</option>
                  <option value="both" className="text-maroon-dark bg-white">All photos</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Folder selector */}
            <div className="space-y-2 mb-4">
              <label className="text-[10px] font-bold uppercase text-gray-400">Folder</label>

              {loadingFolders ? (
                <div className="flex items-center gap-2 py-3 text-gray-400 text-xs">
                  <Loader2 size={14} className="animate-spin" />
                  Loading folders…
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedFolder}
                    onChange={e => setSelectedFolder(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-maroon-dark rounded-xl px-4 py-2.5 text-sm outline-none appearance-none pr-8 focus:ring-2 focus:ring-maroon-deep/20"
                  >
                    <option value="" className="text-maroon-dark bg-white">— select folder —</option>
                    {foldersForCouple.map(f => (
                      <option key={f.raw} value={f.raw} className="text-maroon-dark bg-white">
                        {f.clean}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              )}

              {/* Refresh folders */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowNewFolder(v => !v)}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-maroon-deep hover:text-maroon-dark transition-colors"
                >
                  <FolderPlus size={11} />
                  {showNewFolder ? 'Cancel' : 'New folder'}
                </button>
                <button
                  onClick={loadFolders}
                  className="text-[10px] text-gray-400 hover:text-gray-600 underline transition-colors"
                >
                  Refresh
                </button>
              </div>

              {/* New folder form */}
              <AnimatePresence>
                {showNewFolder && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={newFolder}
                        onChange={e => setNewFolder(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                        placeholder="e.g. haldi, day-1"
                        className="flex-1 bg-gray-50 border border-gray-200 text-maroon-dark rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-maroon-deep/20"
                        autoFocus
                      />
                      <button
                        onClick={handleCreateFolder}
                        disabled={!newFolder.trim() || creatingFolder}
                        className="px-3 py-2 bg-maroon-dark text-white rounded-xl text-xs font-bold disabled:opacity-40 hover:bg-maroon-deep transition-colors"
                      >
                        {creatingFolder ? <Loader2 size={12} className="animate-spin" /> : 'Add'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Upload button */}
            <label className={`flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-sm cursor-pointer transition-all select-none ${
              selectedFolder && !uploading
                ? 'bg-maroon-dark text-white hover:bg-maroon-deep shadow-lg shadow-maroon-dark/20 active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}>
              {uploading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {uploadedCount}/{totalCount} uploading…
                </>
              ) : success ? (
                <>
                  <Check size={15} />
                  Uploaded!
                </>
              ) : (
                <>
                  <Camera size={15} />
                  Choose Photos
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                disabled={!selectedFolder || uploading}
                onChange={handleUpload}
              />
            </label>

            {selectedFolder && !uploading && !success && (
              <p className="text-center text-[10px] text-gray-400 mt-2">
                → <span className="font-bold text-maroon-deep">{parseCategory(selectedFolder).folder}</span>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB (Desktop Only) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(v => !v)}
        className="relative h-14 w-14 items-center justify-center rounded-full border-4 border-gold-metallic/30 bg-maroon-dark text-gold-metallic shadow-2xl shadow-maroon-dark/40 hidden md:flex"
        title="Quick Upload"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span key="cam" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Upload size={20} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
