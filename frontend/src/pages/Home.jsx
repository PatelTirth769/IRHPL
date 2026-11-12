import Navbar from '@/components/layout/Navbar';
import Hero from '@/features/landing/components/Hero';

const Home = () => {
  return (
    <main className="min-h-screen bg-brand-navy">
      <Navbar />
      <Hero />
    </main>
  );
};

export default Home;
