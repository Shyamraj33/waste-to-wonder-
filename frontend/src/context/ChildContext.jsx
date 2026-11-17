import React, { createContext, useContext, useState, useEffect } from 'react';
import { getChildren, getChildProgress, getFavorites } from '../services/api';

const ChildContext = createContext(null);

const AVATAR_EMOJIS = {
  fox: '🦊',
  owl: '🦉',
  turtle: '🐢',
  panda: '🐼',
  frog: '🐸',
  bunny: '🐰',
};

export function ChildProvider({ children }) {
  const [child, setChild] = useState({
    id: 1,
    nickname: 'EcoSam',
    avatar: 'fox',
    age_group: '8-10',
    eco_points: 45,
    interests: ['Animals', 'Art', 'Gardening'],
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Sound effects generator using Web Audio API (zero external sound file latency)
  const playSound = (type = 'click') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'fanfare') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else if (type === 'badge') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      // AudioContext policy fallback
    }
  };

  const refreshChildData = async (childId = child.id) => {
    try {
      const prog = await getChildProgress(childId);
      setChild((prev) => ({
        ...prev,
        eco_points: prog.eco_points,
      }));
      setEarnedBadges(prog.earned_badges || []);
    } catch (e) {
      // offline or unseeded
    }

    try {
      const favs = await getFavorites(childId);
      setFavorites(favs || []);
    } catch (e) {
      // offline
    }
  };

  useEffect(() => {
    // Check if child has local preferences
    const stored = localStorage.getItem('ecocraft_child');
    if (stored) {
      try {
        setChild(JSON.parse(stored));
      } catch (e) {
        // use default
      }
    }

    // Try fetching from backend
    getChildren()
      .then((childrenList) => {
        if (childrenList && childrenList.length > 0) {
          const first = childrenList[0];
          setChild((prev) => ({
            ...prev,
            id: first.id,
            nickname: first.nickname,
            avatar: first.avatar,
            age_group: first.age_group,
            eco_points: first.eco_points,
            interests: first.interests,
          }));
          refreshChildData(first.id);
        }
      })
      .catch(() => {
        // using local fallback
      });
  }, []);

  const updateChildProfile = (updated) => {
    setChild(updated);
    localStorage.setItem('ecocraft_child', JSON.stringify(updated));
  };

  const addPoints = (points) => {
    setChild((prev) => {
      const next = { ...prev, eco_points: prev.eco_points + points };
      localStorage.setItem('ecocraft_child', JSON.stringify(next));
      return next;
    });
  };

  return (
    <ChildContext.Provider
      value={{
        child,
        setChild: updateChildProfile,
        addPoints,
        avatarEmoji: AVATAR_EMOJIS[child.avatar] || '🦊',
        soundEnabled,
        setSoundEnabled,
        playSound,
        favorites,
        earnedBadges,
        refreshChildData,
        showOnboarding,
        setShowOnboarding,
      }}
    >
      {children}
    </ChildContext.Provider>
  );
}

export const useChild = () => useContext(ChildContext);
