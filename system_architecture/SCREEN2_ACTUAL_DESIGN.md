# 📊 Screen2 Dashboard - Actual Design Reference

## What is Screen2?

**Screen2** is the **Main User Dashboard** - the first page authenticated users see after login. It's the central hub showing activity, performance, and personalized AI insights.

---

## Actual Layout from Screen2.tsx

```
┌─────────────────────────────────────────────────────────────┐
│ STICKY HEADER (h-16)                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Logo: 🧠 QuizMind AI                                   │ │
│ │ Nav: Dashboard* | Quizzes | Results | About            │ │
│ │                                    🔔 [👤 Name ▼]      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ MAIN CONTENT (max-w-[1140px] mx-auto px-6 py-12)          │
│                                                             │
│ SECTION 1: Welcome Header                                  │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ ⭐ 16-day learning streak                              ││
│ │ Welcome back, Alex                                      ││
│ │ Here's an overview of your learning activity...        ││
│ │                                [Export] [+ Create quiz] ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ SECTION 2: 4 Stats Cards (grid-cols-4 gap-6)             │
│ ┌───────────┬───────────┬───────────┬───────────┐        │
│ │ 📝        │ 👥        │ 🎯        │ 🔥        │        │
│ │ Quizzes   │ Quizzes   │ Avg.      │ Day       │        │
│ │ Created   │ Joined    │ Score     │ Streak    │        │
│ │ 42 +8%    │ 128 +24%  │ 87% +5%   │ 16 +2     │        │
│ └───────────┴───────────┴───────────┴───────────┘        │
│                                                             │
│ SECTION 3 & 4: Charts (grid-cols-3 gap-6)                │
│ ┌────────────────────────┬──────────────────────┐        │
│ │ QUIZ ACTIVITY          │ CATEGORY BREAKDOWN   │        │
│ │ (col-span-2)           │                      │        │
│ │                        │                      │        │
│ │ Area Chart             │ Donut Chart          │        │
│ │ Created vs Joined      │ Science 38%          │        │
│ │ (6 months)             │ History 24%          │        │
│ │                        │ Math 22%             │        │
│ │ height: h-64           │ Coding 16%           │        │
│ │                        │ height: h-40         │        │
│ └────────────────────────┴──────────────────────┘        │
│                                                             │
│ SECTION 5 & 6: Recent Quizzes & Goals (grid-cols-3)     │
│ ┌────────────────────────┬──────────────────────┐        │
│ │ RECENT QUIZZES         │ GOALS PROGRESS       │        │
│ │ (col-span-2)           │                      │        │
│ │                        │ Create 12: 11/12 92% │        │
│ │ Table:                 │ [████████████░]      │        │
│ │ Quiz | Type | Score    │                      │        │
│ │ ├─ 🧬 Cell Biology     │ Join 30: 25/30 83%   │        │
│ │ ├─ 🏛️ World War II    │ [███████████░░░]     │        │
│ │ ├─ 💻 JavaScript       │                      │        │
│ │ └─ ∑ Algebra           │ 20-day: 16/20 80%    │        │
│ │                        │ [████████████░░]     │        │
│ │ [View all →]           │                      │        │
│ └────────────────────────┴──────────────────────┘        │
│                          ┌──────────────────────┐        │
│                          │ AI INSIGHTS (Card)   │        │
│                          │ Generate with AI     │        │
│                          │ Turn topics to quiz  │        │
│                          │ [✨ Create quiz]     │        │
│                          └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FOOTER                                                      │
│ Logo © 2025 QuizMind. All rights reserved.                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 8 Main Components

| # | Component | Location | Type |
|----|-----------|----------|------|
| 1 | Welcome Section | Top | Header |
| 2 | 4 Stats Cards | grid-cols-4 | Metrics |
| 3 | Quiz Activity Chart | grid-cols-3 col-span-2 | AreaChart |
| 4 | Category Breakdown | grid-cols-3 | PieChart |
| 5 | Recent Quizzes | grid-cols-3 col-span-2 | Table |
| 6 | Goals Progress | grid-cols-3 | Card |
| 7 | Generate with AI | grid-cols-3 | Highlighted |
| 8 | Sticky Header | Sticky Top | Nav |

---

## Component Details

### **1. Welcome Section**
```
Location: Top of page (gap-3 flex flex-col)

Badge: 
├─ Icon: ⭐ Sparkles
└─ Text: "16-day learning streak"

Title: "Welcome back, Alex"
(blue accent on name: text-[#2b7fff])

Subtitle: "Here's an overview of your learning activity, 
          performance, and progress across all your quizzes."

Actions:
├─ [Export] - variant="outline" 
└─ [+ Create quiz] - bg-[#2b7fff] text-blue-50
```

### **2. Four Stats Cards** (grid-cols-4)
```
Layout: grid grid-cols-4 gap-6

Card Structure (p-6 gap-4):
├─ CardHeader (p-0 flex justify-between)
│  ├─ Icon box (size-10 rounded-lg bg-zinc-100 text-[#2b7fff])
│  └─ Trend badge (TrendingUp + percentage)
├─ CardContent (p-0 flex flex-col gap-1)
│  ├─ Large number (font-bold text-3xl)
│  └─ Label (text-[#71717b] text-sm)

Card 1: Quizzes Created
├─ Icon: PencilRuler
├─ Value: 42
└─ Trend: +8%

Card 2: Quizzes Joined
├─ Icon: Users
├─ Value: 128
└─ Trend: +24%

Card 3: Avg. Score
├─ Icon: Target
├─ Value: 87%
└─ Trend: +5%

Card 4: Day Streak
├─ Icon: Flame
├─ Value: 16
└─ Trend: +2
```

### **3. Quiz Activity Chart**
```
Location: grid-cols-3, col-span-2
Type: AreaChart from Recharts

Card Structure:
├─ CardHeader (p-0 justify-between)
│  ├─ Title: "Quiz Activity"
│  ├─ Subtitle: "Created vs joined over the last 6 months"
│  └─ Legend: 
│     ├─ 🔵 Created
│     └─ ⚫ Joined
├─ CardContent (p-0)
│  └─ ChartContainer (h-64)
│     ├─ AreaChart (data: 6 months Jan-Jun)
│     ├─ Area 1: created (blue #2b7fff, opacity gradient)
│     ├─ Area 2: joined (gray #71717b, opacity gradient)
│     ├─ CartesianGrid (vertical: false)
│     ├─ XAxis (tickLine: false, axisLine: false)
│     └─ YAxis

Data Example:
├─ Jan: created 5, joined 14
├─ Feb: created 7, joined 18
├─ Mar: created 6, joined 22
├─ Apr: created 9, joined 28
├─ May: created 8, joined 21
└─ Jun: created 11, joined 25
```

### **4. Category Breakdown Chart**
```
Location: grid-cols-3, single column (right)
Type: PieChart (Donut) from Recharts

Card Structure:
├─ CardHeader (p-0)
│  ├─ Title: "Category Breakdown"
│  └─ Subtitle: "By quiz subject area"
├─ CardContent (p-0 flex flex-col items-center gap-4)
│  ├─ ChartContainer (h-40)
│  │  └─ PieChart
│  │     ├─ Pie (innerRadius: 42, outerRadius: 64)
│  │     └─ Data: 4 categories
│  └─ Legend (grid-cols-2 gap-2)

Data:
├─ Science: 38% (Orange: oklch(0.646 0.222 41.116))
├─ History: 24% (Blue: oklch(0.6 0.118 184.704))
├─ Math: 22% (Purple: oklch(0.398 0.07 227.392))
└─ Coding: 16% (Yellow: oklch(0.828 0.189 84.429))

Legend Below:
├─ 🟠 Science 38%
├─ 🔵 History 24%
├─ 🟣 Math 22%
└─ 🟡 Coding 16%
```

### **5. Recent Quizzes Table**
```
Location: grid-cols-3, col-span-2
Type: Table Component

Card Structure:
├─ CardHeader (p-0 justify-between)
│  ├─ Title: "Recent Quizzes"
│  ├─ Subtitle: "Your latest created and joined activity"
│  └─ [View all →] button
├─ CardContent (p-0)
│  └─ Table

Columns:
├─ Quiz (name with icon)
├─ Type (Created/Joined badge)
├─ Score (bold blue text-[#2b7fff])
└─ Date (gray text-[#71717b])

Rows (4 examples):
├─ Row 1: 🧬 Cell Biology | Created | 92% | Jun 18
├─ Row 2: 🏛️ World War II | Joined | 85% | Jun 16
├─ Row 3: 💻 JavaScript | Created | 78% | Jun 14
└─ Row 4: ∑ Algebra | Joined | 90% | Jun 12

Icons:
├─ Science: Atom
├─ History: Landmark
├─ Coding: Code
└─ Math: Sigma
```

### **6. Goals Progress Card**
```
Location: grid-cols-3, single column (right)
Type: Progress Card

Card Structure (p-6 gap-4):
├─ CardHeader (p-0)
│  ├─ Title: "Goals Progress"
│  └─ Subtitle: "Monthly targets"
├─ CardContent (p-0 flex flex-col gap-4)
│  └─ 3 Goal Items

Goal Item Structure:
├─ Label row (justify-between)
│  ├─ Goal text (font-medium)
│  └─ Progress counter (text-[#71717b])
├─ Progress bar (h-2)

Goals:
├─ Create 12 quizzes
│  ├─ Progress: 11/12
│  └─ Value: 92%
├─ Join 30 quizzes
│  ├─ Progress: 25/30
│  └─ Value: 83%
└─ 20-day streak
   ├─ Progress: 16/20
   └─ Value: 80%
```

### **7. AI Insights Card (Generate with AI)**
```
Location: grid-cols-3, single column (right)
Type: Highlighted CTA Card

Card Structure:
├─ Background: bg-[#2b7fff]/5 (5% opacity)
├─ Border: border-[#2b7fff]/20 (20% opacity)
├─ CardHeader (p-0 gap-2)
│  ├─ Icon box (size-10 rounded-lg bg-[#2b7fff])
│  │  └─ Icon: Wand2 (size-5 text-blue-50)
│  └─ Title: "Generate with AI" (text-base)
├─ CardContent (p-0)
│  └─ Description: "Turn any topic into a tailored quiz 
│     with explanations in seconds."
├─ CardFooter (p-0)
│  └─ [✨ Create quiz] button (full width)

Features:
- Highlighted color scheme
- Prominent call-to-action
- Encourages AI quiz generation
```

### **8. Sticky Header**
```
Position: sticky top-0 z-50
Height: h-16
Border: border-b-1 border-zinc-200

Container: max-w-[1140px] mx-auto px-6 flex justify-between

Left Section:
├─ Logo box (size-9 rounded-lg bg-[#2b7fff])
│  └─ Icon: Brain (size-5 text-blue-50)
├─ Text: "QuizMind AI" (font-bold text-lg)
├─ Nav (flex gap-6)
│  ├─ Dashboard (active - border-b-2 border-[#2b7fff])
│  │  └─ Icon: LayoutDashboard
│  ├─ Quizzes
│  │  └─ Icon: Brain
│  ├─ Results
│  │  └─ Icon: BarChart3
│  └─ About
│     └─ Icon: Info

Right Section:
├─ Bell Button (variant="ghost" size="icon")
│  └─ Dot indicator (size-2 bg-[#2b7fff] top-2 right-2)
├─ User Profile Card
│  ├─ Avatar (size-8)
│  ├─ Name: "Alex Morgan" (font-medium)
│  ├─ Status: "Pro member" (text-[#71717b])
│  └─ ChevronDown
```

---

## Design System (From Screen2.tsx)

**Colors:**
- Primary Blue: #2b7fff
- Gray Text: #71717b
- Gray Light: zinc-100
- Border: zinc-200
- Background: white
- Blue Light: blue-50

**Typography:**
```
Main Title: font-bold text-4xl leading-10
Section Title: font-bold text-lg leading-7 (CardTitle)
Card Label: text-sm leading-5 text-[#71717b]
Large Number: font-bold text-3xl leading-9
Bold Text: font-medium
```

**Spacing:**
```
Main Container: max-w-[1140px] mx-auto px-6 py-12
Sections Gap: gap-12
Card Gap: gap-6
Card Padding: p-6
Card Internal Gap: gap-4
Header/Footer: h-16 px-6
```

**Components Used:**
- Card (CardHeader, CardContent, CardFooter)
- Button (variant: outline, ghost, primary)
- Badge (variant: secondary)
- Avatar (AvatarImage, AvatarFallback)
- Progress (h-2)
- Table (TableHeader, TableRow, TableCell, etc)
- AreaChart (Recharts)
- PieChart (Recharts)

**Icon System:**
From lucide-react:
```
- Brain (Logo)
- LayoutDashboard (Nav)
- Bell (Notifications)
- ChevronDown (Dropdown)
- PencilRuler (Quizzes Created)
- Users (Quizzes Joined)
- Target (Avg Score)
- Flame (Day Streak)
- Download (Export)
- Plus (Create)
- TrendingUp (Trend badge)
- ArrowRight (View all)
- Atom (Biology)
- Landmark (History)
- Code (Programming)
- Sigma (Math)
- Wand2 (AI)
- Sparkles (AI/Magic)
```

---

## Navigation from Screen2

**Navbar Links:**
- Dashboard → Screen2 (stays, underlined)
- Quizzes → Screen8 (Quiz Manager)
- Results → Screen9 (Results & Analytics)
- About → Scroll section or Screen5
- 🔔 Bell → Notifications panel
- Profile dropdown → Screen10 (Profile)
- Logout → Screen1 (Home)

**Interactive Elements:**
- [Export] → Download user data
- [+ Create quiz] → Screen4 (Quiz Details)
- [View all] (Recent Quizzes) → Screen8
- Recent quiz rows → Screen3 (Quiz Dashboard)
- Goals → Can be clicked for details
- [✨ Create quiz] → Screen4 (AI generator)

---

## Data Flow

**Source:** Backend API (mocked in component)
```
GET /api/dashboard
{
  user: { name, avatar, tier },
  stats: { created, joined, avgScore, streak },
  charts: {
    activity: [{ month, created, joined }],
    categories: [{ name, value, fill }]
  },
  recentQuizzes: [{ name, type, score, date, icon }],
  goals: [{ label, current, total, progress }]
}
```

---

## Summary

**Screen2 Dashboard:**
- ✅ Central hub for authenticated users
- ✅ 7 information sections + 1 header
- ✅ 4 stats cards with trends
- ✅ 2 interactive charts (area + pie)
- ✅ Recent activity table
- ✅ Goals progress tracking
- ✅ AI insights call-to-action
- ✅ Responsive 1140px max-width layout
- ✅ Consistent color scheme (#2b7fff primary)
- ✅ Professional dashboard design

**Key Features:**
🎯 Metrics-focused overview
📊 Visual data representation
🎮 Gamification (goals, streaks)
🤖 AI emphasis
📱 Responsive design
♿ Accessible components

It's the main landing page after authentication! 🚀
