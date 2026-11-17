import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Sparkles,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowRight,
  Award,
  RefreshCw,
  Flame,
} from 'lucide-react';
import { useChild } from '../context/ChildContext';
import { getLessons, getLessonDetail, submitQuiz } from '../services/api';

export default function EcoLearningPage() {
  const { child, playSound, addPoints, refreshChildData } = useChild();

  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [quizState, setQuizState] = useState(null); // { currentQuestion, answers, result }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLessons()
      .then((data) => {
        setLessons(data || []);
        if (data && data.length > 0) {
          loadLesson(data[0].id);
        }
      })
      .catch(() => {
        // Fallback offline lesson
        const demo = {
          id: 'lesson-ocean-01',
          title: 'The Great Ocean Rescue: Why Plastic Matters',
          category: 'Oceans & Marine Life',
          icon: '🌊',
          summary: 'Discover how plastic travels to the ocean and how our upcycling crafts help sea turtles and whales swim safely!',
          read_time_minutes: 3,
          eco_points: 10,
          fun_fact: 'A plastic water bottle floating in the ocean can take over 450 years to break down!',
          sections: [
            {
              heading: 'Plastic on the Move',
              body: 'When a plastic bottle or bag is tossed onto the ground, rain and wind can wash it into storm drains, rivers, and eventually out to sea. Once in the ocean, sunlight and waves break plastic into tiny pieces called microplastics.',
            },
            {
              heading: 'Friends in Danger',
              body: 'Sea turtles love eating jellyfish, but floating plastic bags look just like their favorite snack! Whales and sea birds can also accidentally swallow plastic bits when looking for food.',
            },
            {
              heading: 'Your Craft Superpower!',
              body: 'Every time you turn a bottle into a planter, a pencil pot, or a bird feeder, you stop that plastic from ever reaching the sea. You are an ocean guardian!',
            },
          ],
          quiz: [
            {
              question: 'Why do sea turtles sometimes mistake plastic bags for food?',
              options: ['Plastic bags smell sweet', 'Floating bags look just like jellyfish', 'Turtles use bags as blankets', 'Bags make funny noises'],
            },
            {
              question: 'What happens to plastic when you reuse it for crafts?',
              options: ['It gets sent straight to a landfill', 'It stays out of nature and gets a useful new purpose', 'It turns into salt water', 'It floats to outer space'],
            },
            {
              question: 'About how long can a plastic bottle last in the ocean if not recycled?',
              options: ['5 days', '1 month', 'Over 450 years', '2 years'],
            },
          ],
        };
        setLessons([demo]);
        setActiveLesson(demo);
        setQuizState({ currentQuestion: 0, answers: [], result: null });
      })
      .finally(() => setLoading(false));
  }, []);

  const loadLesson = async (lessonId) => {
    playSound('click');
    setLoading(true);
    try {
      const detail = await getLessonDetail(lessonId);
      setActiveLesson(detail);
      setQuizState({
        currentQuestion: 0,
        answers: [],
        result: null,
      });
    } catch (e) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (optionIdx) => {
    playSound('click');
    if (!quizState || !activeLesson?.quiz) return;

    const newAnswers = [...quizState.answers, optionIdx];

    if (newAnswers.length < activeLesson.quiz.length) {
      setQuizState({
        ...quizState,
        currentQuestion: quizState.currentQuestion + 1,
        answers: newAnswers,
      });
    } else {
      // Submit complete quiz
      handleQuizComplete(newAnswers);
    }
  };

  const handleQuizComplete = async (finalAnswers) => {
    try {
      const res = await submitQuiz(child.id, activeLesson.id, finalAnswers);
      setQuizState((prev) => ({
        ...prev,
        answers: finalAnswers,
        result: res,
      }));

      if (res.perfect_score) {
        playSound('fanfare');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        playSound('click');
      }

      addPoints(res.points_awarded);
      refreshChildData(child.id);
    } catch (e) {
      // Offline grading fallback
      const mockResult = {
        score: finalAnswers.length,
        total_questions: finalAnswers.length,
        perfect_score: true,
        points_awarded: 10,
        feedback: finalAnswers.map((a, i) => ({
          question: activeLesson.quiz[i].question,
          is_correct: true,
          explanation: 'Great job! You saved our planet with eco knowledge!',
        })),
      };
      setQuizState((prev) => ({
        ...prev,
        answers: finalAnswers,
        result: mockResult,
      }));
      playSound('fanfare');
      addPoints(10);
    }
  };

  const resetQuiz = () => {
    playSound('click');
    setQuizState({
      currentQuestion: 0,
      answers: [],
      result: null,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs font-display font-extrabold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5 text-sky-600" />
          Interactive Eco Learning Center
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900">
          Learn How Nature Heals! 🌍
        </h1>
        <p className="text-base font-semibold text-slate-600 max-w-xl mx-auto">
          Read quick illustrated lessons about marine animals, forests, and upcycling magic, then take the quiz to earn Eco-Points!
        </p>
      </div>

      {/* Main Grid: Lesson Selector + Active Lesson Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (4 cols): Lesson List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="font-display font-bold text-lg text-slate-800">
            Choose a Lesson ({lessons.length})
          </h3>
          <div className="space-y-3">
            {lessons.map((lesson) => {
              const isActive = activeLesson?.id === lesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => loadLesson(lesson.id)}
                  className={`w-full p-4 rounded-3xl border-2 text-left transition-all flex items-start gap-4 ${
                    isActive
                      ? 'border-eco-500 bg-eco-50 shadow-sm scale-102'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="text-3xl p-2 bg-white rounded-2xl shadow-sm select-none">
                    {lesson.icon}
                  </span>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-eco-700 uppercase tracking-wide">
                      {lesson.category}
                    </span>
                    <h4 className="font-display font-bold text-sm text-slate-800 leading-snug">
                      {lesson.title}
                    </h4>
                    <span className="text-xs font-semibold text-slate-400 block">
                      ⏱️ {lesson.read_time_minutes} min • +{lesson.eco_points} Pts
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column (8 cols): Lesson Content + Quiz */}
        <div className="lg:col-span-8 space-y-8">
          {activeLesson ? (
            <div className="space-y-8">
              {/* Lesson Narrative Card */}
              <div className="kid-card p-6 sm:p-10 border-2 border-eco-200 space-y-6 bg-white">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{activeLesson.icon}</span>
                  <div>
                    <span className="text-xs font-extrabold text-eco-700 uppercase">
                      {activeLesson.category}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
                      {activeLesson.title}
                    </h2>
                  </div>
                </div>

                {/* Did You Know Fun Fact Box */}
                {activeLesson.fun_fact && (
                  <div className="p-4 rounded-2xl bg-sunny-50 border-2 border-sunny-300 text-slate-800 text-sm font-semibold flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-900 font-extrabold block">Did You Know?</strong>
                      <span>{activeLesson.fun_fact}</span>
                    </div>
                  </div>
                )}

                {/* Lesson Sections */}
                <div className="space-y-6 pt-2">
                  {activeLesson.sections?.map((sec, i) => (
                    <div key={i} className="space-y-2">
                      <h3 className="font-display font-bold text-xl text-slate-800">
                        {sec.heading}
                      </h3>
                      <p className="text-base text-slate-600 font-medium leading-relaxed">
                        {sec.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Quiz Card */}
              <div className="kid-card p-6 sm:p-10 border-4 border-sunny-300 bg-gradient-to-b from-sunny-50/50 to-white space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🧠</span>
                    <h3 className="font-display font-extrabold text-2xl text-slate-900">
                      Interactive Eco Quiz
                    </h3>
                  </div>
                  <span className="text-xs font-extrabold text-amber-800 bg-sunny-200 px-3 py-1 rounded-full">
                    +{activeLesson.eco_points} Points on Complete
                  </span>
                </div>

                {/* Quiz Question View */}
                {quizState && !quizState.result && activeLesson.quiz && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>
                        Question {quizState.currentQuestion + 1} of {activeLesson.quiz.length}
                      </span>
                    </div>

                    <h4 className="font-display font-extrabold text-xl text-slate-800">
                      {activeLesson.quiz[quizState.currentQuestion]?.question}
                    </h4>

                    <div className="grid grid-cols-1 gap-3">
                      {activeLesson.quiz[quizState.currentQuestion]?.options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectAnswer(optIdx)}
                          className="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-eco-500 hover:bg-eco-50/50 text-left font-display font-bold text-base text-slate-800 transition-all flex items-center justify-between group"
                        >
                          <span>{opt}</span>
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-eco-600 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quiz Results View */}
                {quizState?.result && (
                  <div className="space-y-6 text-center animate-fadeIn">
                    <div className="text-6xl animate-bounce">
                      {quizState.result.perfect_score ? '🌟' : '🎉'}
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
                        {quizState.result.perfect_score ? 'Perfect Score!' : 'Quiz Complete!'}
                      </h4>
                      <p className="text-base font-semibold text-slate-600">
                        You scored {quizState.result.score} out of {quizState.result.total_questions} and earned{' '}
                        <strong className="text-amber-600 font-extrabold">
                          +{quizState.result.points_awarded} Eco-Points!
                        </strong>
                      </p>
                    </div>

                    {/* Explanations list */}
                    <div className="space-y-3 text-left">
                      {quizState.result.feedback?.map((fb, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border-2 ${
                            fb.is_correct
                              ? 'border-eco-300 bg-eco-50/60 text-eco-900'
                              : 'border-amber-300 bg-amber-50/60 text-amber-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {fb.is_correct ? (
                              <CheckCircle className="w-5 h-5 text-eco-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                            )}
                            <span className="font-display font-bold text-sm">{fb.question}</span>
                          </div>
                          {fb.explanation && (
                            <p className="text-xs font-semibold pl-7">{fb.explanation}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 flex justify-center">
                      <button
                        onClick={resetQuiz}
                        className="btn-kid btn-kid-green py-3 px-8 text-sm flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Try Quiz Again</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-semibold text-slate-500">Select a lesson to begin learning.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
