import { useState } from 'react';
import { useForm } from 'react-form';
// Simple implementation since react-hook-form and zod weren't installed yet, but we will use standard states
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/services/api';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Divider from '@/components/ui/Divider';
import Button from '@/components/ui/Button';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const getStrength = (pass) => {
    if (pass.length === 0) return { label: '', color: 'bg-slate-200' };
    if (pass.length < 8) return { label: 'Weak', color: 'bg-red-400' };
    if (pass.match(/[A-Z]/) && pass.match(/[0-9]/)) return { label: 'Strong', color: 'bg-green-500' };
    return { label: 'Medium', color: 'bg-yellow-400' };
  };
  const strength = getStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 8) return toast.error('Password must be at least 8 characters');
    
    setIsLoading(true);
    try {
      await api.post('/auth/register', { ...formData });
      toast.success('Registration successful!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col text-center">
      <h1 className="text-3xl font-bold text-brand-navy mb-2">Create Your Account</h1>
      <p className="text-gray-500 mb-8">Get started with free compliance tools</p>

      <button className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-lg py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors">
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
        Continue with Google
      </button>

      <Divider text="or" />

      <form onSubmit={handleSubmit} className="text-left space-y-4">
        <Input 
          label="Full Name" 
          placeholder="Your full name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input 
          label="Email" 
          type="email" 
          placeholder="you@company.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <div>
          <PasswordInput 
            label="Password" 
            placeholder="Min 8 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          {formData.password.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 flex gap-1 h-1.5">
                <div className={`flex-1 rounded-full ${formData.password.length > 0 ? strength.color : 'bg-slate-200'}`} />
                <div className={`flex-1 rounded-full ${formData.password.length >= 8 ? strength.color : 'bg-slate-200'}`} />
                <div className={`flex-1 rounded-full ${strength.label === 'Strong' ? strength.color : 'bg-slate-200'}`} />
              </div>
              <span className={`text-xs font-medium ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg h-12 mt-4 transition-colors"
        >
          {isLoading ? 'Creating...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-600">
        Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-medium">Log in</Link>
      </p>
      <p className="mt-3 text-xs text-gray-400">
        By signing up, you agree to our <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}
