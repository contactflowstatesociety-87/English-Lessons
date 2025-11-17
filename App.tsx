
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { User, UserRole, Student, Instructor, Lesson } from './types';
import { MOCK_STUDENTS, INSTRUCTORS, MOCK_LESSONS } from './constants';
import LoginView from './views/LoginView';
import SignUpView from './views/SignUpView';
import StudentProfileSetup from './views/student/StudentProfileSetup';
import StudentDashboard from './views/student/StudentDashboard';
import InstructorDashboard from './views/instructor/InstructorDashboard';
import LessonPlayer from './views/student/LessonPlayer';
import StudentAnalytics from './views/instructor/StudentAnalytics';
import Leaderboard from './views/student/Leaderboard';
import Toast from './components/Toast';
import { googleSheetService } from './services/googleSheetService';

export const UserContext = React.createContext<{
  user: User | null;
  students: Student[];
  lessons: Lesson[];
  logout: () => void;
  updateStudentData: (updatedStudent: Student) => void;
} | null>(null);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [lessons, setLessons] = useState<Lesson[]>(MOCK_LESSONS);
  const [currentView, setCurrentView] = useState('login');
  const [history, setHistory] = useState<string[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  const logout = useCallback(() => {
    setUser(null);
    setCurrentView('login');
    setSelectedLesson(null);
    setSelectedStudent(null);
    setHistory([]);
  }, []);
  
  const navigate = (targetView: string) => {
    setHistory(prevHistory => [...prevHistory, currentView]);
    setCurrentView(targetView);
  };

  const goBack = useCallback(() => {
    if (currentView === 'profileSetup' && history.includes('signup')) {
        logout();
        return;
    }

    if (history.length > 0) {
      const previousView = history[history.length - 1];
      setHistory(prevHistory => prevHistory.slice(0, -1));
      setCurrentView(previousView);
    }
  }, [history, currentView, logout]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const updateStudentData = useCallback((updatedStudent: Student) => {
    setStudents(prevStudents => {
        const studentExists = prevStudents.some(s => s.id === updatedStudent.id);
        if (studentExists) {
            return prevStudents.map(s => (s.id === updatedStudent.id ? updatedStudent : s));
        }
        return [...prevStudents, updatedStudent];
    });

    if (user && user.id === updatedStudent.id) {
      setUser(updatedStudent);
    }
  }, [user]);
  
  const handleStudentLogin = (email: string, password: string): boolean => {
    const studentUser = students.find(s => s.profile.email?.toLowerCase() === email.toLowerCase());

    if (studentUser && studentUser.profile.password === password) {
        setUser(studentUser);
        setHistory([]);
        if (!studentUser.profile.name || !studentUser.profile.learningGoals) {
            setCurrentView('profileSetup');
        } else {
            setCurrentView('studentDashboard');
        }
        showToast('Login successful!', 'success');
        return true;
    }

    showToast('Invalid student email or password.', 'error');
    return false;
  };

  const handleInstructorLogin = (email: string, password: string): boolean => {
    const instructorUser = INSTRUCTORS.find(i => i.profile.email.toLowerCase() === email.toLowerCase());

    if (instructorUser && instructorUser.profile.password === password) {
        setUser(instructorUser);
        setHistory([]);
        setCurrentView('instructorDashboard');
        showToast('Instructor login successful!', 'success');
        return true;
    }

    showToast('Invalid instructor credentials.', 'error');
    return false;
  };
  
  const handleSignUp = async (details: { fullName: string, email: string, country: string, city: string, password: string }) => {
    await googleSheetService.saveNewUser(details);
    
    const newStudentId = `student-${Date.now()}`;
    const newStudent: Student = {
        id: newStudentId,
        role: 'Student',
        profile: {
            name: details.fullName,
            email: details.email,
            country: details.country,
            city: details.city,
            password: details.password, // Storing password for login simulation
            age: 0, 
            learningGoals: '' 
        },
        completedLessons: {},
        points: 0,
        timeSpent: [],
    };
    
    updateStudentData(newStudent);
    googleSheetService.logInteraction(newStudentId, 'user_signup', { name: details.fullName, email: details.email, country: details.country, city: details.city });

    setUser(newStudent);
    setHistory(['login', 'signup']); 
    setCurrentView('profileSetup');
    showToast('Account created! Please complete your profile.', 'success');
  };

  const handleProfileSave = (name: string, age: number, goals: string) => {
    if (!user || user.role !== 'Student') return;

    const studentUser = user as Student;
    const updatedUser: Student = {
      ...studentUser,
      profile: { ...studentUser.profile, name, age, learningGoals: goals },
    };
    
    updateStudentData(updatedUser);
    
    setHistory([]); 
    setCurrentView('studentDashboard');
    showToast('Profile saved!', 'success');
  };

  const contextValue = useMemo(
    () => ({ user, students, lessons, logout, updateStudentData }),
    [user, students, lessons, logout, updateStudentData]
  );
  
  const handleLessonComplete = (lessonId: string, score: number) => {
    const student = user as Student;
    const updatedStudent: Student = {
        ...student,
        completedLessons: {
            ...student.completedLessons,
            [lessonId]: score,
        },
        points: student.points + score,
    };
    updateStudentData(updatedStudent);
    goBack(); 
    showToast(`Lesson complete! You scored ${score} points.`, 'success');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'login':
        return <LoginView onStudentLogin={handleStudentLogin} onInstructorLogin={handleInstructorLogin} onNavigateToSignUp={() => navigate('signup')} />;
      case 'signup':
        return <SignUpView onSignUp={handleSignUp} onGoToLogin={() => setCurrentView('login')} />;
      case 'profileSetup':
        return <StudentProfileSetup onSave={handleProfileSave} onBack={goBack} showBackButton={history.length > 0} />;
      case 'studentDashboard':
        return <StudentDashboard 
                    onStartLesson={(lesson) => { setSelectedLesson(lesson); navigate('lessonPlayer'); }}
                    onShowLeaderboard={() => navigate('leaderboard')}
                    onBack={goBack}
                    showBackButton={history.length > 0}
                />;
      case 'lessonPlayer':
        return selectedLesson && <LessonPlayer lesson={selectedLesson} onComplete={handleLessonComplete} onBack={goBack} />;
      case 'leaderboard':
        return <Leaderboard onBack={goBack} />;
      case 'instructorDashboard':
        return <InstructorDashboard 
                  onSelectStudent={(student) => { setSelectedStudent(student); navigate('studentAnalytics'); }} 
                  onBack={goBack}
                  showBackButton={history.length > 0}
                />;
      case 'studentAnalytics':
        return selectedStudent && <StudentAnalytics student={selectedStudent} onBack={goBack} />;
      default:
        return <LoginView onStudentLogin={handleStudentLogin} onInstructorLogin={handleInstructorLogin} onNavigateToSignUp={() => navigate('signup')} />;
    }
  };

  return (
    <UserContext.Provider value={contextValue}>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        {renderContent()}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </UserContext.Provider>
  );
};

export default App;