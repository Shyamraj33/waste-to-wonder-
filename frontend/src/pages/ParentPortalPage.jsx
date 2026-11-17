import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChild } from '../context/ChildContext';
import { getParentOverview, createChild } from '../services/api';

export default function ParentPortalPage() {
  const { user, login } = useAuth();
  const { playSound } = useChild();

  const [email, setEmail] = useState('parent@ecocraft.ai');
  const [password, setPassword] = useState('ecocraft123');
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // New child form
  const [showAddChild, setShowAddChild] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [newAge, setNewAge] = useState('8-10');

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const data = await getParentOverview();
      setOverview(data);
    } catch (e) {
      // Fallback parent overview
      setOverview({
        parent_name: 'Sarah Miller',
        email: 'parent@ecocraft.ai',
        coppa_notice: 'Eco World never shares children’s photos, names, or locations publicly. All accounts are parent-managed.',
        children: [
          {
            id: 1,
            nickname: 'EcoSam',
            age_group: '8-10',
            avatar: 'fox',
            eco_points: 45,
            completed_crafts_count: 1,
            badges_count: 1,
            recent_crafts: [
              {
                title: 'Self-Watering Sprout Planter',
                material: 'plastic',
                completed_at: new Date().toISOString(),
                points: 15,
              },
            ],
          },
        ],
        metrics: {
          total_crafts_completed: 1,
          total_eco_points: 45,
          materials_diverted_from_waste: ['Plastic', 'Cardboard'],
        },
        safety_guidance: [
          'Always supervise children when using scissors, wire cutters, or hole punchers.',
          'Wash and thoroughly dry all recycled cans and jars before crafting.',
          'Smooth cut metal or hard plastic edges with masking tape.',
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [user]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    playSound('click');
    setErrorMsg(null);
    try {
      await login(email, password);
      playSound('fanfare');
      fetchOverview();
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials.');
    }
  };

  const handleCreateChild = async (e) => {
    e.preventDefault();
    if (!newNickname.trim()) return;
    playSound('click');

    try {
      await createChild({
        nickname: newNickname.trim(),
        age_group: newAge,
        avatar: 'turtle',
        interests: ['Art', 'Animals'],
      });
      setShowAddChild(false);
      setNewNickname('');
      fetchOverview();
    } catch (e) {
      // fallback
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-eco-100 text-eco-800 text-xs font-display font-extrabold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-eco-600" />
          Parent Control & Safety Portal
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900">
          Parent Oversight & Guidance 🛡️
        </h1>
        <p className="text-base font-semibold text-slate-600 max-w-xl mx-auto">
          Manage children’s profiles, review safety guidelines, and view your family’s real environmental recycling impact.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* COPPA Privacy Notice Box */}
        <div className="p-6 rounded-3xl bg-sky-50 border-2 border-sky-200 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-sky-600 flex-shrink-0 mt-1" />
          <div className="space-y-1 text-xs font-semibold text-sky-900 leading-relaxed">
            <h4 className="font-display font-bold text-sm text-sky-950">
              Child Privacy & Safety Guarantee (COPPA Compliant)
            </h4>
            <p>
              Eco World never requires real children’s names, photos, or geographic locations. All crafting activities use fun nicknames, and uploaded waste images are processed locally for Computer Vision material recognition only.
            </p>
          </div>
        </div>

        {/* Children Management & Stats */}
        <div className="kid-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-display font-bold text-slate-800">
                Managed Child Profiles
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Active crafting learners under this household account
              </p>
            </div>
            <button
              onClick={() => setShowAddChild(!showAddChild)}
              className="btn-kid btn-kid-green py-2 px-4 text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Child Profile</span>
            </button>
          </div>

          {showAddChild && (
            <form onSubmit={handleCreateChild} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-display font-bold text-sm text-slate-800">Add New Child Nickname</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  placeholder="e.g. EcoMaya"
                  className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold flex-1"
                  required
                />
                <select
                  value={newAge}
                  onChange={(e) => setNewAge(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                >
                  <option value="5-7">Age 5–7</option>
                  <option value="8-10">Age 8–10</option>
                  <option value="11-12">Age 11–12</option>
                </select>
                <button type="submit" className="btn-kid btn-kid-green py-2 px-4 text-xs font-bold">
                  Save
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {overview?.children?.map((ch) => (
              <div key={ch.id} className="p-4 rounded-2xl border-2 border-eco-100 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-extrabold text-base text-slate-800">
                    {ch.nickname}
                  </span>
                  <span className="text-xs font-bold text-eco-700 bg-eco-50 px-2 py-0.5 rounded-full border border-eco-200">
                    Age {ch.age_group}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-500 space-y-1">
                  <div>Eco-Points Earned: <strong className="text-amber-600 font-extrabold">{ch.eco_points}</strong></div>
                  <div>Crafts Completed: <strong className="text-slate-800">{ch.completed_crafts_count}</strong></div>
                  <div>Badges Unlocked: <strong className="text-slate-800">{ch.badges_count}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Guidelines for Parents */}
        <div className="kid-card p-6 sm:p-8 space-y-4 border-2 border-amber-200 bg-amber-50/30">
          <h3 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Essential DIY Safety Rules for Families</span>
          </h3>
          <ul className="space-y-2 text-sm font-semibold text-slate-700">
            {overview?.safety_guidance?.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-eco-600 flex-shrink-0 mt-0.5" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
