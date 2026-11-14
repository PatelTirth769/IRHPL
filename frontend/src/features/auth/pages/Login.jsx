import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import OtpInput from '@/components/ui/OtpInput';
import api from '@/services/api';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import { Mail, Lock, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const checkAuth = useAuthStore(state => state.checkAuth);
  
  const [tab, setTab] = useState('password'); // 'password' or 'otp'
  const [otpStep, setOtpStep] = useState(1); // 1 = email, 2 = enter code
  const [otpEmail, setOtpEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const onPasswordSubmit = async (data) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast.success('Logged in successfully');
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password');
      } else {
        toast.error(error.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!otpEmail || !/\S+@\S+\.\S+/.test(otpEmail)) {
      toast.error('Enter a valid email');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/otp/send', { email: otpEmail });
      setOtpStep(2);
      setCountdown(30);
      toast.success('Code sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (code) => {
    setIsLoading(true);
    try {
      await api.post('/auth/otp/verify', { email: otpEmail, otp: code });
      await checkAuth();
      toast.success('Logged in successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Top Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Compliance & Operations Portal</span>
        </div>
        <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
          Welcome Back
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Sign in to access your organization workspace
        </p>
      </div>

      {/* Modern Segmented Tab Switcher */}
      <div className="flex p-1 bg-slate-100/90 border border-slate-200/70 rounded-xl mb-4">
        <button 
          type="button"
          className={`flex-1 py-1.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 ${
            tab === 'password' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
          onClick={() => { setTab('password'); setOtpStep(1); }}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Password</span>
        </button>
        <button 
          type="button"
          className={`flex-1 py-1.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 ${
            tab === 'otp' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
          onClick={() => setTab('otp')}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email One-Time Code</span>
        </button>
      </div>

      {/* Password Tab Form */}
      {tab === 'password' && (
        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-3.5">
          <Input 
            label="Email Address" 
            type="email"
            placeholder="you@company.com" 
            icon={Mail}
            {...register('email')} 
            error={errors.email} 
          />
          
          <PasswordInput 
            label="Password" 
            placeholder="Enter your password" 
            icon={Lock}
            {...register('password')} 
            error={errors.password} 
            rightElement={
              <Link 
                to="/forgot-password" 
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              >
                Forgot password?
              </Link>
            }
          />

          <Button 
            type="submit" 
            className="w-full h-11 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow transition-all mt-2" 
            isLoading={isLoading}
          >
            <span>Log In</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>
      )}

      {/* Email OTP Tab - Step 1: Request Code */}
      {tab === 'otp' && otpStep === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <Input 
            label="Email Address" 
            type="email"
            placeholder="you@company.com" 
            icon={Mail}
            value={otpEmail}
            onChange={(e) => setOtpEmail(e.target.value)}
          />
          <Button 
            type="submit" 
            className="w-full h-11 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow transition-all mt-2" 
            isLoading={isLoading}
          >
            <span>Send One-Time Code</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>
      )}

      {/* Email OTP Tab - Step 2: Verify Code */}
      {tab === 'otp' && otpStep === 2 && (
        <div className="space-y-5">
          <div className="text-center p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            <p className="text-xs text-slate-500 mb-0.5">Enter the 6-digit code sent to</p>
            <p className="font-semibold text-slate-800 text-sm">{otpEmail}</p>
          </div>

          <div className="flex justify-center py-1">
            <OtpInput length={6} onComplete={handleVerifyOtp} />
          </div>

          {isLoading && <p className="text-center text-xs font-medium text-blue-600">Verifying code...</p>}

          <div className="flex flex-col items-center gap-2 pt-1 text-xs">
            {countdown > 0 ? (
              <p className="text-slate-400">Resend code in <strong className="text-slate-700">{countdown}s</strong></p>
            ) : (
              <button 
                type="button"
                onClick={handleSendOtp} 
                className="text-blue-600 font-semibold hover:underline"
              >
                Resend code
              </button>
            )}
            
            <button 
              type="button"
              onClick={() => setOtpStep(1)} 
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← Use a different email
            </button>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 text-center text-xs sm:text-sm text-slate-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 font-semibold hover:underline transition-colors">
          Sign up free
        </Link>
      </div>
    </div>
  );
};

export default Login;
