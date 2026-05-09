import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, RefreshCw } from 'lucide-react';

interface BagScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function BagScanner({ onScan, onClose }: BagScannerProps) {
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [error, setError] = useState<string | null>(null);

  const handleScan = (result: any) => {
    if (result && result.length > 0) {
      onScan(result[0].rawValue);
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    setError('Camera access denied or not available.');
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6"
    >
      <div className="absolute top-6 right-6 flex gap-4">
        <button 
          onClick={toggleCamera}
          className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
        >
          <RefreshCw size={24} />
        </button>
        <button 
          onClick={onClose}
          className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden border-2 border-gold-metallic/30 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-white text-center p-8 bg-maroon-dark/50">
             <Camera size={48} className="mb-4 text-gold-metallic opacity-50" />
             <p>{error}</p>
          </div>
        ) : (
          <Scanner
            onScan={handleScan}
            onError={handleError}
            scanDelay={100}
            formats={['qr_code', 'code_128', 'code_39', 'ean_13', 'upc_a']}
            components={{
              finder: false
            }}
            constraints={{
               facingMode: facingMode,
               width: { ideal: 1280 },
               height: { ideal: 720 }
            }}
            styles={{
               container: { width: '100%', height: '100%', padding: 0 }
            }}
          />
        )}
        
        {/* Scanning frame decoration */}
        <div className="absolute inset-8 border-2 border-gold-metallic/50 border-dashed rounded-2xl animate-pulse"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-gold-metallic/80 shadow-[0_0_15px_rgba(212,175,55,0.8)] animate-scan"></div>
      </div>

      <div className="mt-12 text-center">
        <h3 className="text-gold-metallic font-display text-2xl mb-2">Scanning Bag Tag</h3>
        <p className="text-ivory/60 text-sm tracking-widest uppercase">Position the QR Code within the frame</p>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 3s infinite ease-in-out;
        }
      `}</style>
    </motion.div>
  );
}
