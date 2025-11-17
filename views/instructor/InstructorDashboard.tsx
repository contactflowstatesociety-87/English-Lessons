
import React, { useContext, useState, useMemo } from 'react';
import { UserContext } from '../../App';
import { Student } from '../../types';
import Button from '../../components/Button';
import { geminiService } from '../../services/geminiService';
import LoadingSpinner from '../../components/LoadingSpinner';

const ArrowLeftIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const ExportIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);
const AnalyzeIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

interface InstructorDashboardProps {
    onSelectStudent: (student: Student) => void;
    onBack: () => void;
    showBackButton: boolean;
}

const InstructorDashboard: React.FC<InstructorDashboardProps> = ({ onSelectStudent, onBack, showBackButton }) => {
    const context = useContext(UserContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [classAnalysis, setClassAnalysis] = useState<{text: string, sources: any[]} | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    if (!context || !context.user || context.user.role !== 'Instructor') {
        return <div>Error: Not an instructor or no context.</div>;
    }

    const instructor = context.user;
    const students = context.students;
    const lessons = context.lessons;

    const filteredStudents = useMemo(() => {
        return students
            .filter(s => s.profile.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(s => {
                if (filter === 'all') return true;
                const avgScore = Object.values(s.completedLessons).reduce((a, b) => a + b, 0) / (Object.values(s.completedLessons).length || 1);
                if (filter === 'top') return avgScore >= 90;
                if (filter === 'struggling') return avgScore < 70;
                return true;
            });
    }, [students, searchTerm, filter]);

    const analyzeClass = async () => {
        setIsAnalyzing(true);
        setClassAnalysis(null);
        const studentSummary = students.map(s => ({
            completedLessons: Object.keys(s.completedLessons).length,
            averageScore: Object.values(s.completedLessons).reduce((a, b) => a + b, 0) / (Object.values(s.completedLessons).length || 1)
        }));
        
        const prompt = `
            As an educational analyst, review the following anonymous class data for Turkish-speaking English learners.
            
            Class Data:
            - Total Students: ${students.length}
            - Student Performance Summaries: ${JSON.stringify(studentSummary)}
            - Most Challenging Lesson (hypothetical): "Lesson 3: Daily Routines" (many students scored low)

            Provide a concise analysis including:
            1.  A brief summary of overall class performance.
            2.  Potential reasons why "Daily Routines" might be challenging.
            3.  Suggest 2-3 actionable teaching strategies to help improve understanding.
            4.  Find and cite 1-2 relevant online articles or resources for teaching these concepts using your search tool.
            
            Format the response as clean HTML. Use <h4> for headings.
        `;

        const result = await geminiService.generateTextWithSearch(prompt);
        setClassAnalysis(result);
        setIsAnalyzing(false);
    };

    const Header = () => (
        <header className="bg-white dark:bg-slate-800 shadow-md p-4 flex justify-between items-center">
            <div className="flex-1">
                {showBackButton && (
                    <Button onClick={onBack} variant="ghost" leftIcon={<ArrowLeftIcon className="w-5 h-5"/>}>Back</Button>
                )}
            </div>
            <h1 className="flex-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400 text-center">
                Instructor Dashboard
            </h1>
            <div className="flex-1 flex justify-end">
                <Button onClick={context.logout} variant="secondary">Logout</Button>
            </div>
        </header>
    );

    return (
        <div>
            <Header />
            <main className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Student List */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Students</h2>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-grow px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
                        />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                             className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
                        >
                            <option value="all">All Students</option>
                            <option value="top">Top Performers (&gt;90%)</option>
                            <option value="struggling">Struggling (&lt;70%)</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b dark:border-slate-700">
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Lessons Completed</th>
                                    <th className="p-2">Avg. Score</th>
                                    <th className="p-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(student => {
                                    const lessonsDone = Object.keys(student.completedLessons).length;
                                    const avgScore = lessonsDone > 0 ? Math.round(Object.values(student.completedLessons).reduce((a, b) => a + b, 0) / lessonsDone) : 0;
                                    return (
                                        <tr key={student.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="p-3 font-semibold">{student.profile.name}</td>
                                            <td className="p-3">{lessonsDone} / {lessons.length}</td>
                                            <td className="p-3 font-medium">{avgScore}%</td>
                                            <td className="p-3 text-right">
                                                <Button onClick={() => onSelectStudent(student)} size="sm">Details</Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar: Class Summary */}
                <aside className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg h-fit space-y-6">
                    <div>
                        <h2 className="text-xl font-bold mb-4">Class Summary</h2>
                        <div className="space-y-2">
                            <p><strong>Total Students:</strong> {students.length}</p>
                            <p><strong>Avg. Lessons Completed:</strong> { (students.reduce((acc, s) => acc + Object.keys(s.completedLessons).length, 0) / students.length).toFixed(1) }</p>
                        </div>
                    </div>
                    
                    <div className="border-t dark:border-slate-700 pt-6">
                         <h2 className="text-xl font-bold mb-4">Actions</h2>
                         <div className="space-y-3">
                             <Button className="w-full" variant="secondary" leftIcon={<ExportIcon className="w-5 h-5"/>} onClick={() => console.log("Exporting CSV...")}>Export to CSV</Button>
                             <Button className="w-full" leftIcon={<AnalyzeIcon className="w-5 h-5"/>} onClick={analyzeClass} isLoading={isAnalyzing}>Analyze Class Performance</Button>
                         </div>
                    </div>
                    
                    {isAnalyzing && <LoadingSpinner text="Analyzing..."/>}

                    {classAnalysis && (
                        <div className="border-t dark:border-slate-700 pt-6">
                            <h3 className="text-lg font-bold mb-2">AI Class Analysis</h3>
                            <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: classAnalysis.text }}></div>
                            {classAnalysis.sources.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-semibold">Sources:</h4>
                                    <ul className="list-disc pl-5 text-sm">
                                        {classAnalysis.sources.map((source, index) => (
                                            <li key={index}>
                                                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">{source.web.title}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </aside>
            </main>
        </div>
    );
};

export default InstructorDashboard;
