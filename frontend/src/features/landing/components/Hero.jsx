import { ArrowRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-[100px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-brand-navy to-brand-blueDark">
      {/* Optional: subtle background texture or glowing orbs can go here */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center pb-20">
        
        <div className="animate-fade-up" style={{ animationDelay: '0ms' }}>
          <Badge>Employee and airport pass management, simplified</Badge>
        </div>

        <h1 
          className="text-5xl md:text-6xl lg:text-7xl xl:text-[5rem] font-extrabold text-white tracking-tight leading-[1.1] mb-8 max-w-4xl mx-auto animate-fade-up"
          style={{ animationDelay: '150ms' }}
        >
          Manage employees and{' '}
          <span className="text-brand-amber block mt-2 lg:mt-4">airport passes with confidence</span>
        </h1>

        <p 
          className="text-lg md:text-xl lg:text-[22px] text-brand-textLight max-w-3xl mx-auto leading-relaxed mb-12 animate-fade-up"
          style={{ animationDelay: '300ms' }}
        >
          Track TAEP and BAEP applications end to end, manage employee records in one place, and stay ahead of AVSEC and C&A expiry with automated reminders.
        </p>

        <div 
          className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full animate-fade-up"
          style={{ animationDelay: '450ms' }}
        >
          <Button 
            href="/tools" 
            variant="accent" 
            icon={ArrowRight}
            className="w-full sm:w-auto"
          >
            Explore Free Tools
          </Button>
          
          <Button 
            href="/pricing" 
            variant="secondary"
            className="w-full sm:w-auto !py-4 text-lg font-semibold"
          >
            View Pricing
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
