# Screen8: Student Quiz Taking Interface

## 📋 Overview
Screen8 is the **interactive quiz-taking interface** where students actively participate in quizzes. It displays one question at a time with interactive answer selection, progress tracking, timer, and navigation controls. This is the core experience for quiz takers.

---

## 🎯 Purpose & User Flow

**When:** Student clicks "Join Quiz" from Screen4 or receives quiz invitation
**Actions:**
1. Enter quiz password (if protected)
2. Start quiz with [Start Quiz] button
3. Answer questions one at a time
4. Navigate through questions with Previous/Next buttons
5. Submit quiz to see results (Screen3)

---

## 🎨 Layout & Structure

### **Full Page Layout**
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (height: h-16)                                       │
│ Logo | Nav (Dashboard, Quizzes, Results, Pricing) | Profile │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ MAIN CONTENT (px-12 py-8)                                   │
│                                                               │
│ ┌─ Quiz Header ────────────────────────────────────────┐    │
│ │ Quiz Title + Category + Question Progress            │    │
│ └──────────────────────────────────────────────────────┘    │
│                                                               │
│ ┌─ Question Progress Bar ──────────────────────────────┐    │
│ │ 5 of 20 Questions | Timer: 12:45 ⏱️                  │    │
│ └──────────────────────────────────────────────────────┘    │
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ QUESTION CARD (w-full)                                │   │
│ │                                                         │   │
│ │ Q5 | MCQ | Medium                                      │   │
│ │                                                         │   │
│ │ What is the largest planet in our solar system?        │   │
│ │                                                         │   │
│ │ ☐ Option A: Mercury                                    │   │
│ │ ☐ Option B: Venus                                      │   │
│ │ ☐ Option C: Jupiter  (Currently selected - blue bg)    │   │
│ │ ☐ Option D: Saturn                                     │   │
│ │                                                         │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ ┌────────────────────┬──────────────────┐                   │
│ │ [← Previous]       │ [Next →]         │                   │
│ └────────────────────┴──────────────────┘                   │
│                                                               │
│ [Submit Quiz] (visible on last question)                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Component Breakdown

### **1. Header (Fixed)**
```tsx
<header className="border-zinc-200 border-b-1 flex px-8 justify-between items-center h-16">
  // Left: Logo + Navigation
  <div className="flex items-center gap-8">
    <div className="flex items-center gap-2">
      <div className="size-8 rounded-lg bg-[#2b7fff] text-blue-50 flex justify-center items-center">
        <Brain className="size-5" />
      </div>
      <span className="font-bold text-lg leading-7 tracking-tight">
        QuizMind AI
      </span>
    </div>
    
    <nav className="flex items-center gap-6">
      <a className="font-medium text-[#71717b] text-sm leading-5 flex items-center gap-2">
        <LayoutGrid className="size-4" />
        Dashboard
      </a>
      <a className="font-medium text-[#71717b] text-sm leading-5 flex items-center gap-2">
        <HelpCircle className="size-4" />
        Quizzes
      </a>
      <a className="font-medium text-[#71717b] text-sm leading-5 flex items-center gap-2">
        <BarChart3 className="size-4" />
        Results
      </a>
      <a className="font-medium text-[#71717b] text-sm leading-5 flex items-center gap-2">
        <Info className="size-4" />
        Pricing
      </a>
    </nav>
  </div>
  
  // Right: Notifications + Profile
  <div className="flex items-center gap-4">
    <button className="relative size-9">
      <Bell className="size-5 text-[#71717b]" />
      <span className="size-2 rounded-full bg-[#2b7fff] absolute right-2 top-2" />
    </button>
    
    <div className="rounded-full border-zinc-200 border-1 flex pl-1 pr-3 py-1 items-center gap-2">
      <Avatar className="size-8">
        <AvatarImage src="..." alt="Student Name" />
        <AvatarFallback>SN</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-semibold text-sm">Alex Morgan</span>
        <span className="text-[#71717b] text-xs">Student</span>
      </div>
      <ChevronDown className="size-4 text-[#71717b]" />
    </div>
  </div>
</header>
```

**Styling Details:**
- Border: `border-zinc-200 border-b-1 border-solid`
- Height: `h-16`
- Padding: `px-8`
- Flex: `justify-between items-center`

---

### **2. Quiz Header Section**
```tsx
<div className="flex flex-col gap-4">
  <div className="flex justify-between items-center">
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <span className="font-medium text-[#71717b] text-sm uppercase tracking-wide">
          Quiz
        </span>
        <span className="font-bold rounded-full bg-[#2b7fff] text-blue-50 text-xs px-3 py-1">
          Live Mode
        </span>
      </div>
      <h1 className="font-bold text-3xl leading-9 tracking-tight">
        Cell Biology Basics
      </h1>
      <p className="text-[#71717b] text-sm">
        Science • Medium • 20 Questions
      </p>
    </div>
    
    <div className="flex flex-col gap-1 text-right">
      <div className="flex items-center gap-2 justify-end">
        <Clock className="size-5 text-[#2b7fff]" />
        <span className="font-bold text-2xl">12:45</span>
        <span className="text-[#71717b] text-sm">remaining</span>
      </div>
    </div>
  </div>
  
  // Progress Bar
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <span className="font-medium text-[#71717b] text-sm">Question 5 of 20</span>
      <span className="font-medium text-zinc-950 text-sm">25% Complete</span>
    </div>
    <div className="w-full h-2 rounded-full bg-zinc-200">
      <div className="h-full bg-[#2b7fff] rounded-full w-1/4" />
    </div>
  </div>
</div>
```

**Key Details:**
- Quiz title: `font-bold text-3xl`
- Mode badge: Live/Async indicator
- Timer: Prominent display with color coding:
  - Green: > 5 min remaining
  - Amber: 2-5 min remaining
  - Red: < 2 min remaining
- Progress: Visual bar + percentage

---

### **3. Question Card**
```tsx
<Card className="p-8 gap-6 shadow-sm rounded-2xl border-zinc-200">
  <CardHeader className="p-0 flex-row justify-between items-start gap-4">
    <div className="flex items-center gap-2">
      {/* Question Number */}
      <span className="font-bold rounded-md bg-[#2b7fff] text-blue-50 text-xs px-2 h-6 flex items-center">
        Q5
      </span>
      
      {/* Question Type */}
      <span className="font-medium rounded-full bg-zinc-100 text-zinc-900 text-xs px-2 py-0.5">
        MCQ
      </span>
      
      {/* Difficulty */}
      <span className="font-semibold rounded-full bg-amber-100 text-amber-700 text-xs px-2.5 py-0.5">
        Medium
      </span>
      
      {/* Bookmark Button (optional) */}
      <button className="ml-auto">
        <Flag className="size-4 text-[#71717b]" />
      </button>
    </div>
  </CardHeader>
  
  <CardContent className="p-0 flex flex-col gap-4">
    {/* Question Text */}
    <h2 className="font-bold text-lg leading-7">
      What is the largest planet in our solar system?
    </h2>
    
    {/* Options Container */}
    <div className="flex flex-col gap-3">
      {/* Option 1 - Not Selected */}
      <button className="rounded-lg border-zinc-200 border-2 flex px-4 py-3 items-center gap-3 hover:border-[#2b7fff] transition">
        <div className="size-5 rounded-full border-zinc-300 border-2 flex-shrink-0" />
        <span className="text-left font-medium text-sm">Mercury</span>
      </button>
      
      {/* Option 2 - Selected (Active) */}
      <button className="rounded-lg border-[#2b7fff] bg-[#2b7fff]/5 border-2 flex px-4 py-3 items-center gap-3">
        <div className="size-5 rounded-full border-[#2b7fff] border-2 bg-[#2b7fff] flex-shrink-0">
          <Check className="size-3 text-white" />
        </div>
        <span className="text-left font-bold text-sm text-[#2b7fff]">Jupiter</span>
      </button>
      
      {/* Option 3 - Not Selected */}
      <button className="rounded-lg border-zinc-200 border-2 flex px-4 py-3 items-center gap-3 hover:border-[#2b7fff] transition">
        <div className="size-5 rounded-full border-zinc-300 border-2 flex-shrink-0" />
        <span className="text-left font-medium text-sm">Saturn</span>
      </button>
      
      {/* Option 4 - Not Selected */}
      <button className="rounded-lg border-zinc-200 border-2 flex px-4 py-3 items-center gap-3 hover:border-[#2b7fff] transition">
        <div className="size-5 rounded-full border-zinc-300 border-2 flex-shrink-0" />
        <span className="text-left font-medium text-sm">Neptune</span>
      </button>
    </div>
    
    {/* Optional: Explanation (Shown after answer or review) */}
    <div className="rounded-lg bg-blue-50 border-blue-200 border-1 flex px-3 py-2 items-start gap-2 mt-4">
      <Lightbulb className="size-4 text-blue-600 mt-0.5 flex-shrink-0" />
      <p className="text-blue-900 text-xs leading-4">
        Jupiter is the largest planet in our solar system with a diameter of 142,984 km.
      </p>
    </div>
  </CardContent>
</Card>
```

**Option States:**
1. **Default (Unselected)**
   - Border: `border-zinc-200 border-2`
   - Circle: `border-zinc-300 border-2`
   
2. **Hover**
   - Border: `border-[#2b7fff]` (blue border on hover)
   - Cursor: pointer
   
3. **Selected**
   - Background: `bg-[#2b7fff]/5` (light blue)
   - Border: `border-[#2b7fff] border-2` (blue border)
   - Circle: `bg-[#2b7fff] border-[#2b7fff]` with white checkmark
   - Text: `text-[#2b7fff] font-bold`

---

### **4. Navigation Controls**
```tsx
<div className="flex gap-4 mt-8">
  {/* Previous Button */}
  <Button 
    variant="outline"
    className="flex-1 font-medium text-[#71717b] text-sm py-5"
    disabled={currentQuestion === 0}
  >
    <ArrowLeft className="size-4" />
    Previous
  </Button>
  
  {/* Next Button */}
  <Button 
    className="flex-1 bg-[#2b7fff] text-blue-50 font-medium text-sm py-5"
    onClick={nextQuestion}
  >
    Next
    <ArrowRight className="size-4" />
  </Button>
</div>

{/* Submit Button (Only on Last Question) */}
{currentQuestion === totalQuestions - 1 && (
  <Button className="w-full bg-green-600 text-white font-semibold text-base py-6 mt-4">
    <CheckCircle2 className="size-5" />
    Submit Quiz
  </Button>
)}
```

**Button States:**
- **Previous:** Disabled on first question
- **Next:** Enabled until last question
- **Submit:** Appears only on last question, green with checkmark icon

---

## 🎭 Question Variations

### **MCQ (Multiple Choice Question)**
```
Q1 | MCQ | Easy
What is 2 + 2?
☐ 3
☐ 4 (selected)
☐ 5
☐ 6
```

### **True/False Question**
```
Q2 | True/False | Medium
Water boils at 100°C at sea level.
☐ True (selected)
☐ False
```

### **Multiple Select (Advanced)**
```
Q3 | Multiple Select | Hard
Select all that apply: Which planets are gas giants?
☐ Earth
☑ Jupiter (selected)
☑ Saturn (selected)
☐ Mars
☑ Neptune (selected)
```

---

## 🎨 Color & Typography Scheme

### **Colors**
| Element | Color | Usage |
|---------|-------|-------|
| Primary Blue | `#2b7fff` | Selected option, buttons, active states |
| Light Blue | `#2b7fff/5` or `#2b7fff/10` | Hover/selected backgrounds |
| Gray Text | `#71717b` | Secondary text, disabled states |
| Border Gray | `zinc-200` | Card borders, dividers |
| Background Gray | `zinc-100` | Subtle backgrounds |
| Green | `green-600` | Submit button |
| Amber | `amber-100/700` | Medium difficulty badge |
| Red | `red-100/700` | Hard difficulty badge |

### **Typography Hierarchy**
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Quiz Title | `text-3xl` | `font-bold` | `text-zinc-950` |
| Question Text | `text-lg` | `font-bold` | `text-zinc-950` |
| Option Text | `text-sm` | `font-medium` | `text-zinc-950` |
| Label/Info | `text-sm` | `font-medium` | `#71717b` |
| Badge Text | `text-xs` | `font-medium` | varies |

---

## 📱 Responsive Behavior

### **Desktop (Default)**
- Max width: `max-w-[1140px]`
- Padding: `px-12 py-8`
- Card width: Full container
- Options: Full width stacked

### **Tablet (768px - 1024px)**
- Padding: `px-8 py-6`
- Options: Full width
- Timer: Top right corner

### **Mobile (< 768px)**
- Padding: `px-4 py-6`
- Single column layout
- Buttons stack vertically
- Timer: Inline with progress

---

## ⏱️ Timer Implementation

### **Timer Display**
```tsx
<div className="flex items-center gap-2">
  <Clock className="size-5 text-[#2b7fff]" />
  <span className="font-bold text-2xl text-zinc-950">12:45</span>
  <span className="text-[#71717b] text-sm">remaining</span>
</div>
```

### **Color Changes**
- **> 5 minutes:** Green `text-green-600`
- **2-5 minutes:** Amber `text-amber-600`
- **< 2 minutes:** Red `text-red-600` (with pulse animation)
- **Time up:** Show "Time's up" message and auto-submit

### **Time Up Handler**
```tsx
useEffect(() => {
  if (timeRemaining === 0) {
    // Auto-submit quiz
    submitQuiz();
  }
}, [timeRemaining]);
```

---

## 🔄 Interactions & States

### **Question Navigation**
1. **Click Option:** Select/deselect answer
   - Update local state
   - Show selection UI change immediately
   
2. **Click Previous:** Go to previous question
   - Save current answer
   - Load previous answer (if exists)
   - Update progress bar
   
3. **Click Next:** Go to next question
   - Save current answer
   - Load next question
   - Update progress indicator
   
4. **Click Submit:** Submit all answers
   - Show confirmation modal
   - Send to backend
   - Redirect to Screen3 (Results)

### **Question Review (Optional)**
- After submission, allow review before final submit
- Show correct answers vs student answers
- Highlight wrong answers in red
- Show explanations

---

## 📊 Data Structure

### **Quiz Data**
```typescript
{
  quizId: "quiz_12345",
  title: "Cell Biology Basics",
  category: "Science",
  difficulty: "Medium",
  mode: "Live" | "Async",
  totalQuestions: 20,
  totalTime: 1800, // seconds
  isProtected: true,
  startedAt: "2025-05-31T15:30:00Z",
  questions: [
    {
      id: "q1",
      number: 1,
      type: "MCQ" | "TrueFalse" | "MultiSelect",
      text: "What is the largest planet...",
      options: ["Mercury", "Venus", "Jupiter", "Saturn"],
      correctAnswer: 2, // index
      explanation: "Jupiter is the largest...",
      difficulty: "Medium",
      studentAnswer: null // user selected: null | number | number[]
    },
    // ... more questions
  ]
}
```

### **Answer Submission Format**
```json
{
  "quizId": "quiz_12345",
  "studentId": "student_789",
  "answers": [
    { "questionId": "q1", "answer": 2 },
    { "questionId": "q2", "answer": true },
    { "questionId": "q3", "answer": [1, 2, 3] },
  ],
  "totalTime": 1245, // seconds taken,
  "submittedAt": "2025-05-31T15:51:45Z"
}
```

---

## 🎯 Key Features

✅ **One Question Per Screen:** Focus and reduced cognitive load
✅ **Real-time Timer:** Visual urgency with color warnings
✅ **Progress Tracking:** Visual bar + question counter
✅ **Immediate Visual Feedback:** Selection shows instantly
✅ **Navigation Controls:** Previous/Next buttons for flexibility
✅ **Answer Persistence:** Answers saved as you navigate
✅ **Keyboard Navigation:** Arrow keys for next/previous (optional)
✅ **Responsive Design:** Works on all screen sizes
✅ **Explanations:** Available after selection or review
✅ **Question Bookmarking:** Flag questions to review later (optional)
✅ **Auto-Submit:** Submit when time runs out
✅ **Submit Confirmation:** Verify before final submission

---

## 🚀 Component Imports Required

```tsx
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Flag,
  HelpCircle,
  Info,
  LayoutGrid,
  Lightbulb,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
```

---

## 📝 Component Checklist

- [x] Fixed header with navigation
- [x] Quiz info header (title, category, mode)
- [x] Progress bar with percentage
- [x] Timer display with color coding
- [x] Question card with type/difficulty
- [x] 4 answer options with selection UI
- [x] Option state management (default/hover/selected)
- [x] Optional explanation box
- [x] Previous/Next navigation buttons
- [x] Submit button (last question only)
- [x] Responsive layout
- [x] Error handling for time-up
- [x] Answer persistence across navigation
