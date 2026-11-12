import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import OtpInput from '@/components/ui/OtpInput';
import Divider from '@/components/ui/Divider';

export default function Login() {
  const [tab, setTab] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/auth/otp/send', { email });
      setOtpSent(true);
      toast.success('Code sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/otp/verify', { email, otp });
      setAuth(data.data.user);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col text-center">
      <h1 className="text-3xl font-bold text-brand-navy mb-2">Welcome Back</h1>
      <p className="text-gray-500 mb-8">Log in to access your compliance dashboard</p>

      <button className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-lg py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors">
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
        Continue with Google
      </button>

      <Divider text="or" />

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
        <button
          onClick={() => setTab('password')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'password' ? 'bg-[#2563EB] text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Password
        </button>
        <button
          onClick={() => setTab('otp')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'otp' ? 'bg-[#2563EB] text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Email one-time code
        </button>
      </div>

      {tab === 'password' && (
        <form onSubmit={handlePasswordLogin} className="text-left space-y-4">
          <Input 
            label="Email" 
            type="email" 
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <PasswordInput 
            label="Password" 
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            rightElement={
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline font-medium">Forgot password?</Link>
            }
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg h-12 mt-4 transition-colors"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      )}

      {tab === 'otp' && (
        <div className="text-left space-y-4">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input 
                label="Email" 
                type="email" 
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg h-12 mt-4 transition-colors"
              >
                {isLoading ? 'Sending...' : 'Send Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center space-y-1 mb-4">
                <p className="text-sm font-semibold text-gray-900">Enter the 6-digit code</p>
                <p className="text-xs text-gray-500">Sent to {email}</p>
              </div>
              <OtpInput length={6} value={otp} onChange={setOtp} />
              <button 
                type="submit" 
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg h-12 mt-4 transition-colors"
              >
                {isLoading ? 'Verifying...' : 'Verify & Log In'}
              </button>
              <div className="flex justify-between text-sm">
                <button type="button" onClick={() => setOtpSent(false)} className="text-blue-600 hover:underline">Change email</button>
                <button type="button" onClick={handleSendOtp} className="text-blue-600 hover:underline">Resend code</button>
              </div>
            </form>
          )}
        </div>
      )}

      <p className="mt-6 text-sm text-gray-600">
        Don't have an account? <Link to="/register" className="text-blue-600 hover:underline font-medium">Sign up free</Link>
      </p>
    </div>
  );
}
