import React, { useState } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { useChild } from '../context/ChildContext';
import { updateChild } from '../services/api';

const AVATARS = [
  { id: 'fox', emoji: '🦊', label: 'Clever Fox' },
  { id: 'owl', emoji: '🦉', label: 'Wise Owl' },
  { id: 'turtle', emoji: '🐢', label: 'Ocean Turtle' },
  { id: 'panda', emoji: '🐼', label: 'Gentle Panda' },
  { id: 'frog', emoji: '🐸', label: 'Tree Frog' },
  { id: 'bunny', emoji: '🐰', label: 'Speedy Bunny' },
];

const AGE_GROUPS = [
  { id: '5-7', label: '5–7 Years', tag: 'Little Explorers 🌱' },
  { id: '8-10', label: '8–10 Years', tag: 'Junior Crafters 🎨' },
  { id: '11-12', label: '11–12 Years', tag: 'Master Upcyclers 🚀' },
];

const INTERESTS = [
  { id: 'Animals', icon: '🐾', label: 'Animals' },
  { id: 'Art', icon: '🎨', label: 'Art & Painting' },
  { id: 'Toys', icon: '🚀', label: 'Toys & Games' },
  { id: 'Gardening', icon: '🌿', label: 'Gardening' },
  { id: 'Decorations', icon: '✨', label: 'Decorations' },
  { id: 'Science', icon: '🔬', label: 'Science' },
];

export default function ChildOnboardingModal() {
  const { child, setChild, showOnboarding, setShowOnboarding, playSound } = useChild();

  const [nickname, setNickname] = useState(child.nickname || 'EcoSam');
  const [avatar, setAvatar] = useState(child.avatar || 'fox');
  const [ageGroup, setAgeGroup] = useState(child.age_group || '8-10');
  const [selectedInterests, setSelectedInterests] = useState(child.interests || ['Animals', 'Art']);

  if (!showOnboarding) return null;

  const toggleInterest = (id) => {
    playSound('click');
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    playSound('fanfare');

    const updated = {
      ...child,
      nickname: nickname.trim() || 'EcoCrafter',
      avatar,
      age_group: ageGroup,
      interests: selectedInterests,
    };

    setChild(updated);

    try {
      if (child.id) {
        await updateChild(child.id, {
          nickname: updated.nickname,
          avatar: updated.avatar,
          age_group: updated.age_group,
          interests: updated.interests,
        });
      }
    } catch (err) {
      // offline fallback is already saved in state
    }

    setShowOnboarding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-4xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-eco-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => {
            playSound('click');
            setShowOnboarding(false);
          }}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-eco-100 rounded-3xl text-3xl mb-2">
            🌱
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800">
            Customize Your Eco Profile!
          </h2>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Pick your crafting nickname, favorite avatar, and age group!
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Nickname input */}
          <div>
            <label className="block font-display font-bold text-sm text-slate-700 mb-2">
              Your Crafting Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. EcoSam, PlanetHero"
              maxLength={20}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-eco-500 focus:outline-none font-display font-bold text-lg text-slate-800"
              required
            />
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="block font-display font-bold text-sm text-slate-700 mb-2">
              Choose Your Eco Avatar
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {AVATARS.map((av) => (
                <button
                  type="button"
                  key={av.id}
                  onClick={() => {
                    playSound('click');
                    setAvatar(av.id);
                  }}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${
                    avatar === av.id
                      ? 'border-eco-500 bg-eco-50 shadow-sm scale-105'
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-3xl select-none">{av.emoji}</span>
                  <span className="text-xs font-display font-bold text-slate-700">{av.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Age Group */}
          <div>
            <label className="block font-display font-bold text-sm text-slate-700 mb-2">
              Select Your Age Group
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AGE_GROUPS.map((ag) => (
                <button
                  type="button"
                  key={ag.id}
                  onClick={() => {
                    playSound('click');
                    setAgeGroup(ag.id);
                  }}
                  className={`p-3 rounded-2xl border-2 text-center transition-all ${
                    ageGroup === ag.id
                      ? 'border-eco-500 bg-eco-500 text-white shadow-kid-button'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-display font-extrabold text-sm">{ag.label}</span>
                  <span className="block text-[10px] font-semibold opacity-90">{ag.tag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Creative Interests */}
          <div>
            <label className="block font-display font-bold text-sm text-slate-700 mb-2">
              What do you love making? (Pick any)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INTERESTS.map((item) => {
                const isSelected = selectedInterests.includes(item.id);
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => toggleInterest(item.id)}
                    className={`p-2.5 rounded-2xl border-2 flex items-center gap-2 text-left transition-all ${
                      isSelected
                        ? 'border-sunny-400 bg-sunny-50 text-amber-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-semibold'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-xs font-display">{item.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-amber-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-kid btn-kid-green py-4 text-xl flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>Ready to Create!</span>
          </button>
        </form>
      </div>
    </div>
  );
}
