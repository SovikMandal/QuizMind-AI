# Screen9: Pricing & Plans Page

## 📋 Overview
Screen9 is the **Pricing Plans page** where users can view subscription tier options (Free, Pro, Premium), compare features, and upgrade their accounts. This page is accessible to both authenticated and unauthenticated users.

---

## 🎯 Purpose & User Flow

**When Accessed:**
- Click "Pricing" in navbar from any page
- Marketing/onboarding for new users
- Upgrade path for existing free users
- Billing/plan management for authenticated users

**User Actions:**
1. View 3 pricing tiers
2. Compare features side-by-side
3. Choose plan and click CTA button
4. Free users → "Get Started Free"
5. Pro users → "Upgrade to Pro"
6. Pro users → "Go Premium" (to Premium)

---

## 🎨 Layout & Structure

### **Full Page Layout**
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (height: h-16, px-12)                                │
│ Logo | Nav (Dashboard, Quizzes, Results, About) | 🔔 Profile │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ MAIN CONTENT (p-12)                                         │
│                                                              │
│ PAGE HEADER (centered, max-w-5xl)                           │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ ✨ Pricing Plans (badge)                              │   │
│ │                                                        │   │
│ │ Choose the plan that fits you (h1)                    │   │
│ │                                                        │   │
│ │ Start for free and upgrade as your quizzes grow...    │   │
│ │ All plans include unlimited joining for students.     │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ PRICING CARDS (grid-cols-3, gap-6)                          │
│ ┌─────────────────┬─────────────────┬─────────────────┐   │
│ │ FREE PLAN       │ PRO PLAN★       │ PREMIUM PLAN     │   │
│ │ (normal)        │ (featured/pop)  │ (normal)         │   │
│ │                 │                 │                 │   │
│ │ 🎁 Free         │ ⚡ Pro          │ 👑 Premium       │   │
│ │                 │ ★ Most Popular  │                 │   │
│ │ For individuals │ For educators   │ For power users  │   │
│ │ getting started │ & teams         │ & institutions   │   │
│ │                 │                 │                 │   │
│ │ ₹0/month        │ ₹250/month      │ ₹900/month       │   │
│ │                 │                 │                 │   │
│ │ ✓ 10 quizzes    │ ✓ Everything in │ ✓ Everything in  │   │
│ │ ✓ MCQ + TF      │   Free          │   Pro            │   │
│ │ ✓ Live & Async  │ ✓ 30 quizzes    │ ✓ Unlimited      │   │
│ │ ✗ AI Gen        │ ✓ AI Gen        │ ✓ Advanced AI    │   │
│ │ ✗ Analytics     │ ✓ Analytics     │ ✓ Custom Brand   │   │
│ │ [Get Free]      │ ✓ Password Prot │ ✓ Team Seats     │   │
│ │                 │ [Upgrade]       │ [Go Premium]     │   │
│ │                 │ [Upgrade Pro]   │                 │   │
│ └─────────────────┴─────────────────┴─────────────────┘   │
│                                                              │
│ FOOTER TEXT (centered, text-xs)                             │
│ All prices in INR. Cancel anytime. Prices exclude taxes.    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FOOTER                                                       │
│ Logo | © 2025 QuizMind. All rights reserved.                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Component Breakdown

### **1. Header (Fixed)**
```tsx
<header className="bg-white border-zinc-200 border-t-0 border-r-0 border-b-1 border-l-0 border-solid w-full">
  <div className="flex px-12 justify-between items-center h-16">
    // LEFT: Logo + Navigation
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
        <a className="text-[#71717b] text-sm leading-5 flex items-center gap-2">
          <LayoutGrid className="size-4" />
          Dashboard
        </a>
        <a className="font-medium text-[#2b7fff] text-sm leading-5 border-[#2b7fff] border-t-0 border-r-0 border-b-2 border-l-0 border-solid flex pb-1 items-center gap-2">
          <HelpCircle className="size-4" />
          Quizzes
        </a>
        <a className="text-[#71717b] text-sm leading-5 flex items-center gap-2">
          <BarChart3 className="size-4" />
          Results
        </a>
        <a className="text-[#71717b] text-sm leading-5 flex items-center gap-2">
          <Info className="size-4" />
          About
        </a>
      </nav>
    </div>
    
    // RIGHT: Notification + Profile Dropdown
    <div className="flex items-center gap-4">
      <div className="relative">
        <Bell className="size-5 text-[#71717b]" />
        <span className="size-2 rounded-full bg-[#2b7fff] absolute -right-0.5 -top-0.5" />
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-lg flex p-1 items-center gap-2">
            <Avatar className="size-9">
              <AvatarImage src="..." alt="Alex Morgan" />
              <AvatarFallback>AM</AvatarFallback>
            </Avatar>
            <div className="leading-tight flex flex-col items-start">
              <span className="font-semibold text-sm leading-5">
                Alex Morgan
              </span>
              <span className="text-[#71717b] text-xs leading-4">
                Pro member
              </span>
            </div>
            <ChevronDown className="size-4 text-[#71717b]" />
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="p-2">
            <div className="flex flex-col">
              <span className="font-semibold text-sm leading-5">Alex Morgan</span>
              <span className="text-[#71717b] text-xs leading-4">
                alex.morgan@quizmind.ai
              </span>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem className="text-[#71717b] gap-2">
            <User className="size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="text-[#71717b] gap-2">
            <Settings className="size-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem className="text-[#71717b] gap-2">
            <CreditCard className="size-4" />
            Billing
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem className="text-[#e7000b] gap-2">
            <LogOut className="size-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</header>
```

**Styling:**
- Background: `bg-white`
- Border: `border-zinc-200 border-b-1`
- Height: `h-16`
- Padding: `px-12`

---

### **2. Page Header Section**
```tsx
<div className="max-w-5xl flex mx-auto flex-col items-center gap-2">
  {/* Badge */}
  <span className="inline-flex font-medium rounded-full bg-zinc-100 text-zinc-900 text-xs leading-4 px-4 py-1 items-center gap-2">
    <Sparkles className="size-3.5 text-[#2b7fff]" />
    Pricing Plans
  </span>
  
  {/* Main Heading */}
  <h1 className="font-bold text-center text-3xl leading-9 tracking-tight">
    Choose the plan that fits you
  </h1>
  
  {/* Subheading */}
  <p className="max-w-md text-center text-[#71717b] text-sm leading-5">
    Start for free and upgrade as your quizzes grow. All plans include
    unlimited joining for your students.
  </p>
</div>
```

**Styling:**
- Container: `max-w-5xl mx-auto flex flex-col items-center gap-2`
- Badge: `bg-zinc-100 text-zinc-900 text-xs px-4 py-1 rounded-full`
- Heading: `font-bold text-3xl text-center`
- Subheading: `text-[#71717b] text-sm max-w-md`

---

### **3. Pricing Cards Container**
```tsx
<div className="grid grid-cols-3 mt-8 items-start gap-6">
  {/* 3 cards: Free, Pro, Premium */}
</div>
```

**Grid Structure:**
- Layout: `grid-cols-3` (3 equal columns)
- Gap: `gap-6`
- Alignment: `items-start` (align to top)
- Margin: `mt-8`

---

### **4. Plan Card - FREE Plan**
```tsx
<Card className="shadow-sm rounded-2xl border-zinc-200 border-1 border-solid p-6 gap-6">
  {/* Card Header */}
  <CardHeader className="p-0 gap-2">
    <div className="flex items-center gap-2">
      <div className="size-9 rounded-lg bg-zinc-100 flex justify-center items-center">
        <Gift className="size-5 text-zinc-900" />
      </div>
      <CardTitle className="text-lg leading-7">Free</CardTitle>
    </div>
    
    <CardDescription className="text-sm leading-5">
      For individuals getting started.
    </CardDescription>
    
    <div className="flex mt-2 items-end gap-1">
      <span className="font-bold text-3xl leading-9">₹0</span>
      <span className="text-[#71717b] text-sm leading-5 mb-1">
        /month
      </span>
    </div>
  </CardHeader>
  
  {/* Card Content - Features */}
  <CardContent className="flex p-0 flex-col gap-3">
    {/* Included Features (Blue check) */}
    <div className="text-sm leading-5 flex items-start gap-2">
      <Check className="size-4 shrink-0 text-[#2b7fff] mt-0.5" />
      <span>Unlimited join quizzes</span>
    </div>
    
    <div className="text-sm leading-5 flex items-start gap-2">
      <Check className="size-4 shrink-0 text-[#2b7fff] mt-0.5" />
      <span>Create up to <b>10 quizzes</b></span>
    </div>
    
    <div className="text-sm leading-5 flex items-start gap-2">
      <Check className="size-4 shrink-0 text-[#2b7fff] mt-0.5" />
      <span>Basic MCQ & True/False types</span>
    </div>
    
    <div className="text-sm leading-5 flex items-start gap-2">
      <Check className="size-4 shrink-0 text-[#2b7fff] mt-0.5" />
      <span>Live & async quiz modes</span>
    </div>
    
    {/* Not Included Features (Gray X) */}
    <div className="text-[#71717b] text-sm leading-5 flex items-start gap-2">
      <X className="size-4 shrink-0 mt-0.5" />
      <span>AI question generation</span>
    </div>
    
    <div className="text-[#71717b] text-sm leading-5 flex items-start gap-2">
      <X className="size-4 shrink-0 mt-0.5" />
      <span>Advanced analytics</span>
    </div>
  </CardContent>
  
  {/* Card Footer - CTA Button */}
  <CardFooter className="p-0">
    <Button variant="outline" className="w-full h-11">
      Get Started Free
    </Button>
  </CardFooter>
</Card>
```

---

### **5. Plan Card - PRO Plan (Featured)**
```tsx
<Card className="shadow-md relative rounded-2xl border-[#2b7fff] border-2 border-solid p-6 gap-6">
  {/* Popular Badge - Absolutely positioned at top */}
  <span className="left-1/2 -translate-x-1/2 inline-flex font-semibold rounded-full bg-[#2b7fff] text-blue-50 text-xs leading-4 absolute -top-3 px-3 py-1 items-center gap-1">
    <Star className="size-3" />
    Most Popular
  </span>
  
  {/* Card Header */}
  <CardHeader className="p-0 gap-2">
    <div className="flex items-center gap-2">
      <div className="size-9 rounded-lg bg-[#2b7fff]/10 flex justify-center items-center">
        <Zap className="size-5 text-[#2b7fff]" />
      </div>
      <CardTitle className="text-lg leading-7">Pro</CardTitle>
    </div>
    
    <CardDescription className="text-sm leading-5">
      For active educators & teams.
    </CardDescription>
    
    <div className="flex mt-2 items-end gap-1">
      <span className="font-bold text-3xl leading-9">₹250</span>
      <span className="text-[#71717b] text-sm leading-5 mb-1">
        /month
      </span>
    </div>
  </CardHeader>
  
  {/* Card Content - Features */}
  <CardContent className="flex p-0 flex-col gap-3">
    {/* "Everything in Free" highlight */}
    <div className="font-medium text-sm leading-5 flex items-start gap-2">
      <Check className="size-4 shrink-0 text-[#2b7fff] mt-0.5" />
      <span>Everything in Free</span>
    </div>
    
    <div className="text-sm leading-5 flex items-start gap-2">
      <Check className="size-4 shrink-0 text-[#2b7fff] mt-0.5" />
      <span>Create up to <b>30 quizzes/month</b></span>
    </div>
    
    <div className="text-sm leading-5 flex items-start gap-2">
      <Check className="size-4 shrink-0 text-[#2b7fff] mt-0.5" />
      <span>AI question generation</span>
    </div>
    
    <div className="text-sm leading-5 flex items-start gap-2">
      <Check className="size-4 shrink-0 text-[#2b7fff] mt-0.5" />
      <span>All question types</span>
    </div>
    
    <div className="text-sm leading-5 flex items-start gap-2">
      <Check className="size-4 shrink-0 text-[#2b7fff] mt-0.5" />
      <span>Detailed result analytics</span>
    </div>
    
    <div className="text-sm leading-5 flex items-start gap-2">
      <Check className="size-4 shrink-0 text-[#2b7fff] mt-0.5" />
      <span>Password-protected quizzes</span>
    </div>
  </CardContent>
  
  {/* Card Footer - Primary CTA Button */}
  <CardFooter className="p-0">
    <Button className="bg-[#2b7fff] text-blue-50 w-full h-11">
      Upgrade to Pro
    </Button>
  </CardFooter>
</Card>
```

**Featured Styling (Pro):**
- Border: `border-[#2b7fff] border-2` (blue instead of gray)
- Shadow: `shadow-md` (more prominent)
- Badge: Absolutely positioned `-top-3` with star icon
- Button: Primary blue background

---

### **6. Plan Card - PREMIUM Plan**
```tsx
<Card className="shadow-sm rounded-2xl border-zinc-200 border-1 border-solid p-6 gap-6">
  {/* Card Header */}
  <CardHeader className="p-0 gap-2">
    <div className="flex items-center gap-2">
      <div className="size-9 rounded-lg bg-zinc-100 flex justify-center items-center">
        <Crown className="size-5 text-zinc-900" />
      </div>
      <CardTitle className="text-lg leading-7">Premium</CardTitle>
    </div>
    
    <CardDescription className="text-sm leading-5">
      For power users & institutions.
    </CardDescription>
    
    <div className="flex mt-2 items-end gap-1">
      <span className="font-bold text-3xl leading-9">₹900</span>
      <span className="text-[#71717b] text-sm leading-5 mb-1">
        /month
      </span>
    </div>
  </CardHeader>
  
  {/* Card Content - Features */}
  <CardContent className="flex p-0 flex-col gap-3">
    {/* "Everything in Pro" highlight */}
    <div className="font-medium text-sm leading-5 flex items-start gap-2">
      <Check className="size-4 shrink-0 text-[#2b7fff] mt-0.5" />
      <span>Everything in Pro</span>
    </div>
    
    <div className="text-sm leading-5 flex items-start gap-2">
      <Check className="size-4 shrink-0 text-[#2b7fff] mt-0.5" />
      <span><b>Unlimited quizzes/month</b></span>
    </div>
    
    <div className="text-sm leading-5 flex items-start gap-2">
      <Check className="size-4 shrink-0 text-[#2b7fff] mt-0.5" />
      <span>Advanced AI generation & bulk import</span>
    </div>
    
    <div className="text-sm leading-5 flex items-start gap-2">
      <Check className="size-4 shrink-0 text-[#2b7fff] mt-0.5" />
      <span>Custom branding & certificates</span>
    </div>
    
    <div className="text-sm leading-5 flex items-start gap-2">
      <Check className="size-4 shrink-0 text-[#2b7fff] mt-0.5" />
      <span>Team collaboration seats</span>
    </div>
    
    <div className="text-sm leading-5 flex items-start gap-2">
      <Check className="size-4 shrink-0 text-[#2b7fff] mt-0.5" />
      <span>Priority 24/7 support</span>
    </div>
  </CardContent>
  
  {/* Card Footer - Secondary CTA Button */}
  <CardFooter className="p-0">
    <Button variant="outline" className="w-full h-11">
      Go Premium
    </Button>
  </CardFooter>
</Card>
```

---

### **7. Footer Note**
```tsx
<p className="text-center text-[#71717b] text-xs leading-4 mt-8">
  All prices in INR. Cancel anytime. Prices exclude applicable taxes.
</p>
```

---

### **8. Page Footer**
```tsx
<footer className="border-zinc-200 border-t-1 border-r-0 border-b-0 border-l-0 border-solid w-full">
  <div className="flex px-12 py-6 justify-between items-center">
    <div className="flex items-center gap-2">
      <div className="size-7 rounded-lg bg-[#2b7fff] text-blue-50 flex justify-center items-center">
        <Brain className="size-4" />
      </div>
      <span className="font-semibold text-sm leading-5">
        QuizMind AI
      </span>
    </div>
    
    <span className="text-[#71717b] text-xs leading-4">
      © 2025 QuizMind. All rights reserved.
    </span>
  </div>
</footer>
```

---

## 📊 Pricing Plans Comparison

| Feature | Free | Pro | Premium |
|---------|------|-----|---------|
| **Price** | ₹0 | ₹250 | ₹900 |
| **Icon** | 🎁 Gift | ⚡ Zap | 👑 Crown |
| **Monthly Quizzes** | 10 | 30 | Unlimited |
| **Unlimited Join** | ✅ | ✅ | ✅ |
| **MCQ & True/False** | ✅ | ✅ | ✅ |
| **Live & Async Mode** | ✅ | ✅ | ✅ |
| **AI Question Gen** | ❌ | ✅ | ✅ |
| **All Question Types** | ❌ | ✅ | ✅ |
| **Analytics** | ❌ | ✅ | ✅ |
| **Password Protected** | ❌ | ✅ | ✅ |
| **Bulk Import** | ❌ | ❌ | ✅ |
| **Custom Branding** | ❌ | ❌ | ✅ |
| **Certificates** | ❌ | ❌ | ✅ |
| **Team Seats** | ❌ | ❌ | ✅ |
| **24/7 Support** | ❌ | ❌ | ✅ |

---

## 🎨 Design System Details

### **Color Palette**
| Element | Color | Usage |
|---------|-------|-------|
| Primary Blue | `#2b7fff` | Pro plan border, buttons, icons |
| Gray Text | `#71717b` | Secondary text, descriptions |
| Border Gray | `zinc-200` | Card borders (Free & Premium) |
| Background Gray | `zinc-100` | Badge, icon backgrounds |
| Light Blue BG | `#2b7fff/10` | Pro plan icon background |

### **Typography**
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page Header | `text-3xl` | `font-bold` | `text-zinc-950` |
| Plan Name | `text-lg` | - | `text-zinc-950` |
| Price | `text-3xl` | `font-bold` | `text-zinc-950` |
| Features | `text-sm` | `font-medium` or base | varies |
| Description | `text-sm` | - | `text-[#71717b]` |
| Badge | `text-xs` | `font-medium` | varies |

### **Spacing**
- Container padding: `p-12`
- Card padding: `p-6`
- Card gaps: `gap-6`
- Feature list gaps: `gap-3`
- Button height: `h-11`
- Margin top (cards): `mt-8`

---

## 🔄 Interactive Features

### **Button Actions**

**Free Plan - "Get Started Free"**
- Variant: `outline`
- Action: Navigate to signup (if not logged in) or activate free trial

**Pro Plan - "Upgrade to Pro"** (Primary CTA)
- Variant: primary (blue background)
- Class: `bg-[#2b7fff] text-blue-50`
- Action: Trigger payment flow or upgrade modal
- Most prominent: Bold, centered, primary color

**Premium Plan - "Go Premium"**
- Variant: `outline`
- Action: Trigger payment flow for premium tier

### **Plan Selection**
- Hover effects on cards (optional: slight shadow increase)
- Pro plan has higher shadow (`shadow-md` vs `shadow-sm`)
- Star badge on Pro plan draws attention
- "Most Popular" label above Pro plan

---

## 📱 Responsive Behavior

### **Desktop (1024px+)**
- Grid: `grid-cols-3` (3 equal columns)
- Max width: `max-w-5xl` (header section)
- All cards visible side-by-side
- Full feature descriptions

### **Tablet (768px - 1023px)**
- Grid: `grid-cols-2` or stacked with featured card centered
- Cards slightly smaller
- Feature text truncated or adjusted

### **Mobile (< 768px)**
- Grid: `grid-cols-1` (stacked vertically)
- Full width cards
- Pro plan might be featured first
- Compressed feature list

---

## 💳 Billing Integration Points

### **Free Plan Actions**
```
"Get Started Free" → 
  ├─ If logged in: Activate free tier
  ├─ If logged out: → Screen13 (Signup) → Activate Free
  └─ Success: Redirect to Screen2 (Dashboard)
```

### **Pro Plan Actions**
```
"Upgrade to Pro" → 
  ├─ Payment gateway (Stripe/Razorpay)
  ├─ Enter payment details
  ├─ Process ₹250/month
  └─ Success: Update user plan → Screen2 (Dashboard)
```

### **Premium Plan Actions**
```
"Go Premium" → 
  ├─ Payment gateway (Stripe/Razorpay)
  ├─ Enter payment details
  ├─ Process ₹900/month
  └─ Success: Update user plan → Screen2 (Dashboard)
```

---

## 🚀 Component Imports Required

```tsx
import { useEffect } from "react";
import {
  BarChart3,
  Bell,
  Brain,
  Check,
  ChevronDown,
  CreditCard,
  Crown,
  Gift,
  HelpCircle,
  Info,
  LayoutGrid,
  LogOut,
  Settings,
  Sparkles,
  Star,
  User,
  X,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
- [x] Notification bell with indicator
- [x] Profile dropdown menu with options
- [x] Centered page header section
- [x] "Pricing Plans" badge with icon
- [x] Main heading "Choose the plan that fits you"
- [x] Descriptive subheading
- [x] 3-column pricing cards grid
- [x] Free Plan card with 6 features (4 included, 2 excluded)
- [x] Pro Plan card (featured) with 6 features
- [x] Premium Plan card with 6 features
- [x] "Most Popular" badge on Pro card
- [x] Pricing display (₹X/month format)
- [x] Plan descriptions
- [x] Feature comparison with checkmarks/X marks
- [x] CTA buttons for each plan
- [x] Footer disclaimer text
- [x] Page footer with copyright
- [x] Responsive grid layout
- [x] Color-coded plan cards (Pro with blue border)
- [x] Icon for each plan (Gift/Zap/Crown)
