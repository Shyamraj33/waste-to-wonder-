import React, { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  Printer,
  ShieldCheck,
  CheckCircle,
  Lock,
  Star,
  Trophy,
} from 'lucide-react';
import { useChild } from '../context/ChildContext';
import { getChildProgress, getCertificateData } from '../services/api';

const ALL_BADGES_DEFAULT = [
  {
    id: 'badge-eco-explorer',
    name: 'Eco Explorer',
    description: 'Awarded for completing your very first Eco World project!',
    icon: '🌱',
    color: '#22c55e',
  },
  {
    id: 'badge-plastic-hero',
    name: 'Plastic Hero',
    description: 'Awarded for rescuing plastic bottles or containers from ending up in landfills!',
    icon: '🛡️',
    color: '#0ea5e9',
  },
  {
    id: 'badge-creative-recycler',
    name: 'Creative Recycler',
    description: 'Showed versatile creativity by crafting with at least 3 different materials!',
    icon: '🎨',
    color: '#f59e0b',
  },
  {
    id: 'badge-nature-guardian',
    name: 'Nature Guardian',
    description: 'Proved eco-smarts by scoring 100% on any Eco Learning Center quiz!',
    icon: '🦊',
    color: '#10b981',
  },
  {
    id: 'badge-recycling-champ',
    name: 'Recycling Champion',
    description: 'Earned over 100 Eco-Points through crafting and environmental learning!',
    icon: '🏆',
    color: '#eab308',
  },
  {
    id: 'badge-master-upcycler',
    name: 'Master Upcycler',
    description: 'A true DIY master: successfully created 5 wonderful upcycled projects!',
    icon: '🚀',
    color: '#a855f7',
  },
];

export default function RewardsPage() {
  const { child, avatarEmoji, playSound } = useChild();

  const [progress, setProgress] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certData, setCertData] = useState(null);

  useEffect(() => {
    getChildProgress(child.id)
      .then((data) => setProgress(data))
      .catch(() => {
        // Fallback progress
        setProgress({
          nickname: child.nickname,
          eco_points: child.eco_points,
          level_title: '🌿 Green Explorer',
          earned_badges: [
            { id: 'badge-eco-explorer', is_unlocked: true },
          ],
          completed_crafts: [{ id: '1' }],
        });
      });

    getCertificateData(child.id)
      .then((data) => setCertData(data))
      .catch(() => {
        setCertData({
          child_nickname: child.nickname,
          avatar: child.avatar,
          eco_points: child.eco_points,
          crafts_completed: 1,
          badges_unlocked: 1,
          issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          honorary_title: 'Official Eco World Planet Guardian',
        });
      });
  }, [child.id, child.eco_points]);

  const earnedBadgeIds = new Set(
    (progress?.earned_badges || []).map((b) => b.id)
  );

  const handlePrint = () => {
    playSound('click');
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sunny-100 text-amber-900 text-xs font-display font-extrabold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          Eco Rewards & Hall of Fame
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900">
          Your Eco Achievements 🌟
        </h1>
        <p className="text-base font-semibold text-slate-600 max-w-xl mx-auto">
          Every recycled craft and quiz you complete earns real Eco-Points, unlocks shiny badges, and levels up your planet guardian rank!
        </p>
      </div>

      {/* Rank Progression Card */}
      <div className="kid-card p-6 sm:p-10 bg-gradient-to-r from-sunny-100 via-amber-50 to-eco-50 border-4 border-sunny-300 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <span className="text-6xl p-4 bg-white rounded-3xl shadow-sm select-none">
              {avatarEmoji}
            </span>
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wide">
                Current Level
              </span>
              <h2 className="text-3xl font-display font-extrabold text-slate-900">
                {progress?.level_title || '🌿 Green Explorer'}
              </h2>
              <p className="text-sm font-semibold text-slate-600">
                {child.nickname} has earned{' '}
                <strong className="text-amber-700 font-extrabold">{child.eco_points} Eco-Points</strong>!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playSound('fanfare');
              setShowCertificate(true);
            }}
            className="btn-kid btn-kid-green py-3.5 px-6 text-sm flex items-center gap-2 whitespace-nowrap shadow-kid-button"
          >
            <Award className="w-5 h-5" />
            <span>Generate Official Certificate</span>
          </button>
        </div>
      </div>

      {/* Badges Wall */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-extrabold text-2xl text-slate-900">
              Badges Wall ({earnedBadgeIds.size} of {ALL_BADGES_DEFAULT.length} Unlocked)
            </h3>
            <p className="text-sm font-semibold text-slate-500">
              Collect all badges by exploring different materials and completing quizzes!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {ALL_BADGES_DEFAULT.map((badge) => {
            const isUnlocked = earnedBadgeIds.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`kid-card p-6 flex items-start gap-4 transition-all ${
                  isUnlocked
                    ? 'border-2 border-sunny-300 bg-white shadow-sm'
                    : 'border-2 border-slate-200 bg-slate-50 opacity-60'
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm flex-shrink-0 ${
                    isUnlocked ? 'bg-sunny-100' : 'bg-slate-200'
                  }`}
                >
                  {isUnlocked ? badge.icon : <Lock className="w-6 h-6 text-slate-400" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-base text-slate-800">
                      {badge.name}
                    </h4>
                    {isUnlocked && (
                      <CheckCircle className="w-4 h-4 text-eco-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                    {badge.description}
                  </p>
                  <span
                    className={`inline-block text-[10px] font-extrabold uppercase tracking-wider ${
                      isUnlocked ? 'text-eco-600' : 'text-slate-400'
                    }`}
                  >
                    {isUnlocked ? '✨ Unlocked!' : 'Locked'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-4xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl border-4 border-sunny-400 relative space-y-6">
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              ✕
            </button>

            {/* Printable Certificate Area */}
            <div id="print-certificate" className="p-8 rounded-3xl border-4 border-double border-amber-300 bg-amber-50/40 text-center space-y-4">
              <div className="text-5xl select-none">🏆</div>

              <span className="text-xs font-extrabold text-amber-800 tracking-widest uppercase">
                Official Eco World Award
              </span>

              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900">
                Certificate of Environmental Action
              </h2>

              <p className="text-xs font-semibold text-slate-500">
                This honor is proudly awarded to
              </p>

              <div className="py-2">
                <span className="text-2xl sm:text-3xl font-display font-extrabold text-eco-700 underline decoration-sunny-400 decoration-wavy">
                  {child.nickname} {avatarEmoji}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-600 max-w-md mx-auto leading-relaxed">
                For outstanding dedication in turning recyclable waste into creative DIY wonders, earning{' '}
                <strong>{child.eco_points} Eco-Points</strong>, and protecting our oceans, trees, and wildlife!
              </p>

              <div className="pt-6 border-t border-amber-200/80 flex items-center justify-between text-xs font-bold text-slate-500">
                <div>
                  <span className="block text-slate-400">Date of Recognition:</span>
                  <span>{certData?.issue_date || 'November 11, 2026'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-eco-700">
                  <ShieldCheck className="w-5 h-5 text-eco-600" />
                  <span>Eco World Certified</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handlePrint}
                className="btn-kid btn-kid-green py-3 px-8 text-sm flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate 🖨️</span>
              </button>
              <button
                onClick={() => setShowCertificate(false)}
                className="btn-kid btn-kid-white py-3 px-6 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
