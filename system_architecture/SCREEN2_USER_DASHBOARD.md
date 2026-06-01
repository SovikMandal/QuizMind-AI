# 📊 Screen2 - User Dashboard (Main Hub)

## Overview

**Screen2** is the **main landing page for authenticated users** after login or signup. It serves as the central hub where users can see their overview, access all features, and navigate the entire platform.

---

## Where Dashboard Appears

```
User Journey:
├─ Login (Screen12) → [Sign in] → Screen2 ✅
├─ Signup (Screen13) → [Create Account] → Screen2 ✅
└─ Direct Visit → Auto-redirect → Screen2 ✅
```

**Screen2 is the FIRST screen authenticated users see after login!**

---

## Dashboard Layout

```
┌──────────────────────────────────────────────────────────────────┐
│                          NAVBAR                                   │
│  Logo  │ Dashboard │ Quizzes │ Results │ Pricing │ 🔔 │ Profile  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                       MAIN CONTENT                               │
│                                                                  │
│  Welcome Section                                                │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Welcome back, Sarah! 👋                                    ││
│  │ Last logged in: May 31, 2025 at 2:45 PM                   ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Quick Stats Section (4-Column Cards)                          │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐   │
│  │ Total       │ Avg Score   │ Quizzes     │ Learning    │   │
│  │ Quizzes     │ Achieved    │ This Month  │ Streak      │   │
│  ├─────────────┼─────────────┼─────────────┼─────────────┤   │
│  │ 24          │ 78.5%       │ 8           │ 15 days     │   │
│  └─────────────┴─────────────┴─────────────┴─────────────┘   │
│                                                                  │
│  Quick Actions (3 Buttons)                                      │
│  ┌──────────────────┬──────────────────┬──────────────────┐   │
│  │  ✏️ Create Quiz  │  📊 View Results │  ⚙️ Settings     │   │
│  └──────────────────┴──────────────────┴──────────────────┘   │
│                                                                  │
│  Your Performance Section                                       │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ 📈 Performance Trend (Line Chart)                          ││
│  │                                                             ││
│  │ Score %                                                    ││
│  │   85% │      ╱╲                                           ││
│  │   80% │    ╱  ╲      ╱╲                                  ││
│  │   75% │  ╱    ╲    ╱  ╲   ╱╲                            ││
│  │   70% │_╱______╲__╱____╲_╱  ╲                           ││
│  │        │ W1    W2    W3    W4    W5                       ││
│  │        └─────────────────────────────────                ││
│  │                                                             ││
│  │ This week you averaged 75.2% | 📥 Download               ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Quizzes Section                                                │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ 📋 Recent Quizzes                          [See All]       ││
│  │                                                             ││
│  │ Quiz 1: Biology Chapter 5                                 ││
│  │ ┌─────────────────────────────────────────────────────┐  ││
│  │ │ Status: Completed ✅                              │  ││
│  │ │ Your Score: 18/20 (90%)                          │  ││
│  │ │ Time Spent: 15 min 30 sec                        │  ││
│  │ │ Date: May 31, 2025                               │  ││
│  │ │ [View Details] [View Analytics] [Retake]        │  ││
│  │ └─────────────────────────────────────────────────────┘  ││
│  │                                                             ││
│  │ Quiz 2: Chemistry Bonding                                 ││
│  │ ┌─────────────────────────────────────────────────────┐  ││
│  │ │ Status: In Progress ⏳                            │  ││
│  │ │ Progress: 12/20 questions completed              │  ││
│  │ │ Time Remaining: 8 min 45 sec                     │  ││
│  │ │ [Continue Quiz] [Exit] [Pause]                  │  ││
│  │ └─────────────────────────────────────────────────────┘  ││
│  │                                                             ││
│  │ Quiz 3: Physics Motion                                    ││
│  │ ┌─────────────────────────────────────────────────────┐  ││
│  │ │ Status: Not Started 📝                           │  ││
│  │ │ Questions: 15 | Difficulty: Hard | Time: 20min  │  ││
│  │ │ [Start Quiz] [Learn More]                        │  ││
│  │ └─────────────────────────────────────────────────────┘  ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Recommended Section                                            │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ 💡 Recommended for You                   [See All]        ││
│  │                                                             ││
│  │ Based on your performance, try these:                     ││
│  │ • Electron Configuration Quiz                            ││
│  │ • Chemical Bonding Deep Dive                             ││
│  │ • Thermodynamics Basics                                  ││
│  │ • Practice: Balancing Equations                          ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Upcoming Events Section                                        │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ 📅 Upcoming Quizzes                                        ││
│  │                                                             ││
│  │ • Biology Final Exam - Jun 5, 2025 @ 10:00 AM           ││
│  │ • Chemistry Midterm - Jun 8, 2025 @ 2:00 PM             ││
│  │ • Physics Assignment - Jun 10, 2025                      ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Achievements/Badges Section                                    │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ 🏅 Your Achievements                                       ││
│  │                                                             ││
│  │ ⭐ Quiz Master        ⭐ Consistent Learner              ││
│  │    Completed 20+      Score 80%+ on 10+               ││
│  │    quizzes            quizzes                         ││
│  │                                                             ││
│  │ ⭐ Speed Demon        ⭐ 🔓 (Locked)                   ││
│  │    Completed quiz     Complete 50                   ││
│  │    in <10 min         quizzes                        ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Learning Insights Section                                      │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ 🤖 AI Learning Insights                                    ││
│  │                                                             ││
│  │ Based on your quiz history:                              ││
│  │ • You're strongest in: Multiple Choice Questions (88%)   ││
│  │ • You need practice with: Long Answer (62%)              ││
│  │ • Your best subject: Biology (82%)                       ││
│  │ • Your weakest subject: Physics (58%)                    ││
│  │ • Recommended study time: 45 min/day                     ││
│  │                                                             ││
│  │ [Get Personalized Study Plan] [View Details]             ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                         FOOTER                                    │
│  © 2025 QuizMind AI | Privacy | Terms | Help | Contact           │
└──────────────────────────────────────────────────────────────────┘
```

---

## Dashboard Components (Detailed)

### **1. Welcome Section**
```
👋 Welcome back, Sarah!
Last logged in: May 31, 2025 at 2:45 PM

User Avatar: [Profile Picture]
User Tier: Pro Member (Upgrade to Premium)
```

---

### **2. Quick Stats Cards (4-Column)**

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total        │ Avg Score    │ Quizzes This │ Learning     │
│ Quizzes      │ Achieved     │ Month        │ Streak       │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ 24           │ 78.5%        │ 8            │ 15 days      │
│ Taken        │ Overall      │ Completed    │ (Keep going!)│
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Each Card Shows:**
- Big number (stat)
- Label (what it is)
- Optional: Comparison (↑ 5%, ↓ 2%)
- Optional: Badge (streak fire 🔥)

---

### **3. Quick Action Buttons**

```
┌──────────────────┬──────────────────┬──────────────────┐
│  ✏️ Create Quiz  │  📊 View Results │  ⚙️ Settings     │
│                  │                  │                  │
│ New quiz in      │ Explore all      │ Manage your      │
│ 3 easy steps     │ past attempts    │ preferences      │
└──────────────────┴──────────────────┴──────────────────┘
```

---

### **4. Performance Trend Chart**

**Type:** Line Chart

**Shows:**
- Score progression over time
- Weekly/Monthly view
- Trend line (improving/declining)
- Interactive points (hover for details)

**Data:**
```
Week 1: 72%, Week 2: 75%, Week 3: 78%, Week 4: 76%, Week 5: 80%
Average: 75.2%
```

---

### **5. Recent Quizzes Section**

Shows **3-5 recent quizzes** in different states:

#### **Quiz Card - Completed:**
```
┌─────────────────────────────────────────────────────┐
│ 📋 Biology Chapter 5                         ✅      │
├─────────────────────────────────────────────────────┤
│ Status: Completed                                   │
│ Your Score: 18/20 (90%)                            │
│ Time Spent: 15 min 30 sec                          │
│ Date Taken: May 31, 2025 @ 2:45 PM                │
│                                                     │
│ [View Details] [View Analytics] [Retake] [Share]  │
└─────────────────────────────────────────────────────┘
```

#### **Quiz Card - In Progress:**
```
┌─────────────────────────────────────────────────────┐
│ 📋 Chemistry Bonding                        ⏳      │
├─────────────────────────────────────────────────────┤
│ Status: In Progress                                 │
│ Progress: 12/20 questions completed (60%)          │
│ Time Remaining: 8 min 45 sec                       │
│                                                     │
│ [Continue Quiz] [Pause] [Exit] [Help]              │
└─────────────────────────────────────────────────────┘
```

#### **Quiz Card - Not Started:**
```
┌─────────────────────────────────────────────────────┐
│ 📋 Physics Motion                           📝      │
├─────────────────────────────────────────────────────┤
│ Status: Not Started                                 │
│ Questions: 15 | Difficulty: Hard | Time: 20 min   │
│ Description: Motion and kinematics fundamentals    │
│                                                     │
│ [Start Quiz] [Learn More] [Preview]                │
└─────────────────────────────────────────────────────┘
```

---

### **6. Recommended Section**

```
💡 Recommended for You

Based on your recent quizzes and performance:

Suggested Quizzes:
• Electron Configuration Quiz (You struggled here!)
• Chemical Bonding Deep Dive (Related to your weakness)
• Thermodynamics Basics (Next in course)
• Practice: Balancing Equations (Popular with your peers)

[See All Recommendations] [Personalize]
```

---

### **7. Upcoming Events Section**

```
📅 Upcoming Quizzes & Deadlines

• Biology Final Exam - Jun 5, 2025 @ 10:00 AM
  📍 Mandatory | 40 questions | 60 minutes

• Chemistry Midterm - Jun 8, 2025 @ 2:00 PM
  📍 Mandatory | 30 questions | 45 minutes

• Physics Assignment - Jun 10, 2025
  📍 Optional | Project submission

[Set Reminders] [Add to Calendar]
```

---

### **8. Achievements/Badges Section**

```
🏅 Your Achievements

Unlocked Badges:
┌─────────────────────────────────────────────────────┐
│ ⭐ Quiz Master              ⭐ Consistent Learner   │
│   Completed 20+ quizzes    Score 80%+ on 10+ quiz  │
│   Unlocked: Mar 15, 2025   Unlocked: May 20, 2025  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ⭐ Speed Demon              🔓 Perfect Score (Locked)│
│   Completed quiz <10 min   Need: 5 perfect scores  │
│   Unlocked: May 10, 2025   Progress: 2/5          │
└─────────────────────────────────────────────────────┘

[View All Badges] [Share Achievements]
```

---

### **9. AI Learning Insights Section**

```
🤖 AI Learning Insights & Personalization

Based on your quiz history and performance patterns:

Strengths:
✓ You're strongest in: Multiple Choice Questions (88%)
✓ Your best subject: Biology (82% avg)
✓ Best time to study: 2:00 PM - 4:00 PM
✓ Optimal quiz duration: 15-20 minutes

Areas to Improve:
✗ You need practice with: Long Answer Questions (62%)
✗ Your weakest subject: Physics (58% avg)
✗ Slower in: Chemistry Practical Questions

Recommendations:
📚 Recommended study time: 45 minutes/day
💡 Focus on: Short answer practice
📅 Best study days: Weekdays
🎯 Next milestone: Reach 85% in Physics

[Get Personalized Study Plan] [View Detailed Analysis] [Adjust Preferences]
```

---

## Dashboard Navigation

### **From Dashboard, User Can Go To:**

```
Screen2 (Dashboard) has buttons/links to:

1. [Dashboard] → Screen2 (stays)

2. [Quizzes] → Screen8 (Quiz Manager)
   ├─ All created quizzes (if teacher)
   └─ All available quizzes (if student)

3. [Results] → Screen9 (Results & Analytics)
   └─ All past attempts and results

4. [Pricing] → Screen5 (Pricing Page)
   └─ Upgrade subscription

5. [Create Quiz] → Screen4 (Quiz Details)
   └─ Multi-step quiz creation

6. [Recent Quiz] card → Screen3 (Quiz Dashboard)
   └─ View specific quiz details/analytics

7. [Profile Icon] → Dropdown Menu
   ├─ [Profile] → Screen10 (Profile)
   ├─ [Settings] → Screen11 (Settings)
   ├─ [Billing] → Screen5 (Pricing)
   └─ [Logout] → Screen1 (Home)

8. [Notification Bell] 🔔 → Notification Panel
   └─ See all notifications
```

---

## Dashboard Features for Different User Types

### **For Teachers:**
- Create new quizzes
- View quizzes created by them
- See student performance
- Access analytics
- Manage class

### **For Students:**
- Take available quizzes
- View past attempts
- Check progress
- See recommendations
- Track learning

### **For Admins:**
- System statistics
- User management
- Quiz management
- Reports and analytics

---

## Data Displayed on Dashboard

```
User Profile Data:
✓ User name & photo
✓ User tier/subscription level
✓ Last login time
✓ Account status

Performance Data:
✓ Total quizzes taken
✓ Average score
✓ Quizzes this month
✓ Learning streak
✓ Performance trend (chart)

Quiz Data:
✓ Recent quiz list (3-5 quizzes)
✓ Quiz status (Completed/In Progress/Not Started)
✓ Score for each quiz
✓ Time spent
✓ Date/time
✓ Progress bar (if in progress)

Recommendations:
✓ Suggested quizzes
✓ Weak areas to practice
✓ Strong subjects

Achievements:
✓ Earned badges
✓ Progress to next badge
✓ Streak status

AI Insights:
✓ Learning patterns
✓ Subject performance
✓ Strength/weakness analysis
✓ Study recommendations
```

---

## Dashboard Responsiveness

```
Desktop (1920px+):
├─ 2 columns layout
├─ All sections visible
└─ Large charts

Tablet (768px - 1024px):
├─ 1 column layout
├─ Stacked sections
└─ Smaller charts

Mobile (< 768px):
├─ 1 column layout
├─ Compact cards
├─ Drawer navigation
└─ Simplified charts
```

---

## Key Features Summary

| Feature | Purpose |
|---------|---------|
| **Quick Stats** | See overview at a glance |
| **Performance Chart** | Track progress over time |
| **Recent Quizzes** | Quick access to recent attempts |
| **Quick Actions** | Fast navigation to common tasks |
| **Recommendations** | Personalized learning suggestions |
| **Upcoming Events** | Know what's due/scheduled |
| **Achievements** | Gamification & motivation |
| **AI Insights** | Personalized learning analytics |
| **Notifications** | Stay updated on important events |

---

## User Actions on Dashboard

✅ **Click quiz card** → Go to Screen3 (View quiz details)
✅ **Click [Create Quiz]** → Go to Screen4 (Create new quiz)
✅ **Click [View Results]** → Go to Screen9 (All results)
✅ **Click [Settings]** → Go to Screen11 (Preferences)
✅ **Click [Profile]** → Go to Screen10 (Profile)
✅ **Click [Logout]** → Go to Screen1 (Home)
✅ **Continue Quiz** → Go back to quiz-taking page
✅ **Download Chart** → Export performance data
✅ **Share Achievement** → Social sharing

---

## Summary

**Screen2 (Dashboard) is:**
- ✅ The main hub after login
- ✅ Shows user overview & statistics
- ✅ Provides quick access to all features
- ✅ Personalized with AI insights
- ✅ Gamified with achievements
- ✅ Mobile responsive
- ✅ Real-time data updates
- ✅ Central navigation point

**Dashboard Purpose:** Help users quickly understand their progress, access quizzes, and navigate the platform with personalized recommendations. 🎓📊
