import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import api from '@/services/api';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { User, Mail, Lock, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

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

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  });
  const passwordValue = watch('password', '');

  useEffect(() => {
    reset({ name: '', email: '', password: '' });
  }, [reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      toast.success('Account created successfully!');
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

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Get Started Free</span>
        </div>
        <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
          Create Your Account
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Access your organization compliance workspace
        </p>
      </div>

      {/* Registration Form with Autofill Trap */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" autoComplete="off">
        {/* Hidden dummy fields to prevent browser credential managers from autofilling */}
        <input type="text" name="fakeusernameremembered" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
        <input type="password" name="fakepasswordremembered" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

        <Input 
          label="Full Name" 
          placeholder="e.g. Rahul Sharma" 
          icon={User}
          autoComplete="off"
          {...register('name')} 
          error={errors.name} 
        />
        
        <Input 
          label="Email Address" 
          type="email"
          placeholder="name@company.com" 
          icon={Mail}
          autoComplete="off"
          {...register('email')} 
          error={errors.email} 
        />
        
        <PasswordInput 
          label="Password" 
          placeholder="Min 8 characters (letters & numbers)" 
          icon={Lock}
          autoComplete="new-password"
          value={passwordValue}
          {...register('password')} 
          error={errors.password} 
          showStrength={true}
        />

        <Button 
          type="submit" 
          className="w-full h-11 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow transition-all mt-2" 
          isLoading={isLoading}
        >
          <span>Create Account</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </form>

      {/* Footer Navigation */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 text-center text-xs sm:text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 font-semibold hover:underline transition-colors">
          Log in
        </Link>
      </div>

      {/* Terms & Privacy */}
      <div className="mt-2.5 text-center text-[11px] sm:text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
        By creating an account, you agree to our{' '}
        <Link to="/terms" className="underline hover:text-slate-600 transition-colors">Terms</Link>
        {' '}and{' '}
        <Link to="/privacy" className="underline hover:text-slate-600 transition-colors">Privacy Policy</Link>.
      </div>
    </div>
  );
};

export default Register;
