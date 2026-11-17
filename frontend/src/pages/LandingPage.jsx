import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Compass,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TreePine,
  Fish,
  Recycle,
  Star,
  Users,
} from 'lucide-react';
import { useChild } from '../context/ChildContext';
import { getCrafts } from '../services/api';

export default function LandingPage() {
  const { playSound, setShowOnboarding } = useChild();
  const [popularCrafts, setPopularCrafts] = useState([]);

  useEffect(() => {
    getCrafts({ limit: 4 })
      .then((crafts) => {
        if (crafts && crafts.length > 0) {
          setPopularCrafts(crafts.slice(0, 3));
        }
      })
      .catch(() => {
        // Fallback popular crafts
        setPopularCrafts([
          {
            id: 'craft-pb-01',
            title: 'Self-Watering Sprout Planter',
            category: 'Gardening',
            primary_material: 'plastic',
            difficulty: 'Easy',
            estimated_time_minutes: 20,
            eco_points: 15,
            description: 'Turn an empty plastic bottle into a living planter for kitchen herbs!',
          },
          {
            id: 'craft-cb-01',
            title: 'Shoebox Mini Puppet Theater',
            category: 'Toys',
            primary_material: 'cardboard',
            difficulty: 'Medium',
            estimated_time_minutes: 30,
            eco_points: 20,
            description: 'Stage puppet shows with storybook characters inside an upcycled box.',
          },
          {
            id: 'craft-tc-01',
            title: 'Starlit Lantern Luminary',
            category: 'Decorations',
            primary_material: 'metal',
            difficulty: 'Easy',
            estimated_time_minutes: 25,
            eco_points: 15,
            description: 'Glow with magic constellations crafted from clean food cans.',
          },
        ]);
      });
  }, []);

  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-eco-100 border-2 border-eco-200 text-eco-800 text-sm font-display font-bold shadow-sm">
                <Sparkles className="w-4 h-4 text-eco-600 animate-spin" />
                <span>AI & Computer Vision for Young Eco-Inventors</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Turn Waste Into <span className="text-eco-600 underline decoration-sunny-400 decoration-wavy">Wonder!</span> 🌿🎨
              </h1>

              <p className="text-lg sm:text-xl font-body font-semibold text-slate-600 max-w-2xl leading-relaxed">
                Snap a photo of any clean recyclable item—like a bottle, cardboard box, or paper roll—and watch our AI instantly discover fun, step-by-step DIY crafts to protect our planet!
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/scanner"
                  onClick={() => playSound('fanfare')}
                  className="w-full sm:w-auto btn-kid btn-kid-green py-4 px-8 text-xl flex items-center justify-center gap-3 group"
                >
                  <Camera className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>Start Scanning Waste</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/crafts"
                  onClick={() => playSound('click')}
                  className="w-full sm:w-auto btn-kid btn-kid-white py-4 px-8 text-xl flex items-center justify-center gap-2"
                >
                  <Compass className="w-5 h-5 text-eco-600" />
                  <span>Explore 30+ Crafts</span>
                </Link>
              </div>

              {/* Safety Badges Under Hero */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-eco-500" />
                  <span>100% Kid-Safe Recommendations</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-eco-500" />
                  <span>COPPA Protected (No Real Names)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-eco-500" />
                  <span>Audio Speech Narration</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Decorative floating bubbles */}
                <div className="absolute -top-6 -left-6 bg-sunny-300 text-amber-900 font-display font-extrabold text-sm px-4 py-2 rounded-2xl shadow-kid-button-sunny rotate-[-6deg] animate-float z-20 flex items-center gap-1.5">
                  <span>📸 Snap photo</span>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-sky-400 text-white font-display font-extrabold text-sm px-4 py-2 rounded-2xl shadow-kid-button-sky rotate-[6deg] animate-float z-20 flex items-center gap-1.5" style={{ animationDelay: '1.5s' }}>
                  <span>🌟 +15 Eco-Points!</span>
                </div>

                {/* Main Interactive Card */}
                <div className="kid-card border-4 border-eco-200 p-8 text-center space-y-6 bg-gradient-to-b from-white to-eco-50/50">
                  <div className="w-28 h-28 mx-auto bg-eco-100 rounded-3xl p-4 shadow-inner flex items-center justify-center">
                    <img src="/logo.svg" alt="Eco Sprout" className="w-full h-full object-contain animate-wiggle" />
                  </div>

                  <div className="space-y-2">
                    <span className="inline-block px-3 py-1 bg-eco-200 text-eco-800 rounded-full font-display font-bold text-xs uppercase tracking-wider">
                      Live AI Material Detection
                    </span>
                    <h3 className="font-display font-extrabold text-2xl text-slate-800">
                      Empty Plastic Bottle?
                    </h3>
                    <p className="text-sm font-semibold text-slate-600">
                      Don't throw it out! It can become a self-watering herb planter or a cosmic double-rocket jetpack!
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm flex items-center justify-between text-left">
                    <div>
                      <span className="block text-xs font-bold text-slate-400">Detected Material:</span>
                      <span className="font-display font-extrabold text-eco-700 text-base">PET Plastic (98% match)</span>
                    </div>
                    <span className="text-3xl">🌱</span>
                  </div>

                  <button
                    onClick={() => {
                      playSound('click');
                      setShowOnboarding(true);
                    }}
                    className="w-full btn-kid btn-kid-yellow py-3 text-base flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span>Choose Your Kid Avatar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold text-eco-600 tracking-wider uppercase bg-eco-100 px-4 py-1.5 rounded-full">
            Simple 3-Step Magic
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900">
            How Eco World Works
          </h2>
          <p className="text-base sm:text-lg font-semibold text-slate-600">
            Turning recyclables into exciting crafts is as easy as 1-2-3!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="kid-card text-center p-8 space-y-4 hover:border-eco-400 transition-all group">
            <div className="w-16 h-16 mx-auto bg-sunny-100 rounded-3xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
              📸
            </div>
            <div className="w-8 h-8 mx-auto bg-sunny-400 text-slate-900 font-display font-extrabold rounded-full flex items-center justify-center text-sm shadow-sm">
              1
            </div>
            <h3 className="font-display font-bold text-xl text-slate-800">
              Snap Your Waste
            </h3>
            <p className="text-sm font-semibold text-slate-600 leading-relaxed">
              Use your phone or computer camera to take a photo of an empty bottle, cardboard box, egg carton, or tin can.
            </p>
          </div>

          {/* Step 2 */}
          <div className="kid-card text-center p-8 space-y-4 hover:border-eco-400 transition-all group">
            <div className="w-16 h-16 mx-auto bg-sky-100 rounded-3xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
              🤖
            </div>
            <div className="w-8 h-8 mx-auto bg-sky-500 text-white font-display font-extrabold rounded-full flex items-center justify-center text-sm shadow-sm">
              2
            </div>
            <h3 className="font-display font-bold text-xl text-slate-800">
              AI Identifies Material
            </h3>
            <p className="text-sm font-semibold text-slate-600 leading-relaxed">
              Our PyTorch MobileNetV3 model estimates the material (plastic, cardboard, paper, metal) and finds kid-safe matching projects.
            </p>
          </div>

          {/* Step 3 */}
          <div className="kid-card text-center p-8 space-y-4 hover:border-eco-400 transition-all group">
            <div className="w-16 h-16 mx-auto bg-eco-100 rounded-3xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
              🎉
            </div>
            <div className="w-8 h-8 mx-auto bg-eco-500 text-white font-display font-extrabold rounded-full flex items-center justify-center text-sm shadow-sm">
              3
            </div>
            <h3 className="font-display font-bold text-xl text-slate-800">
              Build & Earn Badges
            </h3>
            <p className="text-sm font-semibold text-slate-600 leading-relaxed">
              Follow illustrated steps with voice narration. Finish your creation to earn real Eco-Points, unlock badges, and save the earth!
            </p>
          </div>
        </div>
      </section>

      {/* Popular Crafts Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900">
              Popular DIY Eco Crafts 🎨
            </h2>
            <p className="text-base font-semibold text-slate-600 mt-1">
              Curated, tested, and 100% child-friendly projects you can build right now.
            </p>
          </div>
          <Link
            to="/crafts"
            className="btn-kid btn-kid-green py-2.5 px-6 text-sm flex items-center gap-1.5"
          >
            <span>See All 30+ Crafts</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {popularCrafts.map((craft) => (
            <div key={craft.id} className="kid-card flex flex-col justify-between p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-eco-100 text-eco-800 rounded-full font-display font-bold text-xs capitalize">
                    {craft.primary_material}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-sunny-100 px-2.5 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    +{craft.eco_points} Pts
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-xl text-slate-800 line-clamp-1">
                  {craft.title}
                </h3>
                <p className="text-sm font-medium text-slate-600 mt-2 line-clamp-2">
                  {craft.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">
                  ⏱️ {craft.estimated_time_minutes} mins • {craft.difficulty}
                </span>
                <Link
                  to={`/crafts/${craft.id}`}
                  onClick={() => playSound('click')}
                  className="btn-kid btn-kid-sky py-1.5 px-4 text-xs font-bold"
                >
                  Start Craft
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Environmental Impact & Recycling Benefits */}
      <section className="bg-gradient-to-r from-eco-600 to-teal-700 rounded-4xl max-w-7xl mx-auto px-6 py-12 sm:p-16 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-extrabold uppercase tracking-wider backdrop-blur-sm">
              Real Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold leading-tight">
              Why Upcycling Matters for Our Planet 🌍
            </h2>
            <p className="text-base text-eco-50 font-medium leading-relaxed">
              Every year, over 300 million tons of plastic are produced worldwide. When children turn discarded boxes and bottles into toys, they stop waste at the source and cultivate lifetime habits of environmental stewardship!
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
                <TreePine className="w-6 h-6 mx-auto mb-1 text-sunny-300" />
                <span className="block font-display font-extrabold text-2xl">17 Trees</span>
                <span className="text-xs text-eco-100">Saved per ton of paper</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
                <Fish className="w-6 h-6 mx-auto mb-1 text-sky-300" />
                <span className="block font-display font-extrabold text-2xl">450 Yrs</span>
                <span className="text-xs text-eco-100">Saved from ocean drift</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
                <Recycle className="w-6 h-6 mx-auto mb-1 text-amber-300" />
                <span className="block font-display font-extrabold text-2xl">0% Power</span>
                <span className="text-xs text-eco-100">No factory emissions</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 text-center p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
            <h3 className="font-display font-extrabold text-2xl mb-2">
              Ready to Join the Eco Heroes?
            </h3>
            <p className="text-sm text-eco-100 mb-6 font-medium">
              Start with one empty container from your recycling bin today!
            </p>
            <Link
              to="/scanner"
              onClick={() => playSound('fanfare')}
              className="btn-kid btn-kid-yellow py-3.5 px-8 text-lg font-extrabold text-slate-900 inline-flex items-center gap-2"
            >
              <Camera className="w-5 h-5 text-amber-700" />
              <span>Scan Your First Item</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Parent & Teacher Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="kid-card p-8 space-y-4 border-2 border-eco-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-eco-100 flex items-center justify-center text-eco-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900">For Parents</h3>
                <span className="text-xs font-semibold text-eco-600">Safe, COPPA-Compliant Oversight</span>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              We never collect real children's names, photos, or GPS locations. All accounts are managed with adult supervision, and safety flags clearly indicate when an adult needs to assist with scissors or cutters.
            </p>
            <Link
              to="/parent"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-eco-700 hover:text-eco-800"
            >
              <span>Visit Parent Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="kid-card p-8 space-y-4 border-2 border-sunny-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sunny-100 flex items-center justify-center text-amber-700">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900">For Educators</h3>
                <span className="text-xs font-semibold text-amber-600">Curriculum-Aligned STEM Activities</span>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Assign classroom recycling challenges, print educational worksheets, and guide students through hands-on science lessons about biodiversity, capillary action, and sustainable materials.
            </p>
            <Link
              to="/teacher"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-700 hover:text-amber-800"
            >
              <span>Visit Teacher Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
