# 📚 COMPREHENSIVE DOCUMENTATION - Tarumbeta Platform

**Complete documentation of all features, user journeys, and functionality**

---

## 🎯 PLATFORM OVERVIEW

**Tarumbeta** is a full-stack web platform that connects music learners with:
1. **Instrument Rentals** - Rent musical instruments from owners
2. **Instructor Matching** - Get matched with qualified music instructors using **Machine Learning**
3. **Lesson Scheduling** - Book and manage music lessons

### Core Value Proposition:
> "Find the perfect instrument to rent AND get matched with the best instructor for your learning journey"

### Main Goal:
**ML-Powered Instructor Matching** - The platform's unique selling point is using machine learning to match learners with the most suitable instructors based on:
- Instrument type
- Experience level
- Learning goals
- Budget
- Location
- Schedule preferences
- Teaching style compatibility

---

## 👥 USER TYPES

### 1. **Learner** (Student/Renter)
- Primary user type
- Rents instruments
- Gets matched with instructors
- Books lessons
- Leaves reviews

### 2. **Owner** (Instrument Owner)
- Lists instruments for rent
- Manages rental requests
- Approves/rejects bookings
- Confirms pickup and return
- Can also be a learner

### 3. **Instructor** (Music Teacher)
- Registered as instructor
- Gets matched with learners
- Conducts lessons
- Can also rent instruments
- Can also list instruments

### 4. **Hybrid Users**
- Can have multiple roles simultaneously
- Example: Owner + Instructor
- Example: Learner + Owner

---

## 🎨 DESIGN SYSTEM

### Color Palette:
- **Deep Indigo** - `#4F46E5` - Primary brand color
- **Vibrant Teal** - `#14B8A6` - Secondary/accent color
- **Warm Gold** - `#F59E0B` - Highlights and CTAs
- **Neutral Grays** - Background and text

### Dark Mode:
- Full dark mode support
- Automatic switching based on system preference
- Toggle available in UI

### Component Architecture:
- **Atomic Design** - Atoms → Molecules → Organisms
- **Shadcn/ui** - Base component library
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Icon system

### Responsive Design:
- **Mobile First** - Designed for mobile, enhanced for desktop
- **Breakpoints:**
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

---

## 🗺️ COMPLETE USER JOURNEYS

---

## 📱 JOURNEY 1: NEW LEARNER - RENT INSTRUMENT & FIND INSTRUCTOR

### Persona: Sarah
**Background:** Beginner guitarist, wants to learn before buying an expensive guitar

### Step-by-Step Journey:

#### 1. **Landing Page**
**User sees:**
- Hero section with value proposition
- Search bar for instruments
- Categories (Guitar, Piano, Drums, etc.)
- Featured instructors
- How it works section
- CTA buttons: "Browse Instruments" / "Sign Up"

**User actions:**
- Clicks "Browse Instruments"
- OR uses search: "Guitar in Nairobi"

---

#### 2. **Browse Instruments Page**
**URL:** `/instruments`

**User sees:**
- Grid of available instruments
- Filters sidebar:
  - Instrument type
  - Location
  - Price range
  - Condition (Excellent, Good, Fair)
- Sorting options (Price, Date, Rating)

**Each instrument card shows:**
- Image
- Name (e.g., "Yamaha Acoustic Guitar")
- Type (Guitar)
- Condition (Excellent)
- Price (KES 500/day)
- Location (Nairobi)
- Owner rating (4.8 ⭐)

**User actions:**
- Applies filters: Type = Guitar, Location = Nairobi
- Sees 15 matching guitars
- Clicks on "Yamaha Acoustic Guitar"

---

#### 3. **Instrument Details Page**
**URL:** `/instruments/:id`

**User sees:**
- Large instrument image gallery
- Full description
- Specifications:
  - Type: Acoustic Guitar
  - Brand: Yamaha
  - Condition: Excellent
  - Includes: Case, strap, picks
- Pricing:
  - Daily: KES 500
  - Weekly: KES 3,000
  - Monthly: KES 10,000
- Owner profile:
  - Name: John Doe
  - Rating: 4.8 ⭐ (23 reviews)
  - Response time: < 1 hour
- Availability calendar
- Reviews from previous renters

**User actions:**
- Not logged in yet
- Clicks "Rent This Instrument"
- **Redirected to Sign Up/Login page**

---

#### 4. **Sign Up Page**
**URL:** `/signup`

**User sees:**
- Sign up form with fields:
  - Full Name: [Sarah Mwangi]
  - Email: [sarah@email.com]
  - Password: [••••••••]
  - Role selection: ○ Learner ○ Owner ○ Instructor
  - Terms & Conditions checkbox

**User actions:**
- Fills form
- Selects "Learner" role
- Clicks "Create Account"
- Account created successfully
- **Automatically logged in**
- **Redirected back to instrument details page**

---

#### 5. **Rent Instrument - Date Selection**
**URL:** `/instruments/:id` (now logged in)

**User sees:**
- Same instrument details
- Now sees "Book Rental" section:
  - Start Date picker
  - End Date picker
  - Duration calculation (e.g., "7 days")
  - Price breakdown:
    - Weekly rate: KES 3,000
    - Service fee: KES 300
    - **Total: KES 3,300**
  - Checkbox: "I want an instructor for this instrument"

**User actions:**
- Selects dates: Jan 15 - Jan 22 (7 days)
- **Checks "I want an instructor"** ✓
- Clicks "Proceed to Checkout"

---

#### 6. **Instructor Matching Flow**
**URL:** `/matching/preferences`

**User sees:**
- "Find Your Perfect Instructor" form
- Questions for ML matching:
  1. **Experience Level:**
     - ○ Complete Beginner (never played before)
     - ● Beginner (know basics)
     - ○ Intermediate
     - ○ Advanced
  
  2. **Learning Goals:** (checkboxes)
     - ☑ Learn chords
     - ☑ Fingerpicking techniques
     - ☐ Music theory
     - ☐ Songwriting
     - ☐ Performance skills
  
  3. **Budget for Lessons:**
     - Slider: KES 500 - 2,000 per hour
     - Selected: KES 1,200/hour
  
  4. **Preferred Schedule:**
     - Checkboxes: ☑ Weekdays ☑ Weekends
     - Time: ○ Morning ● Afternoon ○ Evening
  
  5. **Learning Style:**
     - ○ Structured curriculum
     - ● Flexible, casual approach
     - ○ Intensive bootcamp style
  
  6. **Location Preference:**
     - ● In-person (Nairobi)
     - ○ Online only
     - ○ Hybrid

**User actions:**
- Fills out all preferences
- Clicks "Find Matching Instructors"
- **ML Model runs in background**
- Shows loading animation: "🎯 Finding your perfect match..."

---

#### 7. **Instructor Matches Page**
**URL:** `/matching/results`

**ML Model has:**
- Analyzed Sarah's profile
- Compared with all available guitar instructors
- Calculated match scores
- Ranked instructors

**User sees:**
- **"We found 5 great matches for you!"**

**Top Match (95% match):**
```
┌─────────────────────────────────────────────────┐
│ 🏆 BEST MATCH (95%)                             │
│                                                  │
│ [Photo] Mary Wanjiru                            │
│         ⭐ 4.9 (47 reviews)                      │
│                                                  │
│ 🎸 Specializes in: Acoustic Guitar - Beginners  │
│ 💰 KES 1,000/hour (Within your budget)          │
│ 📍 Westlands, Nairobi (3km from you)            │
│ 📅 Available: Weekday afternoons, Weekends      │
│ 🎓 8 years experience                           │
│                                                  │
│ WHY THIS MATCH:                                  │
│ ✓ Expert in beginner fingerpicking              │
│ ✓ Flexible, patient teaching style              │
│ ✓ Perfect schedule alignment                    │
│ ✓ Specializes in your learning goals            │
│                                                  │
│ [View Full Profile] [Select Instructor]         │
└─────────────────────────────────────────────────┘
```

**Other matches:**
- 2nd: David Kimani (89% match) - KES 1,500/hour
- 3rd: Grace Achieng (86% match) - KES 900/hour
- 4th: Peter Omondi (82% match) - KES 1,200/hour
- 5th: Linda Njeri (78% match) - KES 1,800/hour

**User actions:**
- Clicks "View Full Profile" for Mary Wanjiru
- Sees detailed instructor profile:
  - Full bio
  - Teaching philosophy
  - Student testimonials
  - Sample lesson video
  - Certifications
  - Availability calendar
- Decides Mary is perfect
- Clicks "Select Instructor"

---

#### 8. **Rental Confirmation Page**
**URL:** `/rentals/confirm`

**User sees:**
- **Rental Summary:**
  ```
  Instrument: Yamaha Acoustic Guitar
  Owner: John Doe
  Dates: Jan 15 - Jan 22, 2025
  Duration: 7 days
  Price: KES 3,300
  ```

- **Instructor Summary:**
  ```
  Instructor: Mary Wanjiru
  Match Score: 95%
  Hourly Rate: KES 1,000
  Suggested: 2 lessons/week
  ```

- **Payment Details:**
  ```
  Instrument Rental: KES 3,300
  First Lesson (1 hour): KES 1,000
  ─────────────────────────────
  Total: KES 4,300
  ```

- **Payment Method Selection:**
  - ○ M-Pesa
  - ○ Credit/Debit Card
  - ○ Bank Transfer

- **Terms:**
  - ☑ I agree to rental terms
  - ☑ I understand cancellation policy

**User actions:**
- Selects M-Pesa
- Clicks "Confirm Booking"
- M-Pesa prompt appears on phone
- Enters PIN and confirms
- **Payment successful!**

---

#### 9. **Success Page & Next Steps**
**URL:** `/rentals/success/:id`

**User sees:**
- ✅ Success message: "Booking Confirmed!"
- **What happens next:**
  
  **Instrument Rental:**
  1. ✉️ Owner (John) has been notified
  2. ⏳ Waiting for owner to approve request
  3. 📅 Once approved, coordinate pickup details
  4. 📍 Pickup location: John's address in Nairobi
  
  **Instructor Match:**
  1. ✉️ Mary has been notified of your interest
  2. 📅 Check your dashboard to schedule first lesson
  3. 💬 Message instructor to introduce yourself

- **Action Buttons:**
  - [Go to My Dashboard]
  - [Message John (Owner)]
  - [Message Mary (Instructor)]
  - [Download Receipt]

**Notifications sent:**
- Email to Sarah: Booking confirmation
- Email to John: New rental request pending approval
- Email to Mary: New student match
- SMS confirmations to all parties

**User actions:**
- Clicks "Go to My Dashboard"

---

#### 10. **Learner Dashboard**
**URL:** `/dashboard`

**User sees 4 tabs:**

**Tab 1: My Rentals**
```
┌─────────────────────────────────────────────┐
│ Yamaha Acoustic Guitar                      │
│ Status: ⏳ Pending Approval                 │
│ Dates: Jan 15 - 22, 2025                    │
│ Owner: John Doe                             │
│ Total: KES 3,300                            │
│                                              │
│ [Cancel Request] [Message Owner]            │
└─────────────────────────────────────────────┘
```

**Tab 2: My Instructors**
```
┌─────────────────────────────────────────────┐
│ 🏆 Mary Wanjiru (Guitar)                    │
│ Match Score: 95%                             │
│ Status: Match pending                        │
│                                              │
│ [Schedule First Lesson] [View Profile]      │
└─────────────────────────────────────────────┘
```

**Tab 3: Upcoming Lessons**
```
┌─────────────────────────────────────────────┐
│ No lessons scheduled yet                     │
│                                              │
│ [Schedule Your First Lesson]                │
└─────────────────────────────────────────────┘
```

**Tab 4: Profile**
- Edit profile information
- Change password
- Notification preferences

---

#### 11. **Owner Approves Rental**
**Owner (John) receives notification:**
- Email: "New rental request for your Yamaha Guitar"
- Logs into his Owner Dashboard
- Sees rental request from Sarah
- Views Sarah's profile (verified user, no negative reviews)
- Clicks "Approve Request"

**Sarah receives notification:**
- Email: "Your rental has been approved!"
- Push notification on phone
- Dashboard updates:
  ```
  Status: ✅ Confirmed
  Next Step: Coordinate pickup with John
  Pickup: Jan 15, 2025
  ```

---

#### 12. **Pickup Day**
**January 15, 2025 - Pickup Day**

**Sarah:**
- Meets John at agreed location
- Inspects guitar (excellent condition)
- Signs pickup agreement

**John (Owner):**
- Logs into Owner Dashboard
- Finds Sarah's rental
- Clicks "Mark as Picked Up"
- Confirms instrument handed over

**System updates:**
```
Status: 🎸 Active
Started: Jan 15, 2025
Return due: Jan 22, 2025
```

---

#### 13. **First Lesson with Instructor**
**January 16, 2025**

**Sarah:**
- Opens Dashboard → My Instructors
- Clicks "Schedule First Lesson" with Mary
- Calendar shows Mary's availability
- Selects: Jan 17, 3:00 PM - 4:00 PM
- Adds note: "Looking forward to learning fingerpicking!"
- Confirms booking

**Mary receives:**
- Email notification
- Approves lesson time
- Prepares beginner fingerpicking curriculum

**Lesson happens:**
- Sarah learns basic fingerpicking patterns
- Mary is patient and encouraging
- Great experience!

---

#### 14. **Return Instrument**
**January 22, 2025 - Return Day**

**Sarah:**
- Uses guitar all week for practice
- Returns guitar to John
- Guitar in same condition

**In Learner Dashboard:**
- Clicks "Mark as Returned" button
- Confirms return
- System updates: 
  ```
  Status: ⏳ Pending Owner Confirmation
  Renter marked returned: Jan 22, 2025
  ```

**John (Owner):**
- Receives notification: "Sarah has returned the guitar"
- Inspects guitar (all good)
- Logs into Owner Dashboard
- Clicks "Confirm Return"
- System updates:
  ```
  Status: ✅ Completed
  Rental successfully completed
  ```

---

#### 15. **Leave Reviews**

**Sarah reviews:**

**Instrument Owner (John):**
```
Rating: ⭐⭐⭐⭐⭐ (5 stars)
Title: "Excellent guitar, smooth rental!"
Comment: "John was professional and the guitar was in 
perfect condition. Great communication throughout. 
Highly recommend!"
```

**Instructor (Mary):**
```
Rating: ⭐⭐⭐⭐⭐ (5 stars)
Title: "Amazing teacher! Perfect match!"
Comment: "Mary is incredibly patient and made learning 
fingerpicking so easy. The ML matching was spot on - 
she's exactly the teacher I needed. Already booked 
more lessons!"
```

**John reviews Sarah:**
```
Rating: ⭐⭐⭐⭐⭐ (5 stars)
Comment: "Perfect renter. Took great care of the 
instrument and returned it on time."
```

**Mary reviews Sarah:**
```
Rating: ⭐⭐⭐⭐⭐ (5 stars)
Comment: "Motivated student, practices regularly. 
Pleasure to teach!"
```

---

#### 16. **Continue Learning Journey**

**Sarah's next actions:**
- Books 4 more lessons with Mary (weekly)
- Rents guitar for another month
- Considers buying own guitar eventually
- Recommends Tarumbeta to friends
- **Becomes loyal platform user!**

---

**🎯 JOURNEY COMPLETE - All goals achieved:**
✅ Found and rented perfect guitar
✅ Matched with ideal instructor (95% ML match)
✅ Started learning journey
✅ Smooth rental lifecycle
✅ Great experience for all parties

---

## 📱 JOURNEY 2: INSTRUMENT OWNER - LIST & MANAGE RENTALS

### Persona: John
**Background:** Owns 3 guitars, wants to earn passive income when not using them

---

### Step-by-Step Journey:

#### 1. **Sign Up as Owner**
- Creates account
- Selects role: "Owner"
- Completes profile:
  - Full name
  - Location: Nairobi
  - Phone number
  - ID verification (uploads ID photo)

---

#### 2. **List First Instrument**
**URL:** `/list-instrument`

**Form fields:**
1. **Instrument Details:**
   - Name: [Yamaha Acoustic Guitar]
   - Type: [Guitar ▼]
   - Category: [Acoustic ▼]
   - Brand: [Yamaha]
   - Model: [FG800]
   
2. **Condition:**
   - ● Excellent ○ Good ○ Fair
   - Description: [Barely used, like new condition. Includes hard case, strap, and picks]

3. **Pricing:**
   - Daily rate: [KES 500]
   - Weekly rate: [KES 3,000] (auto-calculated 15% discount)
   - Monthly rate: [KES 10,000] (auto-calculated 33% discount)

4. **Availability:**
   - Available from: [Immediately]
   - Blackout dates: (calendar to block unavailable dates)

5. **Location:**
   - Address: [Westlands, Nairobi]
   - Pickup options:
     - ☑ Pickup at my location
     - ☑ Can deliver (within 5km, +KES 200 fee)

6. **Photos:**
   - Upload up to 6 images
   - Drag & drop or click to upload
   - [Front view, Side view, Case, Accessories]

7. **Additional Details:**
   - Included items: [Hard case, strap, 3 picks, capo]
   - Rental terms: [No smoking around instrument, return in same condition]

**User actions:**
- Fills all fields
- Uploads 4 photos
- Clicks "Publish Listing"
- **Listing goes live immediately!**

---

#### 3. **Owner Dashboard**
**URL:** `/owner-dashboard`

**5 Tabs:**

**Tab 1: Pending Requests**
```
┌─────────────────────────────────────────────┐
│ NEW REQUEST                                  │
│                                              │
│ Renter: Sarah Mwangi ⭐ 5.0 (New User)      │
│ Instrument: Yamaha Acoustic Guitar           │
│ Dates: Jan 15 - 22, 2025 (7 days)           │
│ Total: KES 3,300                             │
│                                              │
│ Renter's message:                            │
│ "Hi! I'm new to guitar and excited to       │
│  start learning. Will take great care!"      │
│                                              │
│ [View Profile] [Approve] [Decline]          │
└─────────────────────────────────────────────┘
```

**Tab 2: Confirmed Rentals**
```
┌─────────────────────────────────────────────┐
│ UPCOMING PICKUP                              │
│                                              │
│ Renter: David Kamau ⭐ 4.8                  │
│ Instrument: Electric Guitar                  │
│ Pickup: Tomorrow, 2:00 PM                    │
│                                              │
│ [Mark as Picked Up] [Message Renter]        │
└─────────────────────────────────────────────┘
```

**Tab 3: Active Rentals**
```
┌─────────────────────────────────────────────┐
│ CURRENTLY RENTED                             │
│                                              │
│ Renter: Sarah Mwangi                         │
│ Instrument: Yamaha Acoustic Guitar           │
│ Return due: Jan 22, 2025 (2 days)           │
│                                              │
│ [Remind Renter] [Message]                   │
└─────────────────────────────────────────────┘
```

**Tab 4: Pending Returns**
```
┌─────────────────────────────────────────────┐
│ RENTER MARKED AS RETURNED                    │
│                                              │
│ Renter: Sarah Mwangi                         │
│ Instrument: Yamaha Acoustic Guitar           │
│ Returned: Today, 3:00 PM                     │
│                                              │
│ Please inspect instrument and confirm:       │
│ [Confirm Return] [Report Issue]             │
└─────────────────────────────────────────────┘
```

**Tab 5: My Listings**
```
┌─────────────────────────────────────────────┐
│ Yamaha Acoustic Guitar                       │
│ Status: Available                            │
│ Listed: 2 weeks ago                          │
│ Total rentals: 5                             │
│ Rating: ⭐ 4.9 (5 reviews)                   │
│ Earnings: KES 15,000                         │
│                                              │
│ [Edit Listing] [Mark Unavailable] [Delete]  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Fender Electric Guitar                       │
│ Status: Available                            │
│ ...                                          │
└─────────────────────────────────────────────┘
```

---

#### 4. **Manage Rental Request**

**John reviews Sarah's request:**
- Clicks "View Profile"
- Sees Sarah is new user (verified email)
- No negative reviews
- Message shows genuine interest
- Dates work for John

**Decision:** Approve

**Actions:**
- Clicks "Approve"
- Modal appears:
  ```
  Confirm Approval
  
  You're about to approve this rental:
  - Instrument: Yamaha Acoustic Guitar
  - Renter: Sarah Mwangi
  - Dates: Jan 15 - 22, 2025
  - Earnings: KES 3,300
  
  Pickup instructions:
  [My address: Westlands, Nairobi
   Available: Weekdays 6-8pm, Weekends anytime
   Contact: 0712345678]
  
  [Cancel] [Confirm Approval]
  ```

- Clicks "Confirm Approval"
- Sarah receives notification
- Rental moves to "Confirmed" tab

---

#### 5. **Pickup Day**
**Jan 15, 2025**

- Sarah arrives at scheduled time
- John checks her ID
- Shows her the guitar
- Sarah inspects it (all good)
- Both sign pickup agreement

**John's action:**
- Opens Owner Dashboard
- Goes to "Confirmed Rentals"
- Finds Sarah's rental
- Clicks "Mark as Picked Up"
- Confirms: 
  ```
  ✓ Renter ID verified
  ✓ Instrument handed over in good condition
  ✓ Pickup agreement signed
  
  [Confirm Pickup]
  ```

**System updates:**
- Rental moves to "Active Rentals" tab
- Payment released to John (minus platform fee)
- Sarah can now start using instrument

---

#### 6. **During Rental Period**
- John occasionally checks dashboard
- Sees guitar is still on rent
- No issues reported

---

#### 7. **Return Day**
**Jan 22, 2025**

**Notification received:**
- "Sarah has marked the guitar as returned"

**John's actions:**
- Meets Sarah
- Inspects guitar:
  - ✅ No damage
  - ✅ All accessories present
  - ✅ Clean condition
- Satisfied with return

**In Owner Dashboard:**
- Goes to "Pending Returns" tab
- Clicks "Confirm Return"
- Modal:
  ```
  Confirm Instrument Return
  
  Instrument condition:
  ● Excellent (same as rented)
  ○ Good (minor wear)
  ○ Fair (needs maintenance)
  ○ Damaged (file claim)
  
  Comments: [Guitar returned in perfect condition]
  
  [Confirm Return]
  ```

- Clicks "Confirm Return"
- Rental marked as completed

---

#### 8. **Post-Rental**

**Leave Review:**
```
Rating: ⭐⭐⭐⭐⭐
Comment: "Perfect renter. Took great care of the 
instrument and returned it on time."
```

**View Earnings:**
```
Rental Summary:
Rental fee: KES 3,300
Platform fee (10%): -KES 330
Net earnings: KES 2,970
Payment: Transferred to M-Pesa
```

**Re-list Instrument:**
- Guitar automatically becomes available again
- Ready for next rental

---

**🎯 OWNER JOURNEY COMPLETE:**
✅ Listed instrument easily
✅ Managed rental request
✅ Earned KES 2,970 in one week
✅ Positive review received
✅ Instrument ready for next rental

---

## 📱 JOURNEY 3: INSTRUCTOR - GET MATCHED & TEACH

### Persona: Mary Wanjiru
**Background:** Professional guitar teacher, 8 years experience, wants more students

---

### Step-by-Step Journey:

#### 1. **Register as Instructor**
**URL:** `/become-instructor`

**Application Form:**

1. **Personal Information:**
   - Full name: [Mary Wanjiru]
   - Email: [mary@email.com]
   - Phone: [0723456789]
   - Location: [Westlands, Nairobi]

2. **Teaching Details:**
   - Primary instrument: [Guitar ▼]
   - Also teaches: [☑ Ukulele ☐ Bass]
   - Teaching since: [2017]
   - Years of experience: [8 years]

3. **Expertise:**
   - Skill levels you teach:
     - ☑ Beginners
     - ☑ Intermediate
     - ☐ Advanced
     - ☐ Professional
   
   - Specializations:
     - ☑ Fingerpicking
     - ☑ Chords & strumming
     - ☑ Music theory basics
     - ☐ Jazz
     - ☐ Classical

4. **Teaching Style:**
   - Approach: [● Flexible ○ Structured ○ Intensive]
   - Teaching philosophy: 
     [I believe in patient, encouraging teaching that 
      adapts to each student's pace and goals. Making 
      music should be fun!]

5. **Availability:**
   - Days available:
     - ☑ Monday ☑ Tuesday ☑ Wednesday
     - ☑ Thursday ☑ Friday ☑ Saturday ☐ Sunday
   - Time slots:
     - ☐ Morning (6am-12pm)
     - ☑ Afternoon (12pm-6pm)
     - ☑ Evening (6pm-10pm)

6. **Lesson Options:**
   - ☑ In-person lessons
   - ☑ Online lessons (Zoom/Google Meet)
   - ☑ Student's location (within 10km)

7. **Pricing:**
   - Hourly rate: [KES 1,000]
   - Package deals:
     - 4 lessons: [KES 3,600] (10% discount)
     - 8 lessons: [KES 6,800] (15% discount)

8. **Qualifications:**
   - Certifications:
     - [Upload] Grade 8 Guitar Certificate (ABRSM)
     - [Upload] Teaching Diploma
   
   - Bio (max 500 words):
     [Professional guitar instructor with 8 years of 
      experience teaching students of all ages. I 
      specialize in helping beginners fall in love 
      with music through patient, personalized 
      instruction. Former lead guitarist in local 
      band, now focused on teaching full-time.]

9. **Portfolio:**
   - Profile photo: [Upload]
   - Teaching video: [Upload sample lesson]
   - Student testimonials: [Optional]

**Verification:**
- ID verification
- Background check consent
- References (2 required)

**User actions:**
- Fills complete application
- Uploads certificates
- Records 2-minute intro video
- Submits application
- **Review pending (24-48 hours)**

---

#### 2. **Profile Approved**
**Email notification:**
```
Subject: Welcome to Tarumbeta Instructors! 🎉

Hi Mary,

Congratulations! Your instructor profile has been 
approved. You're now visible to learners looking for 
guitar instruction.

Your profile: https://tarumbeta.com/instructors/mary-w

Next steps:
1. Complete your availability calendar
2. Set up payment information
3. Start getting matched with students!

We're excited to have you on board.
```

---

#### 3. **Instructor Dashboard**
**URL:** `/instructor-dashboard`

**4 Main Tabs:**

**Tab 1: New Matches**
```
┌─────────────────────────────────────────────┐
│ 🎯 NEW STUDENT MATCH (95% compatibility)    │
│                                              │
│ Student: Sarah Mwangi                        │
│ Instrument: Guitar (Acoustic)                │
│ Level: Beginner                              │
│ Budget: KES 1,000/hour ✓ Matches yours      │
│                                              │
│ Learning Goals:                              │
│ • Learn chords                               │
│ • Fingerpicking techniques                   │
│                                              │
│ Schedule Preference:                         │
│ • Weekday afternoons ✓ You're available     │
│ • Weekends                                   │
│                                              │
│ Student rented: Yamaha Acoustic Guitar       │
│ Rental period: Jan 15-22, 2025              │
│                                              │
│ WHY THIS MATCH:                              │
│ • Your fingerpicking expertise aligns        │
│ • Schedule perfectly compatible              │
│ • Within student's budget                    │
│ • Your beginner specialization matches       │
│                                              │
│ [Accept Match] [View Full Profile] [Decline]│
└─────────────────────────────────────────────┘
```

**Tab 2: My Students**
```
┌─────────────────────────────────────────────┐
│ David Kamau                                  │
│ Instrument: Guitar (Electric)                │
│ Lessons completed: 12                        │
│ Next lesson: Tomorrow, 4:00 PM               │
│ Progress: Intermediate - learning solos      │
│                                              │
│ [View Progress] [Message] [Schedule]        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Grace Akinyi                                 │
│ Instrument: Ukulele                          │
│ Lessons completed: 6                         │
│ Next lesson: Friday, 5:00 PM                 │
│ Progress: Beginner - working on chord changes│
│                                              │
│ [View Progress] [Message] [Schedule]        │
└─────────────────────────────────────────────┘
```

**Tab 3: Schedule**
```
Calendar view showing:
- Booked lessons (blue)
- Available slots (green)
- Blocked time (gray)

This Week:
Mon: 3:00-4:00 PM - David (Guitar)
Tue: Available
Wed: 5:00-6:00 PM - Grace (Ukulele)
Thu: Available
Fri: 4:00-5:00 PM - David (Guitar)
Sat: Available
Sun: Blocked
```

**Tab 4: Earnings**
```
This Month:
Lessons completed: 24
Total hours taught: 24
Gross earnings: KES 24,000
Platform fee (15%): -KES 3,600
Net earnings: KES 20,400

Payment schedule: Weekly to M-Pesa
Next payout: Friday (KES 5,100)
```

---

#### 4. **Accept New Student Match**

**Mary reviews Sarah's profile:**
- Complete beginner
- Wants to learn fingerpicking (Mary's specialty!)
- Budget matches perfectly
- Schedule works great
- Just rented a guitar (serious commitment)

**Decision:** Accept

**Actions:**
- Clicks "Accept Match"
- Modal appears:
  ```
  Welcome New Student!
  
  You're about to accept Sarah as your student.
  
  Suggested first lesson:
  🎯 Introduction & Basic Fingerpicking
  
  Send introduction message:
  [Hi Sarah! I'm excited to be your guitar teacher! 
   I saw you're interested in fingerpicking - that's 
   my specialty. Let's schedule your first lesson to 
   get started. Looking forward to meeting you!]
  
  [Send & Accept Match]
  ```

- Clicks "Send & Accept Match"
- Sarah receives notification
- Match moves to "My Students" tab

---

#### 5. **First Lesson Scheduled**

**Sarah schedules lesson:**
- Picks Jan 17, 3:00 PM - 4:00 PM
- Lesson type: In-person
- Location: Mary's studio in Westlands

**Mary receives booking:**
- Notification: "Sarah scheduled first lesson"
- Appears in calendar
- Clicks "Accept"
- Lesson confirmed

**Preparation:**
- Mary prepares beginner fingerpicking curriculum
- Creates practice exercises for Sarah
- Sets up studio space

---

#### 6. **Teaching the Lesson**
**Jan 17, 3:00 PM**

**Lesson plan:**
1. Get to know Sarah (5 min)
2. Assess current skill level (5 min)
3. Basic finger positioning (15 min)
4. Simple fingerpicking pattern (20 min)
5. Practice exercise assignment (10 min)
6. Q&A and next steps (5 min)

**After lesson:**
- Mary updates student notes in dashboard
- Assigns practice homework
- Schedules next 3 lessons with Sarah

---

#### 7. **Track Student Progress**

**In "My Students" tab:**
```
Sarah Mwangi
Lessons completed: 1
Next lesson: Jan 24, 3:00 PM

Progress Log:
─────────────────────────────
Lesson 1 (Jan 17):
✓ Learned proper finger positioning
✓ Basic thumb-index pattern
✓ Practiced "Dust in the Wind" intro
⚠ Needs work on finger independence

Homework assigned:
• Practice thumb-index 10 min/day
• Finger stretching exercises

Notes: Quick learner, very motivated!
─────────────────────────────

[Add Progress Note] [Schedule Next Lesson]
```

---

#### 8. **Ongoing Teaching**

**Weekly routine:**
- Teach 4-6 lessons per day
- Update student progress notes
- Respond to student messages
- Schedule upcoming lessons
- Receive weekly payouts

**Student retention:**
- Sarah continues for 3 months
- David continues for 6 months
- Grace continues for 2 months
- High satisfaction ratings

---

#### 9. **Receive Reviews**

**Sarah's review after 4 lessons:**
```
⭐⭐⭐⭐⭐ (5 stars)

"Amazing teacher! Perfect match!"

Mary is incredibly patient and made learning 
fingerpicking so easy. The ML matching was spot on - 
she's exactly the teacher I needed. Her teaching 
style is so encouraging and she tailors lessons to 
my goals. Best decision I made!

Would recommend to: Beginners, Fingerpicking, Guitar
```

**Impact:**
- Mary's rating increases to 4.9
- Profile becomes "Top Rated Instructor"
- Gets featured on homepage
- **More match requests!**

---

**🎯 INSTRUCTOR JOURNEY COMPLETE:**
✅ Registered as professional instructor
✅ Received high-quality student matches via ML
✅ Building consistent student base
✅ Earning KES 20,000+ per month
✅ Excellent reviews and ratings
✅ Growing reputation on platform

---

## 🔄 COMPLETE RENTAL LIFECYCLE (All Statuses)

### Status Flow Diagram:
```
                    ┌─────────────┐
                    │   PENDING   │ ← User creates rental request
                    └──────┬──────┘
                           │
                 ┌─────────┴─────────┐
                 │                   │
            Owner approves      Owner rejects
                 │                   │
                 ▼                   ▼
         ┌──────────────┐    ┌──────────────┐
         │  CONFIRMED   │    │   REJECTED   │ ← End state
         └──────┬───────┘    └──────────────┘
                │                   
       Owner marks picked up
                │              User cancels
                ▼                   │
         ┌──────────────┐    ┌──────────────┐
         │    ACTIVE    │───→│  CANCELLED   │ ← End state
         └──────┬───────┘    └──────────────┘
                │
    Renter marks returned
                │
                ▼
      ┌──────────────────┐
      │ PENDING_RETURN   │
      └────────┬─────────┘
               │
    Owner confirms return
               │
               ▼
      ┌──────────────────┐
      │    COMPLETED     │ ← End state
      └──────────────────┘
```

### Detailed Status Descriptions:

#### 1. **PENDING**
- **Created by:** Renter
- **Meaning:** Rental request awaiting owner approval
- **Duration:** Typically 24-48 hours
- **Actions available:**
  - **Renter:** Cancel request, message owner
  - **Owner:** Approve, reject, message renter
- **Next status:** CONFIRMED, REJECTED, or CANCELLED

---

#### 2. **CONFIRMED**
- **Set by:** Owner (approves request)
- **Meaning:** Rental approved, awaiting pickup
- **Duration:** Until scheduled pickup date
- **Actions available:**
  - **Renter:** Cancel (with cancellation fee), message owner, view pickup details
  - **Owner:** Mark as picked up, message renter, set pickup instructions
- **Next status:** ACTIVE or CANCELLED
- **Notifications:**
  - Renter: "Your rental has been approved!"
  - Owner: "Prepare for pickup on [date]"

---

#### 3. **ACTIVE**
- **Set by:** Owner (marks as picked up)
- **Meaning:** Instrument currently in renter's possession
- **Duration:** From pickup until renter marks returned
- **Actions available:**
  - **Renter:** Mark as returned, message owner, extend rental
  - **Owner:** Message renter, send return reminder
- **Next status:** PENDING_RETURN
- **System actions:**
  - Instrument marked as unavailable
  - Payment released to owner
  - Return reminder sent 1 day before due date

---

#### 4. **PENDING_RETURN**
- **Set by:** Renter (marks as returned)
- **Meaning:** Renter claims instrument returned, awaiting owner confirmation
- **Duration:** Until owner inspects and confirms
- **Actions available:**
  - **Renter:** Message owner, view return timestamp
  - **Owner:** Confirm return, report issue, message renter
- **Next status:** COMPLETED
- **Purpose:** Dual confirmation system to prevent disputes

---

#### 5. **COMPLETED**
- **Set by:** Owner (confirms return)
- **Meaning:** Rental successfully completed
- **Duration:** Permanent end state
- **Actions available:**
  - **Both:** Leave review, view rental history
  - **Renter:** Rebook same instrument
  - **Owner:** View earnings, review renter
- **System actions:**
  - Instrument marked as available again
  - Prompts for reviews sent to both parties
  - Rental archived in history

---

#### 6. **REJECTED**
- **Set by:** Owner (declines rental request)
- **Meaning:** Owner declined the rental
- **Duration:** Permanent end state
- **Actions available:**
  - **Renter:** Browse other instruments, view rejection reason
  - **Owner:** None (archived)
- **Common reasons:**
  - Dates not available
  - Renter profile concerns
  - Instrument no longer available
- **System actions:**
  - Full refund to renter (if paid)
  - Renter notified with reason

---

#### 7. **CANCELLED**
- **Set by:** Renter (cancels before/during rental)
- **Meaning:** Renter cancelled the rental
- **Duration:** Permanent end state
- **Cancellation policy:**
  - **Before confirmation:** Full refund
  - **After confirmation, before pickup:** 50% refund
  - **After pickup (active):** No refund (use pending_return flow)
- **Actions available:**
  - **Renter:** View cancellation details, browse other instruments
  - **Owner:** View cancellation reason
- **System actions:**
  - Instrument becomes available again
  - Refund processed (if applicable)
  - Both parties notified

---

## 🎯 ML INSTRUCTOR MATCHING (Core Feature)

### How the ML Model Works:

#### Input Features:
The ML model receives the following data about the learner:

**1. Learner Profile:**
```python
{
  'instrument_type': 'Guitar',
  'experience_level': 'beginner',  # beginner, intermediate, advanced
  'learning_goals': ['chords', 'fingerpicking', 'theory'],
  'budget': 1200,  # KES per hour
  'location': 'Nairobi',
  'location_coords': {'lat': -1.286389, 'lng': 36.817223},
  'preferred_schedule': {
    'days': ['weekdays', 'weekends'],
    'times': ['afternoon', 'evening']
  },
  'learning_style': 'flexible',  # flexible, structured, intensive
  'lesson_format': 'in-person',  # in-person, online, hybrid
  'age_group': 'adult',  # child, teen, adult
  'has_instrument': True
}
```

**2. Available Instructors:**
```python
[
  {
    'id': 'uuid-1',
    'name': 'Mary Wanjiru',
    'instrument': 'Guitar',
    'specializations': ['fingerpicking', 'beginner-friendly'],
    'hourly_rate': 1000,
    'location': 'Westlands, Nairobi',
    'location_coords': {'lat': -1.267, 'lng': 36.814},
    'available_days': ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    'available_times': ['afternoon', 'evening'],
    'teaching_style': 'flexible',
    'years_experience': 8,
    'rating': 4.9,
    'total_students': 47,
    'completion_rate': 0.95,
    'lesson_formats': ['in-person', 'online']
  },
  # ... more instructors
]
```

#### Feature Engineering:

**The model calculates:**

1. **Instrument Match** (Weight: 30%)
   - Exact match: 1.0
   - Related instrument: 0.7
   - Different: 0.0

2. **Experience Level Compatibility** (Weight: 20%)
   - Instructor teaches learner's level: 1.0
   - Instructor can adapt: 0.6
   - Mismatch: 0.2

3. **Budget Compatibility** (Weight: 15%)
   ```python
   if instructor_rate <= learner_budget:
       score = 1.0
   elif instructor_rate <= learner_budget * 1.2:  # 20% over
       score = 0.7
   else:
       score = 0.3
   ```

4. **Location Proximity** (Weight: 12%)
   ```python
   distance_km = calculate_distance(learner_coords, instructor_coords)
   if distance_km < 5:
       score = 1.0
   elif distance_km < 10:
       score = 0.8
   elif distance_km < 20:
       score = 0.5
   else:
       score = 0.2
   ```

5. **Schedule Compatibility** (Weight: 10%)
   - Overlap calculation between learner preferences and instructor availability

6. **Learning Goals Alignment** (Weight: 8%)
   - Jaccard similarity between learner goals and instructor specializations

7. **Teaching Style Match** (Weight: 5%)
   - Direct match: 1.0
   - Compatible: 0.7
   - Different: 0.4

8. **Instructor Quality Metrics** (Bonus: up to +10%)
   - Rating (4.5+): +5%
   - High completion rate (>80%): +3%
   - Many successful students (>20): +2%

#### Model Output:

```python
[
  {
    'instructor_id': 'uuid-1',
    'instructor_name': 'Mary Wanjiru',
    'match_score': 0.95,  # 95% match
    'match_breakdown': {
      'instrument': 1.0,
      'experience': 1.0,
      'budget': 1.0,
      'location': 0.9,
      'schedule': 0.95,
      'goals': 0.88,
      'style': 1.0,
      'quality_bonus': 0.10
    },
    'match_reasons': [
      'Specializes in beginner fingerpicking',
      'Flexible teaching style matches your preference',
      'Perfect schedule alignment',
      'Within budget (KES 1,000/hour)',
      'Only 3km away',
      'Highly rated (4.9⭐) with 47 successful students'
    ],
    'potential_concerns': [],  # None for this match
    'recommendation_strength': 'Excellent Match'
  },
  {
    'instructor_id': 'uuid-2',
    'instructor_name': 'David Kimani',
    'match_score': 0.89,
    'match_breakdown': {...},
    'match_reasons': [...],
    'potential_concerns': [
      'Slightly higher rate (KES 1,500/hour)',
      'Prefers structured curriculum'
    ],
    'recommendation_strength': 'Great Match'
  },
  # ... top 5 matches returned
]
```

#### Match Score Interpretation:

- **90-100%** - Excellent Match (Highly recommended)
- **80-89%** - Great Match (Recommended)
- **70-79%** - Good Match (Consider)
- **60-69%** - Fair Match (Possible)
- **Below 60%** - Not recommended (not shown)

---

### Why This Matching System is Powerful:

1. **Personalized** - Considers 8+ factors unique to each learner
2. **Transparent** - Shows why each instructor was matched
3. **Data-driven** - Uses historical success rates
4. **Adaptive** - Learns from completed lessons and reviews
5. **Fair** - Gives all qualified instructors opportunity based on merit

---

## 📊 PLATFORM FEATURES (Complete List)

### User Management:
1. ✅ Sign up (email/password)
2. ✅ Sign in / Sign out
3. ✅ Multi-role support (Learner/Owner/Instructor)
4. ✅ Profile management
5. ✅ Email verification
6. ✅ Password reset
7. ✅ Profile photos
8. ✅ ID verification (for owners/instructors)

### Instrument Listings:
9. ✅ Browse all instruments
10. ✅ Filter by type, location, price
11. ✅ Sort by relevance, price, rating
12. ✅ Search functionality
13. ✅ View instrument details
14. ✅ Image galleries (up to 6 photos)
15. ✅ Owner profiles on listings
16. ✅ Availability calendars
17. ✅ Create new listing
18. ✅ Edit existing listing
19. ✅ Delete listing
20. ✅ Mark as available/unavailable
21. ✅ Pricing tiers (daily/weekly/monthly)

### Rental System:
22. ✅ Create rental request
23. ✅ Date range selection
24. ✅ Price calculation
25. ✅ Rental with/without instructor option
26. ✅ Owner approval workflow
27. ✅ Owner rejection with reason
28. ✅ Pickup confirmation
29. ✅ Active rental tracking
30. ✅ Return marking (dual confirmation)
31. ✅ Rental completion
32. ✅ Rental cancellation
33. ✅ Cancellation refund logic
34. ✅ Rental extension requests
35. ✅ Rental history

### Dashboards:
36. ✅ Learner Dashboard (4 tabs)
    - My Rentals
    - My Instructors
    - Upcoming Lessons
    - Profile
37. ✅ Owner Dashboard (5 tabs)
    - Pending Requests
    - Confirmed Rentals
    - Active Rentals
    - Pending Returns
    - My Listings
38. ✅ Instructor Dashboard (4 tabs)
    - New Matches
    - My Students
    - Schedule
    - Earnings

### Instructor Matching (ML):
39. ✅ Instructor registration
40. ✅ Instructor profiles
41. ✅ Browse all instructors
42. ✅ Filter instructors
43. ✅ ML matching questionnaire
44. ✅ Match score calculation
45. ✅ Top 5 matches display
46. ✅ Match reasons explanation
47. ✅ Accept/decline matches
48. ✅ Match history
49. ✅ Instructor availability

### Lessons:
50. ✅ Schedule lesson with instructor
51. ✅ Lesson calendar
52. ✅ Lesson reminders
53. ✅ Cancel/reschedule lessons
54. ✅ Lesson notes
55. ✅ Progress tracking
56. ✅ Homework assignment
57. ✅ Lesson history
58. ✅ In-person/online options

### Reviews & Ratings:
59. ✅ Leave review for owner
60. ✅ Leave review for instructor
61. ✅ Leave review for renter
62. ✅ Star ratings (1-5)
63. ✅ Written reviews
64. ✅ View all reviews
65. ✅ Average rating calculation
66. ✅ Review moderation

### Messaging:
67. ✅ Message owner
68. ✅ Message instructor
69. ✅ Message renter
70. ✅ Message history
71. ✅ Unread message indicators
72. ✅ Email notifications for messages

### Notifications:
73. ✅ Email notifications
74. ✅ Push notifications (web)
75. ✅ SMS notifications
76. ✅ Notification preferences
77. ✅ Rental status updates
78. ✅ Lesson reminders
79. ✅ New match alerts
80. ✅ Review requests

### Payment & Earnings:
81. ✅ M-Pesa integration
82. ✅ Card payments
83. ✅ Bank transfers
84. ✅ Payment receipts
85. ✅ Earnings dashboard
86. ✅ Payout schedule
87. ✅ Transaction history
88. ✅ Refund processing

### Search & Discovery:
89. ✅ Homepage search
90. ✅ Category browsing
91. ✅ Featured instruments
92. ✅ Top-rated instructors
93. ✅ Recently added
94. ✅ Popular instruments
95. ✅ Location-based search

### UI/UX:
96. ✅ Responsive design (mobile/tablet/desktop)
97. ✅ Dark mode
98. ✅ Loading states
99. ✅ Error handling
100. ✅ Success messages
101. ✅ Confirmation modals
102. ✅ Image optimization
103. ✅ Accessibility (WCAG)

### Security:
104. ✅ JWT authentication
105. ✅ Password encryption
106. ✅ Role-based access control
107. ✅ Data validation
108. ✅ XSS protection
109. ✅ CSRF protection
110. ✅ Rate limiting
111. ✅ Secure file uploads

---

## 🎭 ALL POSSIBLE USER DECISIONS

### As a **LEARNER**:

#### Before Signing Up:
- ❓ Browse instruments (yes/no)
- ❓ Search for specific instrument (yes/no)
- ❓ Filter by location/price (yes/no)
- ❓ View instructor profiles (yes/no)
- ❓ Create account (yes/no)

#### Creating Account:
- ❓ Sign up as Learner (yes/no)
- ❓ Also register as Owner (yes/no)
- ❓ Complete profile now/later

#### Browsing Instruments:
- ❓ Apply filters (type/location/price)
- ❓ Sort results (price/date/rating)
- ❓ View instrument details (which one)
- ❓ Save to favorites (yes/no)
- ❓ Compare multiple instruments (yes/no)

#### Renting Decision:
- ❓ Rent this instrument (yes/no)
- ❓ Select dates (when/how long)
- ❓ Choose pricing tier (daily/weekly/monthly)
- ❓ Want instructor with rental (YES/NO) ← Critical decision
- ❓ Message owner first (yes/no)
- ❓ Proceed to payment (yes/no)

#### If Wants Instructor:
- ❓ Fill matching questionnaire (yes/no)
- ❓ Skip matching, browse manually (yes/no)
- ❓ Experience level (beginner/intermediate/advanced)
- ❓ Learning goals (select multiple)
- ❓ Budget preference (amount)
- ❓ Schedule preference (days/times)
- ❓ Lesson format (in-person/online/hybrid)
- ❓ Teaching style (flexible/structured/intensive)

#### Viewing Matches:
- ❓ Select top match (yes/no)
- ❓ View other matches (yes/no)
- ❓ View instructor full profile (which one)
- ❓ Accept instructor (which one)
- ❓ Decline all, browse more (yes/no)

#### After Rental Request:
- ❓ Wait for approval (yes/no)
- ❓ Cancel request (yes/no)
- ❓ Message owner (yes/no)
- ❓ Modify dates (yes/no)

#### If Approved:
- ❓ Confirm pickup appointment (yes/no)
- ❓ Arrange delivery instead (yes/no)
- ❓ Cancel confirmed rental (yes/no)

#### During Rental:
- ❓ Extend rental period (yes/no)
- ❓ Report issue with instrument (yes/no)
- ❓ Contact owner (yes/no)
- ❓ Schedule lessons with instructor (yes/no)
- ❓ Request early return (yes/no)

#### With Instructor:
- ❓ Schedule first lesson (when)
- ❓ Lesson format (in-person/online)
- ❓ Reschedule lesson (yes/no)
- ❓ Cancel lesson (yes/no)
- ❓ Book package (4/8 lessons)
- ❓ Continue after first lesson (yes/no)
- ❓ Request different instructor (yes/no)

#### Returning Instrument:
- ❓ Mark as returned (yes/no)
- ❓ Report damage (yes/no)
- ❓ Dispute return (yes/no)

#### After Completion:
- ❓ Leave review for owner (yes/no)
- ❓ Leave review for instructor (yes/no)
- ❓ Rent again (yes/no)
- ❓ Continue lessons (yes/no)
- ❓ Purchase own instrument (yes/no - external)

---

### As an **OWNER**:

#### Getting Started:
- ❓ Sign up as Owner (yes/no)
- ❓ Complete ID verification (yes/no)
- ❓ List first instrument (yes/no)

#### Creating Listing:
- ❓ Upload photos (how many: 1-6)
- ❓ Set pricing (daily/weekly/monthly)
- ❓ Set location (address/general area)
- ❓ Offer delivery (yes/no)
- ❓ Block unavailable dates (yes/no)
- ❓ Publish immediately (yes/no)

#### Managing Requests:
- ❓ Approve rental request (yes/no)
- ❓ Reject rental request (yes/no + reason)
- ❓ Request more info from renter (yes/no)
- ❓ Negotiate dates (yes/no)
- ❓ Offer alternative instrument (yes/no)

#### If Approving:
- ❓ Provide pickup instructions (yes/no)
- ❓ Suggest delivery instead (yes/no)
- ❓ Request deposit (yes/no)
- ❓ Add rental terms (yes/no)

#### Pickup Day:
- ❓ Mark as picked up (yes/no)
- ❓ Document instrument condition (yes/no)
- ❓ Provide accessories (yes/no)
- ❓ Explain care instructions (yes/no)

#### During Rental:
- ❓ Check on renter (yes/no)
- ❓ Approve extension (yes/no)
- ❓ Send return reminder (yes/no)
- ❓ Report issue (yes/no)

#### Return Process:
- ❓ Confirm return (yes/no)
- ❓ Inspect for damage (yes/no)
- ❓ Report damage (yes/no)
- ❓ Dispute return (yes/no)
- ❓ Request compensation (yes/no)

#### After Rental:
- ❓ Leave review for renter (yes/no)
- ❓ Accept future bookings from this renter (yes/no)
- ❓ Adjust pricing (yes/no)
- ❓ Update listing (yes/no)

---

### As an **INSTRUCTOR**:

#### Registration:
- ❓ Apply to be instructor (yes/no)
- ❓ Upload certifications (yes/no)
- ❓ Record intro video (yes/no)
- ❓ Set hourly rate (amount)
- ❓ Offer package deals (yes/no)
- ❓ Set availability (days/times)
- ❓ Offer online lessons (yes/no)
- ❓ Travel to students (yes/no + distance)

#### Receiving Matches:
- ❓ Accept student match (yes/no)
- ❓ Decline match (yes/no + reason)
- ❓ Request more info (yes/no)
- ❓ View student's rental (yes/no)
- ❓ Suggest lesson plan (yes/no)

#### Lesson Scheduling:
- ❓ Accept lesson request (yes/no)
- ❓ Suggest alternative time (yes/no)
- ❓ Propose lesson plan (yes/no)
- ❓ Set lesson location (where)

#### Teaching:
- ❓ Track student progress (yes/no)
- ❓ Assign homework (yes/no)
- ❓ Provide learning materials (yes/no)
- ❓ Record lesson notes (yes/no)
- ❓ Recommend practice schedule (yes/no)

#### Student Management:
- ❓ Continue with student (yes/no)
- ❓ Suggest more lessons (yes/no)
- ❓ Recommend instrument purchase (yes/no)
- ❓ Refer to another instructor (yes/no)
- ❓ Stop teaching student (yes/no)

#### After Lessons:
- ❓ Leave review for student (yes/no)
- ❓ Update availability (yes/no)
- ❓ Adjust rates (yes/no)
- ❓ Update teaching profile (yes/no)

---

## 🎯 CRITICAL USER FLOWS

### Flow 1: Rent WITHOUT Instructor
```
Browse → Select Instrument → Login → Choose Dates 
→ [ UNCHECK "Want Instructor" ] 
→ Pay → Wait Approval → Pickup → Use → Return → Complete
```

**Result:** Simple rental transaction

---

### Flow 2: Rent WITH Instructor (MAIN FLOW)
```
Browse → Select Instrument → Login → Choose Dates 
→ [ CHECK "Want Instructor" ] ← CRITICAL DECISION
→ Fill Matching Form → ML Model Runs 
→ View Matches (ranked by %) 
→ Select Best Match 
→ Pay (Rental + First Lesson) 
→ Wait Approval → Pickup → First Lesson 
→ Continue Lessons → Return Instrument → Complete 
→ Leave Reviews
```

**Result:** Full value proposition - instrument + instructor

---

### Flow 3: Find Instructor AFTER Renting
```
Browse → Rent (without instructor) → Pickup → Start Using
→ [ Decide need instructor ] 
→ Dashboard → "Find Instructor" CTA 
→ Fill Matching Form → Get Matches → Select → Schedule Lessons
```

**Result:** Flexibility to add instructor later

---

### Flow 4: Browse Instructors FIRST, then Rent
```
Homepage → "Find Instructors" 
→ Browse Instructors → Select Instructor 
→ [ Need instrument? ] 
→ Browse Instruments → Rent → Connect with Instructor
```

**Result:** Instructor-first approach

---

## 📈 SUCCESS METRICS

### For Learners:
- ✅ Found suitable instrument to rent
- ✅ Matched with compatible instructor (if wanted)
- ✅ Match score > 80%
- ✅ Completed first lesson
- ✅ Continued with lessons (retention)
- ✅ Smooth rental experience
- ✅ Left positive review

### For Owners:
- ✅ Instrument rented regularly
- ✅ High approval rate (not rejecting often)
- ✅ Instruments returned on time
- ✅ No damage disputes
- ✅ Positive reviews
- ✅ Consistent earnings

### For Instructors:
- ✅ Receiving quality student matches
- ✅ High match acceptance rate
- ✅ Students completing lessons
- ✅ Student retention > 4 lessons
- ✅ Positive reviews
- ✅ Growing student base

### For Platform:
- ✅ High conversion: Browser → Renter
- ✅ High opt-in: "Want Instructor" checkbox
- ✅ Match accuracy: Accepted matches / Total matches
- ✅ Rental completion rate
- ✅ Lesson completion rate
- ✅ User retention (repeat rentals)
- ✅ Revenue per transaction

---

## 🎉 CONCLUSION

**Tarumbeta is a comprehensive platform solving a unique problem:**

> "Making it easy for anyone to start learning music by providing both the instrument AND the perfect teacher"

**The ML matching system is the secret sauce** that differentiates Tarumbeta from:
- Simple instrument rental platforms
- Generic instructor directories
- Music school websites

By combining these services and using intelligent matching, Tarumbeta provides unmatched value to all users.

---

**Next Steps:**
- Read `README.md` for project overview
- Review `API_MAPPING.md` for technical integration
- Check `LOCAL_SETUP.md` for development guide

---

*This documentation covers 100% of platform functionality, user types, journeys, decisions, and features. Use it to provide complete context to any AI model or developer.*
