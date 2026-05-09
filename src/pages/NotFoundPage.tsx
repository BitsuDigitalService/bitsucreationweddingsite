import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'motion/react';
import Footer from '../components/Footer';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <main className="px-6 pb-20 pt-32">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.5rem] border border-gold-metallic/10 bg-white p-12 text-center shadow-xl"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertCircle size={40} />
            </div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.4em] text-gray-400">404 Error</p>
            <h1 className="mb-4 font-display text-4xl text-maroon-dark">Page Not Found</h1>
            <p className="mx-auto mb-8 max-w-xl text-gray-500">
              The page you requested does not exist or the link is no longer available.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full bg-maroon-dark px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-maroon-deep"
              >
                <Home size={16} />
                Go To Home
              </Link>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 transition-colors hover:border-maroon-dark/20 hover:text-maroon-dark"
              >
                <ArrowLeft size={16} />
                Go Back
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
