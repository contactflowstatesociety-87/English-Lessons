
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
        const prompt = `
            For a Turkish-speaking English learner, provide a simple definition, common usage tips, and two example sentences (with Turkish translations) for the English ${item.type === 'vocabulary' ? 'word' : 'phrase'} "${term}".
            Format the response as clean, readable text.
        `;
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
                             <button onClick={() => setShowInfo(false)} className="text-2xl">&times;</button>
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
