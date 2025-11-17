
import React, { useState } from 'react';
import Button from '../components/Button';
import SparkIcon from '../components/icons/SparkIcon';

interface LoginViewProps {
  onStudentLogin: (email: string, password: string) => boolean;
  onInstructorLogin: (email: string, password: string) => boolean;
  onNavigateToSignUp: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onStudentLogin, onInstructorLogin, onNavigateToSignUp }) => {
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [instructorEmail, setInstructorEmail] = useState('');
  const [instructorPassword, setInstructorPassword] = useState('');
  
  const [isStudentLoading, setIsStudentLoading] = useState(false);
  const [isInstructorLoading, setIsInstructorLoading] = useState(false);
  
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);

  const handleStudentLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsStudentLoading(true);
    const success = onStudentLogin(studentEmail, studentPassword);
    if (!success) {
      setIsStudentLoading(false);
    }
  };

  const handleInstructorLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsInstructorLoading(true);
    const success = onInstructorLogin(instructorEmail, instructorPassword);
    if (!success) {
      setIsInstructorLoading(false);
    }
  };

  const InstructorLoginModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-sm p-8 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl relative">
            <button onClick={() => setIsInstructorModalOpen(false)} className="absolute top-2 right-4 text-3xl font-light text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">&times;</button>
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Instructor Login</h2>
            </div>
            <form onSubmit={handleInstructorLoginSubmit} className="space-y-4">
                <div>
                    <label htmlFor="instructor-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                    <input id="instructor-email" type="email" value={instructorEmail} onChange={(e) => setInstructorEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" placeholder="instructor@example.com"/>
                </div>
                <div>
                    <label htmlFor="instructor-password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                    <input id="instructor-password" type="password" value={instructorPassword} onChange={(e) => setInstructorPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" placeholder="••••••••"/>
                </div>
                <Button type="submit" className="w-full" size="lg" isLoading={isInstructorLoading}>
                    Log In
                </Button>
            </form>
        </div>
    </div>
  );

  return (
    <>
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
        <div className="text-center">
            <div className="flex justify-center">
             <SparkIcon className="w-16 h-16 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-2">Magic English</h1>
            <p className="text-gray-600 dark:text-gray-300">Your AI-powered journey to fluency starts here.</p>
        </div>
        
        <h2 className="text-xl font-semibold text-center text-slate-800 dark:text-slate-200">Student Login</h2>
        <form onSubmit={handleStudentLoginSubmit} className="space-y-4">
            <div>
                <label htmlFor="student-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                <input id="student-email" type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" placeholder="you@example.com"/>
            </div>
            <div>
                <label htmlFor="student-password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <input id="student-password" type="password" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" placeholder="••••••••"/>
            </div>
            <Button type="submit" className="w-full" size="lg" isLoading={isStudentLoading}>
                Log In
            </Button>
        </form>

        <div className="text-center text-sm">
            <p className="text-slate-600 dark:text-slate-400">
                First time here?{' '}
                <button onClick={onNavigateToSignUp} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                    Create an account
                </button>
            </p>
        </div>

        <div className="relative flex items-center justify-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        <div className="text-center">
            <Button onClick={() => setIsInstructorModalOpen(true)} className="w-full" variant="secondary">
                Instructor Login
            </Button>
        </div>
      </div>
    </div>
    {isInstructorModalOpen && <InstructorLoginModal />}
    </>
  );
};

export default LoginView;