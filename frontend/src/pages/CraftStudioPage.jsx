import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Award,
  CheckSquare,
  Square,
  ShieldCheck,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Film,
  BookOpen,
} from 'lucide-react';
import { useChild } from '../context/ChildContext';
import { getCraftById, completeCraft } from '../services/api';

// Curated step animation graphics for the video player
const STEP_VISUALS = {
  cut: '✂️',
  paint: '🎨',
  plant: '🌱',
  glue: '🧴',
  fold: '📦',
  string: '🧶',
  sparkle: '✨',
  light: '💡',
};

export default function CraftStudioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { child, playSound, addPoints, refreshChildData } = useChild();

  const [craft, setCraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [checkedMaterials, setCheckedMaterials] = useState({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [newBadges, setNewBadges] = useState([]);

  // Video Process Player State
  const [viewMode, setViewMode] = useState('video'); // 'video' or 'steps'
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0); // 0 to 100
  const [videoSpeed, setVideoSpeed] = useState(1); // 1 or 0.75
  const videoTimerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    getCraftById(id)
      .then((data) => {
        setCraft(data);
      })
      .catch(() => {
        // Fallback demo craft
        setCraft({
          id: 'craft-pb-01',
          title: 'Self-Watering Sprout Planter',
          category: 'Gardening',
          primary_material: 'plastic',
          difficulty: 'Easy',
          estimated_time_minutes: 20,
          eco_points: 15,
          requires_adult: true,
          safety_precautions: 'Ask an adult to assist with cutting the plastic bottle. Cover cut edges with soft tape.',
          materials: ['1 clean plastic bottle', 'Cotton string or yarn (20cm)', 'Potting soil', 'Fast-growing seeds (beans or basil)', 'Water'],
          tools: ['Safety scissors (adult assistance for cutting)', 'Masking tape', 'Color markers or stickers'],
          environmental_tip: 'Plastic bottles take over 450 years to decompose in nature. Reusing them as garden planters gives them a happy second life!',
          steps: [
            {
              step_number: 1,
              heading: 'Prep and Cut',
              instruction: 'Rinse the bottle cleanly. With an adult’s help, cut the bottle horizontally about 10cm from the top to create a funnel top and a reservoir base.',
              tip: 'Cover the cut edges with paper tape to keep them silky smooth for little hands!',
            },
            {
              step_number: 2,
              heading: 'Thread the Wick',
              instruction: 'Thread the cotton string through the bottle mouth. Half of the string will hang down into the reservoir, and the other half will sit inside the top funnel.',
              tip: 'Cotton draws water upward naturally by capillary action—just like plant roots!',
            },
            {
              step_number: 3,
              heading: 'Soil and Plant',
              instruction: 'Invert the top funnel into the base. Fill the funnel with soil around the wick, gently press your seeds 1cm deep, and add water to the base reservoir.',
              tip: 'Place your new planter near a sunny windowsill and watch the green sprouts appear in 3–5 days!',
            },
          ],
        });
      })
      .finally(() => setLoading(false));

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (videoTimerRef.current) {
        clearInterval(videoTimerRef.current);
      }
    };
  }, [id]);

  // Video progress timer simulation
  useEffect(() => {
    if (isVideoPlaying) {
      videoTimerRef.current = setInterval(() => {
        setVideoProgress((prev) => {
          if (prev >= 100) {
            setIsVideoPlaying(false);
            return 100;
          }
          const next = prev + (1.2 * videoSpeed);
          // Automatically synchronize currentStepIndex based on progress
          const totalSteps = craft?.steps?.length || 3;
          const stepIdx = Math.min(
            totalSteps - 1,
            Math.floor((next / 100) * totalSteps)
          );
          setCurrentStepIndex(stepIdx);
          return next;
        });
      }, 100);
    } else {
      if (videoTimerRef.current) {
        clearInterval(videoTimerRef.current);
      }
    }
    return () => {
      if (videoTimerRef.current) clearInterval(videoTimerRef.current);
    };
  }, [isVideoPlaying, videoSpeed, craft]);

  const toggleVideoPlayback = () => {
    playSound('click');
    if (videoProgress >= 100) {
      setVideoProgress(0);
      setCurrentStepIndex(0);
    }
    setIsVideoPlaying(!isVideoPlaying);
  };

  const jumpToStep = (index) => {
    playSound('click');
    setCurrentStepIndex(index);
    const totalSteps = craft?.steps?.length || 3;
    const targetProgress = (index / totalSteps) * 100 + 2;
    setVideoProgress(targetProgress);
  };

  const toggleMaterialCheck = (idx) => {
    playSound('click');
    setCheckedMaterials((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const currentStep = craft?.steps?.[currentStepIndex];
    if (!currentStep) return;

    const textToRead = `Step ${currentStep.step_number}. ${currentStep.heading}. ${currentStep.instruction}. Helpful tip: ${currentStep.tip || ''}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleNextStep = () => {
    playSound('click');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (craft && currentStepIndex < craft.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const totalSteps = craft.steps.length;
      setVideoProgress((nextIdx / totalSteps) * 100 + 5);
    }
  };

  const handlePrevStep = () => {
    playSound('click');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      const totalSteps = craft?.steps?.length || 3;
      setVideoProgress((prevIdx / totalSteps) * 100 + 5);
    }
  };

  const handleFinishCraft = async () => {
    playSound('fanfare');
    setIsVideoPlaying(false);

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // fallback
    }

    setIsCompleted(true);
    addPoints(craft?.eco_points || 15);

    try {
      const res = await completeCraft(child.id, craft.id);
      if (res.new_badges_awarded && res.new_badges_awarded.length > 0) {
        setNewBadges(res.new_badges_awarded);
        playSound('badge');
      }
      refreshChildData(child.id);
    } catch (err) {
      // offline fallback
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 mx-auto border-4 border-eco-200 border-t-eco-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!craft) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-display font-bold text-slate-800">Craft Not Found</h2>
        <Link to="/crafts" className="btn-kid btn-kid-green py-2 px-6 text-sm">
          Return to Crafts
        </Link>
      </div>
    );
  }

  const steps = craft.steps || [];
  const currentStep = steps[currentStepIndex];
  const progressPercent = steps.length > 0 ? Math.round(((currentStepIndex + 1) / steps.length) * 100) : 100;
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top back bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/crafts"
          onClick={() => playSound('click')}
          className="inline-flex items-center gap-1.5 text-sm font-display font-bold text-slate-600 hover:text-eco-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Crafts</span>
        </Link>
        <span className="text-xs font-bold text-amber-700 bg-sunny-100 border border-sunny-300 px-3 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
          <span>Reward: +{craft.eco_points} Points</span>
        </span>
      </div>

      {/* Craft Header Card */}
      <div className="kid-card p-6 sm:p-8 space-y-4 bg-gradient-to-r from-eco-50 via-teal-50 to-white border-2 border-eco-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-eco-200 text-eco-900 font-display font-bold text-xs uppercase tracking-wider">
            {craft.primary_material}
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-xs">
            {craft.category}
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-xs">
            ⏱️ {craft.estimated_time_minutes} Mins
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-xs">
            Level: {craft.difficulty}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900">
          {craft.title}
        </h1>

        <p className="text-base font-semibold text-slate-600">
          {craft.description}
        </p>

        {/* Safety Banner */}
        {craft.requires_adult && (
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs font-bold text-amber-900 space-y-1">
              <span className="block font-display font-extrabold text-sm text-amber-950">
                Adult Supervision Reminder:
              </span>
              <span>{craft.safety_precautions || 'Ask a parent or teacher to handle cutting tools.'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Materials Checklist Card */}
      <div className="kid-card p-6 space-y-4">
        <h3 className="text-lg font-display font-bold text-slate-800 flex items-center gap-2">
          <span>📦 Materials Needed (Tap to Check Off):</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {craft.materials?.map((mat, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => toggleMaterialCheck(idx)}
              className={`p-3 rounded-2xl border-2 flex items-center gap-3 text-left transition-all ${
                checkedMaterials[idx]
                  ? 'border-eco-500 bg-eco-50 text-eco-900 line-through opacity-75'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
              }`}
            >
              {checkedMaterials[idx] ? (
                <CheckSquare className="w-5 h-5 text-eco-600 flex-shrink-0" />
              ) : (
                <Square className="w-5 h-5 text-slate-400 flex-shrink-0" />
              )}
              <span className="text-xs font-semibold">{mat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* View Mode Switcher: Video Process Mode vs Step Cards */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => {
            playSound('click');
            setViewMode('video');
          }}
          className={`px-5 py-2.5 rounded-2xl font-display font-bold text-sm flex items-center gap-2 transition-all ${
            viewMode === 'video'
              ? 'bg-eco-600 text-white shadow-kid-button'
              : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>🎬 Watch Making Video</span>
        </button>

        <button
          onClick={() => {
            playSound('click');
            setViewMode('steps');
          }}
          className={`px-5 py-2.5 rounded-2xl font-display font-bold text-sm flex items-center gap-2 transition-all ${
            viewMode === 'steps'
              ? 'bg-eco-600 text-white shadow-kid-button'
              : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>📝 Step-by-Step Cards</span>
        </button>
      </div>

      {/* Main Process Content: Video Player or Step Cards */}
      {!isCompleted ? (
        <div className="space-y-6">
          {/* ==================== 1. Video Making Process Player ==================== */}
          {viewMode === 'video' && (
            <div className="kid-card p-6 sm:p-8 border-4 border-eco-400 bg-slate-900 text-white space-y-6 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between text-xs text-eco-300 font-bold">
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <Film className="w-4 h-4 text-sunny-400" />
                  Eco World Video Tutorial • {craft.title}
                </span>
                <span className="bg-eco-900/60 border border-eco-500/40 px-2.5 py-1 rounded-full text-eco-200">
                  {isVideoPlaying ? '🔴 Playing Demonstration' : '⏸️ Paused'}
                </span>
              </div>

              {/* Theater Video Stage Screen */}
              <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-eco-950 flex flex-col items-center justify-center p-6 border-2 border-white/10 shadow-inner group">
                {/* Visual Demonstration Scene */}
                <div className="text-center space-y-4 max-w-lg z-10">
                  <div className="w-24 h-24 mx-auto rounded-3xl bg-eco-500/20 border-2 border-eco-400/50 flex items-center justify-center text-5xl shadow-lg transform group-hover:scale-105 transition-transform">
                    {currentStepIndex === 0 ? '✂️' : (currentStepIndex === 1 ? '🧶' : '🌱')}
                  </div>

                  <div className="space-y-1">
                    <span className="text-sunny-300 text-xs font-display font-extrabold uppercase tracking-widest block">
                      Video Step {currentStep?.step_number}: {currentStep?.heading}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                      {currentStep?.heading}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                      {currentStep?.instruction}
                    </p>
                  </div>
                </div>

                {/* Big Center Play Overlay Button */}
                <button
                  onClick={toggleVideoPlayback}
                  className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/30 hover:bg-black/20 transition-all cursor-pointer group-hover:opacity-100 opacity-90"
                >
                  <div className="w-16 h-16 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform">
                    {isVideoPlaying ? <Pause className="w-8 h-8 fill-slate-900" /> : <Play className="w-8 h-8 fill-slate-900 ml-1" />}
                  </div>
                </button>
              </div>

              {/* Video Timeline Scrubber */}
              <div className="space-y-2">
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden cursor-pointer relative"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percent = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
                    setVideoProgress(percent);
                    const totalSteps = steps.length;
                    setCurrentStepIndex(Math.min(totalSteps - 1, Math.floor((percent / 100) * totalSteps)));
                  }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-sunny-400 via-eco-400 to-eco-500 transition-all rounded-full"
                    style={{ width: `${videoProgress}%` }}
                  />
                </div>

                {/* Video Controls Bar */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 pt-1">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleVideoPlayback}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title={isVideoPlaying ? 'Pause' : 'Play'}
                    >
                      {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    </button>
                    <button
                      onClick={() => {
                        setVideoProgress(0);
                        setCurrentStepIndex(0);
                      }}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Replay from start"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-white">
                      {Math.floor(videoProgress)}% Complete
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setVideoSpeed(videoSpeed === 1 ? 0.75 : 1)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono"
                      title="Playback speed"
                    >
                      {videoSpeed}x Pace
                    </button>
                    <button
                      onClick={handleSpeech}
                      className="px-2.5 py-1 rounded-lg bg-eco-600 hover:bg-eco-500 text-white text-xs flex items-center gap-1 font-display"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isSpeaking ? 'Narrating...' : 'Narrate'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step Jump Bookmarks Under Video */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Jump to Video Chapter:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {steps.map((st, i) => (
                    <button
                      key={i}
                      onClick={() => jumpToStep(i)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                        currentStepIndex === i
                          ? 'border-eco-400 bg-eco-950/80 text-white'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-white/20 font-display font-extrabold text-xs flex items-center justify-center">
                        {st.step_number}
                      </span>
                      <span className="text-xs font-display font-bold truncate">
                        {st.heading}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons inside Video Mode */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className={`btn-kid btn-kid-white py-2.5 px-6 text-xs text-slate-900 ${
                    currentStepIndex === 0 ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span>Previous Step</span>
                </button>

                {isLastStep ? (
                  <button
                    onClick={handleFinishCraft}
                    className="btn-kid btn-kid-yellow py-3 px-8 text-sm font-extrabold text-slate-900 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span>I Finished My Craft! 🎉</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNextStep}
                    className="btn-kid btn-kid-green py-2.5 px-6 text-xs flex items-center gap-1.5"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ==================== 2. Step-by-Step Cards Mode ==================== */}
          {viewMode === 'steps' && (
            <div className="kid-card p-6 sm:p-10 border-4 border-eco-300 space-y-8 bg-white">
              {/* Progress Bar & Speech Audio */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-600">
                  <span className="font-display text-sm text-eco-700">
                    Step {currentStep?.step_number || 1} of {steps.length}
                  </span>
                  <button
                    onClick={handleSpeech}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-xs font-display font-bold transition-all ${
                      isSpeaking
                        ? 'border-eco-500 bg-eco-500 text-white animate-pulse'
                        : 'border-slate-200 bg-slate-50 hover:bg-eco-50 text-slate-700'
                    }`}
                    title="Read step instructions out loud"
                  >
                    {isSpeaking ? <Volume2 className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-eco-600" />}
                    <span>{isSpeaking ? 'Reading aloud...' : 'Read aloud 🔊'}</span>
                  </button>
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-eco-400 to-eco-600 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Current Step Content */}
              {currentStep && (
                <div className="space-y-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-eco-500 text-white font-display font-extrabold text-2xl shadow-kid-button">
                    {currentStep.step_number}
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
                      {currentStep.heading}
                    </h2>
                    <p className="text-base sm:text-lg font-semibold text-slate-700 leading-relaxed">
                      {currentStep.instruction}
                    </p>
                  </div>

                  {/* Helpful Tip Callout */}
                  {currentStep.tip && (
                    <div className="p-4 rounded-2xl bg-sunny-50 border-2 border-sunny-300 text-slate-800 text-sm font-semibold space-y-1">
                      <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider block">
                        ✨ Pro Crafter Tip:
                      </span>
                      <p>{currentStep.tip}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step Navigation Controls */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className={`btn-kid btn-kid-white py-3 px-6 text-sm flex items-center gap-2 ${
                    currentStepIndex === 0 ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {isLastStep ? (
                  <button
                    onClick={handleFinishCraft}
                    className="btn-kid btn-kid-green py-3.5 px-8 text-base font-extrabold flex items-center gap-2 shadow-kid-button"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>I Finished My Craft! 🎉</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNextStep}
                    className="btn-kid btn-kid-green py-3 px-6 text-sm flex items-center gap-2"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Completion Celebration View */
        <div className="kid-card p-8 sm:p-12 text-center space-y-6 border-4 border-sunny-300 bg-gradient-to-b from-sunny-50 to-white animate-fadeIn">
          <div className="text-7xl animate-bounce">🎉</div>

          <div className="space-y-2">
            <span className="px-4 py-1.5 bg-sunny-200 text-amber-900 rounded-full font-display font-extrabold text-xs uppercase tracking-wider">
              Quest Complete!
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900">
              Awesome Work, {child.nickname}!
            </h2>
            <p className="text-base font-semibold text-slate-600 max-w-md mx-auto">
              You turned waste into wonder and earned{' '}
              <strong className="text-amber-600 font-extrabold">+{craft.eco_points} Eco-Points!</strong>
            </p>
          </div>

          {/* Newly Awarded Badges */}
          {newBadges.length > 0 && (
            <div className="p-4 rounded-3xl bg-amber-50 border-2 border-amber-300 max-w-sm mx-auto space-y-2">
              <span className="text-xs font-extrabold text-amber-800 uppercase">
                New Badge Unlocked! 🏆
              </span>
              {newBadges.map((b) => (
                <div key={b.id} className="flex items-center justify-center gap-2">
                  <span className="text-3xl">{b.icon}</span>
                  <span className="font-display font-bold text-base text-slate-800">{b.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Environmental tip review */}
          {craft.environmental_tip && (
            <div className="p-4 rounded-2xl bg-eco-50 border border-eco-200 text-xs font-semibold text-eco-900 max-w-lg mx-auto">
              🌍 <strong>Eco World Planet Fact:</strong> {craft.environmental_tip}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/dashboard"
              onClick={() => playSound('click')}
              className="btn-kid btn-kid-green py-3 px-8 text-base font-bold"
            >
              View My Dashboard
            </Link>
            <Link
              to="/crafts"
              onClick={() => playSound('click')}
              className="btn-kid btn-kid-white py-3 px-6 text-sm font-bold"
            >
              Explore Next Craft
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
