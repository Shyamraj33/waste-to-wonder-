# Eco World – Turn Waste Into Wonder! 🌿🎨✨

**Eco World** is a complete, full-stack, AI-powered educational web platform designed for children aged 5–12. It helps kids transform unused household items and recyclable waste into exciting, creative DIY crafts using Computer Vision, material intelligence, video demonstration walkthroughs, and an age-tailored recommendation engine.

---

## 🌟 Key Features

1. **Smart Waste Scanner**: Children snap or upload a photo of household waste (plastic bottles, cardboard boxes, paper rolls, tin cans, glass jars, phone cases, etc.). A PyTorch image classifier (MobileNetV3) detects the object and maps its estimated material composition with sub-second inference.
2. **🌟 Rare & Secret Craft Inventions Lab**: Highlights unusual, high-value upcycling projects (e.g. MagSafe Wall Key Docks, Acoustic Megaphone Speakers, Hydroponic Hanging Wall Gardens, Kinetic Acrobats, Star Projectors) with bonus Eco-Points.
3. **🎬 Interactive Making Video Player**: Step-by-step illustrated video player with timeline scrubber, bookmark jump markers, variable playback speeds, voice narration, and celebratory confetti.
4. **Kid-Centric Recommendation Engine**: Ranks crafts using a weighted score:
   - **Material compatibility**: 40%
   - **Age suitability**: 25%
   - **Difficulty suitability**: 15%
   - **Safety suitability**: 10%
   - **Interests & duration**: 10%
   - **Strict hard safety filtering**: Unsafe crafts or hazardous materials are strictly filtered out.
5. **Eco Learning Center**: Interactive lessons on ocean conservation, plastic reduction, upcycling, and tree preservation, paired with interactive quizzes and badges.
6. **Gamification & Eco-Points**: Earn points and badges (e.g., *Eco Explorer*, *Plastic Hero*, *Nature Guardian*, *Recycling Champion*) stored in child profiles.
7. **Parent & Teacher Portals**: Safe, COPPA-friendly parent-managed accounts with safety notes and oversight, plus teacher challenge management with no public child exposure.

---

## 🏗️ Architecture & Project Structure

```
waste to wonder/
├── frontend/                 # React 18 + Vite + Tailwind CSS + Framer Motion
│   ├── public/              # Static icons, badges, illustrations
│   └── src/
│       ├── components/      # Reusable UI (Navbar, Footer, ChildOnboardingModal)
│       ├── context/         # AuthContext & ChildContext
│       ├── pages/           # Landing, Scanner, Studio, Learning, Dashboard, Rewards, Portals
│       ├── services/        # API client and endpoints
│       └── styles/          # Tailwind custom palette & animations
│
├── backend/                  # Python 3.12 + FastAPI + SQLAlchemy + PyTorch
│   ├── app/
│   │   ├── ai/              # Computer Vision inference (MobileNetV3) & material mapping
│   │   ├── api/             # REST endpoints (auth, scanner, crafts, learning, progress, portal)
│   │   ├── data/            # 30+ curated crafts, lessons, badges in JSON seed
│   │   ├── database/        # SQLite engine, models & session management
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── recommendations/ # Weighted scoring & hard safety filters
│   │   ├── schemas/         # Pydantic validation schemas
│   │   └── security/        # JWT auth, password hashing, role checks
│   ├── tests/               # Pytest suite (10 automated tests passing)
│   ├── uploads/             # Secure local storage for scanned images
│   ├── requirements.txt     # Python backend dependencies
│   └── .env.example         # Configuration template
│
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide (Windows PowerShell)

### Prerequisites
- **Node.js**: v18+ (tested on v26)
- **Python**: 3.10+ (tested on Python 3.12)

---

### 1. Start the Backend API

Open Windows PowerShell and run:

```powershell
cd "c:\Users\hp\Documents\waste to wonder\backend"

# Activate the virtual environment
.\venv\Scripts\Activate.ps1

# Run the backend server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- API Root: `http://127.0.0.1:8000/`
- Interactive API Swagger Docs: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/api/health`

---

### 2. Start the Frontend Application

In a new Windows PowerShell terminal:

```powershell
cd "c:\Users\hp\Documents\waste to wonder\frontend"

# Launch development server
npm.cmd run dev
```

- Web Application: `http://localhost:5173`

---

### 3. Run Backend Pytest Suite

```powershell
cd "c:\Users\hp\Documents\waste to wonder\backend"
.\venv\Scripts\pytest.exe tests -v
```

All 10 test suites test:
1. API Root & Health Check
2. AI Material Mapping & Hazardous Waste Safety Filter
3. 30+ Curated Crafts Listing & Filtering
4. Craft Detail & Illustrated Steps
5. Weighted Recommendation Engine Scoring
6. Smart Waste Scanner Image Upload & MobileNetV3 Inference
7. Child Profile Creation, Progress & Eco-Points Awarding
8. Eco Learning Center & Interactive Quiz Evaluation
9. Health Status Endpoint
10. Parent Authentication & Dashboard Summary
