
import React, { useContext, useState } from 'react';
import { UserContext } from '../../App';
import { Student } from '../../types';
import Button from '../../components/Button';
import { geminiService } from '../../services/geminiService';
import SparkIcon from '../../components/icons/SparkIcon';
import LoadingSpinner from '../../components/LoadingSpinner';

const ArrowLeftIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const StudentAnalytics: React.FC<{ student: Student; onBack: () => void; }> = ({ student, onBack }) => {
    const context = useContext(UserContext);
    const [weakTopics, setWeakTopics] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    if (!context) return null;
    const { lessons } = context;

    const analyzeWeakTopics = async () => {
        setIsLoading(true);
        setWeakTopics('');
        const quizHistorySummary = lessons
            .filter(l => student.completedLessons[l.id] !== undefined)
            .map(l => `Lesson '${l.title}': Score ${student.completedLessons[l.id]}%.`);
            
        const prompt = `
            Analyze the following student's quiz history to identify potential weak topics. The student is a Turkish speaker learning English.
            Assume incorrect answers were related to the primary concepts of the lessons where scores are low.
            
            Student Name: ${student.profile.name}
            Quiz History:
            ${quizHistorySummary.join('\n')}

            Based on this, generate a concise list (2-3 bullet points) of flagged weak topics. For example, if the score for "Daily Routines" is low, a weak topic might be "Present Tense Verbs".
            Format as a markdown list.
        `;
        const analysis = await geminiService.generateText(prompt);
        setWeakTopics(analysis);
        setIsLoading(false);
    };

    const lessonScores = lessons.map(lesson => ({
        title: lesson.title,
        score: student.completedLessons[lesson.id]
    }));

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <header className="flex items-center mb-8">
                <Button onClick={onBack} variant="ghost" leftIcon={<ArrowLeftIcon className="w-5 h-5"/>}>Back to Dashboard</Button>
            </header>
            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Student Profile */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg h-fit">
                    <h2 className="text-2xl font-bold mb-4">{student.profile.name}</h2>
                    <p><strong>Age:</strong> {student.profile.age}</p>
                    <p><strong>Total Points:</strong> {student.points}</p>
                    <p className="mt-2"><strong>Goals:</strong> {student.profile.learningGoals}</p>
                </div>

                {/* Main Analytics */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Quiz History */}
                    <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold mb-4">Quiz History</h3>
                        <ul className="space-y-3">
                            {lessonScores.map((item, index) => (
                                <li key={index} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                    <span className="font-semibold">{item.title}</span>
                                    {item.score !== undefined ? (
                                        <span className={`font-bold ${item.score >= 80 ? 'text-green-500' : item.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>{item.score}%</span>
                                    ) : (
                                        <span className="text-slate-400">Not Taken</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* AI Analysis */}
                    <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold flex items-center">
                                <SparkIcon className="w-6 h-6 mr-2 text-indigo-500"/>
                                AI-Flagged Weak Topics
                            </h3>
                            <Button onClick={analyzeWeakTopics} isLoading={isLoading}>Analyze</Button>
                        </div>
                        {isLoading && <LoadingSpinner text="Analyzing..."/>}
                        {weakTopics ? (
                             <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{__html: weakTopics.replace(/\*/g, '<li>')}} />
                        ): (
                            <p className="text-slate-500 dark:text-slate-400">Click "Analyze" to identify student's potential areas for improvement.</p>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default StudentAnalytics;
