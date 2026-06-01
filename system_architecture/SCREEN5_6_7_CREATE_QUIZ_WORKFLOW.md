# 🎯 Screens 5-7: Create Quiz Workflow (3-Step Process)

## What is This?

**Screens 5, 6, 7 are NOT separate pages** - they are **3 connected slides/steps of a single "Create Quiz" workflow**. Users move through a guided wizard: **Details → Questions → Review & Publish**.

---

## Workflow Overview

```
START: Click [Create Quiz] button
  ↓
STEP 1: Screen5 - Quiz Details
├─ Enter quiz name, description
├─ Select category, difficulty, duration
├─ Choose type (public/private)
├─ [Next: Add Questions] button
  ↓
STEP 2: Screen6 - Add Questions
├─ AI generate questions OR add manually
├─ Edit question type, text, options
├─ Set difficulty and explanation
├─ [Back] or [Next: Review & Publish] button
  ↓
STEP 3: Screen7 - Review & Publish
├─ Review all questions
├─ See quiz summary (sticky card)
├─ [Publish Quiz] button
  ↓
END: Quiz published, available to join
```

---

## Shared Elements Across All 3 Screens

### **Sticky Header (All 3 screens)**
```
┌─────────────────────────────────────────────┐
│ Logo: Brain QuizMind AI                    │
│ Nav: Dashboard | Quizzes* | Results | About│
│                          🔔  [👤 Alex ▼]  │
└─────────────────────────────────────────────┘
```

### **Progress Indicator (Step Bar)**

**Screen 5 Style (Horizontal Step Bar in separate section):**
```
┌──────────────────────────────────────────────────────┐
│ [1 Quiz Details] ═══ [2 Add Questions] ═══ [3 ...]  │
│ (Blue circle)        (Empty circle)        (Empty)   │
│ Step 1 of 3          Step 2 of 3           Step 3 of 3
│ (Blue line)          (Gray line)           (Gray)    │
└──────────────────────────────────────────────────────┘
```

**Screen 6 Style (Horizontal with checkmarks):**
```
┌──────────────────────────────────────────────────────┐
│ [✓ Quiz Details] ═══ [2 Add Questions] ═══ [3...]   │
│ (Checkmark)          (Blue circle)        (Gray)     │
│ Step 1 Done          Step 2 of 3          Step 3 of 3│
│ (Blue line)          (Blue line)          (Gray)     │
└──────────────────────────────────────────────────────┘
```

**Screen 7 Style (Final step):**
```
┌──────────────────────────────────────────────────────┐
│ [✓ Quiz Details] ═══ [✓ Add Questions] ═══ [3...]   │
│ (Checkmark)          (Checkmark)           (Blue)    │
│ Step 1 Done          Step 2 Done           Step 3    │
│ (Blue line)          (Blue line)           (Blue)    │
└──────────────────────────────────────────────────────┘
```

---

## SCREEN 5: Quiz Details (Step 1 of 3)

### Layout
```
┌────────────────────────────────────────────────┐
│ HEADER                                         │
│ CREATE A NEW QUIZ                             │
│ Fill in the details to set up your quiz.      │
│                                               │
│ SINGLE CARD FORM (p-8 gap-6)                 │
│ Grid: grid-cols-2 gap-6                       │
│                                               │
│ 1. Quiz Name (col-span-2)                    │
│    [Text Input h-11]                         │
│    "e.g. Cell Biology Basics"                │
│                                               │
│ 2. Description (col-span-2)                  │
│    [Textarea min-h-24]                       │
│    "Describe what this quiz covers..."       │
│                                               │
│ 3. Subject/Category (col-1)                  │
│    [Select Dropdown h-11]                    │
│    Options: Science, Math, History, Coding   │
│                                               │
│ 4. Difficulty (col-1)                        │
│    [Button Group: Easy | Medium | Hard]      │
│    (Easy selected by default)                │
│                                               │
│ 5. Total Duration (col-span-2)               │
│    [Number Input] "minutes"                  │
│    Format: "30 minutes"                      │
│                                               │
│ 6. Quiz Type (col-span-2)                    │
│    [Card Selector: 2 cards]                  │
│    ┌─ Public (selected)  ┌─ Private        │
│    │ Globe icon         │ Lock icon        │
│    │ "Anyone with..."   │ "Only people..." │
│    │ [✓]                │ [ ]              │
│    └──────────────────┴─────────────────┘   │
│                                               │
│ 7. Quiz Password (conditional on Private)   │
│    [Input with KeyRound icon]               │
│    "Set quiz password"                       │
│                                               │
│ 8. Async Mode (col-span-2)                   │
│    [Checkbox] "Allow students to join and   │
│    attempt this quiz anytime, even after... │
│    📅 CalendarClock icon                     │
│                                               │
│                    [Next: Add Questions →]  │
└────────────────────────────────────────────────┘
```

### Component Details

**Quiz Name**
- Label: "Quiz Name"
- Input: h-11, placeholder "e.g. Cell Biology Basics"
- Type: text

**Description**
- Label: "Description"
- Textarea: min-h-24, placeholder "Describe what this quiz covers..."
- Resizable

**Subject/Category**
- Label: "Subject / Category"
- Select dropdown with options:
  - Science
  - Math
  - History
  - Coding

**Difficulty (Button Group)**
- Label: "Difficulty"
- 3 buttons in row (Easy | Medium | Hard)
- Background: rounded-lg bg-zinc-100 border-zinc-200
- Selected: white bg with shadow
- Default: Easy

**Total Duration**
- Label: "Total Duration"
- Number input in flex container
- Format: [Input] "minutes"
- h-11 container

**Quiz Type (Card Selector)**
- Label: "Quiz Type"
- 2 card options (grid-cols-2 gap-4)
- Each card has:
  - Icon box (size-10 rounded-lg)
  - Title (font-semibold)
  - Description (text-xs gray)
  - CheckCircle2 icon on selected
- Public: Globe icon, bg-[#2b7fff]/5, border-[#2b7fff]
- Private: Lock icon, white bg, border-zinc-200
- Default: Public selected

**Quiz Password**
- Label: "Quiz Password"
- KeyRound icon
- Placeholder: "Set quiz password"
- Shown only when Private selected
- h-11

**Async Mode**
- Checkbox + CalendarClock icon
- Label: "Allow students to join and attempt this quiz anytime, even after it ends."
- col-span-2

**Navigation**
- Next button: bg-[#2b7fff], ArrowRight icon
- Text: "Next: Add Questions"

---

## SCREEN 6: Add Questions (Step 2 of 3)

### Layout
```
┌────────────────────────────────────────────────┐
│ HEADER                                         │
│ ADD QUESTIONS                                 │
│ Use AI to generate questions or add manually  │
│                                               │
│ CARD 1: AI Generator                          │
│ ┌───────────────────────────────────────────┐ │
│ │ ✨ Generate with AI                       │ │
│ │ Let AI craft questions from your topic   │ │
│ │                                           │ │
│ │ [Describe your quiz topic (textarea)]    │ │
│ │                                           │ │
│ │ [Number of questions: 10 (input)]        │ │
│ │                                           │ │
│ │ [✨ Generate Questions] (full width)     │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│ ─────────  OR ADD MANUALLY  ─────────        │
│                                               │
│ [+ Add Question Manually] (outline, full)    │
│                                               │
│ CARD 2+: Question Cards (repeating)          │
│ ┌───────────────────────────────────────────┐ │
│ │ ⋮ Question 1                    🗑 Delete │ │
│ │                                           │ │
│ │ [Question Type: Multiple Choice ▼]       │ │
│ │                                           │ │
│ │ [Question Text (textarea)]               │ │
│ │                                           │ │
│ │ Answer Options: (grid-cols-2 for MCQ)   │ │
│ │ ┌─ ✓ Option A    ┌─ ○ Option B        │ │
│ │ ├─ ○ Option C    ├─ ○ Option D        │ │
│ │ "Tap to mark correct answer"            │ │
│ │                                           │ │
│ │ [Difficulty: Easy | Medium | Hard]      │ │
│ │                                           │ │
│ │ [Explanation (textarea)]                 │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│         [← Back]  [Next: Review & Publish →]│
└────────────────────────────────────────────────┘
```

### Component Details

**AI Generator Card**
- Icon: Sparkles
- Title: "Generate with AI"
- Subtitle: "Let AI craft questions from your topic description"
- Fields:
  - Describe your quiz topic (textarea rows-4)
  - Number of questions (input type-number)
- Button: [✨ Generate Questions] (full width, primary)

**Divider**
```
─────────────  OR ADD MANUALLY  ─────────────
```

**Add Question Button**
- Outline variant
- [+ Add Question Manually] (full width)
- Text color: text-[#2b7fff]
- Border: border-[#2b7fff]

**Question Card (MCQ Example)**
- Header (flex justify-between):
  - Left: GripVertical icon + "Question 1" (bold)
  - Right: Trash2 icon (delete)
- Field: Question Type dropdown (Multiple Choice selected)
- Field: Question Text (textarea rows-2)
- Field: Answer Options (grid-cols-2)
  - Each option: checkbox circle + text input
  - Correct answer: filled circle + check icon + blue bg
  - Wrong answers: empty circle + border
- Field: Difficulty Level (button group inline-flex)
  - Easy | Medium | Hard
  - One selected (highlighted blue)
- Field: Explanation (textarea rows-2)

**Question Card (True/False Example)**
- Same structure but:
- Answer Options: flex-col (2 options)
  - True / False (radio buttons)
  - One selected (with checkmark)

**Features**
- GripVertical icon for drag reordering
- Trash2 icon for delete
- Correct answer marked with blue circle + Check icon
- Different styling for selected options

**Navigation**
- [← Back] button (outline, ArrowLeft icon)
- [Next: Review & Publish →] button (primary, ArrowRight icon)

---

## SCREEN 7: Review & Publish (Step 3 of 3)

### Layout
```
┌────────────────────────────────────────────────────┐
│ HEADER                                             │
│ REVIEW & PUBLISH                                  │
│ Review your quiz details and questions...          │
│                                                    │
│ FLEX: gap-8                                        │
│ ┌──────────────────────────────┬─────────────────┐│
│ │ LEFT (65% width)             │ RIGHT (35% w)   ││
│ │                              │                 ││
│ │ CARD 1: Question Review      │ STICKY CARD:    ││
│ │ ┌────────────────────────┐   │ QUIZ SUMMARY    ││
│ │ │ [Q1] [MCQ] [Easy ✓]    │   │ ┌─────────────┐││
│ │ │                         │   │ │ 📋 SUMMARY  │││
│ │ │ "What is powerhouse?"   │   │ │             │││
│ │ │ ├─ ✓ Mitochondria       │   │ │ Quiz Name   │││
│ │ │ │ (green, checkmark)    │   │ │ Category    │││
│ │ │ ├─ Nucleus              │   │ │ Difficulty  │││
│ │ │ ├─ Ribosome             │   │ │             │││
│ │ │ └─ Golgi                │   │ │ Duration    │││
│ │ │ 💡 Explanation...       │   │ │ Password    │││
│ │ └────────────────────────┘   │ │ Join Mode   │││
│ │                              │ │ Questions   │││
│ │ CARD 2: Question Review      │ │ AI Gen      │││
│ │ ┌────────────────────────┐   │ │             │││
│ │ │ [Q2] [T/F] [Med ▼]     │   │ │ [🚀 Pub]   │││
│ │ │ "Cell membrane..."     │   │ │ [← Back]    │││
│ │ │ ├─ ✓ True              │   │ │ (Note)      │││
│ │ │ ├─ False               │   │ │ └─────────────┘││
│ │ │ 💡 Explanation...      │   │                 ││
│ │ └────────────────────────┘   │                 ││
│ │                              │                 ││
│ │ CARD 3: Question Review      │                 ││
│ │ (Same pattern)               │                 ││
│ │                              │                 ││
│ └──────────────────────────────┴─────────────────┘│
└────────────────────────────────────────────────────┘
```

### Component Details

**Left Column (65%) - Question Review Cards**

Question Card Structure:
```
┌─────────────────────────────────────┐
│ [Q1 badge] [MCQ badge] [Easy badge] │
│                                     │
│ "What is the powerhouse of cell?"   │
│                                     │
│ Answer Options:                     │
│ ├─ ✓ Mitochondria (green bg)        │
│ │   [CheckCircle2 green]            │
│ │   (font-medium green-800)         │
│ ├─ Nucleus (border)                 │
│ ├─ Ribosome (border)                │
│ └─ Golgi apparatus (border)         │
│                                     │
│ 💡 Explanation:                     │
│ "Mitochondria generate most..."     │
│ (bg-zinc-100, text-xs gray)        │
└─────────────────────────────────────┘
```

**Badges:**
- Question number: [Q1] - blue bg, white text, rounded-md h-6
- Question type: [MCQ] or [True/False] - gray bg, gray-900
- Difficulty:
  - Easy: green-100 bg, green-700 text
  - Medium: amber-100 bg, amber-700 text
  - Hard: red-100 bg, red-700 text

**Right Column (35% Sticky) - Quiz Summary Card**

```
┌──────────────────────────────────────┐
│ 📋 QUIZ SUMMARY (uppercase)          │
│                                      │
│ Cell Biology Basics (h2 font-bold)  │
│                                      │
│ [Science] [Medium] (badges)         │
│                                      │
│ ⏱ Duration     15 min               │
│ 🔒 Password    Protected (green)    │
│ ∞ Join mode    Async ✓              │
│ ❓ Total questions  20              │
│                                      │
│ [✨ 14 AI-generated questions]      │
│ (bg-[#2b7fff]/10, badge)            │
│                                      │
│ [🚀 Publish Quiz] (green, py-6)    │
│ [← Back to Questions]               │
│                                      │
│ "Once published, students can..."   │
│ (text-center, text-xs gray)         │
└──────────────────────────────────────┘
```

**Summary Card Fields:**
- Quiz name (h2 font-bold text-xl)
- Subject badge
- Difficulty badge
- Duration (Clock icon + value)
- Password (Lock icon + status)
- Join mode (Infinity icon + "Async" + CheckSquare)
- Total questions (HelpCircle icon + count)
- AI generation info (Sparkles badge)

**Buttons:**
- [🚀 Publish Quiz]: bg-green-600, py-6, full width
- [← Back to Questions]: outline variant
- Note below buttons (text-xs gray center)

**Sticky Positioning:**
```
position: sticky
top-8 (so it stays 8px below viewport top)
```

---

## Design System (Screens 5-7)

**Colors:**
```
Primary: #2b7fff (blue)
Success: green-600 (publish button)
Gray: #71717b
Light Gray: zinc-100, zinc-200
Green: green-50, green-100, green-600, green-700, green-800
Amber: amber-100, amber-700
Red: red-100, red-700
Blue Light: blue-50
```

**Typography:**
```
Page Title: font-bold text-3xl
Section Title: font-semibold text-base or text-lg
Label: font-medium text-sm
Input Placeholder: text-xs
Badge: text-xs
Button: font-semibold text-base
```

**Spacing:**
```
Card: p-6 or p-8
Form gap: gap-6 or gap-4
Grid: grid-cols-2 gap-4 or gap-6
Container: max-w-[1140px] mx-auto px-6
Button: h-11 or py-6
```

**Components:**
```
Cards: Card (CardHeader, CardContent)
Buttons: Button (primary, outline, green)
Forms: Input, Textarea, Select, Label
Icons: lucide-react (40+ icons)
Progress: Custom step indicators
```

---

## Data Flow Between Screens

**Screen 5 → Screen 6:**
```
{
  quizName: string,
  description: string,
  subject: string,
  difficulty: 'easy' | 'medium' | 'hard',
  duration: number,
  type: 'public' | 'private',
  password?: string,
  allowAsync: boolean
}
```

**Screen 6 → Screen 7:**
```
{
  ...previous data,
  questions: [
    {
      id: string,
      type: 'mcq' | 'tf',
      text: string,
      options: [
        { text: string, isCorrect: boolean }
      ],
      difficulty: string,
      explanation: string
    }
  ]
}
```

**Screen 7 → Publish:**
```
{
  ...all previous data,
  createdAt: timestamp,
  publishedAt: timestamp,
  quizCode: string (auto-generated)
}
```

---

## Summary

**Screens 5-7 Create Quiz Workflow:**
- ✅ 3-step guided wizard
- ✅ Progress indicator shows completion
- ✅ Data persists between steps
- ✅ Back/Next navigation
- ✅ Screen 5: Quiz metadata
- ✅ Screen 6: Question management (AI + manual)
- ✅ Screen 7: Final review + publish
- ✅ Sticky summary sidebar on Screen 7
- ✅ All connected in single flow

**Key Features:**
📝 Form-based quiz creation  
🤖 AI question generation  
⚙️ Manual question entry  
✏️ Question editing/reordering  
📋 Review before publish  
🚀 One-click publishing  
📊 Quiz summary preview  

**It's a complete guided quiz creation experience!** 🎯
