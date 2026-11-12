import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { listenToUserStats, listenToRecentHistory, listenToEmployeeCount, startPresencePulse, stopPresencePulse } from '../services/dashboard.firestore';

import { passService } from '../../passManagement/services/pass.service';

export const useDashboardStats = () => {
  const user = useAuthStore((state) => state.firebaseUser);
  const [stats, setStats] = useState(null);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [passCount, setPassCount] = useState(0);
  const [expiringCount, setExpiringCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    // Start presence pulse
    startPresencePulse(user.uid);

    let unsubStats;
    let unsubHistory;
    let unsubEmployees;

    try {
      unsubStats = listenToUserStats(user.uid, (data) => {
        if (data) setStats(data);
        setLoading(false);
      }, (err) => {
        console.error('Error fetching stats:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      });

      unsubHistory = listenToRecentHistory(user.uid, (data) => {
        setHistory(data);
      }, (err) => {
        console.error('Error fetching history:', err);
      });

      unsubEmployees = listenToEmployeeCount(user.uid, (count) => {
        setEmployeeCount(count);
      }, (err) => {
        console.error('Error fetching employee count:', err);
      });

      // Fetch pass count
      passService.getPasses().then((res) => {
        setPassCount(res?.data?.length || 0);
      }).catch(err => {
        console.error('Error fetching passes:', err);
      });

      // Fetch expiring in 10 days
      passService.getExpiryReminders('10days').then((res) => {
        setExpiringCount(res?.data?.length || 0);
      }).catch(err => {
        console.error('Error fetching expiry reminders:', err);
      });

    } catch (err) {
      console.error(err);
      setError('Failed to initialize dashboard');
      setLoading(false);
    }

    return () => {
      if (unsubStats) unsubStats();
      if (unsubHistory) unsubHistory();
      if (unsubEmployees) unsubEmployees();
      stopPresencePulse();
    };
  }, [user?.uid]);

  return { stats, employeeCount, passCount, expiringCount, history, loading, error };
};
