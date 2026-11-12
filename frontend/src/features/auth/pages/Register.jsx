import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import api from '@/services/api';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/config/firebase';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  });
  const passwordValue = watch('password', '');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // 2. Call backend if we need to store profile (optional, but requested for architecture)
      // Since backend doesn't store users in Mongo anymore, we just navigate.
      // But we can optionally call a backend endpoint if we want.
      // We will just show success.
      toast.success('Account created successfully!');
      // PublicRoute will auto-redirect
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already exists');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address');
      } else {
        toast.error('Registration failed: ' + (error.message || 'Unknown error'));
      }
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
        <h1 className="text-[28px] font-bold text-gray-900 mb-2">Create Your Account</h1>
        <p className="text-gray-500 text-[15px]">Get started with free compliance tools</p>
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input 
          label="Full Name" 
          placeholder="Your full name" 
          {...register('name')} 
          error={errors.name} 
        />
        
        <Input 
          label="Email" 
          type="email"
          placeholder="you@company.com" 
          {...register('email')} 
          error={errors.email} 
        />
        
        <PasswordInput 
          label="Password" 
          placeholder="Min 8 characters" 
          value={passwordValue}
          {...register('password')} 
          error={errors.password} 
          showStrength={true}
        />

        <Button type="submit" className="w-full h-12 text-base mt-2" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center text-[15px] text-gray-600">
        Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Log in</Link>
      </div>

      <div className="mt-8 text-center text-xs text-gray-500 max-w-sm mx-auto">
        By signing up, you agree to our <Link to="/terms" className="underline hover:text-gray-700">Terms</Link> and <Link to="/privacy" className="underline hover:text-gray-700">Privacy Policy</Link>.
      </div>
    </div>
  );
};

export default Register;
