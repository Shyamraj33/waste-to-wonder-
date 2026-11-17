import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  Download,
  CheckCircle,
  Plus,
} from 'lucide-react';
import { getTeacherOverview } from '../services/api';

export default function TeacherPortalPage() {
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeacherOverview()
      .then((data) => setTeacherData(data))
      .catch(() => {
        // Fallback classroom data
        setTeacherData({
          teacher_name: 'Ms. Henderson',
          curriculum_crafts_available: 30,
          total_school_completions: 18,
          quizzes_taken: 24,
          active_challenges: [
            {
              id: 'chal-01',
              title: 'Earth Month Cardboard Castle Challenge',
              target_material: 'cardboard',
              suggested_craft: 'Cardboard Castle Fortress',
              points: 25,
              description: 'Have students collaborate to build miniature castles using recycled delivery boxes.',
              duration: '1 week',
            },
            {
              id: 'chal-02',
              title: 'Ocean Guardian Bottle Planters',
              target_material: 'plastic',
              suggested_craft: 'Self-Watering Sprout Planter',
              points: 20,
              description: 'Teach capillary action and plant biology by planting basil seeds in cut plastic bottles.',
              duration: '2 weeks',
            },
            {
              id: 'chal-03',
              title: 'Zero-Waste Rhythm Band',
              target_material: 'metal',
              suggested_craft: 'Tin Can Bongo Drum Set',
              points: 15,
              description: 'Explore sound acoustics and percussion by creating recycled drums and shakers.',
              duration: '3 days',
            },
          ],
          printable_worksheets: [
            { title: 'Ocean Food Chain Coloring Sheet', type: 'PDF' },
            { title: 'Paper Recycling Flowchart Guide', type: 'PDF' },
            { title: 'My Waste Audit Journal for Kids', type: 'PDF' },
          ],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sunny-100 text-amber-900 text-xs font-display font-extrabold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5 text-amber-600" />
          Educator & Classroom Hub
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900">
          Teacher Classroom Challenges 🏫
        </h1>
        <p className="text-base font-semibold text-slate-600 max-w-xl mx-auto">
          Engage students with hands-on STEM upcycling challenges, printable nature lesson plans, and classroom recycling audits.
        </p>
      </div>

      {/* Classroom Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="kid-card p-6 text-center space-y-1">
          <span className="text-3xl">🎨</span>
          <span className="block font-display font-extrabold text-3xl text-slate-800">
            {teacherData?.curriculum_crafts_available || 30}+
          </span>
          <span className="text-xs font-bold text-slate-400">Available STEM Crafts</span>
        </div>
        <div className="kid-card p-6 text-center space-y-1">
          <span className="text-3xl">🌟</span>
          <span className="block font-display font-extrabold text-3xl text-eco-600">
            {teacherData?.total_school_completions || 18}
          </span>
          <span className="text-xs font-bold text-slate-400">Classroom Creations Made</span>
        </div>
        <div className="kid-card p-6 text-center space-y-1">
          <span className="text-3xl">📚</span>
          <span className="block font-display font-extrabold text-3xl text-sky-600">
            {teacherData?.quizzes_taken || 24}
          </span>
          <span className="text-xs font-bold text-slate-400">Eco Quizzes Completed</span>
        </div>
      </div>

      {/* Active Classroom Challenges */}
      <div className="kid-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-display font-bold text-slate-800">
              Active Classroom Challenges
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              Group recycling projects for science & art class
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {teacherData?.active_challenges?.map((chal) => (
            <div
              key={chal.id}
              className="p-5 rounded-3xl border-2 border-slate-200 bg-white hover:border-sunny-400 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-lg text-slate-900">
                  {chal.title}
                </span>
                <span className="text-xs font-extrabold text-amber-700 bg-sunny-100 px-3 py-1 rounded-full">
                  +{chal.points} Pts per student
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                {chal.description}
              </p>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-1">
                <span>Target: <strong>{chal.target_material}</strong></span>
                <span>•</span>
                <span>Duration: <strong>{chal.duration}</strong></span>
                <span>•</span>
                <span className="text-eco-600">Featured craft: {chal.suggested_craft}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Printable STEM Resources */}
      <div className="kid-card p-6 sm:p-8 space-y-4">
        <h3 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
          <Download className="w-5 h-5 text-eco-600" />
          <span>Printable Nature & Science Guides</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {teacherData?.printable_worksheets?.map((ws, i) => (
            <div key={i} className="p-4 rounded-2xl border-2 border-eco-100 bg-eco-50/50 flex flex-col justify-between space-y-3">
              <span className="font-display font-bold text-sm text-slate-800">{ws.title}</span>
              <button
                onClick={() => window.print()}
                className="btn-kid btn-kid-white py-1.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Worksheet</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
