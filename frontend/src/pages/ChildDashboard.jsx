import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Compass,
  BookOpen,
  Sparkles,
  Award,
  Calendar,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Heart,
} from 'lucide-react';
import { useChild } from '../context/ChildContext';
import { getChildProgress } from '../services/api';

export default function ChildDashboard() {
  const { child, avatarEmoji, playSound, setShowOnboarding } = useChild();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChildProgress(child.id)
      .then((data) => setProgressData(data))
      .catch(() => {
        // Fallback progress state
        setProgressData({
          nickname: child.nickname,
          eco_points: child.eco_points,
          level_title: '🌿 Green Explorer',
          completed_crafts: [
            {
              id: 'craft-pb-01',
              title: 'Self-Watering Sprout Planter',
              primary_material: 'plastic',
              category: 'Gardening',
              completed_at: new Date().toISOString(),
              points_earned: 15,
            },
          ],
          earned_badges: [
            {
              id: 'badge-eco-explorer',
              name: 'Eco Explorer',
              description: 'Completed your very first craft!',
              icon: '🌱',
              color: '#22c55e',
              is_unlocked: true,
            },
          ],
          materials_recycled_count: 1,
          total_time_spent_minutes: 20,
        });
      })
      .finally(() => setLoading(false));
  }, [child.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Friendly Greeting Header */}
      <div className="kid-card bg-gradient-to-r from-eco-500 via-eco-600 to-teal-600 text-white p-6 sm:p-10 relative overflow-hidden shadow-xl border-none">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => {
                playSound('click');
                setShowOnboarding(true);
              }}
              className="text-6xl sm:text-7xl p-3 bg-white/20 backdrop-blur-md rounded-4xl hover:scale-105 transition-transform"
              title="Click to customize avatar"
            >
              {avatarEmoji}
            </button>
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-extrabold uppercase tracking-wider text-sunny-200">
                Eco-Craft Level: {progressData?.level_title || '🌱 Eco Sprout'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold">
                Hello, {child.nickname}! 👋
              </h1>
              <p className="text-sm sm:text-base text-eco-100 font-semibold">
                You have {child.eco_points} Eco-Points! What waste item shall we rescue today?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/scanner"
              onClick={() => playSound('fanfare')}
              className="btn-kid btn-kid-yellow py-3.5 px-6 text-base font-extrabold flex items-center gap-2 shadow-kid-button-sunny"
            >
              <Camera className="w-5 h-5 text-amber-900" />
              <span>Scan Waste Item</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Action Center & Weekly Challenge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Actions & Recent Creations */}
        <div className="lg:col-span-8 space-y-8">
          {/* Quick Actions Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/scanner"
              onClick={() => playSound('click')}
              className="kid-card p-6 flex flex-col items-center text-center space-y-2 hover:border-eco-400 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-eco-100 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                📸
              </div>
              <h3 className="font-display font-bold text-lg text-slate-800">Scan Waste</h3>
              <p className="text-xs font-semibold text-slate-500">
                Point camera at recyclables to find crafts
              </p>
            </Link>

            <Link
              to="/crafts"
              onClick={() => playSound('click')}
              className="kid-card p-6 flex flex-col items-center text-center space-y-2 hover:border-sunny-400 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-sunny-100 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🎨
              </div>
              <h3 className="font-display font-bold text-lg text-slate-800">Browse 30+ Crafts</h3>
              <p className="text-xs font-semibold text-slate-500">
                Filter by cardboard, plastic, paper, metal
              </p>
            </Link>

            <Link
              to="/learning"
              onClick={() => playSound('click')}
              className="kid-card p-6 flex flex-col items-center text-center space-y-2 hover:border-sky-400 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                📚
              </div>
              <h3 className="font-display font-bold text-lg text-slate-800">Eco Lessons</h3>
              <p className="text-xs font-semibold text-slate-500">
                Play quick quizzes & learn how nature heals
              </p>
            </Link>
          </div>

          {/* Weekly Creative Challenge Card */}
          <div className="kid-card p-6 sm:p-8 bg-gradient-to-r from-sunny-50 to-amber-50 border-2 border-sunny-300 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-3 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sunny-200 text-amber-900 rounded-full font-display font-bold text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Weekly Creative Quest</span>
                </div>
                <h3 className="text-2xl font-display font-extrabold text-slate-900">
                  Cardboard Egg Carton Bug Sanctuary 🐞
                </h3>
                <p className="text-sm font-semibold text-slate-600 max-w-xl">
                  Turn an empty pulp egg carton into friendly bees, bumblebugs, and caterpillars. Earn a huge bonus +25 Eco-Points this week!
                </p>
                <div className="flex items-center gap-4 text-xs font-bold text-amber-800">
                  <span>⏱️ 25 Mins</span>
                  <span>•</span>
                  <span>🌱 100% Kid Safe</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-600">
                    <Sparkles className="w-3.5 h-3.5 fill-amber-500" /> +25 Points
                  </span>
                </div>
              </div>
              <Link
                to="/crafts/craft-ec-01"
                onClick={() => playSound('fanfare')}
                className="btn-kid btn-kid-yellow py-3 px-6 text-sm whitespace-nowrap"
              >
                Accept Quest!
              </Link>
            </div>
          </div>

          {/* My Creations Gallery */}
          <div className="kid-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-extrabold text-slate-800">
                  My Completed Creations 🏆
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  Your recycled projects that helped save the planet
                </p>
              </div>
              <span className="text-sm font-extrabold text-eco-700 bg-eco-100 px-3 py-1 rounded-full">
                {progressData?.completed_crafts?.length || 0} Finished
              </span>
            </div>

            {progressData?.completed_crafts && progressData.completed_crafts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {progressData.completed_crafts.map((c, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl border-2 border-eco-100 bg-eco-50/50 flex items-center justify-between hover:border-eco-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl">
                        🌱
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm text-slate-800 line-clamp-1">{c.title}</h4>
                        <span className="text-[11px] font-semibold text-slate-500 capitalize">
                          {c.primary_material} • +{c.points_earned} Eco-Points
                        </span>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-eco-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-2">
                <span className="text-3xl">🎨</span>
                <p className="text-sm font-bold text-slate-600">No completed crafts yet!</p>
                <p className="text-xs font-semibold text-slate-400">
                  Snap an empty box or bottle to build your first wonder!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Badges, Impact Stats & Tips */}
        <div className="lg:col-span-4 space-y-8">
          {/* Eco Badges Wall Preview */}
          <div className="kid-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-1.5">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Earned Badges</span>
              </h3>
              <Link to="/rewards" className="text-xs font-bold text-eco-600 hover:text-eco-700">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {progressData?.earned_badges && progressData.earned_badges.length > 0 ? (
                progressData.earned_badges.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-2xl border-2 border-amber-200 bg-amber-50/50 text-center space-y-1"
                  >
                    <span className="text-3xl select-none">{b.icon}</span>
                    <span className="block font-display font-bold text-xs text-slate-800">{b.name}</span>
                    <span className="block text-[10px] font-semibold text-amber-700">Unlocked!</span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-4 text-xs font-bold text-slate-400">
                  Complete your first craft to unlock badges!
                </div>
              )}
            </div>
          </div>

          {/* Child Impact Stats */}
          <div className="kid-card p-6 space-y-4 bg-gradient-to-br from-teal-50 to-sky-50 border-2 border-sky-100">
            <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-sky-600" />
              <span>Your Eco Impact</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-white rounded-xl border border-sky-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Materials Diverted:</span>
                <span className="font-display font-extrabold text-sm text-sky-700">
                  {progressData?.materials_recycled_count || 1} Types
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-sky-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Crafting Time:</span>
                <span className="font-display font-extrabold text-sm text-sky-700">
                  {progressData?.total_time_spent_minutes || 20} Minutes
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-sky-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Trees & Oceans Helped:</span>
                <span className="font-display font-extrabold text-sm text-eco-600">
                  Verified Safe 🌿
                </span>
              </div>
            </div>
          </div>

          {/* Daily Eco Fact Tip */}
          <div className="kid-card p-6 bg-sunny-50 border-2 border-sunny-200 space-y-2">
            <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wide">
              Did You Know? 💡
            </span>
            <p className="text-xs font-semibold text-slate-700 leading-relaxed">
              Recycling just one cardboard cereal box saves enough energy to charge a smartphone for over a week!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
