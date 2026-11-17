import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ChildProvider } from './context/ChildContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChildOnboardingModal from './components/ChildOnboardingModal';

import LandingPage from './pages/LandingPage';
import ChildDashboard from './pages/ChildDashboard';
import SmartScannerPage from './pages/SmartScannerPage';
import CraftsCatalogPage from './pages/CraftsCatalogPage';
import CraftStudioPage from './pages/CraftStudioPage';
import EcoLearningPage from './pages/EcoLearningPage';
import RewardsPage from './pages/RewardsPage';
import ParentPortalPage from './pages/ParentPortalPage';
import TeacherPortalPage from './pages/TeacherPortalPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ChildProvider>
          <div className="min-h-screen flex flex-col bg-[#FAFDF6] text-slate-800 antialiased selection:bg-eco-200 selection:text-eco-800">
            {/* Global Kid-Friendly Navigation Bar */}
            <Navbar />

            {/* Child Profile Onboarding / Customization Modal */}
            <ChildOnboardingModal />

            {/* Page View Routing */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<ChildDashboard />} />
                <Route path="/scanner" element={<SmartScannerPage />} />
                <Route path="/crafts" element={<CraftsCatalogPage />} />
                <Route path="/crafts/:id" element={<CraftStudioPage />} />
                <Route path="/learning" element={<EcoLearningPage />} />
                <Route path="/rewards" element={<RewardsPage />} />
                <Route path="/parent" element={<ParentPortalPage />} />
                <Route path="/teacher" element={<TeacherPortalPage />} />
              </Routes>
            </main>

            {/* Child-Friendly Footer */}
            <Footer />
          </div>
        </ChildProvider>
      </AuthProvider>
    </Router>
  );
}
