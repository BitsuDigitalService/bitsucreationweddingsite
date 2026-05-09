import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  User, 
  Phone, 
  Home, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { bagService } from '../services/bagService';
import { WeddingBag, BagStatus } from '../types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAdminStatus } from '../hooks/useAdminStatus';

export default function BagDetailsPage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const navigate = useNavigate();
  const [bag, setBag] = useState<WeddingBag | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = useAdminStatus();

  useEffect(() => {
    async function fetchBag() {
      if (tagCode) {
        try {
          setError(null);
          const data = await bagService.getBagByCode(tagCode);
          setBag(data);
          if (data) {
            await bagService.incrementScanCount(tagCode);
          }
        } catch (err: any) {
          console.error(err);
          if (err.message.includes('Permission') || err.message.includes('RLS')) {
            setError("PERMISSION ERROR: The database is restricting access. Please ensure the 'bags' table has public RLS policies enabled.");
          } else {
            setError("Failed to load bag details.");
          }
        }
      }
      setLoading(false);
    }
    fetchBag();
    window.scrollTo(0, 0);
  }, [tagCode]);

  const handleUpdateStatus = async (status: BagStatus) => {
    if (!bag) return;
    const success = await bagService.updateBagStatus(bag.id, status);
    if (success) {
      const updated = await bagService.getBagByCode(tagCode!);
      setBag(updated);
    }
  };

  const handleDeleteBag = async () => {
    if (!bag) return;
    if (confirm('Are you sure you want to permanently delete this bag tag? This action cannot be undone.')) {
      const success = await bagService.deleteBag(bag.id);
      if (success) {
        navigate('/admin');
      } else {
        alert('Failed to delete bag. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-maroon-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold-metallic/20 border-t-gold-metallic rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-maroon-deep font-bold text-xs uppercase tracking-widest mb-8 hover:text-gold-metallic transition-colors">
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          {error ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-12 text-center shadow-xl border border-red-500/20"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} />
              </div>
              <h1 className="font-display text-4xl text-maroon-dark mb-4">Connection Issue</h1>
              <p className="text-gray-500 mb-8">{error}</p>
              <div className="p-4 bg-maroon-dark/5 text-maroon-dark rounded-xl font-mono text-sm inline-block">
                Code: #{tagCode?.split('/').pop()}
              </div>
            </motion.div>
          ) : !bag ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-12 text-center shadow-xl border border-gold-metallic/10"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} />
              </div>
              <h1 className="font-display text-4xl text-maroon-dark mb-4">Bag Not Found</h1>
              <p className="text-gray-500 mb-8">This tag code doesn't seem to be registered in our system yet.</p>
              <div className="p-4 bg-maroon-dark/5 text-maroon-dark rounded-xl font-mono text-sm inline-block">
                Tag ID: #{tagCode?.split('/').pop()}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Header Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-maroon-dark rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <Package size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold ${
                      bag.bag_status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gold-metallic/20 text-gold-metallic border border-gold-metallic/30'
                    }`}>
                      {bag.bag_status}
                    </span>
                    <span className="text-ivory/40 text-xs font-mono">#{bag.unique_tag_code.split('/').pop()}</span>
                  </div>
                  <h1 className="font-display text-5xl md:text-6xl text-gold-metallic mb-2">Guest Bag</h1>
                  <p className="text-ivory/60 italic font-garamond text-xl">Identity Verification & Status</p>
                </div>
              </motion.div>
              
              {/* Admin Control Panel */}
              {isAdmin && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2rem] p-8 shadow-xl border-l-4 border-l-gold-metallic"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-maroon-dark uppercase tracking-widest text-xs">Admin Control Panel</h3>
                    <div className="px-3 py-1 bg-gold-metallic/10 text-gold-metallic rounded-full text-[8px] font-bold uppercase">Authenticated</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                      onClick={() => handleUpdateStatus('collected')}
                      disabled={bag.bag_status === 'collected'}
                      className="p-4 rounded-xl border border-green-100 bg-green-50/50 flex flex-col items-center gap-2 hover:bg-green-50 transition-all group disabled:opacity-50"
                    >
                      <CheckCircle className="text-green-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase text-green-700">Mark Collected</span>
                    </button>
                    
                    <button 
                      onClick={() => handleUpdateStatus('active')}
                      disabled={bag.bag_status === 'active'}
                      className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex flex-col items-center gap-2 hover:bg-blue-50 transition-all group disabled:opacity-50"
                    >
                      <RotateCcw className="text-blue-500 group-hover:rotate-180 transition-transform duration-500" />
                      <span className="text-[10px] font-bold uppercase text-blue-700">Reactivate Bag</span>
                    </button>
                    
                    <button 
                      onClick={handleDeleteBag}
                      className="p-4 rounded-xl border border-red-100 bg-red-50/50 flex flex-col items-center gap-2 hover:bg-red-50 transition-all group"
                    >
                      <Trash2 className="text-red-500 group-hover:shake transition-transform" />
                      <span className="text-[10px] font-bold uppercase text-red-700">Delete Tag</span>
                    </button>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                     <span className="text-[10px] font-medium text-gray-400">Owner identity must be verified before collection.</span>
                     <div className="text-right">
                       <span className="text-[10px] font-bold text-maroon-dark block">Total Scans: {bag.scan_count || 0}</span>
                       {bag.last_scanned_at && (
                         <span className="text-[10px] text-gray-500 block mt-1">Last Scan: {new Date(bag.last_scanned_at).toLocaleString()}</span>
                       )}
                     </div>
                  </div>
                </motion.div>
              )}

              {/* Status Banner */}
              {bag.bag_status === 'collected' && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4 text-green-800"
                >
                  <CheckCircle className="text-green-500" />
                  <div>
                    <p className="font-bold">Bag Returned</p>
                    <p className="text-sm opacity-80">This bag was successfully collected at {new Date(bag.collected_at!).toLocaleString()}</p>
                  </div>
                </motion.div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Guest Info */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-[2rem] p-8 shadow-lg border border-gold-metallic/5"
                >
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 bg-maroon-dark/5 rounded-xl flex items-center justify-center text-maroon-dark">
                        <User size={24} />
                     </div>
                     <h3 className="font-bold text-gray-800 uppercase tracking-widest text-sm">Guest Details</h3>
                  </div>
                  <div className="space-y-6">
                    <DetailItem label="Owner Name" value={bag.guest_name} />
                    <DetailItem label="Phone Number" value={bag.phone_number} />
                    <DetailItem label="Room/Location" value={bag.room_name} />
                  </div>
                </motion.div>

                {/* Bag Image */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-[2rem] p-4 shadow-lg border border-gold-metallic/5"
                >
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                    {bag.bag_image ? (
                      <img src={bag.bag_image} alt="Guest Bag" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-300">
                        <Package size={48} className="mb-2" />
                        <p className="text-xs uppercase tracking-tighter">No Image Uploaded</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex items-center justify-between text-gray-400">
                     <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span className="text-[10px] uppercase font-bold tracking-tighter">Registered: {new Date(bag.created_at).toLocaleDateString()}</span>
                     </div>
                     <ShieldCheck size={16} className="text-green-500/50" />
                  </div>
                </motion.div>
              </div>

              {/* Safety Message */}
              <div className="p-8 bg-gold-metallic/5 rounded-[2rem] border border-gold-metallic/10 text-center">
                 <p className="text-maroon-dark/60 font-garamond italic text-lg leading-relaxed">
                   "If you found this bag unattended, please contact the wedding management team immediately."
                 </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">{label}</p>
      <p className="text-xl font-serif text-maroon-dark">{value}</p>
    </div>
  );
}
