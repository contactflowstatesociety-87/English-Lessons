
# Magic English Learning App - Project Log

This file contains a complete snapshot of all the files in the project. It can be used to restore the project state or to review the code in its entirety.

---

## File: `index.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## File: `metadata.json`

```json
{
  "name": "Magic English Learning App",
  "description": "A gamified English curriculum for Turkish speakers, featuring AI-powered lessons, quizzes, progress tracking, and real-time voice conversations with Gemini.",
  "requestFramePermissions": [
    "microphone"
  ]
}
```

---

## File: `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="A gamified English curriculum for Turkish speakers, featuring AI-powered lessons, quizzes, progress tracking, and real-time voice conversations with Gemini." />
    <title>Learn English</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Poppins', sans-serif;
      }
      @keyframes confetti-fall {
        0% { transform: translateY(-10vh) rotateZ(0deg); opacity: 1; }
        100% { transform: translateY(110vh) rotateZ(720deg); opacity: 0; }
      }
      .confetti-piece {
        position: absolute;
        top: -10vh;
        animation-name: confetti-fall;
        animation-timing-function: linear;
        animation-iteration-count: 1;
        animation-fill-mode: forwards;
      }
    </style>
  <script type="importmap">
{
  "imports": {
    "recharts": "https://aistudiocdn.com/recharts@^3.4.1",
    "react-dom/": "https://aistudiocdn.com/react-dom@^19.2.0/",
    "@google/genai": "https://aistudiocdn.com/@google/genai@^1.29.1",
    "react/": "https://aistudiocdn.com/react@^19.2.0/",
    "react": "https://aistudiocdn.com/react@^19.2.0"
  }
}
</script>
</head>
  <body class="bg-gray-50 dark:bg-gray-900">
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
```

---

## File: `App.tsx`

```tsx
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
```

---

## File: `types.ts`

```ts
export type UserRole = 'Student' | 'Instructor';

export interface User {
  id: string;
  role: UserRole;
}

export interface Student extends User {
  role: 'Student';
  profile: {
    name: string;
    age: number;
    learningGoals: string;
    email?: string;
    country?: string;
    city?: string;
    password?: string; // For login simulation
  };
  completedLessons: { [lessonId: string]: number }; // lessonId: score
  points: number;
  timeSpent: { date: string, minutes: number }[]; // For charts
}

export interface Instructor extends User {
  role: 'Instructor';
  profile: {
    name: string;
    email: string;
    password?: string;
  };
}

export interface VocabularyTile {
  type: 'vocabulary';
  word: string;
  turkish: string;
  image: string;
}

export interface PhraseModule {
  type: 'phrase';
  phrase: string;
  turkish: string;
}

export type LessonStep = VocabularyTile | PhraseModule;

export interface Lesson {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  steps: LessonStep[];
  quiz: QuizQuestion[];
}

export type QuizQuestionType = 'multiple-choice' | 'fill-in-the-blank' | 'listening';

export interface QuizQuestion {
  type: QuizQuestionType;
  question: string;
  options?: string[]; // For multiple-choice
  correctAnswer: string;
  audioText?: string; // For listening
}
```

---

## File: `constants.ts`

```ts
import { Student, Instructor, Lesson } from './types';

export const MOCK_STUDENTS: Student[] = [
  {
    id: 'student-1',
    role: 'Student',
    profile: {
      name: 'Ayşe Yılmaz',
      age: 14,
      learningGoals: 'To watch movies without subtitles and travel abroad.',
      email: 'ayse.yilmaz@example.com',
      password: 'password123',
    },
    completedLessons: { 'lesson-1': 80, 'lesson-2': 95 },
    points: 175,
    timeSpent: [
      { date: 'Mon', minutes: 20 },
      { date: 'Tue', minutes: 35 },
      { date: 'Wed', minutes: 15 },
      { date: 'Thu', minutes: 40 },
      { date: 'Fri', minutes: 25 },
      { date: 'Sat', minutes: 60 },
      { date: 'Sun', minutes: 10 },
    ],
  },
  {
    id: 'student-2',
    role: 'Student',
    profile: {
      name: 'Mehmet Öztürk',
      age: 16,
      learningGoals: 'To study computer science at an international university.',
      email: 'mehmet.ozturk@example.com',
      password: 'password123',
    },
    completedLessons: { 'lesson-1': 100, 'lesson-3': 70 },
    points: 210,
    timeSpent: [],
  },
    {
    id: 'student-3',
    role: 'Student',
    profile: {
      name: 'Fatma Kaya',
      age: 15,
      learningGoals: 'To read English fantasy novels.',
      email: 'fatma.kaya@example.com',
      password: 'password123',
    },
    completedLessons: { 'lesson-1': 90 },
    points: 90,
    timeSpent: [],
  },
];

export const INSTRUCTORS: Instructor[] = [
  {
    id: 'instructor-1',
    role: 'Instructor',
    profile: {
      name: 'Flowstate Instructor',
      email: 'contact.flowstatesociety@gmail.com',
      password: 'Cashmoney18$?',
    },
  },
  {
    id: 'instructor-2',
    role: 'Instructor',
    profile: {
      name: 'Müjde Nur',
      email: 'mujde.nurr@gmail.com',
      password: 'Cashmoney18$?',
    },
  },
];


export const MOCK_LESSONS: Lesson[] = [
  {
    id: 'lesson-1',
    title: 'Greetings & Introductions',
    difficulty: 'Beginner',
    steps: [
      { type: 'vocabulary', word: 'Hello', turkish: 'Merhaba', image: 'https://picsum.photos/seed/hello/400' },
      { type: 'vocabulary', word: 'Goodbye', turkish: 'Hoşça kal', image: 'https://picsum.photos/seed/goodbye/400' },
      { type: 'phrase', phrase: "What's your name?", turkish: 'Adınız nedir?' },
      { type: 'phrase', phrase: 'My name is...', turkish: 'Benim adım...' },
      { type: 'vocabulary', word: 'Thank you', turkish: 'Teşekkür ederim', image: 'https://picsum.photos/seed/thankyou/400' },
    ],
    quiz: [
      { type: 'multiple-choice', question: "How do you say 'Merhaba' in English?", options: ['Goodbye', 'Hello', 'Please'], correctAnswer: 'Hello' },
      { type: 'fill-in-the-blank', question: "My ____ is Ayşe.", correctAnswer: 'name' },
      { type: 'listening', question: 'Listen and choose the correct word.', audioText: 'Goodbye', options: ['Good morning', 'Goodbye', 'Good evening'], correctAnswer: 'Goodbye' },
    ],
  },
  {
    id: 'lesson-2',
    title: 'At the Restaurant',
    difficulty: 'Beginner',
    steps: [
        { type: 'vocabulary', word: 'Menu', turkish: 'Menü', image: 'https://picsum.photos/seed/menu/400' },
        { type: 'vocabulary', word: 'Water', turkish: 'Su', image: 'https://picsum.photos/seed/water/400' },
        { type: 'phrase', phrase: 'Can I have the menu, please?', turkish: 'Menüyü alabilir miyim, lütfen?' },
        { type: 'phrase', phrase: 'The check, please.', turkish: 'Hesap, lütfen.' },
    ],
    quiz: [
        { type: 'multiple-choice', question: "What do you ask for to see the list of food?", options: ['Water', 'Check', 'Menu'], correctAnswer: 'Menu' },
        { type: 'listening', audioText: "The check, please.", question: "What is the person asking for?", options: ['The food', 'The bill', 'The table'], correctAnswer: 'The bill' },
    ]
  },
  {
    id: 'lesson-3',
    title: 'Daily Routines',
    difficulty: 'Intermediate',
    steps: [
        { type: 'vocabulary', word: 'Breakfast', turkish: 'Kahvaltı', image: 'https://picsum.photos/seed/breakfast/400' },
        { type: 'vocabulary', word: 'Commute', turkish: 'İşe gidip gelmek', image: 'https://picsum.photos/seed/commute/400' },
        { type: 'phrase', phrase: 'I wake up at 7 AM.', turkish: "Sabah 7'de uyanırım." },
        { type: 'phrase', phrase: 'I take the bus to school.', turkish: 'Okula otobüsle giderim.' },
    ],
    quiz: [
        { type: 'fill-in-the-blank', question: "The first meal of the day is called ____.", correctAnswer: 'breakfast' },
        { type: 'multiple-choice', question: "The journey to work or school is called a ____.", options: ['Routine', 'Commute', 'Schedule'], correctAnswer: 'Commute' },
    ]
  },
   {
    id: 'lesson-4',
    title: 'Discussing Hobbies',
    difficulty: 'Advanced',
    steps: [
        { type: 'vocabulary', word: 'Passionate', turkish: 'Tutkulu', image: 'https://picsum.photos/seed/passionate/400' },
        { type: 'vocabulary', word: 'Recreational', turkish: 'Eğlence amaçlı', image: 'https://picsum.photos/seed/recreational/400' },
        { type: 'phrase', phrase: 'I\'m passionate about photography.', turkish: 'Fotoğrafçılığa tutkuluyum.' },
        { type: 'phrase', phrase: 'I find hiking to be very therapeutic.', turkish: 'Doğa yürüyüşünü çok terapötik buluyorum.' },
    ],
    quiz: [
        { type: 'fill-in-the-blank', question: "If you have a strong feeling for something, you are ____ about it.", correctAnswer: 'passionate' },
        { type: 'multiple-choice', question: "Activities done for enjoyment are ____.", options: ['Mandatory', 'Professional', 'Recreational'], correctAnswer: 'Recreational' },
    ]
  }
];
```

---

## File: `services/geminiService.ts`

```ts
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Assume API key is set in the environment
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY || 'MISSING_API_KEY' });

export const geminiService = {
  generateText: async (prompt: string): Promise<string> => {
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Error generating text:", error);
      return "Sorry, I couldn't generate a response right now.";
    }
  },

  generateTextWithThinking: async (prompt: string): Promise<string> => {
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 32768 },
        }
      });
      return response.text;
    } catch (error) {
      console.error("Error generating text with thinking:", error);
      return "Sorry, I couldn't generate a thoughtful response right now.";
    }
  },
  
  generateTextWithSearch: async (prompt: string): Promise<{ text: string, sources: any[] }> => {
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
        },
      });
      
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      return { text: response.text, sources };
    } catch (error) {
      console.error("Error generating text with search:", error);
      return { text: "Sorry, I couldn't get up-to-date information right now.", sources: [] };
    }
  },

  generateAudio: async (text: string): Promise<string | null> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating audio:", error);
        return null;
    }
  }
};
```

---

## File: `services/googleSheetService.ts`

```ts
import { Student } from '../types';

type InteractionEvent = 
  | 'user_signup'
  | 'lesson_started'
  | 'lesson_completed'
  | 'quiz_submitted'
  | 'ai_example_requested'
  | 'ai_info_requested'
  | 'ai_recommendations_requested';

// This is a MOCK service. In a real application, these functions would
// make secure API calls to a backend server, which would then interact
// with the Google Sheets API. NEVER expose API keys on the frontend.
export const googleSheetService = {
  saveNewUser: (userData: { fullName: string, email: string, country: string, city: string }): Promise<{ success: boolean }> => {
    console.log('[Google Sheet Service] Mock Saving New User:');
    console.table(userData);
    // Simulate network request
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
  },

  logInteraction: (studentId: string, event: InteractionEvent, data: Record<string, any>): void => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      studentId,
      event,
      ...data,
    };
    console.log(`[Google Sheet Service] Mock Logging Interaction: ${event}`);
    console.table(logEntry);
  },
};
```

---

## File: `components/Badge.tsx`

```tsx
import React from 'react';

interface BadgeProps {
  text: string;
  type: 'Beginner' | 'Intermediate' | 'Advanced' | 'Completed' | 'Default';
}

const Badge: React.FC<BadgeProps> = ({ text, type }) => {
  const colorClasses = {
    Beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    Intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    Advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    Completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    Default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  const classes = colorClasses[type] || colorClasses.Default;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {text}
    </span>
  );
};

export default Badge;
```

---

## File: `components/Button.tsx`

```tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 focus:ring-indigo-500',
    ghost: 'bg-transparent text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-slate-800 focus:ring-indigo-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
```

---

## File: `components/Confetti.tsx`

```tsx
import React from 'react';

const ConfettiPiece: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
  return <div className="confetti-piece" style={style}></div>;
};

const Confetti: React.FC = () => {
  const confettiCount = 100;
  const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

  const pieces = Array.from({ length: confettiCount }).map((_, index) => {
    const style: React.CSSProperties = {
      left: `${Math.random() * 100}vw`,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      animationDuration: `${3 + Math.random() * 4}s`,
      animationDelay: `${Math.random() * 5}s`,
      transform: `rotate(${Math.random() * 360}deg)`,
      width: `${Math.floor(Math.random() * (12 - 6 + 1) + 6)}px`,
      height: `${Math.floor(Math.random() * (12 - 6 + 1) + 6)}px`,
      opacity: Math.random() + 0.5,
    };
    return <ConfettiPiece key={index} style={style} />;
  });

  return <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">{pieces}</div>;
};

export default Confetti;
```

---

## File: `components/LoadingSpinner.tsx`

```tsx
import React from 'react';

const LoadingSpinner: React.FC<{ text?: string }> = ({ text = "Loading..."}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8">
      <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="mt-4 text-lg font-semibold text-slate-600 dark:text-slate-400">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
```

---

## File: `components/Toast.tsx`

```tsx
import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // allow fade-out animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  const baseClasses = 'fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white transition-all duration-300 transform';
  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
  };
  const visibilityClasses = visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5';

  return (
    <div role="alert" className={`${baseClasses} ${typeClasses[type]} ${visibilityClasses}`}>
      <div className="flex items-center">
        <span className="font-semibold">{type === 'success' ? 'Success' : 'Error'}:</span>
        <p className="ml-2">{message}</p>
        <button onClick={onClose} className="ml-4 text-xl font-bold" aria-label="Close notification">&times;</button>
      </div>
    </div>
  );
};

export default Toast;
```

---

## File: `components/icons/SparkIcon.tsx`

```tsx
import React from 'react';

const SparkIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.75.75v3.344c1.123.412 2.07.994 2.802 1.726a.75.75 0 11-1.06 1.06C10.79 10.63 10 9.803 10 8.814v-3.06a.75.75 0 01-1 0V.75a.75.75 0 011.5 0v3.061c.49.179 1.01.42 1.512.721a.75.75 0 11-.824 1.235C10.67 5.488 10.03 5.01 9 4.5zM15 6.814v3.06c0 .989-.79 1.816-1.498 2.572a.75.75 0 11-1.06-1.06c.732-.732 1.688-1.314 2.802-1.726V6.064a.75.75 0 01-1 0V3.75a.75.75 0 011.5 0v2.341a4.11 4.11 0 011.512.721.75.75 0 11-.824 1.235A2.613 2.613 0 0015 6.814z" clipRule="evenodd" />
        <path d="M12.51 16.221a.75.75 0 01.49 1.405c-1.801.9-2.887 2.722-2.887 4.624a.75.75 0 01-1.5 0c0-2.484 1.48-4.733 3.693-5.694a.75.75 0 01.704-.335z" />
        <path d="M12 21.75a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" />
        <path d="M10.5 18.75a.75.75 0 00-1.5 0v.008a.75.75 0 001.5 0v-.008z" />
        <path d="M12 12.75a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" />
        <path d="M13.5 15.75a.75.75 0 00-1.5 0v.008a.75.75 0 001.5 0v-.008z" />
        <path d="M10.99 11.23a.75.75 0 00-1.06-1.06l-.008.007a.75.75 0 001.06 1.06l.008-.007z" />
        <path d="M15.75 12.75a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" />
        <path d="M15.49 10.16a.75.75 0 00-1.06-1.06l-.008.007a.75.75 0 001.06 1.06l.008-.007z" />
        <path d="M11.51 16.221a.75.75 0 01.704.335c2.213.96 3.693 3.21 3.693 5.694a.75.75 0 01-1.5 0c0-1.902-1.086-3.723-2.887-4.624a.75.75 0 01-.49-1.405z" />
    </svg>
);
export default SparkIcon;
```

---

## File: `views/LoginView.tsx`

```tsx
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
            <button onClick={() => setIsInstructorModalOpen(false)} aria-label="Close instructor login" className="absolute top-2 right-4 text-3xl font-light text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">&times;</button>
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
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-2">Learn English</h1>
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
```

---

## File: `views/SignUpView.tsx`

```tsx
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
```

---

## File: `views/student/StudentProfileSetup.tsx`

```tsx
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
```

---

## File: `views/student/StudentDashboard.tsx`

```tsx
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
```

---

## File: `views/student/LessonPlayer.tsx`

```tsx
import React, { useState, useCallback, useEffect, useContext } from 'react';
import { Lesson, LessonStep, VocabularyTile, PhraseModule, Student } from '../../types';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import { geminiService } from '../../services/geminiService';
import SparkIcon from '../../components/icons/SparkIcon';
import Confetti from '../../components/Confetti';
import { UserContext } from '../../App';
import { googleSheetService } from '../../services/googleSheetService';

// Audio decoding helper
function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// Custom decoder for raw PCM audio data from Gemini API
async function decodePcmAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const TrophyIconSolid: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071 1.052A2.249 2.249 0 0113.5 6.75v5.228c.38.134.717.34.989.596a.75.75 0 11-1.088.944A1.5 1.5 0 0012 13.5v-1.5a.75.75 0 00-1.5 0v1.5a1.5 1.5 0 00.1 1.018.75.75 0 01-1.088-.944 2.25 2.25 0 01.989-.596V6.75a2.249 2.249 0 011.608-2.412.75.75 0 001.052-1.052z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M12 21a8.25 8.25 0 008.25-8.25V8.805a.75.75 0 011.5 0V12.75a9.75 9.75 0 01-9.75 9.75A9.75 9.75 0 012.25 12.75V8.805a.75.75 0 011.5 0V12.75A8.25 8.25 0 0012 21z" clipRule="evenodd" />
    </svg>
);

const InfoIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const PlayIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const ArrowLeftIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);
const ArrowRightIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

const LessonPlayer: React.FC<{ lesson: Lesson; onComplete: (lessonId: string, score: number) => void; onBack: () => void; }> = ({ lesson, onComplete, onBack }) => {
    const context = useContext(UserContext);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isQuiz, setIsQuiz] = useState(false);
    const [answers, setAnswers] = useState<(string | null)[]>(new Array(lesson.quiz.length).fill(null));
    const [score, setScore] = useState<number | null>(null);
    const [showInfo, setShowInfo] = useState(false);
    const [infoContent, setInfoContent] = useState('');
    const [infoSources, setInfoSources] = useState<any[]>([]);
    const [isInfoLoading, setIsInfoLoading] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [exampleSentence, setExampleSentence] = useState('');
    const [isExampleLoading, setIsExampleLoading] = useState(false);

    const student = context?.user as Student;
    const currentStep = isQuiz ? null : lesson.steps[currentStepIndex];

    const playAudio = useCallback(async (text: string) => {
        setIsAudioLoading(true);
        const audioData = await geminiService.generateAudio(text);
        if (audioData) {
            try {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                const audioBytes = decode(audioData);
                const audioBuffer = await decodePcmAudioData(audioBytes, audioContext, 24000, 1);
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start(0);
            } catch (e) {
                console.error("Error playing audio:", e);
            }
        }
        setIsAudioLoading(false);
    }, []);

    const fetchInfo = async (item: VocabularyTile | PhraseModule) => {
        const term = item.type === 'vocabulary' ? item.word : item.phrase;
        googleSheetService.logInteraction(student.id, 'ai_info_requested', { lessonId: lesson.id, term });
        setIsInfoLoading(true);
        setShowInfo(true);
        setInfoSources([]);
        const prompt = `What is the meaning and common usage of the English ${item.type === 'vocabulary' ? 'word' : 'phrase'} "${term}"? Provide a simple explanation and an example sentence for a Turkish-speaking English learner.`;
        const { text, sources } = await geminiService.generateTextWithSearch(prompt);
        setInfoContent(text);
        setInfoSources(sources);
        setIsInfoLoading(false);
    };
    
    const fetchExample = async (item: VocabularyTile | PhraseModule) => {
        const term = item.type === 'vocabulary' ? item.word : item.phrase;
        googleSheetService.logInteraction(student.id, 'ai_example_requested', { lessonId: lesson.id, term });
        setIsExampleLoading(true);
        setExampleSentence('');
        const prompt = `
            Please provide one new, simple example sentence using the English ${item.type === 'vocabulary' ? 'word' : 'phrase'} "${term}".
            This is for a Turkish-speaking English learner.
            Keep the sentence easy to understand.
            Also, provide the Turkish translation of the sentence.
            Format it as:
            <p><strong>Example:</strong> [English sentence]</p>
            <p><strong>Turkish:</strong> [Turkish translation]</p>
        `;
        const content = await geminiService.generateText(prompt);
        setExampleSentence(content);
        setIsExampleLoading(false);
    };

    const handleNext = () => {
        setExampleSentence('');
        setInfoContent('');
        setInfoSources([]);
        if (currentStepIndex < lesson.steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            setIsQuiz(true);
        }
    };
    
    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setExampleSentence('');
            setInfoContent('');
            setInfoSources([]);
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const handleAnswer = (qIndex: number, answer: string) => setAnswers(prev => {
        const newAnswers = [...prev];
        newAnswers[qIndex] = answer;
        return newAnswers;
    });

    const handleSubmitQuiz = () => {
        let correctCount = 0;
        lesson.quiz.forEach((q, i) => {
            if (answers[i]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
                correctCount++;
            }
        });
        const finalScore = Math.round((correctCount / lesson.quiz.length) * 100);
        googleSheetService.logInteraction(student.id, 'quiz_submitted', {
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            score: finalScore,
            answers
        });
        setScore(finalScore);
    };
    
    const handleCompleteAndFinish = (score: number) => {
        googleSheetService.logInteraction(student.id, 'lesson_completed', {
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            score
        });
        onComplete(lesson.id, score);
    };

    if (score !== null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 relative overflow-hidden">
                <Confetti />
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl z-10">
                    <TrophyIconSolid className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-2">Lesson Complete!</h2>
                    <div className="text-7xl font-bold text-indigo-600 mb-4">{score}%</div>
                    <p className="mb-6 text-lg">You got {Math.round(score / 100 * lesson.quiz.length)} out of {lesson.quiz.length} correct!</p>
                    <Button onClick={() => handleCompleteAndFinish(score)} size="lg">Claim Your Points & Finish</Button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen flex flex-col">
            <header className="p-4 flex justify-between items-center bg-white dark:bg-slate-800 shadow-md">
                <Button onClick={onBack} variant="ghost" leftIcon={<ArrowLeftIcon className="w-5 h-5"/>}>Back</Button>
                <h1 className="text-xl font-bold">{lesson.title}</h1>
                <div className="w-24"></div>
            </header>

            <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 relative">
                    {isQuiz ? (
                        <div>
                             <h2 className="text-2xl font-bold text-center mb-6">Quiz Time!</h2>
                             <div className="space-y-6">
                                {lesson.quiz.map((q, i) => (
                                    <div key={i} className="border-t pt-4 dark:border-slate-700">
                                        <p className="font-semibold mb-2">{i+1}. {q.question}</p>
                                        {q.type === 'listening' && q.audioText && (
                                            <Button onClick={() => playAudio(q.audioText)} size="sm" variant="secondary" className="mb-2" leftIcon={<PlayIcon className="w-4 h-4" />} isLoading={isAudioLoading}>
                                                Play Audio
                                            </Button>
                                        )}
                                        {q.type === 'multiple-choice' && q.options && q.options.map(opt => (
                                            <div key={opt} className="flex items-center mb-2">
                                                <input id={`q${i}-${opt}`} type="radio" name={`q${i}`} value={opt} onChange={() => handleAnswer(i, opt)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"/>
                                                <label htmlFor={`q${i}-${opt}`} className="ml-3 block text-sm text-slate-700 dark:text-slate-300">{opt}</label>
                                            </div>
                                        ))}
                                        {q.type === 'fill-in-the-blank' && (
                                            <input type="text" onChange={(e) => handleAnswer(i, e.target.value)} className="mt-1 block w-full sm:w-1/2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                                        )}
                                    </div>
                                ))}
                             </div>
                             <div className="text-center mt-8">
                                <Button onClick={handleSubmitQuiz} size="lg">Submit Quiz</Button>
                             </div>
                        </div>
                    ) : currentStep && (
                         <div className="flex flex-col items-center text-center">
                            {currentStep.type === 'vocabulary' && (
                                <>
                                    <img src={currentStep.image} alt={currentStep.word} className="w-64 h-64 object-cover rounded-lg mb-4 shadow-lg"/>
                                    <h2 className="text-4xl font-bold">{currentStep.word}</h2>
                                    <p className="text-xl text-slate-500 dark:text-slate-400">{currentStep.turkish}</p>
                                </>
                            )}
                             {currentStep.type === 'phrase' && (
                                <div className="p-8">
                                    <h2 className="text-4xl font-bold">"{currentStep.phrase}"</h2>
                                    <p className="text-xl text-slate-500 dark:text-slate-400 mt-2">{currentStep.turkish}</p>
                                </div>
                             )}
                             <div className="flex flex-wrap justify-center gap-4 mt-6">
                                <Button onClick={() => playAudio(currentStep.type === 'vocabulary' ? currentStep.word : currentStep.phrase)} variant="secondary" isLoading={isAudioLoading} leftIcon={<PlayIcon className="w-5 h-5"/>}>
                                    Pronounce
                                </Button>
                                <Button onClick={() => fetchInfo(currentStep)} variant="secondary" leftIcon={<InfoIcon className="w-5 h-5"/>}>
                                    More Info
                                </Button>
                                <Button onClick={() => fetchExample(currentStep)} variant="secondary" isLoading={isExampleLoading} leftIcon={<SparkIcon className="w-5 h-5" />}>
                                    Get Example
                                </Button>
                             </div>

                             <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg w-full min-h-[100px] flex items-center justify-center">
                                {isExampleLoading ? (
                                    <LoadingSpinner text="Generating..."/>
                                ) : exampleSentence ? (
                                    <div className="text-left prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: exampleSentence }} />
                                ) : (
                                    <p className="text-slate-500 dark:text-slate-400">Click "Get Example" for a new sentence!</p>
                                )}
                            </div>
                         </div>
                    )}

                    {/* Navigation */}
                    {!isQuiz && (
                        <div className="flex justify-between mt-8">
                            <Button onClick={handlePrev} disabled={currentStepIndex === 0} leftIcon={<ArrowLeftIcon className="w-5 h-5"/>}>Prev</Button>
                            <Button onClick={handleNext} rightIcon={<ArrowRightIcon className="w-5 h-5"/>}>
                                {currentStepIndex === lesson.steps.length - 1 ? 'Go to Quiz' : 'Next'}
                            </Button>
                        </div>
                    )}
                </div>
            </main>

             {showInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={() => setShowInfo(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="text-xl font-bold flex items-center"><SparkIcon className="w-6 h-6 mr-2 text-indigo-500" /> More Info</h3>
                             <button onClick={() => setShowInfo(false)} className="text-2xl" aria-label="Close more info modal">&times;</button>
                        </div>
                        {isInfoLoading ? <LoadingSpinner text="Searching..."/> : (
                            <>
                                <div className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: infoContent.replace(/\n/g, '<br />') }} />
                                {infoSources.length > 0 && (
                                    <div className="mt-6 border-t dark:border-slate-700 pt-4">
                                        <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400">Sources:</h4>
                                        <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                                            {infoSources.map((source, index) => source.web && (
                                                <li key={index}>
                                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                                        {source.web.title || source.web.uri}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonPlayer;
```

---

## File: `views/student/Leaderboard.tsx`

```tsx
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
```

---

## File: `views/instructor/InstructorDashboard.tsx`

```tsx
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
```

---

## File: `views/instructor/StudentAnalytics.tsx`

```tsx
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
```