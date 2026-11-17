import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Search,
  Sparkles,
  Heart,
  Filter,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useChild } from '../context/ChildContext';
import { getCrafts, toggleFavorite } from '../services/api';

const MATERIALS = [
  { id: '', label: 'All Materials' },
  { id: 'plastic', label: 'Plastic 🧴' },
  { id: 'cardboard', label: 'Cardboard 📦' },
  { id: 'paper', label: 'Paper 📰' },
  { id: 'metal', label: 'Metal 🥫' },
  { id: 'glass', label: 'Glass 🫙' },
  { id: 'fabric', label: 'Fabric 🧵' },
];

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Advanced'];

export default function CraftsCatalogPage() {
  const { child, playSound, favorites, refreshChildData } = useChild();

  const [crafts, setCrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCrafts = () => {
    setLoading(true);
    const params = {};
    if (selectedMaterial) params.material = selectedMaterial;
    if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
    if (searchQuery.trim()) params.search = searchQuery.trim();

    getCrafts(params)
      .then((data) => setCrafts(data || []))
      .catch(() => setCrafts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCrafts();
  }, [selectedMaterial, selectedDifficulty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    playSound('click');
    fetchCrafts();
  };

  const handleFavoriteClick = async (craftId) => {
    playSound('click');
    try {
      await toggleFavorite(child.id, craftId);
      refreshChildData(child.id);
    } catch (e) {
      // offline
    }
  };

  const isFavorited = (craftId) => {
    return favorites.some((f) => f.id === craftId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sunny-100 text-amber-900 text-xs font-display font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          Creative DIY Database
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900">
          Explore 30+ Upcycled Crafts 🎨
        </h1>
        <p className="text-base font-semibold text-slate-600 max-w-2xl mx-auto">
          Every craft uses everyday household items, is 100% child-tested, and gives you illustrated step-by-step guidance.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="kid-card p-6 space-y-6">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, item (e.g. 'rocket', 'planter', 'bird feeder')..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-eco-500 focus:outline-none font-display font-bold text-base text-slate-800"
            />
          </div>
          <button type="submit" className="btn-kid btn-kid-green py-3 px-6 text-sm">
            Search
          </button>
        </form>

        {/* Material Filter Tabs */}
        <div>
          <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Filter by Waste Material
          </span>
          <div className="flex flex-wrap gap-2">
            {MATERIALS.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  playSound('click');
                  setSelectedMaterial(m.id);
                }}
                className={`px-4 py-2 rounded-2xl font-display font-bold text-xs transition-all ${
                  selectedMaterial === m.id
                    ? 'bg-eco-500 text-white shadow-kid-button'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-3 pt-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Difficulty:
          </span>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => {
                  playSound('click');
                  setSelectedDifficulty(d);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedDifficulty === d
                    ? 'bg-amber-400 text-slate-900 shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Crafts Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 mx-auto border-4 border-eco-200 border-t-eco-600 rounded-full animate-spin" />
        </div>
      ) : crafts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crafts.map((craft) => (
            <div
              key={craft.id}
              className="kid-card p-6 flex flex-col justify-between space-y-4 hover:border-eco-400 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-eco-100 text-eco-800 font-display font-bold text-xs capitalize">
                      {craft.primary_material}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{craft.category}</span>
                  </div>
                  <button
                    onClick={() => handleFavoriteClick(craft.id)}
                    className="p-1.5 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Bookmark to favorites"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isFavorited(craft.id) ? 'text-rose-500 fill-rose-500' : ''
                      }`}
                    />
                  </button>
                </div>

                <h3 className="font-display font-extrabold text-xl text-slate-800 group-hover:text-eco-700 transition-colors">
                  {craft.title}
                </h3>

                <p className="text-sm font-medium text-slate-600 line-clamp-3">
                  {craft.description}
                </p>

                {craft.requires_adult && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Adult cutting help recommended</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-400">
                    ⏱️ {craft.estimated_time_minutes} min • {craft.difficulty}
                  </span>
                  <span className="block text-xs font-extrabold text-amber-600">
                    +{craft.eco_points} Eco-Points
                  </span>
                </div>

                <Link
                  to={`/crafts/${craft.id}`}
                  onClick={() => playSound('click')}
                  className="btn-kid btn-kid-green py-2 px-5 text-xs font-extrabold flex items-center gap-1"
                >
                  <span>Start</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-slate-200 space-y-3">
          <span className="text-4xl">🔍</span>
          <h3 className="font-display font-bold text-xl text-slate-800">
            No Crafts Found
          </h3>
          <p className="text-sm font-semibold text-slate-500">
            Try choosing a different material filter or search term.
          </p>
          <button
            onClick={() => {
              setSelectedMaterial('');
              setSelectedDifficulty('All');
              setSearchQuery('');
            }}
            className="btn-kid btn-kid-white py-2 px-4 text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
