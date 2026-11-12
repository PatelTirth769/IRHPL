import { Link, Outlet } from 'react-router-dom';
import { BookOpen, Globe } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#F6F8FC] flex flex-col font-sans">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center">
        <Link to="/" className="flex items-center group focus:outline-none h-10">
          <img src="/logo.png" alt="India Retails & Hospitality Private Limited" className="h-full object-contain" />
        </Link>
        
        <button className="flex items-center text-gray-600 hover:text-gray-900 text-sm font-medium focus:outline-none">
          <Globe className="w-4 h-4 mr-1.5" />
          English
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 py-20">
        <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E5E9F2] p-8 sm:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
