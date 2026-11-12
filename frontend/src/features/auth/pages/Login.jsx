import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import OtpInput from '@/components/ui/OtpInput';
import api from '@/services/api';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
      // PublicRoute will auto-redirect when auth state updates
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
      // PublicRoute will auto-redirect when auth state updates
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired code');
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Logged in successfully!');
      // PublicRoute will auto-redirect
    } catch (error) {
      console.error(error);
      toast.error('Google login failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };


  return (
    <div className="flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-[28px] font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-500 text-[15px]">Log in to access your compliance dashboard</p>
      </div>

      <Button 
        variant="secondary" 
        className="w-full h-12 flex items-center justify-center gap-3 !font-medium"
        onClick={() => googleLogin()}
        isLoading={isGoogleLoading}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </Button>

      <Divider />

      {/* Tabs */}
      <div className="flex p-1 bg-white border border-slate-200 rounded-xl mb-6 relative z-0">
        <div className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-blue-600 rounded-lg transition-transform duration-300 ease-in-out -z-10 ${tab === 'otp' ? 'translate-x-full' : 'translate-x-0'}`} />
        
        <button 
          className={`flex-1 py-2 text-sm font-semibold transition-colors ${tab === 'password' ? 'text-white' : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => { setTab('password'); setOtpStep(1); }}
        >
          Password
        </button>
        <button 
          className={`flex-1 py-2 text-sm font-semibold transition-colors ${tab === 'otp' ? 'text-white' : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => setTab('otp')}
        >
          Email one-time code
        </button>
      </div>

      {tab === 'password' && (
        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-5 animate-fade-in">
          <Input 
            label="Email" 
            type="email"
            placeholder="you@company.com" 
            {...register('email')} 
            error={errors.email} 
          />
          
          <PasswordInput 
            label="Password" 
            placeholder="Enter your password" 
            {...register('password')} 
            error={errors.password} 
            rightElement={<Link to="/forgot-password" className="text-sm text-blue-600 hover:underline font-medium">Forgot password?</Link>}
          />

          <Button type="submit" className="w-full h-12 text-base mt-2" isLoading={isLoading}>
            Log In
          </Button>
        </form>
      )}

      {tab === 'otp' && otpStep === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-5 animate-fade-in">
          <Input 
            label="Email" 
            type="email"
            placeholder="you@company.com" 
            value={otpEmail}
            onChange={(e) => setOtpEmail(e.target.value)}
          />
          <Button type="submit" className="w-full h-12 text-base mt-2" isLoading={isLoading}>
            Send Code
          </Button>
        </form>
      )}

      {tab === 'otp' && otpStep === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Enter the 6-digit code sent to</p>
            <p className="font-semibold text-gray-900">{otpEmail}</p>
          </div>

          <div className="flex justify-center">
            <OtpInput length={6} onComplete={handleVerifyOtp} />
          </div>

          {isLoading && <p className="text-center text-sm text-blue-600">Verifying...</p>}

          <div className="flex flex-col items-center gap-3 pt-2">
            {countdown > 0 ? (
              <p className="text-sm text-gray-500">Resend code in {countdown}s</p>
            ) : (
              <button onClick={handleSendOtp} className="text-sm text-blue-600 font-medium hover:underline">
                Resend code
              </button>
            )}
            
            <button onClick={() => setOtpStep(1)} className="text-sm text-gray-500 hover:text-gray-900">
              Change email
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 text-center text-[15px] text-gray-600">
        Don't have an account? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Sign up free</Link>
      </div>
    </div>
  );
};

export default Login;
