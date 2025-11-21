# 🎵 Tarumbeta - Musical Instrument Rental & Instructor Matching Platform

**Connecting music learners with the perfect instruments and instructors using Machine Learning**

---

## 🌟 Overview

Tarumbeta is a full-stack web platform that revolutionizes how people start their music learning journey. We solve two problems at once:

1. **🎸 Affordable Access to Instruments** - Rent high-quality musical instruments instead of expensive purchases
2. **🎓 Perfect Instructor Matching** - Get matched with the ideal music teacher using ML algorithms

### Why Tarumbeta?

> "Don't just rent an instrument - find your perfect learning partner"

Traditional platforms only handle rentals OR instructor directories. **Tarumbeta is the first to intelligently combine both**, using machine learning to match learners with instructors based on:
- Learning goals & experience level
- Budget & location
- Schedule compatibility
- Teaching style preferences
- **95%+ match accuracy**

---

## 🎯 Core Features

### For Learners (Students)
- 🔍 **Browse & Rent Instruments** - Guitars, Pianos, Drums, and more
- 🤖 **ML-Powered Instructor Matching** - Answer a few questions, get ranked matches
- 📅 **Integrated Lesson Booking** - Schedule lessons directly after renting
- 💬 **Direct Messaging** - Communicate with owners and instructors
- ⭐ **Review System** - Rate your experience
- 📊 **Learning Dashboard** - Track rentals, lessons, and progress

### For Owners (Instrument Owners)
- 📝 **Easy Listing Management** - Upload instruments in minutes
- 🔔 **Rental Request Management** - Approve/reject with full control
- 📋 **Complete Rental Lifecycle** - From request to return with dual confirmation
- 💰 **Earnings Dashboard** - Track income and payouts
- 🛡️ **Protected Rentals** - Deposits and damage reporting

### For Instructors (Music Teachers)
- 🎯 **Quality Student Matching** - ML brings you compatible students
- 📆 **Schedule Management** - Integrated calendar and booking
- 📈 **Progress Tracking** - Document student growth
- 💵 **Reliable Income** - Automatic payments and weekly payouts
- 🏆 **Build Reputation** - Ratings and reviews system

---

## 🏗️ Architecture

### Current (Figma Make Prototype)
```
React Frontend (Vite + TypeScript)
        ↓
Services (Direct Supabase calls)
        ↓
Supabase (Database + Auth + Storage)
```

### Production (After Migration)
```
React Frontend (Port 3000)
        ↓
Flask Backend API (Port 8000)
        ↓ ↓
        ↓ └→ ML Model (Instructor Matching)
        ↓
Supabase (Database + Auth + Storage)
```

**Tech Stack:**

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS v4.0
- Vite (Build tool)
- Shadcn/ui (Component library)
- React Router (Navigation)
- Lucide Icons

**Backend:**
- Flask (Python web framework)
- Supabase Python SDK
- Flask-CORS
- JWT Authentication

**Database:**
- Supabase (PostgreSQL)
- Tables: users, instrument_listings, rentals, instructors, instructor_matches, lessons, reviews

**ML Model:**
- Python (scikit-learn / custom)
- Features: 8+ matching criteria
- Output: Ranked instructor list with match scores

**Auth:**
- Supabase Auth
- JWT tokens validated by Flask
- Role-based access control

**Storage:**
- Supabase Storage (instrument images, profile photos)

---

## 📁 Project Structure

```
tarumbeta/
│
├── frontend/                           # React Application
│   ├── src/
│   │   ├── components/                 # UI Components
│   │   │   ├── ui/                    # Shadcn base components
│   │   │   ├── auth/                  # Login, Signup
│   │   │   ├── instruments/           # Instrument cards, details
│   │   │   ├── instructors/           # Instructor profiles, matching
│   │   │   ├── rentals/               # Rental management
│   │   │   ├── lessons/               # Lesson scheduling
│   │   │   └── dashboard/             # User dashboards
│   │   │
│   │   ├── contexts/                  # React Context
│   │   │   └── AuthContext.tsx        # Authentication state
│   │   │
│   │   ├── services/                  # API Service Layer
│   │   │   ├── instrumentsService.ts  # Instrument CRUD
│   │   │   ├── instructorsService.ts  # Instructor management
│   │   │   ├── rentalsService.ts      # Rental lifecycle
│   │   │   ├── lessonsService.ts      # Lesson booking
│   │   │   ├── matchingService.ts     # ML matching API
│   │   │   └── reviewsService.ts      # Review system
│   │   │
│   │   ├── lib/                       # Utilities
│   │   │   └── supabase.ts           # Supabase client config
│   │   │
│   │   ├── styles/                    # Styling
│   │   │   └── globals.css           # Global CSS + Tailwind
│   │   │
│   │   ├── App.tsx                    # Main app component
│   │   └── main.tsx                   # Entry point
│   │
│   ├── public/                        # Static assets
│   ├── .env                          # Environment variables
│   ├── package.json                  # Dependencies
│   ├── vite.config.ts                # Vite configuration
│   └── tailwind.config.js            # Tailwind configuration
│
└── backend/                           # Flask API Server
    ├── app/
    │   ├── __init__.py               # Flask app factory
    │   ├── config.py                 # Configuration
    │   │
    │   ├── routes/                   # API Endpoints
    │   │   ├── __init__.py
    │   │   ├── auth.py              # POST /api/auth/signup, /signin
    │   │   ├── instruments.py       # GET/POST/PUT/DELETE /api/instruments
    │   │   ├── rentals.py           # Rental lifecycle endpoints
    │   │   ├── instructors.py       # Instructor management
    │   │   ├── lessons.py           # Lesson scheduling
    │   │   ├── matching.py          # ML matching endpoint
    │   │   └── reviews.py           # Review system
    │   │
    │   ├── ml_models/                # Machine Learning
    │   │   ├── __init__.py
    │   │   ├── instructor_matcher.py # ML model wrapper
    │   │   └── trained_model.pkl     # Trained ML model
    │   │
    │   └── utils/                    # Helper functions
    │       ├── __init__.py
    │       ├── supabase_client.py   # Supabase connection
    │       └── auth_helpers.py      # JWT validation
    │
    ├── requirements.txt              # Python dependencies
    ├── .env                         # Environment variables
    └── run.py                       # Flask entry point
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- Supabase Account
- Git

### Quick Start

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/tarumbeta.git
cd tarumbeta
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

Frontend runs on `http://localhost:3000`

#### 3. Backend Setup
```bash
cd backend_template

# Option 1: Standard Python venv
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Option 2: Miniconda/Anaconda (if you have conda installed)
conda create -n tarumbeta python=3.10
conda activate tarumbeta

# Install dependencies (both options)
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start server
python run.py
```

Backend runs on `http://localhost:8000`

#### 4. Add ML Model
Place your trained model in `backend/app/ml_models/trained_model.pkl`

---

## 🗄️ Database Schema

### Tables

#### **users**
```sql
- id (uuid, primary key)
- email (text, unique)
- full_name (text)
- role (text) -- 'learner', 'owner', 'instructor'
- location (text)
- phone (text)
- avatar_url (text)
- created_at (timestamp)
```

#### **instrument_listings**
```sql
- id (uuid, primary key)
- owner_id (uuid, foreign key → users)
- name (text)
- instrument_type (text) -- 'Guitar', 'Piano', etc.
- category (text) -- 'Acoustic', 'Electric', etc.
- condition (text) -- 'Excellent', 'Good', 'Fair'
- description (text)
- price_per_day (decimal)
- price_per_week (decimal)
- price_per_month (decimal)
- location (text)
- is_available (boolean)
- image_url (text)
- created_at (timestamp)
```

#### **rentals**
```sql
- id (uuid, primary key)
- instrument_id (uuid, foreign key → instrument_listings)
- renter_id (uuid, foreign key → users)
- start_date (date)
- end_date (date)
- total_price (decimal)
- status (text) -- 'pending', 'confirmed', 'active', 'pending_return', 'completed', 'rejected', 'cancelled'
- with_instructor (boolean)
- actual_start_date (timestamp)
- actual_end_date (timestamp)
- renter_marked_returned_at (timestamp)
- created_at (timestamp)
```

#### **instructors**
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → users)
- instrument (text)
- hourly_rate (decimal)
- bio (text)
- years_experience (integer)
- certifications (text[])
- rating (decimal)
- total_students (integer)
- is_available (boolean)
- teaching_style (text)
- available_days (text[])
- available_times (text[])
- created_at (timestamp)
```

#### **instructor_matches**
```sql
- id (uuid, primary key)
- learner_id (uuid, foreign key → users)
- instructor_id (uuid, foreign key → instructors)
- match_score (decimal) -- 0.0 to 1.0
- match_reasons (text[])
- status (text) -- 'pending', 'accepted', 'declined'
- created_at (timestamp)
```

#### **lessons**
```sql
- id (uuid, primary key)
- instructor_id (uuid, foreign key → instructors)
- learner_id (uuid, foreign key → users)
- scheduled_at (timestamp)
- duration (integer) -- minutes
- lesson_type (text) -- 'in-person', 'online'
- status (text) -- 'scheduled', 'completed', 'cancelled'
- notes (text)
- created_at (timestamp)
```

#### **reviews**
```sql
- id (uuid, primary key)
- reviewer_id (uuid, foreign key → users)
- reviewed_id (uuid, foreign key → users)
- review_type (text) -- 'instructor', 'rental'
- rating (integer) -- 1-5
- comment (text)
- created_at (timestamp)
```

---

## 🔄 Rental Lifecycle

### Status Flow
```
PENDING → CONFIRMED → ACTIVE → PENDING_RETURN → COMPLETED
   ↓          ↓
REJECTED   CANCELLED
```

### Detailed Workflow

1. **PENDING** - Learner creates rental request
   - Owner receives notification
   - Owner can approve or reject

2. **CONFIRMED** - Owner approves request
   - Pickup details shared
   - Learner can cancel (with refund)

3. **ACTIVE** - Owner marks as picked up
   - Instrument in learner's possession
   - Payment released to owner

4. **PENDING_RETURN** - Learner marks as returned
   - Owner must confirm return
   - Dual confirmation prevents disputes

5. **COMPLETED** - Owner confirms return
   - Rental successfully completed
   - Review prompts sent

6. **REJECTED** - Owner declines request
   - Learner receives refund
   - Reason provided

7. **CANCELLED** - Learner cancels
   - Refund based on cancellation policy
   - Instrument becomes available

---

## 🤖 ML Matching Algorithm

### Input Features
- Instrument type
- Experience level (beginner/intermediate/advanced)
- Learning goals (list)
- Budget (KES per hour)
- Location (coordinates)
- Schedule preferences
- Learning style
- Lesson format preference

### Matching Criteria (Weighted)
1. **Instrument Match** (30%) - Exact or related instrument
2. **Experience Compatibility** (20%) - Instructor teaches this level
3. **Budget Fit** (15%) - Within learner's budget
4. **Location Proximity** (12%) - Distance in km
5. **Schedule Alignment** (10%) - Overlapping availability
6. **Goals Alignment** (8%) - Matching specializations
7. **Teaching Style** (5%) - Compatible approaches
8. **Quality Bonus** (up to +10%) - Ratings, completion rate, experience

### Output
- Top 5 instructors ranked by match score
- Score: 0.0 - 1.0 (displayed as percentage)
- Detailed reasons for each match
- Recommendation strength (Excellent/Great/Good/Fair)

### Example Match
```json
{
  "instructor_id": "uuid-123",
  "instructor_name": "Mary Wanjiru",
  "match_score": 0.95,
  "match_reasons": [
    "Specializes in beginner fingerpicking",
    "Flexible teaching style matches your preference",
    "Perfect schedule alignment",
    "Within budget (KES 1,000/hour)",
    "Only 3km away"
  ],
  "recommendation_strength": "Excellent Match"
}
```

---

## 🎨 Design System

### Colors
- **Primary (Deep Indigo):** `#4F46E5`
- **Secondary (Vibrant Teal):** `#14B8A6`
- **Accent (Warm Gold):** `#F59E0B`
- **Neutrals:** Tailwind gray scale

### Typography
- Default system: Set in `globals.css`
- No inline font sizes/weights unless requested
- Responsive scaling

### Components
- **Atomic Design** architecture
- **Shadcn/ui** base components
- Custom components in `/components`

### Dark Mode
- Full support across all pages
- System preference detection
- Manual toggle available

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## 📱 Key User Journeys

### Journey 1: Learner Rents Guitar + Finds Instructor
1. Browse instruments → Find Yamaha Guitar
2. Sign up as Learner
3. Select rental dates
4. **Check "I want an instructor"** ✓
5. Fill ML matching form (experience, goals, budget, schedule)
6. View top 5 matches (e.g., 95% match with Mary)
7. Select instructor → Pay
8. Owner approves → Pickup guitar
9. First lesson scheduled
10. Weekly lessons for 3 months
11. Return guitar → Leave reviews
12. **Success!** Learned guitar fundamentals

### Journey 2: Owner Lists & Manages Rentals
1. Sign up as Owner
2. Create instrument listing (photos, pricing, description)
3. Receive rental request
4. Approve request
5. Coordinate pickup
6. Mark as picked up
7. Monitor active rental
8. Renter marks returned
9. Confirm return after inspection
10. Receive payment
11. Leave review

### Journey 3: Instructor Gets Matched & Teaches
1. Apply as instructor (certifications, bio, video)
2. Profile approved
3. Receive ML match (95% with Sarah)
4. Accept match
5. Sarah schedules first lesson
6. Teach lesson (fingerpicking basics)
7. Track progress in dashboard
8. Student books 3 more lessons
9. Receive positive review
10. Get more match requests

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/me` - Get current user

### Instruments
- `GET /api/instruments` - List all (with filters)
- `GET /api/instruments/:id` - Get details
- `POST /api/instruments` - Create listing
- `PUT /api/instruments/:id` - Update listing
- `DELETE /api/instruments/:id` - Delete listing

### Rentals
- `POST /api/rentals` - Create rental request
- `GET /api/rentals/my-rentals` - Learner's rentals
- `GET /api/rentals/my-listings` - Owner's rentals
- `PUT /api/rentals/:id/approve` - Owner approves
- `PUT /api/rentals/:id/reject` - Owner rejects
- `PUT /api/rentals/:id/pickup` - Mark picked up
- `PUT /api/rentals/:id/mark-returned` - Renter returns
- `PUT /api/rentals/:id/confirm-return` - Owner confirms
- `PUT /api/rentals/:id/cancel` - Cancel rental

### Instructors
- `GET /api/instructors` - List all (with filters)
- `GET /api/instructors/:id` - Get profile
- `POST /api/instructors` - Register as instructor

### Matching (ML)
- `POST /api/matching/find-instructors` - Run ML matching
- `GET /api/matching/history` - Match history

### Lessons
- `POST /api/lessons` - Schedule lesson
- `GET /api/lessons/my-lessons` - User's lessons
- `PUT /api/lessons/:id/cancel` - Cancel lesson

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/user/:id` - User's reviews

**All endpoints (except auth) require JWT Bearer token in Authorization header**

---

## 🔐 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Backend (.env)
```env
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your_flask_secret
PORT=8000
```

---

## 🧪 Testing

### Frontend
```bash
cd frontend
npm run test          # Unit tests (if configured)
npm run build         # Production build test
npm run preview       # Preview production build
```

### Backend
```bash
cd backend
pytest                # Run tests (if configured)
python run.py         # Manual testing
```

### Testing Checklist
- [ ] User signup/login
- [ ] Browse instruments
- [ ] Create rental request
- [ ] ML matching flow
- [ ] Rental lifecycle (all statuses)
- [ ] Lesson scheduling
- [ ] Review system
- [ ] Payment flow

---





**Built with React, Flask, Supabase, and Machine Learning**

🎵 *Making music education accessible to everyone* 🎵
