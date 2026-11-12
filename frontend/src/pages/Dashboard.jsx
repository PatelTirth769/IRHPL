import { useAuthStore } from '@/store/authStore';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import WelcomeHeader from '@/features/dashboard/components/WelcomeHeader';
import StatCard from '@/features/dashboard/components/StatCard';
import RecentHistory from '@/features/dashboard/components/RecentHistory';
import { differenceInDays } from 'date-fns';

import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, firebaseUser } = useAuthStore();
  const { stats, employeeCount, passCount, expiringCount, history, loading, error } = useDashboardStats();
  const navigate = useNavigate();

  // Calculate days active securely from firebase user creation time
  let daysActive = 1;
  if (firebaseUser?.metadata?.creationTime) {
    const created = new Date(firebaseUser.metadata.creationTime);
    daysActive = Math.max(1, differenceInDays(new Date(), created));
  }

  return (
    <div className="animate-fade-in">
      <WelcomeHeader user={user} />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard 
          title="Employee Master" 
          value={employeeCount} 
          type="calculator" 
          isLoading={loading} 
          onClick={() => navigate('/dashboard/employee-master')}
        />
        <StatCard 
          title="Pass Management" 
          value={passCount} 
          type="pin" 
          isLoading={loading} 
          onClick={() => navigate('/dashboard/pass-management')}
        />
        <StatCard 
          title="Plan" 
          value={(stats?.plan || 'Free').charAt(0).toUpperCase() + (stats?.plan || 'free').slice(1)} 
          type="crown" 
          isLoading={loading} 
        />
        <StatCard 
          title="Expiring in 10 days" 
          value={expiringCount} 
          type="clock" 
          isLoading={loading} 
          onClick={() => navigate('/expiry-reminders')}
        />
      </div>

      <RecentHistory history={history} isLoading={loading} />
    </div>
  );
};

export default Dashboard;
