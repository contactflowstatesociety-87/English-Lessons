
import React, { useState } from 'react';
import Button from '../../components/Button';

const ArrowLeftIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

interface StudentProfileSetupProps {
  onSave: (name: string, age: number, goals: string) => void;
  onBack: () => void;
  showBackButton: boolean;
}

const StudentProfileSetup: React.FC<StudentProfileSetupProps> = ({ onSave, onBack, showBackButton }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [goals, setGoals] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && age && goals) {
      onSave(name, parseInt(age, 10), goals);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow-sm p-2">
        <div className="max-w-7xl mx-auto">
          {showBackButton && (
            <Button onClick={onBack} variant="ghost" leftIcon={<ArrowLeftIcon className="w-5 h-5" />}>Back</Button>
          )}
        </div>
      </header>
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg p-8 space-y-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white">Welcome! Let's set up your profile.</h1>
          <p className="text-center text-slate-600 dark:text-slate-400">This will help us personalize your learning journey.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., Ayşe Yılmaz"
              />
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Age</label>
              <input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., 15"
              />
            </div>
            <div>
              <label htmlFor="goals" className="block text-sm font-medium text-slate-700 dark:text-slate-300">What are your learning goals?</label>
              <textarea
                id="goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                required
                rows={4}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., To travel the world, to watch movies without subtitles..."
              />
            </div>
            <div>
              <Button type="submit" className="w-full" size="lg">
                Save and Start Learning
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileSetup;
