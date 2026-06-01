# 🎯 Screen4 - Discover Quizzes (Actual Design Reference)

## What is Screen4?

**Screen4** is the **Quiz Discovery Hub** - where authenticated users browse, search, and join public quizzes. It shows live quizzes, asynchronous quizzes, upcoming quizzes, and allows joining private quizzes with a code.

---

## Actual Layout from Screen4.tsx

```
┌─────────────────────────────────────────────────────────────┐
│ STICKY HEADER (h-16)                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Logo: BrainCircuit QuizMind AI                         │ │
│ │ Nav: Dashboard | Quizzes* | Results | About            │ │
│ │                                    🔔 [👤 Name ▼]      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ MAIN CONTENT (max-w-[1140px] mx-auto px-6 py-12)          │
│                                                             │
│ HEADER SECTION                                              │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Badge: ✨ Browse all quizzes                           ││
│ │ Title: "Discover Quizzes"                              ││
│ │ Subtitle: "Explore public quizzes that are live now,   ││
│ │           available anytime, or coming soon..."        ││
│ │                            [🔍 Search quizzes...] (w-72)││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ MAIN GRID (grid-cols-3 gap-8, items-start)                │
│ ┌────────────────────────────┬─────────────────────────────┐│
│ │ MAIN (col-span-2)          │ SIDEBAR (col-span-1)        ││
│ │                            │                             ││
│ │ SECTION 1: Live Quizzes    │ SIDEBAR 1:                  ││
│ │ ─────────────────────      │ Join Private Quiz Card      ││
│ │ Header:                    │ ┌──────────────────────────┐││
│ │ ├─ 🔴 Pulse + Ping        │ │ bg-[#2b7fff]/5          │││
│ │ ├─ "Live Quizzes"          │ │ border-[#2b7fff]/30     │││
│ │ │ (font-semibold text-lg)   │ │                         │││
│ │ ├─ Badge: "3 active"       │ │ Icon: 🔒 Lock          │││
│ │ │ (bg-[#e7000b]/10)         │ │ Title: Join Private     │││
│ │ └─ [View all →]            │ │ Quiz                    │││
│ │                            │ │                         │││
│ │ Cards (grid-cols-3 gap-4): │ │ Form:                   │││
│ │ ┌──┬──┬──┐                 │ │ - Quiz Code [Input]     │││
│ │ │P1│P2│P3│                 │ │ - Password [Input]      │││
│ │ │ ⚡ │ ⚡ │ ⚡ │                 │ │ [Join private quiz]     │││
│ │ └──┴──┴──┘                 │ │ 🔒 Secure & encrypted   │││
│ │                            │ └──────────────────────────┘││
│ │ SECTION 2: Async Quizzes   │                             ││
│ │ ─────────────────────────  │ SIDEBAR 2:                  ││
│ │ Header:                    │ Quiz Stats Card             ││
│ │ ├─ ∞ Infinity icon        │ ┌──────────────────────────┐││
│ │ ├─ "Asynchronous Quizzes"  │ │ Title: Quiz Stats       │││
│ │ ├─ Badge: "Anytime"        │ │ Subtitle: Across today  │││
│ │ ├─ Subtitle: "Live sessions│ │                         │││
│ │ │ ended but these quizzes..." │ │ 🔴 Live now: 12     │││
│ │ └─ [View all →]            │ │ ∞ Available: 248        │││
│ │                            │ │ 📅 Upcoming: 34         │││
│ │ Cards (grid-cols-3 gap-4): │ └──────────────────────────┘││
│ │ ┌──┬──┬──┐                 │                             ││
│ │ │A1│A2│A3│                 │ SIDEBAR 3:                  ││
│ │ │ ▶ │ ▶ │ ▶ │                 │ Create Your Own Card        ││
│ │ └──┴──┴──┘                 │ ┌──────────────────────────┐││
│ │                            │ │ Icon: 🪄 Wand2          │││
│ │ SECTION 3: Upcoming        │ │ Title: Create your own  │││
│ │ ─────────────────────────  │ │ Description: Turn any   │││
│ │ Header:                    │ │ topic into a quiz...    │││
│ │ ├─ 📅 CalendarClock       │ │ [+ Create quiz] (outline)│││
│ │ ├─ "Upcoming Quizzes"      │ └──────────────────────────┘││
│ │ ├─ Badge: "Scheduled"      │                             ││
│ │ └─ [View all →]            │                             ││
│ │                            │                             ││
│ │ Cards (grid-cols-3 gap-4): │                             ││
│ │ ┌──┬──┬──┐                 │                             ││
│ │ │U1│U2│U3│                 │                             ││
│ │ │🔔 │ 🔔 │ 🔔 │                 │                             ││
│ │ └──┴──┴──┘                 │                             ││
│ │                            │                             ││
│ └────────────────────────────┴─────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FOOTER                                                      │
│ Logo © 2025 QuizMind. All rights reserved.                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Main Components (7 Sections)

| # | Component | Location | Type |
|----|-----------|----------|------|
| 1 | Header & Search | Top | Section |
| 2 | Live Quizzes | Main col-span-2 | Cards Grid |
| 3 | Async Quizzes | Main col-span-2 | Cards Grid |
| 4 | Upcoming Quizzes | Main col-span-2 | Cards Grid |
| 5 | Private Quiz Form | Sidebar | Card |
| 6 | Quiz Stats | Sidebar | Card |
| 7 | Create Your Own | Sidebar | Card |

---

## Component Details

### **1. Header Section**
```
Layout: flex justify-between items-end gap-6

Left Side (flex flex-col gap-3):
├─ Badge (variant="secondary", rounded-full)
│  ├─ Icon: Sparkles (size-3.5 text-[#2b7fff])
│  └─ Text: "Browse all quizzes"
├─ Title: "Discover Quizzes"
│  └─ font-bold text-3xl leading-9 tracking-tight
└─ Subtitle (max-w-xl):
   ├─ text-[#71717b] text-sm leading-5
   └─ "Explore public quizzes that are live now, 
      available anytime, or coming soon. Or join 
      a private quiz with a code."

Right Side (relative w-72):
└─ Search Input (with Search icon on left)
   ├─ Icon: Search (size-4 left-3)
   ├─ Placeholder: "Search quizzes..."
   └─ h-10
```

### **2. Live Quizzes Section**
```
Location: Main content col-span-2
Type: 3-column grid of cards

Header (flex justify-between items-center):
├─ Left:
│  ├─ Animated Pulse Indicator:
│  │  ├─ Inner: animate-ping + opacity-75
│  │  └─ Outer: relative size-2.5 bg-[#e7000b]
│  ├─ Title: "Live Quizzes" (font-semibold text-lg)
│  └─ Badge (rounded-full bg-[#e7000b]/10 text-[#e7000b])
│     └─ "3 active"
└─ Right: "View all →" link

Cards (grid-cols-3 gap-4, p-5 gap-4):

Card Structure:
├─ CardHeader (p-0 gap-0)
│  ├─ Icon box (size-10 rounded-lg bg-zinc-100)
│  │  └─ Category icon (size-5 text-[#2b7fff])
│  └─ Live badge (rounded-full bg-[#e7000b]/10)
│     ├─ Pulse dot (size-1.5 bg-[#e7000b] mr-1)
│     └─ "Live"
├─ CardContent (p-0 gap-2)
│  ├─ Quiz name (font-semibold)
│  ├─ Subject · Questions (text-xs gray)
│  └─ Stats (flex gap-4):
│     ├─ Users icon + count
│     └─ Clock icon + "Ends Xm"
└─ CardFooter (p-0)
   └─ [⚡ Join now] button (full width, primary blue)

Example Cards:
1. Physics Speed Round (Atom icon)
   - Science · 15 questions
   - 214 participants | Ends 12m

2. World History Sprint (Landmark icon)
   - History · 20 questions
   - 168 participants | Ends 25m

3. JavaScript Blitz (Code2 icon)
   - Coding · 12 questions
   - 302 participants | Ends 8m
```

### **3. Asynchronous Quizzes Section**
```
Location: Main content col-span-2
Type: 3-column grid of cards

Header (flex justify-between items-center):
├─ Left:
│  ├─ Icon: Infinity (size-5 text-[#2b7fff])
│  ├─ Title: "Asynchronous Quizzes" (font-semibold text-lg)
│  └─ Badge (rounded-full bg-zinc-100 text-zinc-900)
│     └─ "Anytime"
└─ Right: "View all →" link

Subtitle (text-xs gray -mt-2):
"Live sessions ended but these quizzes are still open to 
 take on your own time."

Cards (grid-cols-3 gap-4, p-5 gap-4):

Card Structure:
├─ CardHeader (p-0 gap-0)
│  ├─ Icon box (size-10 rounded-lg bg-zinc-100)
│  │  └─ Category icon (size-5 text-[#2b7fff])
│  └─ Open badge (variant="outline", rounded-full)
├─ CardContent (p-0 gap-2)
│  ├─ Quiz name (font-semibold)
│  ├─ Subject · Questions (text-xs gray)
│  └─ Stats (flex gap-4):
│     ├─ Users icon + count
│     └─ Target icon + "XX%"
└─ CardFooter (p-0)
   └─ [▶ Take quiz] button (outline variant, full width)

Example Cards:
1. Cell Biology Basics (Microscope icon)
   - Science · 20 questions
   - 348 participants | 84% average

2. Algebra Essentials (Sigma icon)
   - Math · 18 questions
   - 275 participants | 79% average

3. World War II Overview (Globe2 icon)
   - History · 25 questions
   - 412 participants | 81% average
```

### **4. Upcoming Quizzes Section**
```
Location: Main content col-span-2
Type: 3-column grid of cards

Header (flex justify-between items-center):
├─ Left:
│  ├─ Icon: CalendarClock (size-5 text-[#2b7fff])
│  ├─ Title: "Upcoming Quizzes" (font-semibold text-lg)
│  └─ Badge (rounded-full bg-zinc-100 text-zinc-900)
│     └─ "Scheduled"
└─ Right: "View all →" link

Cards (grid-cols-3 gap-4, p-5 gap-4):

Card Structure:
├─ CardHeader (p-0 gap-0)
│  ├─ Icon box (size-10 rounded-lg bg-zinc-100)
│  │  └─ Category icon (size-5 text-[#2b7fff])
│  └─ Soon badge (rounded-full bg-[#2b7fff]/10 text-[#2b7fff])
│     ├─ Clock icon (size-3 mr-1)
│     └─ "Soon"
├─ CardContent (p-0 gap-2)
│  ├─ Quiz name (font-semibold)
│  ├─ Subject · Questions (text-xs gray)
│  └─ Scheduled date (flex gap-1):
│     ├─ Calendar icon (size-3.5)
│     └─ "Mon DD, H:MM PM"
└─ CardFooter (p-0)
   └─ [🔔 Remind me] button (outline variant, full width)

Example Cards:
1. Organic Chemistry (FlaskConical icon)
   - Science · 22 questions
   - Jul 2, 3:00 PM

2. Calculus Challenge (Calculator icon)
   - Math · 16 questions
   - Jul 4, 6:30 PM

3. Python Fundamentals (Cpu icon)
   - Coding · 14 questions
   - Jul 6, 5:00 PM
```

### **5. Private Quiz Card** (Right Sidebar)
```
Location: Sidebar col-span-1
Type: Single highlighted card

Card Structure (p-6 gap-5):
├─ Background: bg-[#2b7fff]/5
├─ Border: border-[#2b7fff]/30 border-0 border-solid
├─ CardHeader (p-0 gap-2)
│  ├─ Icon box (size-11 rounded-xl bg-[#2b7fff])
│  │  └─ Lock icon (size-5 text-blue-50)
│  ├─ Title: "Join a Private Quiz" (font-semibold text-lg)
│  └─ Description (text-[#71717b] text-sm):
│     "Got an invite? Enter the access code and 
│      password shared by your host."
├─ CardContent (p-0 gap-4)
│  ├─ Quiz Code Field:
│  │  ├─ Label (font-medium text-sm flex gap-1.5):
│  │  │  ├─ Hash icon (size-3.5 text-[#71717b])
│  │  │  └─ "Quiz Code"
│  │  └─ Input:
│  │     ├─ bg-white h-11
│  │     ├─ tracking-widest
│  │     └─ Placeholder: "e.g. QZ-8X4K2"
│  └─ Password Field:
│     ├─ Label (font-medium text-sm flex gap-1.5):
│     │  ├─ KeyRound icon (size-3.5 text-[#71717b])
│     │  └─ "Password"
│     └─ Input:
│        ├─ type="password" bg-white h-11
│        └─ Placeholder: "Enter quiz password"
├─ CardFooter (p-0 flex-col gap-3)
│  ├─ Button (bg-[#2b7fff] text-blue-50 w-full):
│  │  ├─ LogIn icon (size-4)
│  │  └─ "Join private quiz"
│  └─ Security note (text-xs gray flex gap-1.5):
│     ├─ ShieldCheck icon (size-3.5)
│     └─ "Your access is secure and encrypted"
```

### **6. Quiz Stats Card** (Right Sidebar)
```
Location: Sidebar col-span-1
Type: Statistics card

Card Structure (p-6 gap-4):
├─ CardHeader (p-0 gap-1)
│  ├─ Title: "Quiz Stats" (font-semibold text-base)
│  └─ Subtitle: "Across the platform today" (text-xs gray)
└─ CardContent (p-0 gap-4)
   ├─ Stat 1 (flex justify-between items-center):
   │  ├─ Left:
   │  │  ├─ Radio icon (size-4 text-[#e7000b])
   │  │  └─ "Live now" (text-sm gray)
   │  └─ Right: "12" (font-semibold)
   ├─ Divider (bg-zinc-200 h-px)
   ├─ Stat 2 (flex justify-between items-center):
   │  ├─ Left:
   │  │  ├─ Infinity icon (size-4 text-[#2b7fff])
   │  │  └─ "Available anytime" (text-sm gray)
   │  └─ Right: "248" (font-semibold)
   ├─ Divider (bg-zinc-200 h-px)
   └─ Stat 3 (flex justify-between items-center):
      ├─ Left:
      │  ├─ CalendarClock icon (size-4 text-[#2b7fff])
      │  └─ "Upcoming" (text-sm gray)
      └─ Right: "34" (font-semibold)
```

### **7. Create Your Own Card** (Right Sidebar)
```
Location: Sidebar col-span-1
Type: CTA card

Card Structure (p-6 gap-3):
├─ CardHeader (p-0 gap-2)
│  ├─ Icon box (size-10 rounded-lg bg-zinc-100)
│  │  └─ Wand2 icon (size-5 text-[#2b7fff])
│  ├─ Title: "Create your own" (font-semibold text-base)
│  └─ Description (text-[#71717b] text-sm):
│     "Turn any topic into a quiz and host it 
│      live or share privately."
└─ CardFooter (p-0)
   └─ Button (variant="outline" w-full):
      ├─ Plus icon (size-4)
      └─ "Create quiz"
```

---

## Design System (From Screen4.tsx)

**Colors:**
```
Primary: #2b7fff (blue)
Live: #e7000b (red)
Gray: #71717b
Gray Light: zinc-100, zinc-200
Background: white
Blue Light: blue-50
```

**Typography:**
```
Page Title: font-bold text-3xl leading-9
Section Title: font-semibold text-lg leading-7
Card Title: font-semibold
Label: font-medium text-sm
Description: text-sm text-[#71717b]
Stats: text-xs text-[#71717b]
```

**Spacing:**
```
Container: max-w-[1140px] mx-auto px-6 py-12
Grid Gap: gap-8 (main) | gap-6 (sidebar) | gap-4 (cards)
Card Padding: p-5 or p-6
Section Gap: flex flex-col gap-4
```

**Components:**
```
Cards: Card (CardHeader, CardContent, CardFooter)
Buttons: Button (primary, outline, ghost variants)
Badge: Badge (4 variants used)
Input: Input (basic, with icon)
Icons: lucide-react (40+ icons)
```

---

## Interactions & Navigation

**From Screen4, Can Go To:**

```
Search Box:
└─ Filter/search quizzes

Live Quiz Cards:
├─ [⚡ Join now] → Start live quiz immediately
└─ Card click → View quiz details

Async Quiz Cards:
├─ [▶ Take quiz] → Start quiz-taking page
└─ Card click → View quiz details

Upcoming Quiz Cards:
├─ [🔔 Remind me] → Set notification
└─ Card click → View quiz details

Private Quiz Form:
└─ [Join private quiz] → Validate code + password, then join

Sidebar Buttons:
├─ [Create quiz] → Quiz creation form (Screen 4 variant)
└─ Stats → View all quizzes page

Navbar Links:
├─ Dashboard → Screen2
├─ Results → Screen9
└─ About → About section or Screen5
```

---

## Data Structure

**Quiz Card Data:**
```
{
  id: string,
  name: string,
  subject: string,
  icon: LucideIcon,
  category: 'live' | 'async' | 'upcoming',
  questions: number,
  participants: number,
  averageScore?: number,  // async only
  timeEnding?: string,    // live only (e.g., "Ends 12m")
  scheduledDate?: string, // upcoming only
  badges?: {
    type: 'live' | 'open' | 'soon',
    label: string
  }
}
```

**Form Fields:**
```
{
  quizCode: string,    // format: XX-XXXXX
  password: string
}
```

**Stats:**
```
{
  liveNow: 12,
  availableAnytime: 248,
  upcoming: 34
}
```

---

## Summary

**Screen4 - Discover Quizzes:**
- ✅ Main quiz discovery hub
- ✅ 3 public quiz sections (live, async, upcoming)
- ✅ Search functionality
- ✅ Private quiz join flow
- ✅ Platform statistics
- ✅ Quick creation CTA
- ✅ Responsive grid layout
- ✅ Live status indicators
- ✅ Multiple join methods

**Key Features:**
🔴 Real-time live quizzes with countdown  
∞ Asynchronous quizzes (anytime)  
📅 Scheduled upcoming quizzes  
🔒 Private quiz access with code  
📊 Platform statistics  
🎯 Quick quiz creation  
🔍 Search and filter  
🎨 Clean, organized card-based UI  

**It's the primary discovery and participation page!** 🚀
