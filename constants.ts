
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