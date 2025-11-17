
import React, { useContext, useState } from 'react';
import { UserContext } from '../../App';
import { Student } from '../../types';
import Button from '../../components/Button';

const ArrowLeftIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15zm4.125 3a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zm-3.875 3.75a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5h-13.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    </svg>
);

const Leaderboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const context = useContext(UserContext);
    const [filter, setFilter] = useState<'all-time' | 'weekly' | 'monthly'>('all-time');

    if (!context) return null;

    const sortedStudents = [...context.students].sort((a, b) => b.points - a.points);
    
    const getRankColor = (rank: number) => {
        if (rank === 0) return 'text-yellow-400';
        if (rank === 1) return 'text-gray-400';
        if (rank === 2) return 'text-yellow-600';
        return 'text-slate-500 dark:text-slate-400';
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <header className="flex items-center mb-8">
                <Button onClick={onBack} variant="ghost" leftIcon={<ArrowLeftIcon className="w-5 h-5"/>}>Dashboard</Button>
            </header>
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-white">Leaderboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">See who's at the top of the class!</p>
                </div>
                {/* <div className="flex justify-center space-x-2 mb-8">
                    <Button variant={filter === 'all-time' ? 'primary' : 'secondary'} onClick={() => setFilter('all-time')}>All Time</Button>
                    <Button variant={filter === 'weekly' ? 'primary' : 'secondary'} onClick={() => setFilter('weekly')}>This Week</Button>
                    <Button variant={filter === 'monthly' ? 'primary' : 'secondary'} onClick={() => setFilter('monthly')}>This Month</Button>
                </div> */}
                <ul className="space-y-4">
                    {sortedStudents.map((student, index) => (
                        <li key={student.id} className={`flex items-center p-4 rounded-lg transition-all duration-300 ${index < 3 ? 'bg-indigo-50 dark:bg-slate-700/50 border-l-4 border-indigo-500' : 'bg-slate-50 dark:bg-slate-700/20'}`}>
                            <div className="flex items-center w-1/6">
                               <span className={`text-2xl font-bold ${getRankColor(index)}`}>{index + 1}</span>
                               {index < 3 && <TrophyIcon className={`w-6 h-6 ml-2 ${getRankColor(index)}`} />}
                            </div>
                            <div className="w-4/6 font-semibold text-lg text-slate-700 dark:text-slate-200">
                                {student.profile.name}
                            </div>
                            <div className="w-1/6 text-right font-bold text-xl text-indigo-600 dark:text-indigo-400">
                                {student.points} pts
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Leaderboard;
