
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