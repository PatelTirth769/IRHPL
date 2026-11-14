import { Link, Outlet } from 'react-router-dom';
import { Globe, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 relative flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      <Toaster position="top-right" />
      
      {/* Background Decor Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.12),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-50/50 via-slate-50/20 to-transparent pointer-events-none" />
      
      {/* Subtle Dot Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.4] pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Header */}
      <header className="relative z-10 w-full px-6 py-3.5 sm:py-4 flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="flex items-center group focus:outline-none h-9 sm:h-10 transition-transform active:scale-95" title="Go to home">
          <img 
            src="/logo.png" 
            alt="India Retails & Hospitality Private Limited" 
            className="h-full object-contain filter drop-shadow-sm" 
          />
        </Link>
        
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white border border-slate-200/90 rounded-lg text-slate-700 hover:text-slate-900 text-xs font-semibold shadow-sm hover:shadow transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </Link>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-slate-200/80 shadow-sm text-xs font-medium text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Secure SSL Encrypted</span>
          </div>

          <button className="flex items-center px-3 py-1.5 bg-white/80 hover:bg-white border border-slate-200/80 rounded-lg text-slate-700 hover:text-slate-900 text-xs font-semibold shadow-sm transition-all focus:outline-none">
            <Globe className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            English
          </button>
        </div>
      </header>

      {/* Main Content Card Container (Positioned comfortably near the top) */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 pt-1 sm:pt-2.5 pb-8 relative z-10">
        {/* Back Link on top-left of the form card */}
        <div className="w-full max-w-[480px] mb-2 sm:mb-2.5 flex items-center justify-start">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors group py-0.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="w-full max-w-[480px] bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_15px_40px_rgba(15,23,42,0.07),0_1px_3px_rgba(15,23,42,0.04)] border border-slate-200/80 p-6 sm:p-8 transition-all">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-3 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} India Retails & Hospitality Private Limited. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;
