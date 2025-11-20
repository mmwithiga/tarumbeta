# 🗺️ API MAPPING GUIDE - Tarumbeta

Complete mapping of Frontend Service Calls → Flask API Endpoints → Supabase Tables

---

## 📊 Architecture Flow

```
Frontend Component
      ↓
Service Function (instrumentsService.ts)
      ↓
HTTP Request (fetch) → Flask Route (/api/instruments)
      ↓
Supabase Python Client → Supabase Table (instrument_listings)
      ↓
Response ← ← ← Data flows back
```

---

## 🔐 AUTHENTICATION ENDPOINTS

### 1. Sign Up
**Frontend:** `AuthContext.tsx` → `signUp()`
```typescript
const response = await fetch(`${API_URL}/api/auth/signup`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, fullName, role })
});
```

**Flask Route:** `backend/app/routes/auth.py`
```python
@bp.route('/signup', methods=['POST'])
def signup():
    # Calls: supabase.auth.sign_up()
    # Table: auth.users (Supabase Auth)
    # Returns: { user, session }
```

**Supabase:**
- Uses Supabase Auth service
- Creates user in `auth.users` table
- Returns JWT access token

---

### 2. Sign In
**Frontend:** `AuthContext.tsx` → `signIn()`
```typescript
const response = await fetch(`${API_URL}/api/auth/signin`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

**Flask Route:** `backend/app/routes/auth.py`
```python
@bp.route('/signin', methods=['POST'])
def signin():
    # Calls: supabase.auth.sign_in_with_password()
    # Returns: { user, session, access_token }
```

---

### 3. Sign Out
**Frontend:** `AuthContext.tsx` → `signOut()`
```typescript
const response = await fetch(`${API_URL}/api/auth/signout`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Flask Route:** `backend/app/routes/auth.py`
```python
@bp.route('/signout', methods=['POST'])
def signout():
    # Calls: supabase.auth.sign_out()
    # Invalidates session
```

---

### 4. Get Current User
**Frontend:** `AuthContext.tsx` → `getCurrentUser()`
```typescript
const response = await fetch(`${API_URL}/api/auth/me`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Flask Route:** `backend/app/routes/auth.py`
```python
@bp.route('/me', methods=['GET'])
def get_current_user():
    # Validates JWT token
    # Calls: supabase.auth.get_user(token)
    # Returns: { user }
```

---

## 🎸 INSTRUMENTS ENDPOINTS

### 1. Get All Instruments
**Frontend:** `instrumentsService.ts` → `getAll()`
```typescript
const response = await fetch(
  `${API_URL}/api/instruments?instrument_type=${type}&location=${loc}`,
  { headers: { 'Authorization': `Bearer ${token}` }}
);
```

**Flask Route:** `backend/app/routes/instruments.py`
```python
@bp.route('/instruments', methods=['GET'])
def get_instruments():
    # Query params: instrument_type, location, max_price, page, page_size
    # Calls: supabase.table('instrument_listings').select('*')
    # Filters: .eq('is_available', True)
    # Joins: users table for owner info
    # Returns: [{ id, name, type, price, owner, ... }]
```

**Supabase Table:** `instrument_listings`
```sql
SELECT il.*, u.full_name as owner_name, u.email as owner_email
FROM instrument_listings il
LEFT JOIN users u ON il.owner_id = u.id
WHERE il.is_available = true
ORDER BY il.created_at DESC
```

---

### 2. Get Instrument by ID
**Frontend:** `instrumentsService.ts` → `getById(id)`
```typescript
const response = await fetch(`${API_URL}/api/instruments/${id}`);
```

**Flask Route:** `backend/app/routes/instruments.py`
```python
@bp.route('/instruments/<instrument_id>', methods=['GET'])
def get_instrument(instrument_id):
    # Calls: supabase.table('instrument_listings').select('*').eq('id', instrument_id)
    # Joins: users table
    # Returns: { id, name, type, description, owner, ... }
```

---

### 3. Create Instrument Listing
**Frontend:** `instrumentsService.ts` → `create()`
```typescript
const response = await fetch(`${API_URL}/api/instruments`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(instrumentData)
});
```

**Flask Route:** `backend/app/routes/instruments.py`
```python
@bp.route('/instruments', methods=['POST'])
@require_auth  # Middleware validates JWT
def create_instrument():
    # Body: { name, instrument_type, description, condition, price_per_day, location, image_url }
    # Calls: supabase.table('instrument_listings').insert()
    # Sets: owner_id from JWT token
    # Returns: { id, ... created instrument }
```

---

### 4. Update Instrument
**Frontend:** `instrumentsService.ts` → `update(id, data)`
```typescript
const response = await fetch(`${API_URL}/api/instruments/${id}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(updates)
});
```

**Flask Route:** `backend/app/routes/instruments.py`
```python
@bp.route('/instruments/<instrument_id>', methods=['PUT'])
@require_auth
def update_instrument(instrument_id):
    # Validates: user is owner
    # Calls: supabase.table('instrument_listings').update().eq('id', instrument_id)
    # Returns: { ... updated instrument }
```

---

### 5. Delete Instrument
**Frontend:** `instrumentsService.ts` → `delete(id)`
```typescript
const response = await fetch(`${API_URL}/api/instruments/${id}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Flask Route:** `backend/app/routes/instruments.py`
```python
@bp.route('/instruments/<instrument_id>', methods=['DELETE'])
@require_auth
def delete_instrument(instrument_id):
    # Validates: user is owner
    # Calls: supabase.table('instrument_listings').delete().eq('id', instrument_id)
    # Returns: { success: true }
```

---

## 📋 RENTALS ENDPOINTS

### 1. Create Rental Request
**Frontend:** `rentalsService.ts` → `createRental()`
```typescript
const response = await fetch(`${API_URL}/api/rentals`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    instrument_id,
    start_date,
    end_date,
    total_price,
    with_instructor
  })
});
```

**Flask Route:** `backend/app/routes/rentals.py`
```python
@bp.route('/rentals', methods=['POST'])
@require_auth
def create_rental():
    # Body: { instrument_id, start_date, end_date, total_price, with_instructor }
    # Calls: supabase.table('rentals').insert({
    #   renter_id: user_id,
    #   status: 'pending',
    #   ...
    # })
    # Returns: { id, status: 'pending', ... }
```

**Supabase Table:** `rentals`
- Creates new rental with status `'pending'`
- Sets `renter_id` from authenticated user
- Waits for owner approval

---

### 2. Get User's Rentals (Learner Dashboard)
**Frontend:** `rentalsService.ts` → `getUserRentals()`
```typescript
const response = await fetch(`${API_URL}/api/rentals/my-rentals`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Flask Route:** `backend/app/routes/rentals.py`
```python
@bp.route('/my-rentals', methods=['GET'])
@require_auth
def get_my_rentals():
    # Calls: supabase.table('rentals').select('*, instrument_listings(*)')
    #        .eq('renter_id', user_id)
    # Joins: instrument_listings, users
    # Returns: [{ id, status, instrument, start_date, end_date, ... }]
```

---

### 3. Get Owner's Rentals (Owner Dashboard)
**Frontend:** `rentalsService.ts` → `getOwnerRentals()`
```typescript
const response = await fetch(`${API_URL}/api/rentals/my-listings`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Flask Route:** `backend/app/routes/rentals.py`
```python
@bp.route('/my-listings', methods=['GET'])
@require_auth
def get_owner_rentals():
    # Joins: instrument_listings to get owner_id
    # Calls: supabase.table('rentals').select('*, instrument_listings(*), users(*)')
    #        .eq('instrument_listings.owner_id', user_id)
    # Returns: [{ id, status, instrument, renter, dates, ... }]
```

---

### 4. Approve Rental (Owner)
**Frontend:** `rentalsService.ts` → `approveRental(id)`
```typescript
const response = await fetch(`${API_URL}/api/rentals/${id}/approve`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Flask Route:** `backend/app/routes/rentals.py`
```python
@bp.route('/rentals/<rental_id>/approve', methods=['PUT'])
@require_auth
def approve_rental(rental_id):
    # Validates: user is instrument owner
    # Validates: current status is 'pending'
    # Calls: supabase.table('rentals').update({ status: 'confirmed' })
    # Returns: { status: 'confirmed', ... }
```

**Status Transition:** `pending` → `confirmed`

---

### 5. Reject Rental (Owner)
**Frontend:** `rentalsService.ts` → `rejectRental(id, reason)`
```typescript
const response = await fetch(`${API_URL}/api/rentals/${id}/reject`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ reason })
});
```

**Flask Route:** `backend/app/routes/rentals.py`
```python
@bp.route('/rentals/<rental_id>/reject', methods=['PUT'])
@require_auth
def reject_rental(rental_id):
    # Validates: user is instrument owner
    # Validates: current status is 'pending'
    # Calls: supabase.table('rentals').update({ status: 'rejected', rejection_reason })
    # Returns: { status: 'rejected', ... }
```

**Status Transition:** `pending` → `rejected`

---

### 6. Mark as Picked Up (Owner)
**Frontend:** `rentalsService.ts` → `markAsPickedUp(id)`
```typescript
const response = await fetch(`${API_URL}/api/rentals/${id}/pickup`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Flask Route:** `backend/app/routes/rentals.py`
```python
@bp.route('/rentals/<rental_id>/pickup', methods=['PUT'])
@require_auth
def mark_picked_up(rental_id):
    # Validates: user is instrument owner
    # Validates: current status is 'confirmed'
    # Calls: supabase.table('rentals').update({ 
    #   status: 'active',
    #   actual_start_date: NOW()
    # })
    # Returns: { status: 'active', ... }
```

**Status Transition:** `confirmed` → `active`

---

### 7. Mark as Returned (Renter)
**Frontend:** `rentalsService.ts` → `markAsReturned(id)`
```typescript
const response = await fetch(`${API_URL}/api/rentals/${id}/mark-returned`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Flask Route:** `backend/app/routes/rentals.py`
```python
@bp.route('/rentals/<rental_id>/mark-returned', methods=['PUT'])
@require_auth
def mark_returned(rental_id):
    # Validates: user is renter
    # Validates: current status is 'active'
    # Calls: supabase.table('rentals').update({ 
    #   status: 'pending_return',
    #   renter_marked_returned_at: NOW()
    # })
    # Returns: { status: 'pending_return', ... }
```

**Status Transition:** `active` → `pending_return`

---

### 8. Confirm Return (Owner)
**Frontend:** `rentalsService.ts` → `confirmReturn(id)`
```typescript
const response = await fetch(`${API_URL}/api/rentals/${id}/confirm-return`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Flask Route:** `backend/app/routes/rentals.py`
```python
@bp.route('/rentals/<rental_id>/confirm-return', methods=['PUT'])
@require_auth
def confirm_return(rental_id):
    # Validates: user is instrument owner
    # Validates: current status is 'pending_return'
    # Calls: supabase.table('rentals').update({ 
    #   status: 'completed',
    #   actual_end_date: NOW(),
    #   completed_at: NOW()
    # })
    # Returns: { status: 'completed', ... }
```

**Status Transition:** `pending_return` → `completed`

---

### 9. Cancel Rental (Renter)
**Frontend:** `rentalsService.ts` → `cancelRental(id)`
```typescript
const response = await fetch(`${API_URL}/api/rentals/${id}/cancel`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Flask Route:** `backend/app/routes/rentals.py`
```python
@bp.route('/rentals/<rental_id>/cancel', methods=['PUT'])
@require_auth
def cancel_rental(rental_id):
    # Validates: user is renter
    # Validates: status is 'pending' or 'confirmed' (not active)
    # Calls: supabase.table('rentals').update({ status: 'cancelled' })
    # Returns: { status: 'cancelled', ... }
```

**Status Transition:** `pending` or `confirmed` → `cancelled`

---

## 🎓 INSTRUCTORS ENDPOINTS

### 1. Get All Instructors
**Frontend:** `instructorsService.ts` → `getAll()`
```typescript
const response = await fetch(
  `${API_URL}/api/instructors?instrument=${type}&location=${loc}`
);
```

**Flask Route:** `backend/app/routes/instructors.py`
```python
@bp.route('/instructors', methods=['GET'])
def get_instructors():
    # Query params: instrument, location, min_rating, max_hourly_rate
    # Calls: supabase.table('instructors').select('*, users(*)')
    # Filters: .eq('is_available', True)
    # Returns: [{ id, user, instrument, hourly_rate, bio, ... }]
```

---

### 2. Get Instructor by ID
**Frontend:** `instructorsService.ts` → `getById(id)`
```typescript
const response = await fetch(`${API_URL}/api/instructors/${id}`);
```

**Flask Route:** `backend/app/routes/instructors.py`
```python
@bp.route('/instructors/<instructor_id>', methods=['GET'])
def get_instructor(instructor_id):
    # Calls: supabase.table('instructors').select('*, users(*)').eq('id', instructor_id)
    # Returns: { id, user, instrument, hourly_rate, bio, certifications, ... }
```

---

### 3. Register as Instructor
**Frontend:** `instructorsService.ts` → `registerAsInstructor()`
```typescript
const response = await fetch(`${API_URL}/api/instructors`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    instrument,
    hourly_rate,
    bio,
    years_experience,
    certifications
  })
});
```

**Flask Route:** `backend/app/routes/instructors.py`
```python
@bp.route('/instructors', methods=['POST'])
@require_auth
def register_instructor():
    # Validates: user not already an instructor
    # Calls: supabase.table('instructors').insert({ user_id, ... })
    # Also updates: users.role = 'instructor'
    # Returns: { id, ... instructor profile }
```

---

## 🎯 MATCHING ENDPOINTS (ML)

### 1. Find Matching Instructors
**Frontend:** `matchingService.ts` → `findMatches()`
```typescript
const response = await fetch(`${API_URL}/api/matching/find-instructors`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    instrument_type,
    location,
    budget,
    experience_level,
    learning_goals,
    preferred_schedule
  })
});
```

**Flask Route:** `backend/app/routes/matching.py`
```python
@bp.route('/find-instructors', methods=['POST'])
@require_auth
def find_instructors():
    # 1. Get all available instructors from Supabase
    instructors = supabase.table('instructors').select('*').execute()
    
    # 2. Load ML model
    from app.ml_models.instructor_matcher import InstructorMatcher
    matcher = InstructorMatcher()
    
    # 3. Run ML prediction
    learner_profile = request.json
    matches = matcher.predict_matches(learner_profile, instructors.data)
    
    # 4. Save matches to database
    supabase.table('instructor_matches').insert({
        'learner_id': user_id,
        'instructor_id': match['id'],
        'match_score': match['score'],
        'match_reasons': match['reasons']
    })
    
    # Returns: [{ instructor, match_score, reasons, ... }]
```

**ML Model Input:**
```python
{
  'instrument_type': 'Guitar',
  'location': 'Nairobi',
  'budget': 1500,
  'experience_level': 'beginner',
  'learning_goals': ['chords', 'fingerpicking'],
  'preferred_schedule': 'weekends'
}
```

**ML Model Output:**
```python
[
  {
    'instructor_id': 'uuid-1',
    'match_score': 0.95,
    'reasons': ['Specializes in beginner guitar', 'Available weekends', 'Within budget']
  },
  ...
]
```

---

### 2. Get Match History
**Frontend:** `matchingService.ts` → `getMatchHistory()`
```typescript
const response = await fetch(`${API_URL}/api/matching/history`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Flask Route:** `backend/app/routes/matching.py`
```python
@bp.route('/history', methods=['GET'])
@require_auth
def get_match_history():
    # Calls: supabase.table('instructor_matches')
    #        .select('*, instructors(*, users(*))')
    #        .eq('learner_id', user_id)
    # Returns: [{ instructor, match_score, created_at, ... }]
```

---

## 📅 LESSONS ENDPOINTS

### 1. Schedule Lesson
**Frontend:** `lessonsService.ts` → `scheduleLesson()`
```typescript
const response = await fetch(`${API_URL}/api/lessons`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    instructor_id,
    scheduled_at,
    duration,
    lesson_type,
    notes
  })
});
```

**Flask Route:** `backend/app/routes/lessons.py`
```python
@bp.route('/lessons', methods=['POST'])
@require_auth
def schedule_lesson():
    # Validates: instructor availability
    # Calls: supabase.table('lessons').insert({
    #   learner_id: user_id,
    #   instructor_id,
    #   scheduled_at,
    #   status: 'scheduled'
    # })
    # Returns: { id, scheduled_at, instructor, ... }
```

---

### 2. Get My Lessons
**Frontend:** `lessonsService.ts` → `getMyLessons()`
```typescript
const response = await fetch(`${API_URL}/api/lessons/my-lessons`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Flask Route:** `backend/app/routes/lessons.py`
```python
@bp.route('/my-lessons', methods=['GET'])
@require_auth
def get_my_lessons():
    # Gets lessons where user is learner OR instructor
    # Calls: supabase.table('lessons').select('*, instructors(*), users(*)')
    # Returns: [{ id, scheduled_at, instructor, learner, status, ... }]
```

---

### 3. Cancel Lesson
**Frontend:** `lessonsService.ts` → `cancelLesson(id)`
```typescript
const response = await fetch(`${API_URL}/api/lessons/${id}/cancel`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Flask Route:** `backend/app/routes/lessons.py`
```python
@bp.route('/lessons/<lesson_id>/cancel', methods=['PUT'])
@require_auth
def cancel_lesson(lesson_id):
    # Validates: user is learner or instructor
    # Calls: supabase.table('lessons').update({ status: 'cancelled' })
    # Returns: { status: 'cancelled', ... }
```

---

## ⭐ REVIEWS ENDPOINTS

### 1. Create Review
**Frontend:** `reviewsService.ts` → `createReview()`
```typescript
const response = await fetch(`${API_URL}/api/reviews`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    reviewed_id,  // instructor or owner
    review_type,  // 'instructor' or 'rental'
    rating,
    comment
  })
});
```

**Flask Route:** `backend/app/routes/reviews.py`
```python
@bp.route('/reviews', methods=['POST'])
@require_auth
def create_review():
    # Validates: user has completed rental/lesson with reviewed person
    # Calls: supabase.table('reviews').insert({ reviewer_id: user_id, ... })
    # Also updates: instructor/user average_rating
    # Returns: { id, rating, comment, ... }
```

---

### 2. Get Reviews for User
**Frontend:** `reviewsService.ts` → `getReviewsForUser(userId)`
```typescript
const response = await fetch(`${API_URL}/api/reviews/user/${userId}`);
```

**Flask Route:** `backend/app/routes/reviews.py`
```python
@bp.route('/reviews/user/<user_id>', methods=['GET'])
def get_user_reviews(user_id):
    # Calls: supabase.table('reviews').select('*, users!reviewer_id(*)')
    #        .eq('reviewed_id', user_id)
    # Returns: [{ rating, comment, reviewer, created_at, ... }]
```

---

## 🔄 Complete Rental Lifecycle Flow

**Status Transitions:**
```
1. CREATE RENTAL (Renter)
   → Status: pending
   → Endpoint: POST /api/rentals

2. APPROVE (Owner) OR REJECT (Owner)
   → Status: confirmed OR rejected
   → Endpoint: PUT /api/rentals/{id}/approve
   → Endpoint: PUT /api/rentals/{id}/reject

3. MARK PICKED UP (Owner)
   → Status: active
   → Endpoint: PUT /api/rentals/{id}/pickup

4. MARK RETURNED (Renter)
   → Status: pending_return
   → Endpoint: PUT /api/rentals/{id}/mark-returned

5. CONFIRM RETURN (Owner)
   → Status: completed
   → Endpoint: PUT /api/rentals/{id}/confirm-return

Alternative: CANCEL (Renter)
   → Status: cancelled
   → Endpoint: PUT /api/rentals/{id}/cancel
```

---

## 📊 Database Tables Summary

### Tables in Supabase:
1. **users** - User profiles (auth + data)
2. **instrument_listings** - Instruments for rent
3. **rentals** - Rental transactions
4. **instructors** - Instructor profiles
5. **instructor_matches** - ML matching results
6. **lessons** - Scheduled lessons
7. **reviews** - User/instructor reviews

### Key Relationships:
```
users (1) ──→ (many) instrument_listings [owner_id]
users (1) ──→ (many) rentals [renter_id]
instrument_listings (1) ──→ (many) rentals [instrument_id]
users (1) ──→ (1) instructors [user_id]
instructors (1) ──→ (many) instructor_matches [instructor_id]
users (1) ──→ (many) instructor_matches [learner_id]
instructors (1) ──→ (many) lessons [instructor_id]
users (1) ──→ (many) lessons [learner_id]
users (1) ──→ (many) reviews [reviewer_id, reviewed_id]
```

---

## 🎯 Summary

**Total Endpoints:** ~35+

**Authentication:** JWT tokens from Supabase Auth
**Authorization:** Middleware validates user role/ownership
**Data Flow:** Frontend → Flask → Supabase → Flask → Frontend
**ML Integration:** Flask calls Python ML model for matching

All endpoints use RESTful conventions with proper HTTP methods and status codes.

---

Next: See `COMPREHENSIVE_DOCUMENTATION.md` for complete feature documentation.
