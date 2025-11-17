
import React, { useContext, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserContext } from '../../App';
import { Lesson, Student } from '../../types';
import Button from '../../components/Button';
import SparkIcon from '../../components/icons/SparkIcon';
import Badge from '../../components/Badge';
import { geminiService } from '../../services/geminiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { googleSheetService } from '../../services/googleSheetService';

const ArrowLeftIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

interface StudentDashboardProps {
    onStartLesson: (lesson: Lesson) => void;
    onShowLeaderboard: () => void;
    onBack: () => void;
    showBackButton: boolean;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onStartLesson, onShowLeaderboard, onBack, showBackButton }) => {
    const context = useContext(UserContext);
    const [recommendations, setRecommendations] = useState<string>('');
    const [isLoadingRecs, setIsLoadingRecs] = useState(false);

    if (!context || !context.user || context.user.role !== 'Student') {
        return <div>Error: Not a student or no context.</div>;
    }

    const student = context.user as Student;
    const lessons = context.lessons;

    const completedCount = Object.keys(student.completedLessons).length;
    const totalLessons = lessons.length;
    const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

    const getRecommendations = async () => {
        setIsLoadingRecs(true);
        setRecommendations('');
        googleSheetService.logInteraction(student.id, 'ai_recommendations_requested', {});
        
        const prompt = `
            Based on the following student profile, please provide 2-3 personalized lesson recommendations.
            Keep the response concise and encouraging, formatted as a markdown list.

            Student Profile:
            - Name: ${student.profile.name}
            - Age: ${student.profile.age}
            - Learning Goals: ${student.profile.learningGoals}
            - Completed Lessons: ${Object.keys(student.completedLessons).join(', ') || 'None'}
            - Weak Topics (from past quizzes): Common mistakes in using past tense verbs and prepositions.
            
            Focus on lessons that will help them achieve their goals and improve their weak areas.
        `;
        const response = await geminiService.generateTextWithThinking(prompt);
        setRecommendations(response);
        setIsLoadingRecs(false);
    };
    
    const handleStartLesson = (lesson: Lesson) => {
        googleSheetService.logInteraction(student.id, 'lesson_started', {
            lessonId: lesson.id,
            lessonTitle: lesson.title
        });
        onStartLesson(lesson);
    };

    const Header = () => (
        <header className="bg-white dark:bg-slate-800 shadow-md p-4 flex justify-between items-center">
            <div className="flex-1">
                {showBackButton && (
                    <Button onClick={onBack} variant="ghost" leftIcon={<ArrowLeftIcon className="w-5 h-5"/>}>Back</Button>
                )}
            </div>
            <h1 className="flex-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400 text-center">
                Hi, {student.profile.name}!
            </h1>
            <div className="flex-1 flex justify-end">
                 <Button onClick={onShowLeaderboard} variant="ghost" className="mr-2">Leaderboard</Button>
                 <Button onClick={context.logout} variant="secondary">Logout</Button>
            </div>
        </header>
    );

    return (
        <div>
            <Header />
            <main className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Progress & Stats */}
                    <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Your Progress</h2>
                        <div className="space-y-4">
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
                                <div className="bg-indigo-600 h-4 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span>{completedCount} / {totalLessons} Lessons Completed</span>
                                <span>Total Points: {student.points}</span>
                            </div>
                        </div>
                    </section>
                    
                    {/* AI Recommendations */}
                    <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                         <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center">
                                <SparkIcon className="w-6 h-6 mr-2 text-indigo-500" />
                                AI Lesson Recommendations
                            </h2>
                             <Button onClick={getRecommendations} isLoading={isLoadingRecs} size="sm">
                                {recommendations ? 'Refresh' : 'Get Recs'}
                            </Button>
                        </div>
                        {isLoadingRecs && <LoadingSpinner text="Thinking..." />}
                        {recommendations && <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{__html: recommendations.replace(/\*/g, '<li>')}} />}
                        {!isLoadingRecs && !recommendations && <p className="text-slate-500 dark:text-slate-400">Click "Get Recs" to receive personalized lesson suggestions from our AI!</p>}
                    </section>

                    {/* Time Spent Chart */}
                    <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                         <h2 className="text-xl font-bold mb-4">Time Spent This Week (minutes)</h2>
                         <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={student.timeSpent}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: 'none', color: '#fff' }}/>
                                    <Bar dataKey="minutes" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                         </div>
                    </section>
                </div>

                {/* Right Column - Lesson Catalog */}
                <aside className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg h-fit">
                    <h2 className="text-xl font-bold mb-4">Lesson Catalog</h2>
                    <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                        {lessons.map(lesson => (
                            <div key={lesson.id} className="p-4 border dark:border-slate-700 rounded-lg flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold">{lesson.title}</h3>
                                    <Badge text={lesson.difficulty} type={lesson.difficulty} />
                                    {student.completedLessons[lesson.id] !== undefined && <Badge text="Completed" type="Completed" />}
                                </div>
                                <Button onClick={() => handleStartLesson(lesson)} size="sm">
                                    {student.completedLessons[lesson.id] !== undefined ? 'Review' : 'Start'}
                                </Button>
                            </div>
                        ))}
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default StudentDashboard;
