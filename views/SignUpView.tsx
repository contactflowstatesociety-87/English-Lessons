
import React, { useState } from 'react';
import Button from '../components/Button';
import SparkIcon from '../components/icons/SparkIcon';

interface SignUpViewProps {
  onSignUp: (details: { fullName: string, email: string, country: string, city: string, password: string }) => void;
  onGoToLogin: () => void;
}

const SignUpView: React.FC<SignUpViewProps> = ({ onSignUp, onGoToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!fullName || !email || !country || !city || !password) {
      setError('Please fill out all fields.');
      return;
    }
    setIsLoading(true);
    await onSignUp({ fullName, email, country, city, password });
    // isLoading is handled by App component navigating away
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
        <div className="text-center">
            <div className="flex justify-center">
             <SparkIcon className="w-12 h-12 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">Create Your Account</h1>
            <p className="text-gray-600 dark:text-gray-300">Join Magic English and start your journey!</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
            <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" placeholder="Ayşe Yılmaz"/>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" placeholder="you@example.com"/>
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Country</label>
            <input id="country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" placeholder="Turkey"/>
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
            <input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" placeholder="Ankara"/>
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" placeholder="••••••••"/>
          </div>
          <div>
            <label htmlFor="confirmPassword"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" placeholder="••••••••"/>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Create Account
          </Button>
        </form>
        <div className="text-center text-sm">
            <p className="text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <button onClick={onGoToLogin} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                    Log In
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpView;
