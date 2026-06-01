# QuizMind AI - Frontend Architecture & System Design

## Project Overview

**QuizMind AI** is an intelligent quiz platform that leverages AI to generate adaptive quizzes and provide personalized learning experiences. The platform includes user authentication (login/signup), quiz creation, management, results tracking, pricing tiers, and user profile management.

**Tech Stack:**
- **Framework:** React (TypeScript/TSX)
- **Styling:** Tailwind CSS
- **UI Components:** Custom shadcn/ui-based component library
- **Icons:** Lucide React
- **Charts & Data Visualization:** Recharts

---

## Frontend Architecture Overview

### 1. **Application Structure**

The application consists of **13 distinct screens** organized by functionality:

```
QuizMind AI Frontend
├── Landing & Authentication
│   ├── Screen1 (Landing/Home Page)
│   ├── Screen9 (Pricing Page)
│   ├── Screen12 (Sign In / Login)
│   └── Screen13 (Sign Up / Registration)
├── Quiz Participation
│   ├── Screen4 (Discover & Join Quizzes)
│   └── Screen8 (Student Quiz Taking Interface)
├── Quiz Creation
│   ├── Screen5 (Create Quiz - Step 1: Quiz Details)
│   ├── Screen6 (Add Questions - Step 2)
│   └── Screen7 (Review & Publish - Step 3)
├── Results & Analytics
│   ├── Screen2 (Dashboard - Recent Quizzes)
│   └── Screen3 (Quiz Results & Analytics)
├── User Profile
│   ├── Screen10 (User Profile Settings)
│   └── Screen11 (User Settings - Extended)
└── Support Screens
    └── CustomComponents (Fallback/Helper Components)
```

---

## System Design & Page Specifications

### **Screen 1: Landing Page (Home)**

**Purpose:** Marketing & onboarding for new users

**Key Components:**
- **Header Navigation**
  - Logo with brain icon (brand identity)
  - Navigation: Home, Quizzes, Results, Pricing
  - Auth buttons: Sign in, Get started
- **Hero Section**
  - Main heading: "Learn smarter with quizzes that think with you"
  - Subheading with AI badge
  - CTA buttons: "Start free quiz", "Watch demo"
  - Stats cards: 50K+ learners, 1.2M quizzes, 98% satisfaction
  - Hero image with floating stats card
- **Features Section**
  - Grid layout (3 columns) showcasing:
    - AI Quiz Generation
    - Adaptive Difficulty
    - Smart Analytics
- **How It Works Section**
  - 3-step process with images
  - Dark background section with numbered steps
- **CTA Section** "Ready to make learning addictive?"
- **Footer** with logo and copyright

**Component Usage:**
```tsx
- Button (variant: primary/outline)
- Card, CardContent, CardHeader, CardTitle
- Lucide Icons: Brain, Sparkles, Wand2, Gauge, etc.
```

---

### **Screen 12: Sign In / Login Page**

**Purpose:** User authentication and login

**Layout:** Split screen (50/50 - Left side: Branding, Right side: Login form)

**Left Panel (Branding):**
- Gradient background (#2b7fff to #1a5fd4)
- Decorative blurred circles for visual appeal
- Logo with Brain icon
- Centered title: "Smarter quizzes, powered by AI"
- Subtitle: "Join 12,000+ educators creating engaging assessments in seconds"
- Feature highlights with checkmarks:
  - AI question generation
  - Live & async quiz modes
  - Real-time analytics
- Call-to-action copy for new users

**Right Panel (Login Form):**
- Card component with shadow and rounded corners
- Header section:
  - Brain icon in blue circle
  - Heading: "Welcome back"
  - Subheading: "Sign in to your account to continue"
- Form fields:
  - Email Address (text input with Mail icon)
  - Password (password input with Lock icon and Eye toggle)
  - "Forgot password?" link (aligned right)
- Primary CTA: "Sign In" button (blue with LogIn icon)
- Divider: "or continue with"
- OAuth buttons:
  - Google (outline variant)
  - GitHub (outline variant)
- Footer: "Don't have an account? Sign up" (link to registration)
- Copyright notice at bottom

**Design Features:**
- Professional, clean design with minimal clutter
- Icon-based input fields for better UX
- Password visibility toggle
- Social auth integration
- Responsive form validation ready

---

### **Screen 13: Sign Up / Registration Page**

**Purpose:** New user account creation and registration

**Layout:** Split screen (50/50 - Left side: Branding, Right side: Registration form)

**Left Panel (Branding):**
- Gradient background (blue/purple tones with OKLch color space)
- Decorative blurred circles positioned strategically
- Logo with Brain icon (white on gradient)
- Centered content:
  - Large Brain icon in decorative box
  - Supporting feature icons (Sparkles, HelpCircle, BarChart3) positioned around
  - Heading: "Smarter quizzes, powered by AI"
  - Subtitle: "Join 12,000+ educators creating engaging assessments in seconds"
- Feature highlights with checkmarks:
  - AI question generation
  - Live & async quiz modes
  - Real-time analytics
- Trust message: "Trusted by 12,000+ educators worldwide"

**Right Panel (Registration Form):**
- Card component with clean white background
- Header section:
  - Brain icon in blue circle
  - Heading: "Create your account"
  - Subheading: "Join thousands of educators using QuizMind AI"
- Form fields (8 inputs):
  1. **Full Name** (grid col 1/2 - text input with User icon)
  2. **Username** (grid col 2/2 - text input with @ icon)
  3. **Email Address** (full width - text input with Mail icon)
  4. **Password** (full width - password input with Lock icon and Eye toggle)
  5. **Confirm Password** (full width - password input with ShieldCheck icon)
  6. **Terms Agreement** (Checkbox with linked text)
     - "I agree to the Terms of Service and Privacy Policy"
     - Links are highlighted in primary blue
- Primary CTA: "Create Account" button (blue with UserPlus icon)
- Divider: "or sign up with"
- OAuth buttons:
  - Google (outline variant)
  - GitHub (outline variant)
- Footer: "Already have an account? Sign in" (link to login)
- Copyright notice at bottom

**Advanced Features:**
- Two-column form layout for efficient space usage
- Icon-based input indicators for clarity
- Password confirmation validation
- Terms of Service acceptance requirement
- Social auth integration (Google, GitHub)
- Clean visual hierarchy with proper spacing
- Accessible form with proper labels and structure

---

### **Screen 2: User Dashboard (Main Hub for Authenticated Users)**

**Purpose:** Central landing page and main hub for all authenticated users after login/signup. Displays overview of user activity, performance, and AI-powered personalized insights.

**Screen appears:**
- After login (Screen12)
- After signup (Screen13)
- When clicking [Dashboard] navbar
- Auto-redirect if trying to access unauthenticated pages

**Layout Structure:**

```
┌─────────────────────────────────────────────────────────────┐
│  STICKY HEADER: Logo | Dashboard | Quizzes | Results | About │
│                                    🔔  [Profile Dropdown]     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  MAIN CONTENT (max-width: 1140px)                           │
│                                                              │
│  ⭐ 16-day learning streak                                  │
│  Welcome back, Alex                                          │
│  Here's an overview of your learning activity...            │
│                                  [Export] [+ Create quiz]   │
│                                                              │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
│  │ 📝 Quizzes  │ 👥 Quizzes  │ 🎯 Avg.     │ 🔥 Day      │  │
│  │ Created     │ Joined      │ Score       │ Streak      │  │
│  │ 42 (+8%)    │ 128 (+24%)  │ 87% (+5%)   │ 16 (+2)     │  │
│  └─────────────┴─────────────┴─────────────┴─────────────┘  │
│                                                              │
│  ┌─────────────────────────────┬──────────────────────────┐  │
│  │  Quiz Activity (6 months)   │ Category Breakdown      │  │
│  │  [Area Chart: Created/Join] │ [Pie Chart]             │  │
│  │                             │ Science 38%             │  │
│  │                             │ History 24%             │  │
│  │                             │ Math 22%                │  │
│  │                             │ Coding 16%              │  │
│  └─────────────────────────────┴──────────────────────────┘  │
│                                                              │
│  ┌─────────────────────────────┬──────────────────────────┐  │
│  │  Recent Quizzes (Table)     │ Goals Progress          │  │
│  │  Quiz|Type|Score|Date       │ • Create 12: 11/12 92%  │  │
│  │  • Cell Biology (92%)       │ • Join 30: 25/30 83%    │  │
│  │  • World War II (85%)       │ • 20-day: 16/20 80%     │  │
│  │  • JavaScript (78%)         │                         │  │
│  │  • Algebra (90%)            │ [Generate with AI]      │  │
│  │           [View all →]      │ Turn topics to quizzes  │  │
│  └─────────────────────────────┴──────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  FOOTER: Logo | © 2025 QuizMind. All rights reserved.       │
└─────────────────────────────────────────────────────────────┘
```

**Key Sections (8 Components):**

#### 1. **Top Welcome Section**
```
Badge: ⭐ 16-day learning streak

Title: "Welcome back, Alex"
Subtitle: "Here's an overview of your learning activity, performance, 
           and progress across all your quizzes."

[Export Button]  [+ Create quiz Button]
```
- Shows user's name (personalized)
- Current learning streak with icon
- Export button for data
- Primary CTA for quiz creation

#### 2. **4-Column Stats Cards** (Grid: grid-cols-4)
Each card has:
- Icon in rounded box (background: zinc-100, color: #2b7fff)
- Large bold number (3xl font)
- Label text (gray)
- Trend badge (TrendingUp icon + percentage)

**Cards:**
1. **Quizzes Created** - Icon: PencilRuler, Value: 42, Trend: +8%
2. **Quizzes Joined** - Icon: Users, Value: 128, Trend: +24%
3. **Average Score** - Icon: Target, Value: 87%, Trend: +5%
4. **Day Streak** - Icon: Flame, Value: 16, Trend: +2

#### 3. **Quiz Activity Chart** (3-column grid, col-span-2)
- Title: "Quiz Activity"
- Subtitle: "Created vs joined over the last 6 months"
- Area Chart (Recharts)
  - Two areas: Created (blue) & Joined (gray)
  - Data: 6 months (Jan-Jun)
  - Gradient fills, smooth curves
  - Legend with color dots
- Height: h-64

#### 4. **Category Breakdown Chart** (Single column, right side)
- Title: "Category Breakdown"
- Subtitle: "By quiz subject area"
- Donut Chart (Pie with innerRadius)
  - Science: 38% (Orange)
  - History: 24% (Blue)
  - Math: 22% (Purple)
  - Coding: 16% (Yellow)
- Legend below with color indicators
- Height: h-40

#### 5. **Recent Quizzes Table** (3-column grid, col-span-2)
```
Table Header:
┌──────────────────┬──────────┬───────┬────────┐
│ Quiz             │ Type     │ Score │ Date   │
├──────────────────┼──────────┼───────┼────────┤
│ 🧬 Cell Biology  │ Created  │ 92%   │ Jun 18 │
│ 🏛️ World War II  │ Joined   │ 85%   │ Jun 16 │
│ 💻 JavaScript    │ Created  │ 78%   │ Jun 14 │
│ ∑ Algebra        │ Joined   │ 90%   │ Jun 12 │
└──────────────────┴──────────┴───────┴────────┘
```
- Quiz name with subject icon
- Type badge (Created/Joined)
- Score in blue (bold)
- Date in gray
- [View all →] button at top-right

#### 6. **Goals Progress Card** (Single column, right side)
```
Goal                    Progress
Create 12 quizzes       11/12 [████████████░] 92%
Join 30 quizzes         25/30 [███████████░░░] 83%
20-day streak           16/20 [████████████░░] 80%
```
- Title: "Goals Progress"
- Subtitle: "Monthly targets"
- 3 goal items
- Each with label, counter (X/Y), and progress bar (h-2)

#### 7. **AI Insights Card** (Single column, right side, highlighted)
```
Background: #2b7fff with 5% opacity
Border: #2b7fff with 20% opacity

Icon: Wand2 (size-10, rounded-lg, #2b7fff bg)

Title: "Generate with AI"

Description: "Turn any topic into a tailored quiz with 
              explanations in seconds."

[Sparkles] Create quiz (Full-width button)
```
- Prominent call-to-action
- Highlighted with blue tint
- Encourages AI quiz generation

#### 8. **Sticky Header Navigation**
```
Left Side:
- Logo + "QuizMind AI"
- Nav: [Dashboard ⭐] [Quizzes] [Results] [About] [Pricing]

Right Side:
- Bell icon with blue dot notification
- User profile card with avatar, name, "Pro member", chevron
```

**Design System Used:**

**Colors:**
- Primary: #2b7fff (Blue)
- Gray text: #71717b
- Background: white
- Card bg: white with zinc-200 border
- Icon bg: zinc-100

**Components:**
- Card (with CardHeader, CardContent, CardFooter)
- Badge (variants: secondary, with icons)
- Button (variants: ghost, outline, primary)
- Progress (h-2 for goals)
- Avatar (8-size)
- Table with TableHeader/Body/Row/Cell
- Charts (Recharts: AreaChart, PieChart)

**Typography:**
- Main heading: font-bold text-4xl
- Section titles: font-bold text-lg
- Labels: text-sm, text-[#71717b]
- Numbers: font-bold text-3xl

**Spacing:**
- Main container: max-w-[1140px], mx-auto, px-6, py-12
- Sections: gap-12 (stacked vertically)
- Grids: gap-6
- Cards: p-6, gap-4

**Navigation from Screen2:**
- [Dashboard] → Screen2 (stays, underlined)
- [Quizzes] → Screen8 (Quiz Manager)
- [Results] → Screen9 (Results & Analytics)
- [About] → Scroll to About section OR Screen5
- [Pricing] → Screen5 (Pricing)
- [Create quiz] → Screen4 (Quiz Details)
- [Recent quiz row] → Screen3 (Quiz Analytics)
- [View all] → Screen8 (All quizzes)
- Bell icon → Notification panel
- Profile dropdown → Screen10 (Profile) or logout

**Data Source:**
All data is mock/sample in the component:
- User: Alex Morgan, Pro member
- Stats: 42, 128, 87%, 16
- Chart data: 6 months of created/joined counts
- Categories: Science (38%), History (24%), Math (22%), Coding (16%)
- Recent quizzes: 4 quiz entries with icons
- Goals: 3 monthly targets with progress
- All fetched from backend in production

---

### **Screen 3: Quiz-Specific Dashboard & Results**

**Purpose:** Display detailed dashboard and results for a specific quiz. This screen appears in two scenarios:
1. **When a quiz ends** - User completes taking the quiz and sees their results
2. **When clicking on a quiz** - From Dashboard (Screen2) recent quizzes section or Quiz Manager (Screen8)

**Screen appears from:**
- Screen2 (Dashboard) → Click on "Recent Quizzes" card
- Screen8 (Quiz Manager) → Click [View] button on any quiz
- After student completes quiz → Auto-redirect to Screen3

**Key Sections:**

#### 1. **Quiz Header** 
- Quiz title and subject
- Quiz completion status (if from results)
- Completion date and time
- Status badge (Active, Completed, Archived)

#### 2. **Core Statistics Cards** (4-column layout)
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Total Students  │ Average Score   │ Completion Rate │ Avg Time Taken  │
│ Joined Live     │                 │                 │                 │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ 145 students    │ 72.5%           │ 89%             │ 18 min 30 sec   │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

#### 3. **Participation Over Time Chart**
- Line/area chart showing:
  - When students joined (timeline)
  - How many students were taking quiz at each time
  - Peak participation times
  - Dropoff points
- Interactive tooltip showing exact time and participant count
- X-axis: Time (12am, 3am, 6am, etc. or relative time)
- Y-axis: Number of students participating

#### 4. **Score Distribution Chart**
- Histogram/bar chart showing:
  - X-axis: Score ranges (0-10%, 10-20%, 20-30%, ... 90-100%)
  - Y-axis: Number of students in each range
  - Color coding: Red (low), Yellow (medium), Green (high)
- Shows overall performance spread
- Interactive bars to see exact numbers

#### 5. **Student Leaderboard**
```
┌────┬─────────────────┬─────────┬──────────┬────────────────────┐
│ 🏆 │ Student Name    │ Score   │ Time     │ Submission Time    │
├────┼─────────────────┼─────────┼──────────┼────────────────────┤
│ 1  │ ⭐ Sarah Ahmed  │ 98/100  │ 12:35    │ May 31, 2:45 PM   │
│ 2  │ 🥈 John Smith   │ 96/100  │ 14:12    │ May 31, 3:20 PM   │
│ 3  │ 🥉 Emma Wilson  │ 94/100  │ 15:45    │ May 31, 3:45 PM   │
│ 4  │ Michael Brown   │ 92/100  │ 16:20    │ May 31, 4:10 PM   │
│ 5  │ Lisa Johnson    │ 90/100  │ 18:50    │ May 31, 5:00 PM   │
│ ... │ ... (more)     │ ...     │ ...      │ ...                │
└────┴─────────────────┴─────────┴──────────┴────────────────────┘
```
Features:
- Top 10 students displayed
- Medals for top 3
- Click name → View individual student response
- Sort by: Score, Time, Name
- Show/Hide personal results

#### 6. **Hardest Question Analysis**
```
Question #7: "Calculate the electron configuration of Iron (Fe)"
├─ Type: Short Answer / Multiple Choice
├─ Difficulty: Hard
├─ Only 28% correct (41/145 students)
├─ Time spent: Average 3 min 45 sec
├─ Common Wrong Answers:
│  • "[Ar] 3d^6 4s^2" - 52 students (36%)
│  • "[Ar] 3d^8" - 23 students (16%)
│  • "[Ar] 3d^7 4s^1" - 18 students (12%)
└─ Recommendation: Review electron configuration concepts
```

#### 7. **AI-Generated Insights & Review**
- **AI Summary Panel** with:
  ```
  🤖 AI INSIGHTS
  
  ✓ Overall Performance: Class performed ABOVE AVERAGE
  
  📊 Key Observations:
  • 72.5% average score indicates strong grasp of content
  • 89% completion rate shows high engagement
  • Performance consistent across difficulty levels
  
  🎯 Top Performers:
  • Sarah Ahmed (98%) - Mastered all topics
  • John Smith (96%) - Strong on MCQs, slight weakness in short answers
  • Emma Wilson (94%) - Consistent across all questions
  
  ⚠️ Areas of Concern:
  • Question #7 (Electron Configuration): 72% struggle
  • Question #12 (Chemical Bonding): 65% correct
  • Questions 8-10 cluster shows concept gap
  
  💡 Recommendations:
  • Re-teach electron configuration concepts
  • Consider shorter, focused quiz on chemical bonding
  • Schedule revision session on intermediate topics
  • Celebrate strong overall performance!
  
  📈 Compared to Previous Quizzes:
  • Performance ↑ 5% higher than Quiz 5
  • Time management ↓ 8% faster than average
  • Completion ↑ 2% improvement from last quiz
  ```

- **AI Review Features:**
  - Comparative analysis (vs. previous quizzes)
  - Pattern recognition (identifying struggling students/topics)
  - Performance trend analysis
  - Smart recommendations for next quiz
  - Content gaps identification

#### 8. **Question-by-Question Breakdown**
For Each Question:
- Question number and type
- Difficulty level
- Correct answer with explanation
- % of students who got it correct
- Most commonly selected wrong answer
- Average time spent on question
- Student response distribution

#### 9. **Advanced Analytics Tabs**

**Tab 1: Overview** (Default)
- All metrics above
- Leaderboard
- AI Insights

**Tab 2: Question Analysis**
- Detailed breakdown for each question
- Performance by difficulty
- Time vs accuracy correlation
- Common mistakes patterns

**Tab 3: Student Performance**
- Individual student details
- Performance trends
- Attempt history
- Response timeline

**Tab 4: Export & Share**
- Download full report (PDF)
- Export data (CSV, Excel)
- Generate shareable link
- Print report

#### 10. **Action Buttons**
- [Back] - Return to previous screen
- [Download Report] - Export as PDF
- [Export Data] - CSV/Excel format
- [Share Results] - Generate link
- [Edit Quiz] - Modify quiz content
- [View All Results] - Go to Screen9
- [Generate AI Review] - Create detailed AI analysis
- [Retake Quiz] - For students to retake
- [Print] - Print current view

---

**Data Displayed:**
- Real-time participation metrics
- Student responses and accuracy
- Time spent on each question
- Explanations for correct answers
- Performance compared to class average
- AI-generated performance review
- Trends and patterns
- Recommendations for improvement
- Student leaderboard rankings

**Navigation from Screen3:**
- [Back] → Previous screen (Screen2 or Screen8)
- [Dashboard] → Screen2
- [View All Results] → Screen9
- [Edit Quiz] → Screen4 (if viewing own quiz)
- [Export/Share] → Download or generate link
- **Performance Insights** with recommendations
- **Export & Share Options**
  - PDF report download
  - Share to social media
  - Print functionality

---

### **Screen 4: Discover Quizzes (Browse & Join Quizzes)**

**Purpose:** Central hub to discover, browse, and join public quizzes. Users can find live quizzes, asynchronous quizzes, upcoming quizzes, or join private quizzes with a code.

**Screen appears:**
- When clicking [Quizzes] navbar
- Main quiz discovery hub for all authenticated users

**Layout Structure:**

```
┌─────────────────────────────────────────────────────────────┐
│ STICKY HEADER: Logo | Dashboard | Quizzes* | Results | About│
│                                    🔔  [Profile Dropdown]    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ MAIN CONTENT (max-width: 1140px, grid-cols-3)             │
│                                                              │
│ HEADER                                                       │
│ ✨ Browse all quizzes                                       │
│ Discover Quizzes                                             │
│ Explore public quizzes or join private with code...         │
│                                    [Search: "Search quizzes"]│
│                                                              │
│ ┌────────────────────────────┬─────────────────────────────┐ │
│ │ MAIN (col-span-2)          │ SIDEBAR (col-span-1)        │ │
│ │                            │                             │ │
│ │ 1. LIVE QUIZZES           │ 1. JOIN PRIVATE QUIZ        │ │
│ │ 🔴 3 active               │ ┌───────────────────────┐   │ │
│ │                            │ │ 🔒 Join a Private     │   │ │
│ │ ┌──────┬──────┬──────┐    │ │ Quiz Code:            │   │ │
│ │ │Phys. │World │Java  │    │ │ [QZ-8X4K2______]      │   │ │
│ │ │Speed │Hist  │Blitz │    │ │ Password:             │   │ │
│ │ │Round │Sprin │      │    │ │ [••••••••••••]        │   │ │
│ │ │92% join  │ Live └─────────┼─ [🔐 Join private] │   │ │
│ │ │[⚡ Join]│[⚡ Join]│[⚡ Join]│ │ 🔒 Secure & encrypted│   │ │
│ │ └──────┴──────┴──────┘    │ └───────────────────────┘   │ │
│ │ [View all →]               │                             │ │
│ │                            │ 2. QUIZ STATS              │ │
│ │ 2. ASYNCHRONOUS QUIZZES    │ ┌───────────────────────┐   │ │
│ │ ∞ Anytime                  │ │ 🔴 Live now: 12       │   │ │
│ │                            │ │ ∞ Available: 248      │   │ │
│ │ ┌──────┬──────┬──────┐    │ │ 📅 Upcoming: 34       │   │ │
│ │ │Cell  │Algeb │World │    │ └───────────────────────┘   │ │
│ │ │Bio   │ra    │War   │    │                             │ │
│ │ │      │Essns │II    │    │ 3. CREATE YOUR OWN         │ │
│ │ │84%   │79%   │81%   │    │ ┌───────────────────────┐   │ │
│ │ │[▶ Take]│[▶ Take]│[▶ Take]│ │ 🪄 Create your own   │   │ │
│ │ └──────┴──────┴──────┘    │ │ Turn any topic into   │   │ │
│ │ [View all →]               │ │ a quiz...             │   │ │
│ │                            │ │ [+ Create quiz]       │   │ │
│ │ 3. UPCOMING QUIZZES        │ └───────────────────────┘   │ │
│ │ 📅 Scheduled               │                             │ │
│ │                            │                             │ │
│ │ ┌──────┬──────┬──────┐    │                             │ │
│ │ │Organ │Calc  │Python│    │                             │ │
│ │ │Chem  │Chall │Fund  │    │                             │ │
│ │ │      │enge  │      │    │                             │ │
│ │ │Jul 2 │Jul 4 │Jul 6 │    │                             │ │
│ │ │[🔔 Remind]│[🔔 Remind]│[🔔 Remind]│                             │ │
│ │ └──────┴──────┴──────┘    │                             │ │
│ │ [View all →]               │                             │ │
│ │                            │                             │ │
│ └────────────────────────────┴─────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FOOTER: Logo | © 2025 QuizMind. All rights reserved.        │
└─────────────────────────────────────────────────────────────┘
```

**Key Components:**

#### 1. **Header Section**
```
Badge: ✨ Browse all quizzes

Title: "Discover Quizzes" (font-bold text-3xl)

Subtitle: "Explore public quizzes that are live now, available 
          anytime, or coming soon. Or join a private quiz with a code."

Search Bar: "Search quizzes..." (width: w-72)
├─ Icon: Search
└─ Placeholder text
```

#### 2. **Live Quizzes Section** (grid-cols-3 gap-4)
```
Header:
├─ Icon: 🔴 Animated ping (animate-ping)
├─ Title: "Live Quizzes" (font-semibold text-lg)
└─ Badge: "3 active" (bg-[#e7000b]/10 text-[#e7000b])

[View all →] link

Cards (3 quiz cards):
├─ Icon box (size-10 rounded-lg bg-zinc-100)
├─ Live badge (red #e7000b with pulse dot)
├─ Quiz name (font-semibold)
├─ Subject · Questions (text-xs gray)
├─ Participants count (Users icon)
├─ Time remaining (Clock icon "Ends Xm")
└─ [⚡ Join now] button (primary blue)

Example:
- Physics Speed Round | 15 questions | 214 joined | Ends 12m
- World History Sprint | 20 questions | 168 joined | Ends 25m
- JavaScript Blitz | 12 questions | 302 joined | Ends 8m
```

#### 3. **Asynchronous Quizzes Section** (grid-cols-3 gap-4)
```
Header:
├─ Icon: ∞ Infinity
├─ Title: "Asynchronous Quizzes" (font-semibold text-lg)
└─ Badge: "Anytime" (bg-zinc-100)

Subtitle: "Live sessions ended but these quizzes are still 
          open to take on your own time."

[View all →] link

Cards (3 quiz cards):
├─ Icon box (size-10 rounded-lg bg-zinc-100)
├─ Open badge (variant="outline")
├─ Quiz name (font-semibold)
├─ Subject · Questions (text-xs gray)
├─ Participants count (Users icon)
├─ Average score (Target icon "XX%")
└─ [▶ Take quiz] button (outline variant)

Example:
- Cell Biology Basics | 20 questions | 348 taken | 84% avg
- Algebra Essentials | 18 questions | 275 taken | 79% avg
- World War II Overview | 25 questions | 412 taken | 81% avg
```

#### 4. **Upcoming Quizzes Section** (grid-cols-3 gap-4)
```
Header:
├─ Icon: 📅 CalendarClock
├─ Title: "Upcoming Quizzes" (font-semibold text-lg)
└─ Badge: "Scheduled" (bg-zinc-100)

[View all →] link

Cards (3 quiz cards):
├─ Icon box (size-10 rounded-lg bg-zinc-100)
├─ Soon badge (bg-[#2b7fff]/10 text-[#2b7fff] with Clock icon)
├─ Quiz name (font-semibold)
├─ Subject · Questions (text-xs gray)
├─ Scheduled date (Calendar icon "Mon DD, H:MM PM")
└─ [🔔 Remind me] button (outline variant)

Example:
- Organic Chemistry | 22 questions | Jul 2, 3:00 PM
- Calculus Challenge | 16 questions | Jul 4, 6:30 PM
- Python Fundamentals | 14 questions | Jul 6, 5:00 PM
```

#### 5. **Private Quiz Card** (Right Sidebar, col-span-1)
```
Background: bg-[#2b7fff]/5
Border: border-[#2b7fff]/30

Card Structure:
├─ Icon box (size-11 rounded-xl bg-[#2b7fff])
│  └─ Icon: Lock (size-5 text-blue-50)
├─ Title: "Join a Private Quiz" (font-semibold text-lg)
├─ Description: "Got an invite? Enter the access code and 
│  password shared by your host."
├─ Form Fields:
│  ├─ Quiz Code (placeholder: "e.g. QZ-8X4K2")
│  │  └─ Icon: Hash
│  └─ Password (type: password, placeholder: "Enter quiz password")
│     └─ Icon: KeyRound
├─ Button: [🔐 Join private quiz] (full width, primary)
└─ Security note: "🔒 Your access is secure and encrypted"
```

#### 6. **Quiz Stats Card** (Right Sidebar, col-span-1)
```
Title: "Quiz Stats" (font-semibold text-base)
Subtitle: "Across the platform today" (text-xs gray)

Statistics:
├─ 🔴 Live now: 12 (divider)
├─ ∞ Available anytime: 248 (divider)
└─ 📅 Upcoming: 34

Layout: flex justify-between
├─ Icon + label (text-sm gray)
└─ Number (font-semibold)
```

#### 7. **Create Your Own Card** (Right Sidebar, col-span-1)
```
Icon: 🪄 Wand2 (size-10 rounded-lg bg-zinc-100 text-[#2b7fff])

Title: "Create your own" (font-semibold text-base)

Description: "Turn any topic into a quiz and host it live or 
            share privately."

Button: [+ Create quiz] (outline variant, full width)
```

**Design System:**

**Colors:**
- Primary Blue: #2b7fff
- Live Red: #e7000b
- Gray: #71717b
- Light Gray: zinc-100, zinc-200
- Background: white
- Blue Light: blue-50

**Icons:**
- Live: Radio (red #e7000b)
- Async: Infinity
- Upcoming: CalendarClock
- Categories: Atom, Landmark, Code2, Microscope, Sigma, Globe2, FlaskConical, Calculator, Cpu
- Actions: Zap, Play, Bell
- Other: Search, Users, Clock, Target, Hash, KeyRound, ShieldCheck, LogIn, Lock

**Grid System:**
```
Main Layout: grid-cols-3 gap-8
├─ Main content: col-span-2
├─ Sidebar: col-span-1

Quiz Cards: grid-cols-3 gap-4
- 3 cards per section

Card Structure (p-5 gap-4):
├─ CardHeader (p-0)
├─ CardContent (p-0 gap-2)
└─ CardFooter (p-0)
```

**Navigation from Screen4:**
- Search → Filter quizzes
- [Live Quiz] card [⚡ Join now] → Start live quiz
- [Async Quiz] card [▶ Take quiz] → Take quiz (quiz-taking page)
- [Upcoming Quiz] card [🔔 Remind me] → Set notification
- Private Quiz Form → Join private quiz
- [Create quiz] → Screen create form (likely different flow)
- [View all] → Extended view of each section

---

### **Screens 5, 6, 7: Create Quiz Workflow (3-Step Process)**

**Purpose:** Multi-step guided wizard for creating quizzes. These are NOT separate pages but connected slides of a single creation flow.

**Screen appears:**
- When clicking [Create Quiz] button from Screen2 or Screen4
- Guides users through 3-step process: Details → Questions → Review
- Data persists across steps (can save as draft)

**Overall Workflow:**

```
┌──────────────────────────────────────────────────────────┐
│                  CREATE QUIZ WORKFLOW                    │
│                    (3 Slides)                            │
│                                                          │
│  Step 1: Quiz Details          (Screen5)               │
│  └─ Configure quiz name, description, settings         │
│  └─ Choose type (public/private), difficulty, duration│
│  └─ Button: [Next: Add Questions] → Step 2             │
│                                                          │
│  Step 2: Add Questions          (Screen6)              │
│  └─ AI generation OR manual question entry            │
│  └─ Set question type, options, difficulty, explanation│
│  └─ Buttons: [Back] [Next: Review & Publish] → Step 3 │
│                                                          │
│  Step 3: Review & Publish       (Screen7)              │
│  └─ Final review of all questions                      │
│  └─ Summary card showing quiz settings                 │
│  └─ Button: [Publish Quiz] → Live                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## **Screen 5: Quiz Details (Step 1 of 3)**

**Purpose:** Collect quiz metadata and configuration

**Layout:** Single column form with header

**Progress Indicator (Step Bar):**
```
[1. Quiz Details] ═══ [2. Add Questions] ═══ [3. Review & Publish]
(completed)            (disabled)              (disabled)
```
- Circular badges: 1, 2, 3
- Blue line connecting completed steps
- Gray line for future steps

**Key Form Fields:**

```
┌─────────────────────────────────────────────────────────┐
│ CREATE A NEW QUIZ                                       │
│ Fill in the details to set up your quiz.               │
│                                                         │
│ [Quiz Name] (col-span-2)                              │
│ e.g. Cell Biology Basics                              │
│                                                         │
│ [Description] (col-span-2)                            │
│ Describe what this quiz covers...                      │
│                                                         │
│ [Subject/Category]    [Difficulty]                    │
│ ┌─ Science ▼       ┌─ Easy Medium Hard ─┐            │
│ ├─ Math            │ Easy (selected)     │            │
│ ├─ History         └─────────────────────┘            │
│ └─ Coding                                              │
│                                                         │
│ [Total Duration] (col-span-2)                          │
│ [30 ____] minutes                                      │
│                                                         │
│ [Quiz Type] (col-span-2)                               │
│ ┌─ Public (selected)  ┌─ Private      ┐             │
│ │ Anyone with link    │ Code + password│             │
│ │ [checkmark]         │                │             │
│ └─────────────────────┴────────────────┘             │
│                                                         │
│ [Quiz Password]                                        │
│ 🔑 [Set quiz password__________]                      │
│                                                         │
│ ☐ Allow students to join anytime (async)              │
│   📅 Even after this quiz ends                         │
│                                                         │
│                              [Next: Add Questions →]   │
└─────────────────────────────────────────────────────────┘
```

**Fields:**
1. **Quiz Name** (text input, col-span-2)
2. **Description** (textarea, col-span-2)
3. **Subject/Category** (select dropdown)
   - Science, Math, History, Coding
4. **Difficulty** (button group)
   - Easy, Medium, Hard (toggles)
5. **Total Duration** (number input)
   - Format: "XX minutes"
6. **Quiz Type** (2-column card selector)
   - Public: Globe icon, description
   - Private: Lock icon, description
   - Selected option highlighted in blue
7. **Quiz Password** (text input, conditional on Private)
   - Icon: KeyRound
   - Shown only when Private selected
8. **Async Mode** (checkbox, col-span-2)
   - Label: "Allow students to join and attempt this quiz anytime, even after it ends."
   - Icon: CalendarClock

**Navigation:**
- [Next: Add Questions] button (primary blue)
  - ArrowRight icon
  - Leads to Screen6

---

## **Screen 6: Add Questions (Step 2 of 3)**

**Purpose:** Add questions to quiz via AI or manual entry

**Layout:** Single column with sections

**Progress Indicator:**
```
[✓ Quiz Details] ═══ [2. Add Questions] ═══ [3. Review & Publish]
(completed)         (current)               (disabled)
```

**Header:**
```
ADD QUESTIONS
Use AI to generate questions or add them manually
```

**Key Sections:**

#### 1. **AI Question Generator Card**
```
┌──────────────────────────────────────────────┐
│ ✨ Generate with AI                          │
│ Let AI craft questions from your topic...   │
│                                              │
│ Describe your quiz topic                    │
│ [Textarea: e.g. photosynthesis, mitosis...] │
│                                              │
│ Number of questions                         │
│ [10]                                         │
│                                              │
│ [✨ Generate Questions] (full width)         │
└──────────────────────────────────────────────┘
```

#### 2. **Divider**
```
─────────────  OR ADD MANUALLY  ─────────────
```

#### 3. **Add Question Button**
```
[+ Add Question Manually] (outline, full width)
```

#### 4. **Question Cards** (Repeatable)

**Question Card Structure (for MCQ):**
```
┌──────────────────────────────────────────────────────┐
│ ⋮ Question 1                          🗑 Delete      │
│                                                       │
│ Question Type: [Multiple Choice ▼]                  │
│                                                       │
│ Question Text:                                       │
│ [Textarea: What is the powerhouse...]               │
│                                                       │
│ Answer Options: (grid-cols-2)                        │
│ ┌─ ✓ Option A          ┌─ ○ Option B               │
│ │ [text input]         │ [text input]               │
│ └─────────────────────┴──────────────────            │
│ ┌─ ○ Option C          ┌─ ○ Option D               │
│ │ [text input]         │ [text input]               │
│ └─────────────────────┴──────────────────            │
│ Tap the circle to mark the correct answer           │
│                                                       │
│ Difficulty Level: [Easy | Medium | Hard]            │
│                                                       │
│ Explanation:                                         │
│ [Textarea: Explain why the correct answer...]       │
└──────────────────────────────────────────────────────┘
```

**Question Card Structure (for True/False):**
```
┌──────────────────────────────────────────────────────┐
│ ⋮ Question 2                          🗑 Delete      │
│                                                       │
│ Question Type: [True / False ▼]                     │
│                                                       │
│ Question Text:                                       │
│ [Textarea: The cell membrane is permeable...]       │
│                                                       │
│ Answer Options: (flex flex-col)                      │
│ ┌─ ✓ True (selected)                                │
│ ├─ ○ False                                           │
│                                                       │
│ Difficulty Level: [Easy | Medium | Hard]            │
│                                                       │
│ Explanation:                                         │
│ [Textarea: Explain why...]                          │
└──────────────────────────────────────────────────────┘
```

**Features:**
- GripVertical icon for drag-and-drop reordering
- Trash icon to delete question
- Correct answer marked with blue checkmark circle
- Difficulty toggles (Easy, Medium, Hard)
- Explanation textarea for each question

**Navigation:**
- [Back] button (outline) - returns to Screen5
- [Next: Review & Publish] button (primary) - goes to Screen7

---

## **Screen 7: Review & Publish (Step 3 of 3)**

**Purpose:** Final review of quiz before publishing

**Layout:** 2-column (65% questions, 35% summary)

**Progress Indicator:**
```
[✓ Quiz Details] ═══ [✓ Add Questions] ═══ [3. Review & Publish]
(completed)         (completed)            (current)
```

**Left Column (65%) - Question Review Cards:**
```
Question cards showing:
├─ Question number badge (blue bg, white text: "Q1")
├─ Question type badge (gray: "MCQ", "True/False")
├─ Difficulty badge (colored: green=Easy, amber=Medium, red=Hard)
├─ Question text (bold)
├─ All answer options
│  ├─ Correct answer highlighted in green
│  ├─ Green checkmark icon
│  ├─ Green background (green-50)
│  └─ Grayed out incorrect options
├─ Explanation box (gray bg)
│  ├─ 💡 Lightbulb icon
│  └─ Explanation text
```

**Right Column (35% Sticky) - Quiz Summary Card:**
```
┌───────────────────────────────────────────┐
│ 📋 QUIZ SUMMARY                           │
│                                           │
│ Cell Biology Basics                       │
│                                           │
│ [Science badge] [Medium badge]            │
│                                           │
│ ⏱ Duration: 15 min                       │
│ 🔒 Password: Protected (green)            │
│ ∞ Join mode: Async ✓                     │
│ ❓ Total questions: 20                    │
│                                           │
│ ✨ 14 AI-generated questions (badge)     │
│                                           │
│                                           │
│ [🚀 Publish Quiz] (green, full width)    │
│ [← Back to Questions] (outline)          │
│                                           │
│ Once published, students can join        │
│ using the quiz code.                     │
└───────────────────────────────────────────┘
```

**Summary Card Shows:**
- Quiz name
- Subject badge
- Difficulty badge
- Duration (Clock icon)
- Password status (Lock icon)
- Join mode (Infinity icon for async)
- Total question count (HelpCircle icon)
- AI generation count (Sparkles badge)

**Navigation:**
- [🚀 Publish Quiz] button (green, full width, large)
  - Rocket icon
  - Publishes quiz and creates join code
  - Redirects to Screen8 (Quiz Manager) or Screen2
- [← Back to Questions] button (outline)
  - Returns to Screen6

---

## **Shared Features Across All 3 Screens**

**Sticky Header:**
```
Logo | Dashboard | Quizzes* | Results | About
                            🔔  [👤 Profile]
```

**Data Persistence:**
- Quiz details saved between steps
- Can close and return later (draft mode)
- Form validation on each step

**Design System:**
- Color: #2b7fff (primary blue)
- Card-based sections
- Step progress indicator
- Difficulty color coding:
  - Easy: Green
  - Medium: Amber/Orange
  - Hard: Red

---

**Layout:** Two-column (65%/35%)

**Left Column - Question Review:**
- Each question displayed as read-only card
- Shows:
  - Question number and type badge
  - Difficulty level badge (color-coded: green/amber/red)
  - Question text
  - Answer options (correct answer highlighted in green)
  - Explanation box (light background with lightbulb icon)

**Right Column - Quiz Summary (sticky):**
- Quiz title
- Subject badge
- Difficulty badge
- Metrics:
  - Duration
  - Password protection status
  - Join mode (Async/Sync)
  - Total questions count
- AI generation stats
- Primary CTA: "Publish Quiz" (green button)
- Secondary: "Back to Questions"
- Help text: "Once published, students can join using the quiz code"

---

### **Screen 8: Student Quiz Taking Interface**

**Purpose:** Interactive quiz-taking interface where students answer questions one at a time with real-time progress tracking and timer.

**When Accessed:**
- Student clicks "Join Quiz" from Screen4 (Discover Quizzes)
- Student receives quiz invitation and joins
- After entering password (if protected)

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│ STICKY HEADER                                               │
│ Logo | Dashboard | Quizzes | Results | Pricing | 🔔 Profile │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ MAIN CONTENT (max-width: 1140px, px-12 py-8)               │
│                                                              │
│ QUIZ HEADER                                                  │
│ ┌──────────────────────────┬──────────────────────────────┐ │
│ │ Quiz Title               │ ⏱️ 12:45 remaining           │ │
│ │ Science • 20 Questions   │                              │ │
│ │ Live Mode                │                              │ │
│ └──────────────────────────┴──────────────────────────────┘ │
│                                                              │
│ PROGRESS BAR                                                 │
│ Question 5 of 20 (25%) [═════════════════════════════════]  │
│                                                              │
│ QUESTION CARD (full width)                                   │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Q5 | MCQ | Medium        [🚩 Bookmark]                 │  │
│ │                                                         │  │
│ │ What is the largest planet in our solar system?        │  │
│ │                                                         │  │
│ │ ☐ Mercury                                              │  │
│ │ ☑ Jupiter (selected - blue background)                 │  │
│ │ ☐ Saturn                                               │  │
│ │ ☐ Neptune                                              │  │
│ │                                                         │  │
│ │ 💡 Explanation: Jupiter is the largest planet...      │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌──────────────────────┬───────────────────────────────────┐ │
│ │ [← Previous] (disabled) │ [Next →]                        │ │
│ └──────────────────────┴───────────────────────────────────┘ │
│                                                              │
│ [✓ Submit Quiz] (visible on last question only)             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Key Components:**

#### 1. **Header (Fixed)**
- Logo + Navigation (Dashboard, Quizzes, Results, Pricing)
- Notification bell with indicator
- Student profile dropdown (name, tier, avatar)
- Same styling as Screen4

#### 2. **Quiz Header Section**
```tsx
<div className="flex justify-between items-center">
  <div>
    <div className="flex items-center gap-3">
      <span className="font-medium text-[#71717b] text-sm uppercase">Quiz</span>
      <span className="font-bold bg-[#2b7fff] text-blue-50 text-xs px-3 py-1 rounded-full">
        {mode} // "Live" or "Async"
      </span>
    </div>
    <h1 className="font-bold text-3xl">Cell Biology Basics</h1>
    <p className="text-[#71717b] text-sm">Science • Medium • 20 Questions</p>
  </div>
  
  <div className="text-right">
    <Clock className="size-5 text-[#2b7fff]" />
    <span className="font-bold text-2xl">12:45</span>
    <span className="text-[#71717b] text-sm">remaining</span>
  </div>
</div>
```

**Timer Color Coding:**
- Green (text-green-600): > 5 min
- Amber (text-amber-600): 2-5 min
- Red (text-red-600): < 2 min (with pulse animation)

#### 3. **Progress Section**
```
Question 5 of 20 | 25% Complete

Progress Bar:
├─ Background: bg-zinc-200 (h-2)
└─ Fill: bg-[#2b7fff] (w-[25%])
```

#### 4. **Question Card**
```tsx
<Card className="p-8 gap-6 shadow-sm rounded-2xl border-zinc-200">
  <CardHeader className="p-0 flex-row justify-between items-start gap-4">
    <div className="flex items-center gap-2">
      // Q Label
      <span className="font-bold bg-[#2b7fff] text-blue-50 text-xs px-2 h-6 rounded-md flex items-center">
        Q5
      </span>
      
      // Type Badge
      <span className="font-medium bg-zinc-100 text-zinc-900 text-xs px-2 py-0.5 rounded-full">
        MCQ // or "True/False"
      </span>
      
      // Difficulty Badge
      <span className="font-semibold bg-amber-100 text-amber-700 text-xs px-2.5 py-0.5 rounded-full">
        Medium
      </span>
      
      // Bookmark Button
      <button className="ml-auto">
        <Flag className="size-4 text-[#71717b]" />
      </button>
    </div>
  </CardHeader>
  
  <CardContent className="p-0 flex flex-col gap-4">
    // Question Text
    <h2 className="font-bold text-lg">What is the largest planet?</h2>
    
    // Options
    <div className="flex flex-col gap-3">
      // Each option is a button
      <button className="rounded-lg border-zinc-200 border-2 flex px-4 py-3 items-center gap-3 hover:border-[#2b7fff]">
        <div className="size-5 rounded-full border-zinc-300 border-2" />
        <span className="font-medium text-sm">Mercury</span>
      </button>
      
      // Selected state
      <button className="rounded-lg border-[#2b7fff] bg-[#2b7fff]/5 border-2 flex px-4 py-3 items-center gap-3">
        <div className="size-5 rounded-full border-[#2b7fff] border-2 bg-[#2b7fff] flex items-center justify-center">
          <Check className="size-3 text-white" />
        </div>
        <span className="font-bold text-sm text-[#2b7fff]">Jupiter</span>
      </button>
    </div>
    
    // Explanation (optional)
    <div className="rounded-lg bg-blue-50 border-blue-200 border-1 flex px-3 py-2 items-start gap-2 mt-4">
      <Lightbulb className="size-4 text-blue-600 mt-0.5" />
      <p className="text-blue-900 text-xs">Jupiter is the largest planet with diameter 142,984 km.</p>
    </div>
  </CardContent>
</Card>
```

**Option States:**
| State | Border | Background | Text | Circle |
|-------|--------|------------|------|--------|
| Unselected | `border-zinc-200` | `bg-white` | `text-zinc-950` | `border-zinc-300` |
| Hover | `border-[#2b7fff]` | `bg-white` | `text-zinc-950` | `border-zinc-300` |
| Selected | `border-[#2b7fff]` | `bg-[#2b7fff]/5` | `text-[#2b7fff]` | `bg-[#2b7fff]` + checkmark |

#### 5. **Navigation Buttons**
```tsx
<div className="flex gap-4 mt-8">
  <Button 
    variant="outline"
    className="flex-1 font-medium text-[#71717b] text-sm py-5"
    disabled={currentQuestion === 0}
  >
    <ArrowLeft className="size-4" />
    Previous
  </Button>
  
  <Button 
    className="flex-1 bg-[#2b7fff] text-blue-50 font-medium text-sm py-5"
  >
    Next
    <ArrowRight className="size-4" />
  </Button>
</div>

{/* Submit on last question */}
{currentQuestion === totalQuestions - 1 && (
  <Button className="w-full bg-green-600 text-white font-semibold text-base py-6 mt-4">
    <CheckCircle2 className="size-5" />
    Submit Quiz
  </Button>
)}
```

**Features:**
- ✅ One question per screen
- ✅ Real-time timer with color warnings
- ✅ Progress bar + question counter
- ✅ Immediate visual feedback on selection
- ✅ Navigation buttons (Previous/Next)
- ✅ Answer persistence across navigation
- ✅ Bookmark questions for review
- ✅ Explanations available
- ✅ Auto-submit when time runs out
- ✅ Submit confirmation before final submission

**Data Flow:**
1. User clicks "Join" from Screen4
2. Enters password (if protected) → Shows password modal
3. Clicks "Start Quiz" → Screen8 loads with Q1
4. Answers questions → Previous/Next navigation
5. Last question → Submit button appears
6. Clicks Submit → Confirmation modal
7. Confirms → Redirects to Screen3 (Results)

**Styling Details:**
- Container: `max-w-[1140px] flex mx-auto flex-col gap-8`
- Main padding: `px-12 py-8`
- Card padding: `p-8`
- Question spacing: `gap-4` or `gap-6`
- Button heights: `py-5` or `py-6`

---

### **Screen 9: Pricing & Plans Page**

**Purpose:** Display subscription pricing tiers (Free, Pro, Premium) where users can compare features and upgrade their accounts.

**When Accessed:**
- Click "Pricing" in navbar (from any authenticated page)
- Marketing page for new users exploring pricing
- Billing/upgrade page for existing users
- Accessible to both authenticated and unauthenticated users

**Layout Structure:**

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Logo | Dashboard | Quizzes | Results | About | 🔔   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PAGE HEADER (centered)                                       │
│ ✨ Pricing Plans                                              │
│ Choose the plan that fits you                                │
│ Start for free and upgrade as your quizzes grow...           │
│                                                              │
│ 3-COLUMN PRICING GRID (gap-6)                                │
│ ┌─────────────────┬─────────────────┬─────────────────┐    │
│ │ FREE            │ PRO ★ FEATURED  │ PREMIUM         │    │
│ │ 🎁 Gift         │ ⚡ Zap          │ 👑 Crown        │    │
│ │ For starters    │ For educators   │ For power users │    │
│ │ ₹0/month        │ ₹250/month      │ ₹900/month      │    │
│ │ ✓ 10 quizzes    │ ✓ Everything +  │ ✓ Everything +  │    │
│ │ ✓ Basic types   │ ✓ 30 quizzes/mo │ ✓ Unlimited     │    │
│ │ ✗ AI Gen        │ ✓ AI Gen        │ ✓ Advanced AI   │    │
│ │ [Get Free]      │ [Upgrade to Pro]│ [Go Premium]    │    │
│ └─────────────────┴─────────────────┴─────────────────┘    │
│                                                              │
│ Footer: All prices in INR. Cancel anytime.                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FOOTER: Logo | © 2025 QuizMind. All rights reserved.         │
└─────────────────────────────────────────────────────────────┘
```

**Key Components:**

#### 1. **Header Section**
- Logo + Navigation (Dashboard, Quizzes, Results, About)
- Notification bell with blue indicator
- Profile dropdown menu with options (Profile, Settings, Billing, Logout)

#### 2. **Page Header**
```
Badge: ✨ Pricing Plans
Title: "Choose the plan that fits you" (font-bold text-3xl)
Subtitle: "Start for free and upgrade as your quizzes grow. 
          All plans include unlimited joining for your students."
```

#### 3. **Three Pricing Cards (grid-cols-3)**

**FREE Plan Card**
- Icon: 🎁 Gift
- Price: ₹0/month
- Target: "For individuals getting started"
- Features (6):
  - ✓ Unlimited join quizzes
  - ✓ Create up to 10 quizzes
  - ✓ Basic MCQ & True/False types
  - ✓ Live & async quiz modes
  - ✗ AI question generation
  - ✗ Advanced analytics
- Button: "Get Started Free" (outline variant)

**PRO Plan Card (FEATURED - "Most Popular")**
- Icon: ⚡ Zap
- Border: Blue (#2b7fff) with 2px border
- Shadow: More prominent (shadow-md)
- Badge: "★ Most Popular" (positioned -top-3)
- Price: ₹250/month
- Target: "For active educators & teams"
- Features (6):
  - ✓ Everything in Free
  - ✓ Create up to 30 quizzes/month
  - ✓ AI question generation
  - ✓ All question types
  - ✓ Detailed result analytics
  - ✓ Password-protected quizzes
- Button: "Upgrade to Pro" (primary blue, prominent)

**PREMIUM Plan Card**
- Icon: 👑 Crown
- Price: ₹900/month
- Target: "For power users & institutions"
- Features (6):
  - ✓ Everything in Pro
  - ✓ Unlimited quizzes/month
  - ✓ Advanced AI generation & bulk import
  - ✓ Custom branding & certificates
  - ✓ Team collaboration seats
  - ✓ Priority 24/7 support
- Button: "Go Premium" (outline variant)

#### 4. **Feature Icons**
- Included features: Check mark (text-[#2b7fff])
- Excluded features: X mark (text-[#71717b])

#### 5. **Footer**
- Text: "All prices in INR. Cancel anytime. Prices exclude applicable taxes."
- Copyright: "© 2025 QuizMind. All rights reserved."

**Design Details:**
- Container: `max-w-5xl mx-auto flex flex-col items-center`
- Main padding: `p-12`
- Grid: `grid-cols-3 gap-6 items-start mt-8`
- Card padding: `p-6`
- Card border radius: `rounded-2xl`
- Feature gap: `gap-3` between items

**Color Coding:**
- Pro card border: `border-[#2b7fff] border-2` (blue - premium)
- Free & Premium borders: `border-zinc-200 border-1` (gray - standard)
- Pro card shadow: `shadow-md` (more prominent)
- Feature icons: Check `text-[#2b7fff]`, X `text-[#71717b]`

**CTA Buttons:**
- Free: `variant="outline"` (gray border)
- Pro: `bg-[#2b7fff] text-blue-50` (primary blue - most prominent)
- Premium: `variant="outline"` (gray border)

**Navigation/Integration:**
- Button actions trigger payment flows or signup
- Links to billing system integration
- Updates user tier/subscription status
- Redirects to Screen2 (Dashboard) on success

---

### **Screen 10: User Profile Settings**

**Purpose:** User account management, profile customization, and subscription details

**Layout:** 3-column grid with left sidebar and right main content area
- **Left Sidebar (col-span-1):** Profile card + Quick stats
- **Right Main (col-span-2):** Personal info + Billing + Security

**Key Components:**

**1. Profile Card (Left Sidebar)**
- Avatar (size-28, 112px) with camera icon overlay for picture upload
- Camera button: size-8, rounded-full, bg-[#2b7fff], positioned absolute right-1 bottom-1, white border-2
- User details: Full Name (font-bold text-xl), Username (@handle)
- Member tier badge (Crown icon + "Pro Member" text, blue background)
- Contact info: Email, Location, Join Date (all with icons)
- Logout button (red text, variant outline, full width)

**2. Quick Stats Card (Left Sidebar)**
- 2x2 grid of stat boxes (bg-zinc-100)
- Stats: 24 Quizzes Created, 1,280 Total Attempts, 86% Avg. Score, 312 Students Reached
- Each stat shows bold number (text-2xl) + label (text-xs, gray)

**3. Personal Information Card (Main)**
- Header with "Personal Information" title + "Edit" button (Pencil icon)
- 2-column form grid with 5 fields:
  - Full Name, Username, Email Address, Phone Number
  - Bio (spans 2 columns, textarea, min-h-20)
- Fields are read-only by default, editable when Edit button is clicked

**4. Pro Plan / Billing Card (Main)**
- Header box (blue background: bg-[#2b7fff], rounded-xl, p-6)
  - Crown icon in box (size-12, bg-blue-50/15)
  - Title: "Pro Plan", Description: "Create up to 30 quizzes/month with AI generation"
  - Price: "₹250/month" (font-bold text-2xl)
  - Status badge: "Active" (bg-blue-50/20)
- Subscription details (3-column grid):
  - Started On: Jan 15, 2025 (CalendarClock icon)
  - Renews On: Feb 15, 2025 (RefreshCw icon)
  - Days Remaining: 18 days left (Hourglass icon)
- Usage progress:
  - Label: "Quizzes used this month: 18 / 30"
  - Progress bar: w-[60%] filled (rounded-full, h-2, bg-[#2b7fff])
- Action buttons (3 buttons, h-11):
  - "Upgrade to Premium" (blue bg with ArrowUpCircle icon)
  - "Manage Billing" (outline variant with CreditCard icon)
  - "Cancel Plan" (ghost variant, red text)

**5. Security & Settings Card (Main)**
- 4 setting items, each in rounded-lg box with border:
  - Password: Icon (Lock), "Last changed 2 months ago", "Change" button
  - Two-Factor Auth: Icon (ShieldCheck), "Add an extra layer of security", Toggle switch
  - Email Notifications: Icon (Bell), "Receive updates about quiz activity", Toggle switch (default ON)
  - Log Out (Danger zone - red background): Icon (LogOut), "Sign out on this device", "Log out" button

**Design Specifications:**
- Primary color: #2b7fff (buttons, badges, progress)
- Red (danger): #e7000b (logout, cancel)
- Gray text: #71717b
- Avatar size: size-28 (112px)
- Camera button: size-8 (32px), white border-2
- Grid gaps: gap-8 (main layout), gap-4 (form/stats)
- Card padding: p-6
- Typography: Titles font-bold text-3xl, section titles font-semibold text-base
- Form heights: h-10 (inputs), h-9 (small buttons), h-11 (action buttons)

**Navigation:**
- Header dropdown menu:
  - Profile (leads to Screen10)
  - Settings
  - Billing
  - Logout (red text)
- Navigation links: Dashboard, Quizzes, Results, Pricing

**User Interactions:**
- Profile picture upload: Click Camera icon → file input opens → image previewed and uploaded
- Edit profile: Click "Edit" button → form fields become editable → Save changes
- Plan management: Upgrade/Manage Billing/Cancel buttons open modals
- Security settings: Toggle switches save immediately, "Change" opens modal
- Logout: Signs out user from current device

---

### **Screen 11: User Profile Settings (Alternative)**

**Purpose:** Extended profile and settings management

**Similar to Screen 10 but includes:**
- Additional profile customization options
- Learning preferences
- Subscription management details
- Advanced security settings
- Privacy settings
- Data export options
- Account deletion flow
- More detailed notification preferences
- API key management (if applicable)
- Connected integrations

---

## Component Hierarchy & Reusability

### **Core UI Components** (from shadcn/ui):
```
├── Button (variants: primary, outline, ghost)
├── Card (with CardHeader, CardContent, CardFooter)
├── Input
├── Textarea
├── Select (with SelectTrigger, SelectContent, SelectItem, SelectValue)
├── Avatar (with AvatarImage, AvatarFallback)
├── Badge
├── DropdownMenu (with multiple sub-components)
├── Checkbox
├── Switch
├── Label
├── Table (with TableHeader, TableBody, TableRow, TableCell, TableHead)
├── ChartContainer
├── ChartTooltip
└── Progress
```

### **Data Visualization Components**:
```
├── Recharts Components:
│   ├── AreaChart (AreaChart as RechartsAreaChart)
│   ├── BarChart (BarChart as RechartsBarChart)
│   ├── PieChart (PieChart as RechartsPieChart)
│   ├── CartesianGrid
│   ├── Area
│   ├── Bar
│   ├── Pie
│   ├── Tooltip
│   ├── Legend
│   ├── ResponsiveContainer
└── Custom Chart Wrapper
```

### **Icon Library** (Lucide React):
- Navigation: Home, LayoutDashboard, Info, Brain, LayoutGrid
- Actions: Plus, Edit, Trash2, Download, Share2, Settings, LogIn, LogOut
- Status: Check, CheckCircle2, CheckSquare, Clock, ShieldCheck
- Data: BarChart3, TrendingUp, Sparkles, Zap, HelpCircle
- User: User, Avatar, Bell, UserPlus, AtSign, Pencil, Camera
- Security: Lock, Eye, KeyRound, RefreshCw
- UI: ChevronDown, ChevronRight, ArrowRight, ArrowLeft, X, Mail
- Custom: Brain (logo), GripVertical (drag)

---

## Design System & Styling

### **Color Palette:**
- **Primary Brand:** #2b7fff (Bright Blue)
- **Text Primary:** #000000 / zinc-950
- **Text Secondary:** #71717b (Gray)
- **Background:** #ffffff (White)
- **Borders:** #e4e4e7 (zinc-200)
- **Semantic Colors:**
  - Success: #16a34a (green-600)
  - Warning: #ca8a04 (amber-600)
  - Danger: #dc2626 (red-600)
  - Info: #2b7fff (primary blue)

### **Typography:**
- **Headings:** Bold, tracking-tight
  - H1: text-5xl / text-3xl
  - H2: text-3xl / text-2xl
  - H3: text-lg
- **Body:** text-sm / text-base
- **Small:** text-xs

### **Spacing:**
- Uses Tailwind's gap, px, py, p utilities
- Consistent 8px (0.5rem) based grid
- Container max-width: 1140px / 1044px

### **Borders & Shadows:**
- Thin borders (border-1) in zinc-200
- Subtle shadows (shadow-sm, shadow-md, shadow-lg)
- Rounded corners: rounded-lg, rounded-xl, rounded-2xl, rounded-full

---

## State Management Strategy

### **Current Implementation:**
- **Stateless Components:** All screens are currently static/functional components
- **No Hook Usage:** Minimal use of React hooks (useEffect imported but not actively used)

### **Recommended State Architecture:**
```tsx
// Global State (Context API / Redux)
├── AuthContext
│   ├── user: User
│   ├── isAuthenticated: boolean
│   ├── login(credentials)
│   └── logout()
├── QuizContext
│   ├── quizzes: Quiz[]
│   ├── currentQuiz: Quiz
│   ├── addQuiz(quiz)
│   ├── updateQuiz(id, updates)
│   └── deleteQuiz(id)
├── UserContext
│   ├── profile: UserProfile
│   ├── preferences: UserPreferences
│   └── updateProfile(updates)
└── NotificationContext
    ├── notifications: Notification[]
    ├── addNotification(notification)
    └── removeNotification(id)

// Local Component State (useState)
├── Form State (Quiz Details, Questions)
├── UI State (Modals, Dropdowns, Collapsed sections)
├── Filter/Sort State (Dashboards)
└── Loading/Error State (API calls)
```

---

## Data Models & Interfaces

### **Core Entities:**

```typescript
// Quiz Model
interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  duration: number; // minutes
  questions: Question[];
  isPublic: boolean;
  password?: string;
  allowAsyncJoin: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  attempts: number;
  averageScore: number;
}

// Question Model
interface Question {
  id: string;
  text: string;
  type: "MCQ" | "TrueOrFalse";
  difficulty: "Easy" | "Medium" | "Hard";
  options: Option[];
  correctAnswerId: string;
  explanation: string;
  order: number;
}

// User Model
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  tier: "Free" | "Pro" | "Premium";
  joinDate: Date;
  preferences: UserPreferences;
}

// Result Model
interface QuizResult {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  percentage: number;
  timeSpent: number; // seconds
  answers: Answer[];
  completedAt: Date;
}

// Analytics Model
interface Analytics {
  totalQuizzesCreated: number;
  totalAttempts: number;
  averageScore: number;
  categoryBreakdown: CategoryStats[];
  trends: TrendData[];
  lastUpdated: Date;
}
```

---

## Navigation Flow & Routing Architecture

### **Complete User Flow & Navigation Structure:**

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ENTRY POINT                         │
│                   QuizMind AI Website                        │
└────────┬────────────────────────────────────────────────────┘
         │
         ├─────────────────────┬─────────────────────┐
         │                     │                     │
    NEW USER              EXISTING USER          LOGGED-OUT USER
         │                     │                     │
         ↓                     ↓                     ↓
    [Screen1]             [Screen2]             [Screen1]
    Home Page             Dashboard             Home Page
                         (Auto Redirect)


════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│            NAVBAR STRUCTURE - NON-AUTHENTICATED USER        │
│                          [Screen1]                          │
├─────────────────────────────────────────────────────────────┤
│  Logo  │ Home │ Quizzes │ Results │ Pricing │  Sign in │ Get started
│        │[S1]  │  [S1]   │  [S1]   │ [S1]  │  [S12]  │   [S13]
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│            NAVBAR STRUCTURE - AUTHENTICATED USER             │
│                    [Screen2 & Others]                       │
├─────────────────────────────────────────────────────────────┤
│ Logo │Dashboard│Quizzes│Results│Pricing│🔔│👤 Profile
│      │  [S2]   │ [S8]  │[S2/9] │ [S5]  │  │  [S10/11]
└─────────────────────────────────────────────────────────────┘
                 ↑
        (Replaces "Home"    (Pricing replaced    (New icons)
         & auth buttons)    with Pricing)
```

---

### **Detailed Screen Navigation Map:**

**SCREEN 1 (Home/Landing - Non-Authenticated)**
```
Screen1
├── Navbar
│   ├── Logo → Screen1
│   ├── Home → Screen1
│   ├── Quizzes → Screen1 (scroll to features)
│   ├── Results → Screen1 (scroll to features)
│   ├── Pricing → Screen5 (Pricing page)
│   ├── Sign in → Screen12
│   └── Get started → Screen13
├── Hero Section
│   ├── "Start free quiz" → Screen13 (redirect to login after)
│   └── "Watch demo" → Demo/Modal
├── Features Section
│   └── Descriptions
├── How It Works
│   └── Descriptions
├── CTA Section
│   └── "Create your first quiz" → Screen13
└── Footer
    └── Links → Various screens or external links
```

---

**SCREEN 12 (Login - Non-Authenticated)**
```
Screen12
├── "Sign up" → Screen13
├── "Forgot password?" → Password Recovery Flow
├── Sign In button → (Validate) → Screen2 (Dashboard)
├── Google OAuth → (Validate) → Screen2 (Dashboard)
└── GitHub OAuth → (Validate) → Screen2 (Dashboard)
```

---

**SCREEN 13 (Signup - Non-Authenticated)**
```
Screen13
├── "Sign in" → Screen12
├── Create Account button → (Validate) → Screen2 (Dashboard)
├── Google OAuth → (Validate) → Screen2 (Dashboard)
└── GitHub OAuth → (Validate) → Screen2 (Dashboard)
```

---

**SCREEN 2 (Dashboard - Authenticated)**
```
Screen2 (Home for authenticated users)
├── Navbar (AUTHENTICATED VERSION)
│   ├── Logo → Screen2
│   ├── Dashboard → Screen2
│   ├── Quizzes → Screen8 (Quiz Management)
│   ├── Results → Screen2/3/9 (Analytics)
│   ├── Pricing → Screen5
│   ├── Notification 🔔 → Notifications Panel
│   ├── Profile Avatar 👤 → Dropdown Menu
│   │   ├── Profile → Screen10
│   │   ├── Settings → Screen10
│   │   ├── Billing → Screen10
│   │   └── Logout → Screen1
│   └── [NEW] User Session indicator
├── Main Content
│   ├── Analytics Cards
│   ├── Charts
│   ├── Recent Results
│   └── Quick Actions
├── Create Quiz Button → Screen4
└── Manage Quizzes Link → Screen8
```

---

**SCREEN 4 (Create Quiz - Step 1 - Authenticated)**
```
Screen4 (Quiz Details)
├── Navbar
│   └── Breadcrumb: Dashboard → Screen2
├── Back Button → Screen2 or Screen8
├── Quiz Details Form
│   └── Fill details
└── Next Button → Screen6
```

---

**SCREEN 5 (Pricing - Both States)**
```
Screen5 (Pricing)
├── Navbar (Varies by auth state)
│   └── Logo → Home (Screen1 or Screen2)
├── Pricing Plans
│   ├── Free Plan
│   │   └── Button → Screen13 (if not logged) or Screen2 (if logged)
│   ├── Pro Plan
│   │   └── Upgrade Button → Billing/Checkout
│   └── Premium Plan
│       └── Upgrade Button → Billing/Checkout
└── Footer
    └── Links
```

---

**SCREEN 6 (Add Questions - Step 2 - Authenticated)**
```
Screen6 (Add Questions)
├── Back Button → Screen4
├── AI Generate Section
│   └── Generate Button → API Call
├── Manual Questions Section
│   └── Add/Edit/Delete Questions
└── Next Button → Screen7
```

---

**SCREEN 7 (Review & Publish - Step 3 - Authenticated)**
```
Screen7 (Review & Publish)
├── Back Button → Screen6
├── Question Review Cards
│   └── View Only
├── Quiz Summary (Sticky)
│   ├── Quiz Details
│   ├── Total Questions
│   └── Publish Button → (API) → Screen8
└── Success → Screen8 (Dashboard)
```

---

**SCREEN 8 (Quiz Management Dashboard - Authenticated)**
```
Screen8 (My Quizzes)
├── Navbar
│   ├── Dashboard → Screen2
│   ├── Quizzes → Screen8 (Current)
│   └── Results → Screen2/3/9
├── Create New Quiz Button → Screen4
├── Quizzes List/Table
│   ├── Edit → Screen4 (with data)
│   ├── View Results → Screen9
│   ├── Share → Share Modal
│   └── Delete → Confirmation
├── Charts & Analytics
│   └── View Details → Screen9
└── Footer
    └── Navigation Links
```

---

**SCREEN 9 (Results Dashboard - Authenticated)**
```
Screen9 (Results & Analytics)
├── Navbar
│   ├── Dashboard → Screen2
│   ├── Results → Screen9 (Current)
│   └── Quizzes → Screen8
├── Filters
│   ├── Subject Filter
│   ├── Date Range
│   └── Search
├── Analytics Charts
│   └── Interactive visualizations
├── Results Table
│   └── View Details → Result Detail
├── Export Options
│   ├── Download PDF
│   ├── Download CSV
│   └── Share
└── Footer
    └── Navigation Links
```

---

**SCREEN 10/11 (Profile Settings - Authenticated)**
```
Screen10/11 (Profile & Settings)
├── Navbar
│   └── Logo → Screen2
├── Back Button → Screen2
├── Profile Sections
│   ├── Edit Profile → Screen10
│   ├── Change Password → Modal
│   ├── Billing & Subscription → Billing Page
│   ├── Notification Settings → Update & Save
│   └── Security Settings → 2FA, etc.
├── Logout Button → (Clear session) → Screen1
└── Delete Account Button → Confirmation → Screen1
```

---

### **State-Based Navigation Logic:**

```typescript
// AuthContext determines navigation structure
if (isAuthenticated) {
  // Show authenticated navbar
  // Navigation targets:
  // - Home → Screen2 (Dashboard)
  // - Quizzes → Screen8
  // - Results → Screen2/3/9
  // - About → Screen5 (Pricing)
  // - Auth buttons → User profile (Screen10) + Logout
  // - Notification icon (Screen2)
} else {
  // Show public navbar
  // Navigation targets:
  // - Home → Screen1
  // - Quizzes → Screen1
  // - Results → Screen1
  // - About → Screen1
  // - Sign in → Screen12
  // - Get started → Screen13
}
```

---

### **Complete Page Flow Diagram:**

```
┌─────────────────┐
│  Browser Load   │
└────────┬────────┘
         │
         ├─ Check Auth Token
         │
    ┌────┴─────┐
    │           │
   YES         NO
    │           │
    ↓           ↓
[S2]DASH   [S1]HOME
    │           │
    ├─────┬─────┤
    │     │     │
   Nav   Nav   Nav
    │     │     │
    ├─────┼──────┼──────┐
    │     │      │      │
   [S2]  [S8]   [S5]   [S10]
   │      │      │      │
   └─────┬┴──────┴─────┘
         │
      ┌──┴──┐
      │     │
  Quiz Work
   Flow
      │
      ├── [S4] Details
      │
      ├── [S6] Questions
      │
      └── [S7] Review & Publish
             │
             ↓
          [S8] Dashboard
```

---

### **Navigation Connections Summary:**

| Screen | Type | Purpose | Navigation Links |
|--------|------|---------|------------------|
| S1 | Public | Home/Landing | → S12, S13, S1 |
| S2 | Auth | Dashboard | → S2, S4, S5, S8, S9, S10, S12 |
| S3 | Auth | Analytics | → S2, S8, S9 |
| S4 | Auth | Quiz Details | → S2, S6, S8 |
| S5 | Both | Pricing | → S1/S2, S13, Billing |
| S6 | Auth | Add Questions | → S4, S7, S8 |
| S7 | Auth | Review/Publish | → S6, S8 |
| S8 | Auth | Quiz Manager | → S2, S4, S7, S9 |
| S9 | Auth | Results | → S2, S8, Exports |
| S10 | Auth | Profile | → S2, S5, Logout |
| S11 | Auth | Settings | → S2, S5, Logout |
| S12 | Public | Login | → S13, S2, S1 |
| S13 | Public | Signup | → S12, S2, S1 |

---

### **User Journey Map:**

```
Landing (Screen1)
  ├─→ "Sign in" → Login (Screen12)
  │   ├─→ Forgot Password
  │   ├─→ OAuth: Google/GitHub
  │   └─→ "Sign up" → Registration (Screen13)
  │
  ├─→ "Get started" → Registration (Screen13)
  │   ├─→ OAuth: Google/GitHub
  │   └─→ "Sign in" → Login (Screen12)
  │
  ├─→ "Learn More" → Pricing (Screen5)
  │   └─→ "Upgrade" → Login (Screen12) / Registration (Screen13)
  │
  └─→ Pricing/Plans

Authentication Flow:
Login (Screen12) OR Registration (Screen13)
  ├─→ Email/Password validation
  ├─→ OAuth (Google/GitHub)
  ├─→ Profile setup
  └─→ Dashboard

Authenticated User
  ├─→ Dashboard (Analytics Overview)
  │   ├─→ View Results (Screen2/3/9)
  │   └─→ Manage Quizzes (Screen8)
  │
  ├─→ Create Quiz (Multi-step)
  │   ├─→ Step 1: Details (Screen4)
  │   ├─→ Step 2: Add Questions (Screen6)
  │   └─→ Step 3: Review & Publish (Screen7)
  │
  ├─→ Pricing (Screen5)
  │   └─→ Upgrade Plan
  │
  ├─→ User Profile (Screen10/11)
  │   ├─→ Edit Profile
  │   ├─→ Change Settings
  │   ├─→ Manage Billing
  │   └─→ Logout → Login (Screen12)
  │
  └─→ Quiz Taker
      ├─→ Join Quiz (via code/link)
      ├─→ Take Quiz
      ├─→ View Results
      └─→ See Recommendations
```

---

## Access Control & Authentication Flow

### **Authorization Rules:**

```typescript
// Access Control Matrix
┌──────────────────────────────────────────────────────────┐
│                   PAGE ACCESS RULES                      │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  PUBLIC PAGES (No Login Required):                       │
│  ├── Screen1 (Home/Landing)     → ALWAYS accessible      │
│  ├── Screen5 (Pricing)           → ALWAYS accessible     │
│  ├── Screen12 (Login)            → Always available      │
│  └── Screen13 (Signup)           → Always available      │
│                                                           │
│  PROTECTED PAGES (Login Required):                       │
│  ├── Screen2 (Dashboard)         → ONLY authenticated    │
│  ├── Screen3 (Analytics)         → ONLY authenticated    │
│  ├── Screen4 (Quiz Details)      → ONLY authenticated    │
│  ├── Screen6 (Add Questions)     → ONLY authenticated    │
│  ├── Screen7 (Review & Publish)  → ONLY authenticated    │
│  ├── Screen8 (Quiz Manager)      → ONLY authenticated    │
│  ├── Screen9 (Results)           → ONLY authenticated    │
│  ├── Screen10 (Profile)          → ONLY authenticated    │
│  └── Screen11 (Settings)         → ONLY authenticated    │
│                                                           │
│  REDIRECT LOGIC:                                         │
│  ├── Unauthenticated + access protected page             │
│  │   └──→ REDIRECT TO /login (Screen12)                  │
│  │                                                       │
│  ├── Authenticated + access /login or /signup            │
│  │   └──→ REDIRECT TO /dashboard (Screen2)               │
│  │                                                       │
│  └── Any user + root path (/)                           │
│      ├─→ If authenticated → /dashboard                  │
│      └─→ If not authenticated → /home                   │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### **Authentication Implementation:**

```typescript
// hooks/useAuth.ts - Access control hook
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Usage: const { isAuthenticated, user } = useAuth();
```

```typescript
// components/ProtectedRoute.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2b7fff] border-t-transparent" />
      </div>
    );
  }

  // Not authenticated → Redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated → Show content
  return <>{children}</>;
}
```

```typescript
// components/PublicRoute.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface PublicRouteProps {
  children: ReactNode;
  restricted?: boolean; // If true, redirect authenticated users to dashboard
}

export function PublicRoute({ children, restricted = true }: PublicRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2b7fff] border-t-transparent" />
      </div>
    );
  }

  // If restricted and authenticated, redirect to dashboard
  if (restricted && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
```

### **Complete Routing with Access Control:**

```typescript
// App.tsx - Full implementation with protection
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PublicRoute } from '@/components/PublicRoute';
import { Navbar } from '@/components/layout/Navbar';

// Screens
import Screen1_Home from '@/screens/Screen1_Home';
import Screen2_Dashboard from '@/screens/Screen2_Dashboard';
import Screen3_Analytics from '@/screens/Screen3_Analytics';
import Screen4_QuizDetails from '@/screens/Screen4_QuizDetails';
import Screen5_Pricing from '@/screens/Screen5_Pricing';
import Screen6_AddQuestions from '@/screens/Screen6_AddQuestions';
import Screen7_ReviewPublish from '@/screens/Screen7_ReviewPublish';
import Screen8_QuizManager from '@/screens/Screen8_QuizManager';
import Screen9_Results from '@/screens/Screen9_Results';
import Screen10_Profile from '@/screens/Screen10_Profile';
import Screen11_Settings from '@/screens/Screen11_Settings';
import Screen12_Login from '@/screens/Screen12_Login';
import Screen13_Signup from '@/screens/Screen13_Signup';

export function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2b7fff] border-t-transparent" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Root - Redirect based on auth */}
        <Route 
          path="/" 
          element={<RootRedirect />} 
        />

        {/* ========== PUBLIC ROUTES ========== */}
        
        {/* Home/Landing Page - Always accessible */}
        <Route 
          path="/home" 
          element={
            <PublicRoute restricted={false}>
              <Screen1_Home />
            </PublicRoute>
          } 
        />

        {/* Pricing Page - Always accessible */}
        <Route 
          path="/pricing" 
          element={
            <PublicRoute restricted={false}>
              <Screen5_Pricing />
            </PublicRoute>
          } 
        />

        {/* ========== AUTH ROUTES (Restricted if already logged in) ========== */}

        {/* Login Screen - Redirect to dashboard if already logged in */}
        <Route 
          path="/login" 
          element={
            <PublicRoute restricted={true}>
              <Screen12_Login />
            </PublicRoute>
          } 
        />

        {/* Signup Screen - Redirect to dashboard if already logged in */}
        <Route 
          path="/signup" 
          element={
            <PublicRoute restricted={true}>
              <Screen13_Signup />
            </PublicRoute>
          } 
        />

        {/* ========== PROTECTED ROUTES (Requires Authentication) ========== */}

        {/* Dashboard - Protected */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Screen2_Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Analytics - Protected */}
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <Screen3_Analytics />
            </ProtectedRoute>
          } 
        />

        {/* Quiz Manager - Protected */}
        <Route 
          path="/quizzes" 
          element={
            <ProtectedRoute>
              <Screen8_QuizManager />
            </ProtectedRoute>
          } 
        />

        {/* Create Quiz (Multi-step) - Protected */}
        <Route 
          path="/quiz/create" 
          element={
            <ProtectedRoute>
              <Screen4_QuizDetails />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/quiz/create/questions" 
          element={
            <ProtectedRoute>
              <Screen6_AddQuestions />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/quiz/create/review" 
          element={
            <ProtectedRoute>
              <Screen7_ReviewPublish />
            </ProtectedRoute>
          } 
        />

        {/* Results - Protected */}
        <Route 
          path="/results" 
          element={
            <ProtectedRoute>
              <Screen9_Results />
            </ProtectedRoute>
          } 
        />

        {/* Profile - Protected */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Screen10_Profile />
            </ProtectedRoute>
          } 
        />

        {/* Settings - Protected */}
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Screen11_Settings />
            </ProtectedRoute>
          } 
        />

        {/* Fallback - 404 or redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Root redirect logic
function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/home" replace />
  );
}
```

### **Local Storage & Session Persistence:**

```typescript
// context/AuthContext.tsx - Session management
import React, { createContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');

        if (token && userData) {
          // Validate token with backend
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const user = JSON.parse(userData);
            setUser(user);
            setIsAuthenticated(true);
          } else {
            // Token expired - clear storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Session restore failed:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const { token, user } = await response.json();
      
      // Store in localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Signup failed');

      const { token, user } = await response.json();
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## Frontend Routing Implementation

### **React Router Setup:**

```typescript
// App.tsx - Main routing configuration
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Auth Pages
import LoginPage from '@/screens/Screen12_Login';
import SignupPage from '@/screens/Screen13_Signup';

// Public Pages
import HomePage from '@/screens/Screen1_Home';
import PricingPage from '@/screens/Screen5_Pricing';

// Protected Pages
import DashboardPage from '@/screens/Screen2_Dashboard';
import QuizDetailPage from '@/screens/Screen4_QuizDetails';
import AddQuestionsPage from '@/screens/Screen6_AddQuestions';
import ReviewPublishPage from '@/screens/Screen7_ReviewPublish';
import QuizManagerPage from '@/screens/Screen8_QuizManager';
import ResultsPage from '@/screens/Screen9_Results';
import ProfilePage from '@/screens/Screen10_Profile';
import SettingsPage from '@/screens/Screen11_Settings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (Redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

export function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Initial Route - Redirect based on auth */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/home" />} 
        />

        {/* Public Routes */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        
        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quizzes" 
          element={
            <ProtectedRoute>
              <QuizManagerPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quiz/create" 
          element={
            <ProtectedRoute>
              <QuizDetailPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quiz/create/questions" 
          element={
            <ProtectedRoute>
              <AddQuestionsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quiz/create/review" 
          element={
            <ProtectedRoute>
              <ReviewPublishPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/results" 
          element={
            <ProtectedRoute>
              <ResultsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

### **Dynamic Navbar Component:**

```typescript
// components/layout/Navbar.tsx
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  if (isAuthenticated) {
    // AUTHENTICATED NAVBAR
    return (
      <header className="sticky top-0 z-50 bg-white border-b border-zinc-200">
        <div className="max-w-[1140px] mx-auto px-8 flex justify-between items-center h-16">
          {/* Left: Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <div className="size-8 rounded-lg bg-[#2b7fff] flex items-center justify-center">
              <Brain className="size-5 text-white" />
            </div>
            <span className="font-bold text-lg">QuizMind AI</span>
          </div>

          {/* Middle: Navigation */}
          <nav className="flex items-center gap-6">
            <a 
              onClick={() => navigate('/dashboard')}
              className="font-medium text-zinc-950 text-sm cursor-pointer hover:text-[#2b7fff]"
            >
              Dashboard
            </a>
            <a 
              onClick={() => navigate('/quizzes')}
              className="font-medium text-[#71717b] text-sm cursor-pointer hover:text-[#2b7fff]"
            >
              Quizzes
            </a>
            <a 
              onClick={() => navigate('/results')}
              className="font-medium text-[#71717b] text-sm cursor-pointer hover:text-[#2b7fff]"
            >
              Results
            </a>
            <a 
              onClick={() => navigate('/pricing')}
              className="font-medium text-[#71717b] text-sm cursor-pointer hover:text-[#2b7fff]"
            >
              Pricing
            </a>
          </nav>

          {/* Right: Notification & Profile */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative size-9 rounded-full text-[#71717b] hover:bg-zinc-100 flex items-center justify-center">
              <Bell className="size-5" />
              <span className="size-2 rounded-full bg-[#2b7fff] absolute right-2 top-2" />
            </button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-zinc-200 px-2 py-1 hover:bg-zinc-50">
                  <Avatar className="size-8">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-sm">{user?.name}</span>
                    <span className="text-[#71717b] text-xs">{user?.tier} member</span>
                  </div>
                  <ChevronDown className="size-4 text-[#71717b]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name}</span>
                    <span className="text-[#71717b] text-xs">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/pricing')}>
                  Billing
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    );
  } else {
    // NON-AUTHENTICATED NAVBAR
    return (
      <header className="border-b border-zinc-200">
        <div className="max-w-[1140px] mx-auto px-8 flex justify-between items-center h-16">
          {/* Left: Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/home')}
          >
            <div className="size-9 rounded-xl bg-[#2b7fff] flex items-center justify-center">
              <Brain className="size-5 text-white" />
            </div>
            <span className="font-bold text-lg">QuizMind AI</span>
          </div>

          {/* Middle: Navigation */}
          <nav className="flex items-center gap-8">
            <a 
              onClick={() => navigate('/home')}
              className="font-medium text-zinc-950 text-sm cursor-pointer border-b-2 border-[#2b7fff]"
            >
              Home
            </a>
            <a 
              onClick={() => navigate('/home')}
              className="font-medium text-[#71717b] text-sm cursor-pointer hover:text-[#2b7fff]"
            >
              Quizzes
            </a>
            <a 
              onClick={() => navigate('/home')}
              className="font-medium text-[#71717b] text-sm cursor-pointer hover:text-[#2b7fff]"
            >
              Results
            </a>
            <a 
              onClick={() => navigate('/pricing')}
              className="font-medium text-[#71717b] text-sm cursor-pointer hover:text-[#2b7fff]"
            >
              Pricing
            </a>
          </nav>

          {/* Right: Auth Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost"
              onClick={() => navigate('/login')}
            >
              Sign in
            </Button>
            <Button 
              className="bg-[#2b7fff] text-white"
              onClick={() => navigate('/signup')}
            >
              Get started
            </Button>
          </div>
        </div>
      </header>
    );
  }
}
```

---

### **Updated State Management:**

```typescript
// context/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  tier: 'Free' | 'Pro' | 'Premium';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check auth on mount (restore session)
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Validate token with backend
      validateToken(token)
        .then((user) => {
          setIsAuthenticated(true);
          setUser(user);
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
          setIsAuthenticated(false);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const { token, user } = await response.json();
      localStorage.setItem('auth_token', token);
      setIsAuthenticated(true);
      setUser(user);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const { token, user } = await response.json();
      localStorage.setItem('auth_token', token);
      setIsAuthenticated(true);
      setUser(user);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        signup,
        logout,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

## Navigation Flow

### **User Journey Map:**

**NEW USER JOURNEY:**
```
Visit Website (/) → Auto-redirect to /home
                ↓
        Screen1 (Home Page)
        Navbar: Home | Quizzes | Results | Pricing | [Sign in] [Get started]
                ↓
        Click "Get started" → /signup (Screen13)
                ↓
        Complete Registration
                ↓
        Auto-redirect to /dashboard (Screen2)
```

**EXISTING USER JOURNEY:**
```
Visit Website (/) → Auto-redirect to /dashboard
                ↓
        Screen2 (Dashboard)
        Navbar: Logo | Dashboard | Quizzes | Results | Pricing | [🔔 Notification] [Profile]
```

**COMPLETE NAVIGATION GRAPH:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    UNAUTHENTICATED FLOWS                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Screen1 (Home)  ────→  [Sign in button]  ────→  Screen12 (Login)      │
│  └────────────────────→  [Get started]    ────→  Screen13 (Signup)     │
│  └────────────────────→  [Pricing link]   ────→  Screen5 (Pricing)     │
│  └────────────────────→  [Pricing link]   ────→  Screen5 (Pricing)     │
│  └────────────────────→  [Quizzes link]   ────→  Screen1 (info only)   │
│  └────────────────────→  [Results link]   ────→  Screen1 (info only)   │
│                                                                          │
│  Screen5 (Pricing)  ────→  [Get started]  ────→  Screen13 (Signup)     │
│  └────────────────────→  [Sign in]        ────→  Screen12 (Login)      │
│  └────────────────────→  [Logo]           ────→  Screen1 (Home)        │
│                                                                          │
│  Screen12 (Login)   ────→  [Sign up link] ────→  Screen13 (Signup)     │
│  └────────────────────→  [Forgot pass?]   ────→  Reset Flow (Modal)    │
│  └────────────────────→  [Submit]         ────→  Screen2 (Dashboard)   │
│  └────────────────────→  [OAuth buttons]  ────→  Screen2 (Dashboard)   │
│  └────────────────────→  [Logo]           ────→  Screen1 (Home)        │
│                                                                          │
│  Screen13 (Signup)  ────→  [Sign in]      ────→  Screen12 (Login)      │
│  └────────────────────→  [Submit]         ────→  Screen2 (Dashboard)   │
│  └────────────────────→  [OAuth buttons]  ────→  Screen2 (Dashboard)   │
│  └────────────────────→  [Logo]           ────→  Screen1 (Home)        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATED FLOWS                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Screen2 (Dashboard) ────→ [Dashboard nav]  ────→ Screen2 (stays)       │
│  ├──────────────────────→ [Recent Quiz] click ─→ Screen3 (Quiz Dashboard)│
│  ├──────────────────────→ [Quizzes nav]    ────→ Screen8 (Manager)     │
│  ├──────────────────────→ [Results nav]    ────→ Screen9 (Results)     │
│  ├──────────────────────→ [Pricing nav]    ────→ Screen5 (Pricing)     │
│  ├──────────────────────→ [Notification 🔔] ────→ Notification Panel    │
│  ├──────────────────────→ [Profile avatar]  ────→ Profile Dropdown     │
│  └──────────────────────→ [Create Quiz CTA] ────→ Screen4 (Quiz Detail)│
│                                                                          │
│  QUIZ DETAIL:                                                           │
│  Screen3 (Quiz Dashboard) ─→ Specific quiz analytics & results         │
│  ├──────────────────────→ [Back] button     ────→ Screen2 (Dashboard)  │
│  ├──────────────────────→ [Download] button ────→ Export PDF/CSV       │
│  ├──────────────────────→ [Share] button    ────→ Share link           │
│  ├──────────────────────→ [Edit Quiz]       ────→ Screen4 (Quiz Detail)│
│  └──────────────────────→ [View All Results]────→ Screen9 (Results)    │
│                                                                          │
│  QUIZ CREATION FLOW:                                                   │
│  Screen4 (Quiz Info)  ────→ [Create button] ────→ Screen6 (Questions)  │
│  └──────────────────────→ [Draft save]      ────→ Screen8 (Manager)    │
│  └──────────────────────→ [Back button]     ────→ Screen2 (Dashboard)  │
│                                                                          │
│  Screen6 (Add Qs)     ────→ [Next button]   ────→ Screen7 (Review)     │
│  └──────────────────────→ [Save & exit]     ────→ Screen8 (Manager)    │
│  └──────────────────────→ [Back button]     ────→ Screen4 (Quiz Info)  │
│                                                                          │
│  Screen7 (Review)     ────→ [Publish button]────→ Screen8 (Manager)    │
│  └──────────────────────→ [Back button]     ────→ Screen6 (Questions)  │
│  └──────────────────────→ [Edit from here]  ────→ Screen6 (Questions)  │
│                                                                          │
│  Screen8 (Quiz Manager) ─→ [View quiz]     ────→ Screen3 (Quiz Dashboard) │
│  ├──────────────────────→ [Edit quiz]      ────→ Screen4 (Quiz Detail) │
│  ├──────────────────────→ [Delete quiz]    ────→ Screen8 (stays)       │
│  └──────────────────────→ [Quizzes nav]    ────→ Screen8 (stays)       │
│                                                                          │
│  Screen9 (Results)    ────→ [View detailed] ────→ Screen9 (stays)       │
│  ├──────────────────────→ [Export results] ────→ Download/share        │
│  ├──────────────────────→ [Results nav]    ────→ Screen9 (stays)       │
│  └──────────────────────→ [Dashboard nav]  ────→ Screen2 (Dashboard)   │
│                                                                          │
│  Screen10 (Profile)   ────→ [Edit info]    ────→ Screen10 (modal form) │
│  └──────────────────────→ [Change avatar]  ────→ Screen10 (upload)     │
│  └──────────────────────→ [Back/nav]       ────→ Screen2 (Dashboard)   │
│  └──────────────────────→ [Logout]         ────→ Screen1 (Home)        │
│                                                                          │
│  Screen11 (Settings)  ────→ [Toggle settings]   ────→ Screen11 (stays)  │
│  └──────────────────────→ [Save]           ────→ Screen11 (confirmation)│
│  └──────────────────────→ [Back/nav]       ────→ Screen2 (Dashboard)   │
│                                                                          │
│  Screen5 (Pricing)    ────→ [Upgrade button]    ────→ Payment modal     │
│  └──────────────────────→ [Back/nav]       ────→ Screen2 (Dashboard)   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### **Navbar Transformation Logic:**

```typescript
// Navigation state example
const navbarConfig = {
  unauthenticated: {
    left: ['Logo'],
    center: ['Home', 'Quizzes', 'Results', 'About'],
    right: ['Sign in', 'Get started'],
    routes: {
      Home: '/home',
      Quizzes: '/home#quizzes',
      Results: '/home#results',
      About: '/home#about',
      'Sign in': '/login',
      'Get started': '/signup'
    }
  },
  authenticated: {
    left: ['Logo'],
    center: ['Dashboard', 'Quizzes', 'Results', 'Pricing'],
    right: ['Notifications', 'Profile'],
    routes: {
      Dashboard: '/dashboard',
      Quizzes: '/quizzes',
      Results: '/results',
      Pricing: '/pricing',
      Notifications: '/dashboard#notifications',
      Profile: '/profile'
    }
  }
};
```

### **Protected Routes Implementation:**

All protected routes (Screens 2, 3, 4, 6, 7, 8, 9, 10, 11) should redirect to `/login` if `isAuthenticated === false`.

Public routes (Screens 1, 5, 12, 13) should redirect to `/dashboard` if `isAuthenticated === true`.

---

### **Optimization Strategies:**
1. **Code Splitting:** Lazy load screens by route
2. **Memoization:** Memo for expensive components, useMemo for data transformations
3. **Image Optimization:** Use next/image or similar for lazy loading
4. **Chart Performance:** Virtualize long tables/lists
5. **API Caching:** Cache quiz data, results, and analytics
6. **Bundle Optimization:** Tree-shake unused Lucide icons

### **Metrics to Track:**
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)

---

## Future Enhancements

### **Phase 2 Features:**
- Real-time collaborative quiz editing
- Mobile-responsive design
- Dark mode support
- Multilingual support
- Video question types
- Code-based questions
- Grade management for educators
- Student progress reports
- Parent dashboard
- Gamification (badges, leaderboards)
- Third-party integrations (Google Classroom, etc.)

### **Technical Improvements:**
- Unit tests for all components
- E2E tests with Cypress/Playwright
- Storybook for component documentation
- TypeScript strict mode
- Error boundary implementation
- Accessibility audit (WCAG 2.1)
- PWA capabilities
- Offline mode

---

## Deployment & DevOps

### **Build Process:**
```bash
npm run build      # Production build
npm run dev        # Development server
npm run test       # Unit tests
npm run lint       # ESLint
npm run typecheck  # TypeScript check
```

### **CI/CD Pipeline:**
- GitHub Actions for automated testing
- Pre-commit hooks (Husky + lint-staged)
- Deployment to Vercel/Netlify
- Staging environment for QA
- Production deployment with rollback capability

---

## File Structure Recommendation

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── screens/               # Screen components
│   │   ├── Screen1_Landing.tsx
│   │   ├── Screen2_Analytics.tsx
│   │   └── ...
│   └── layout/                # Layout components
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── Sidebar.tsx
│       └── Navigation.tsx
├── context/                   # React Context
│   ├── AuthContext.tsx
│   ├── QuizContext.tsx
│   └── UserContext.tsx
├── hooks/                     # Custom hooks
│   ├── useAuth.ts
│   ├── useQuiz.ts
│   └── useFetch.ts
├── services/                  # API services
│   ├── quizService.ts
│   ├── userService.ts
│   ├── analyticsService.ts
│   └── authService.ts
├── types/                     # TypeScript interfaces
│   ├── quiz.types.ts
│   ├── user.types.ts
│   ├── common.types.ts
│   └── api.types.ts
├── utils/                     # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   ├── helpers.ts
│   └── constants.ts
├── styles/                    # Global styles
│   ├── globals.css
│   ├── tailwind.config.js
│   └── theme.css
├── App.tsx                    # Main app component
└── main.tsx                   # Entry point
```

---

## Summary

**QuizMind AI** is a comprehensive, well-designed quiz management and assessment platform with:
- ✅ Professional authentication system (Login & Registration screens)
- ✅ Clean, modern UI using Tailwind CSS with gradient backgrounds
- ✅ Reusable component architecture with shadcn/ui
- ✅ Multi-step quiz creation workflow
- ✅ Rich analytics and visualization
- ✅ User management and authentication flows
- ✅ OAuth integration (Google, GitHub)
- ✅ Pricing tier management
- ✅ Scalable, maintainable structure

The authentication system features a split-screen design with branding on the left and form inputs on the right, providing both a professional appearance and intuitive user experience. The platform now has **13 comprehensive screens** covering the complete user lifecycle from onboarding to advanced analytics.

---

**Last Updated:** 2025
**Version:** 1.1
**Total Screens:** 13
**Technology Stack:** React + TypeScript + Tailwind CSS + Recharts + Lucide Icons
