# Screen10: User Profile Page - Complete Design Specifications

## Overview
Screen10 is the **User Profile Management** page where authenticated users can manage their account information, subscription details, and security settings. The page follows a 3-column grid layout with a focused sidebar and expansive main content area.

**Key Features:**
- Profile card with avatar and member tier badge
- Quick statistics dashboard
- Editable personal information form
- Active subscription management card
- Security settings and account management

---

## Page Structure

### 3-Column Grid Layout
```
Grid: grid-cols-3 gap-8
├── Column 1 (col-span-1): Left Sidebar [Profile Card + Quick Stats]
└── Column 2 (col-span-2): Main Content [Personal Info + Billing + Security]
```

### Header Navigation
Same as Screen2 (Dashboard):
- Logo: Brain icon (size-9, rounded-lg, bg-[#2b7fff])
- App name: "QuizMind AI" (font-bold text-lg)
- Navigation items: Dashboard, Quizzes, Results, About (font-medium text-sm, #71717b color)
- Right section: Bell icon (with blue dot notification indicator) + User dropdown menu

### Page Title Section
- Heading: "My Profile" (font-bold text-3xl)
- Subheading: "Manage your account information and subscription." (text-[#71717b] text-sm)
- Margin bottom: mb-8

---

## Component 1: Profile Card (Left Sidebar)

### Container
- Card with p-6 gap-4
- Rounded corners with white background
- Border: zinc-200 border-1

### Profile Avatar Section
```
Relative container
├── Avatar Component (size-28)
│   ├── Image: Woman portrait (112x112px)
│   └── Fallback: "AM"
└── Upload Button [FEATURED ELEMENT]
    ├── Size: size-8 (32px square)
    ├── Style: rounded-full bg-[#2b7fff] text-blue-50
    ├── Border: border-white border-2
    ├── Position: absolute right-1 bottom-1
    ├── Icon: Camera (size-4)
    └── Trigger: File upload modal/input
```

**Upload Feature Details:**
- Button positioned at bottom-right corner of avatar
- Creates visual overlay effect with white border separating from background
- When clicked, should trigger file input for profile picture upload
- Supports image formats: JPG, PNG, GIF
- Max file size: 5MB (recommendation)

### User Information Section
- Full Name: "Alex Morgan" (font-bold text-xl)
- Username: "@alexmorgan" (text-[#71717b] text-sm)
- Member Badge:
  - Style: rounded-full, bg-[#2b7fff], text-blue-50, px-3 py-1
  - Icon: Crown (size-3.5)
  - Text: "Pro Member" (font-medium)

### Contact Information (CardFooter)
- Border top: border-zinc-200 border-t-1
- Padding: px-0 pt-2 pb-0 with flex-col gap-2

**Information Items:**
```
Each item: flex items-center gap-2 w-full

1. Email
   Icon: Mail (size-4, #71717b)
   Value: alex.morgan@quizmind.ai (text-sm)

2. Location
   Icon: MapPin (size-4, #71717b)
   Value: San Francisco, CA (text-sm)

3. Join Date
   Icon: CalendarDays (size-4, #71717b)
   Value: Joined March 2024 (text-sm)
```

### Logout Button
- Style: variant="outline"
- Text color: text-[#e7000b]
- Border: border-[#e7000b]/30, no full border (border-0)
- Padding: px-4 gap-2
- Height: h-10
- Width: w-full
- Icon: LogOut (size-4)
- Margin top: mt-2

---

## Component 2: Quick Stats Card (Left Sidebar)

### Container
- Card with p-6 gap-4
- Same styling as Profile Card

### Header
- CardTitle: "Quick Stats" (font-semibold text-base)

### Stats Grid
- Grid: grid-cols-2 gap-4

**Stat Boxes (4 items in 2x2 grid):**
```
Each stat box:
├── Background: bg-zinc-100
├── Padding: p-4
├── Rounded: rounded-lg
├── Layout: flex flex-col gap-1
├── Number: font-bold text-2xl text-zinc-950
└── Label: text-[#71717b] text-xs

Stats:
1. 24 Quizzes Created
2. 1,280 Total Attempts
3. 86% Avg. Score
4. 312 Students Reached
```

---

## Component 3: Personal Information Card (Main Content)

### Container
- Card with p-6 gap-4
- Full col-span-2 width

### Header Section
- Layout: flex-row justify-between items-center
- Left:
  - Title: "Personal Information" (font-semibold text-base)
  - Description: "Update your personal details here." (text-[#71717b] text-sm)
- Right:
  - Edit Button: variant="outline", px-4 gap-2, h-9
  - Icon: Pencil (size-4)
  - Text: "Edit"

### Form Grid
- Grid: grid-cols-2 gap-4
- 5 form fields total

**Fields:**

```
1. Full Name (col-span-1)
   Label: "Full Name" (font-medium text-sm)
   Input: h-10, defaultValue="Alex Morgan"

2. Username (col-span-1)
   Label: "Username" (font-medium text-sm)
   Input: h-10, defaultValue="alexmorgan"

3. Email Address (col-span-1)
   Label: "Email Address" (font-medium text-sm)
   Input: h-10, defaultValue="alex.morgan@quizmind.ai"

4. Phone Number (col-span-1)
   Label: "Phone Number" (font-medium text-sm)
   Input: h-10, defaultValue="+1 (555) 012-3456"

5. Bio (col-span-2)
   Label: "Bio" (font-medium text-sm)
   Textarea: min-h-20
   Value: "Educator & quiz designer passionate about making learning interactive and fun."
```

---

## Component 4: Pro Plan / Billing Card (Main Content)

### Header Section (Blue Highlight Box)
```
Style: rounded-xl bg-[#2b7fff] text-blue-50 p-6
Layout: flex justify-between items-center

Left Side:
├── Icon Box: size-12, rounded-lg, bg-blue-50/15
│   └── Icon: Crown (size-6)
└── Text:
    ├── Title: "Pro Plan" (font-bold text-lg)
    └── Description: "Create up to 30 quizzes/month with AI generation"

Right Side:
├── Price: "₹250" (font-bold text-2xl)
│   └── Period: "/month" (font-normal text-sm)
└── Status Badge:
    ├── Style: bg-blue-50/20, text-blue-50
    ├── Text: "Active"
    └── Margin: mt-1
```

### Subscription Details (3-Column Grid)

```
Grid: grid-cols-3 gap-4

Each detail box:
├── Background: transparent
├── Border: border-zinc-200 border-1
├── Padding: p-4
├── Rounded: rounded-lg

1. Started On
   Icon: CalendarClock (size-4)
   Label: "Started On" (text-[#71717b] text-xs)
   Value: "Jan 15, 2025" (font-semibold text-sm)

2. Renews On
   Icon: RefreshCw (size-4)
   Label: "Renews On" (text-[#71717b] text-xs)
   Value: "Feb 15, 2025" (font-semibold text-sm)

3. Days Remaining
   Icon: Hourglass (size-4)
   Label: "Days Remaining" (text-[#71717b] text-xs)
   Value: "18 days left" (font-semibold text-sm)
```

### Usage Progress Section
```
Layout: flex flex-col gap-2

1. Label Row:
   ├── Left: "Quizzes used this month" (text-[#71717b] text-sm)
   └── Right: "18 / 30" (font-medium text-zinc-950)

2. Progress Bar:
   ├── Container: rounded-full bg-zinc-100 w-full h-2
   └── Filled: w-[60%] rounded-full bg-[#2b7fff] h-2
```

### Action Buttons (CardFooter)
- Padding: p-0, gap-2
- 3 buttons displayed horizontally

**Button 1: Upgrade to Premium**
- Style: bg-[#2b7fff] text-blue-50
- Padding: px-6
- Height: h-11
- Icon: ArrowUpCircle (size-4)
- Text: "Upgrade to Premium"

**Button 2: Manage Billing**
- Style: variant="outline"
- Padding: px-6
- Height: h-11
- Icon: CreditCard (size-4)
- Text: "Manage Billing"

**Button 3: Cancel Plan**
- Style: variant="ghost"
- Text color: text-[#e7000b]
- Padding: px-4
- Height: h-11
- Text: "Cancel Plan" (no icon)

---

## Component 5: Security & Settings Card (Main Content)

### Container
- Card with p-6 gap-4
- CardHeader: p-0 (empty in this card)

### Security Settings (CardContent)
- Layout: flex flex-col gap-2
- Contains 4 security/account setting items

**Item 1: Password**
```
Box: rounded-lg border-zinc-200 border-1 p-4
Layout: flex justify-between items-center

Left Section:
├── Icon Box: size-9, rounded-lg, bg-zinc-100
│   └── Icon: Lock (size-4, #71717b)
└── Text:
    ├── Title: "Password" (font-medium text-sm)
    └── Subtitle: "Last changed 2 months ago" (text-[#71717b] text-xs)

Right: 
└── Button: variant="outline", px-4, h-9
    └── Text: "Change"
```

**Item 2: Two-Factor Authentication**
```
Box: rounded-lg border-zinc-200 border-1 p-4
Layout: flex justify-between items-center

Left Section:
├── Icon Box: size-9, rounded-lg, bg-zinc-100
│   └── Icon: ShieldCheck (size-4, #71717b)
└── Text:
    ├── Title: "Two-Factor Authentication" (font-medium text-sm)
    └── Subtitle: "Add an extra layer of security" (text-[#71717b] text-xs)

Right:
└── Switch: (togglable, default off)
```

**Item 3: Email Notifications**
```
Box: rounded-lg border-zinc-200 border-1 p-4
Layout: flex justify-between items-center

Left Section:
├── Icon Box: size-9, rounded-lg, bg-zinc-100
│   └── Icon: Bell (size-4, #71717b)
└── Text:
    ├── Title: "Email Notifications" (font-medium text-sm)
    └── Subtitle: "Receive updates about quiz activity" (text-[#71717b] text-xs)

Right:
└── Switch: (togglable, default ON)
```

**Item 4: Log Out (Danger Zone)**
```
Box: rounded-lg bg-[#e7000b]/5 border-[#e7000b]/30 border-1 p-4
Layout: flex justify-between items-center
Margin: mt-2 (distance from previous item)

Left Section:
├── Icon Box: size-9, rounded-lg, bg-[#e7000b]/10
│   └── Icon: LogOut (size-4, text-[#e7000b])
└── Text:
    ├── Title: "Log out" (font-medium text-sm)
    └── Subtitle: "Sign out of your account on this device" (text-[#71717b] text-xs)

Right:
└── Button: variant="outline"
    ├── Text color: text-[#e7000b]
    ├── Border: border-[#e7000b]/30, no-border
    ├── Padding: px-4
    ├── Height: h-9
    ├── Icon: LogOut (size-4)
    └── Text: "Log out"
```

---

## Footer
- Same as other pages
- Border top: border-zinc-200 border-t-1
- Padding: px-8 py-6
- Layout: flex justify-between items-center
- Left: Logo (Brain icon, size-7) + "QuizMind AI" (font-semibold text-sm)
- Right: "© 2025 QuizMind. All rights reserved." (text-[#71717b] text-sm)

---

## Design System References

### Color Palette
- **Primary Blue:** #2b7fff (buttons, badges, progress bars)
- **Red/Danger:** #e7000b (logout, cancel actions)
- **Gray Text:** #71717b (secondary text, labels)
- **Gray Backgrounds:** zinc-100, zinc-200 (cards, borders)
- **Blue Backgrounds:** blue-50/15, blue-50/20, blue-50/80 (transparency variations)

### Typography
- **Page Title:** font-bold text-3xl leading-9 tracking-tight
- **Card Titles:** font-semibold text-base leading-6
- **Card Descriptions:** text-[#71717b] text-sm leading-5
- **Form Labels:** font-medium text-sm leading-5
- **Stats Numbers:** font-bold text-2xl leading-8
- **Stats Labels:** text-[#71717b] text-xs leading-4

### Spacing
- **Container Padding:** px-12 py-8
- **Card Padding:** p-6
- **Grid Gaps:** gap-8 (main layout), gap-6 (sidebar), gap-4 (form)
- **Flex Gaps:** gap-2 (form fields), gap-1 (text stacks), gap-4 (card sections)
- **Heights:** h-10 (inputs), h-9 (small buttons), h-11 (action buttons)

### Component Sizing
- **Avatar:** size-28 (112px)
- **Camera Button:** size-8 (32px)
- **Icon Box:** size-9 or size-12
- **Icons:** size-3.5 to size-6

---

## Icon List (Lucide React)
```
Brain, Bell, LayoutGrid, HelpCircle, BarChart3, Info, 
ChevronDown, Avatar, Badge, Button, Card, Checkbox, Input,
ArrowUpCircle, CreditCard, Crown, DropdownMenu, Lock, LogOut,
Mail, Pencil, RefreshCw, Settings, ShieldCheck, Switch,
Textarea, User, Camera, CalendarClock, CalendarDays,
Hourglass
```

---

## User Interactions

### Profile Picture Upload (Camera Button)
1. User clicks Camera button overlay on avatar
2. File input dialog opens (image files only)
3. Selected image is previewed in avatar
4. Image uploaded to server/CDN
5. Avatar updates with new image

### Edit Personal Information
1. User clicks "Edit" button
2. Form fields become editable/focused
3. User modifies desired fields
4. Save/Cancel options appear
5. Changes persisted to database

### Plan Management
1. **Upgrade to Premium:** Opens payment/upgrade modal
2. **Manage Billing:** Opens billing history and payment methods
3. **Cancel Plan:** Shows confirmation dialog before cancellation

### Security Settings
1. **Change Password:** Opens modal for password update
2. **Enable 2FA:** Toggles two-factor authentication setup flow
3. **Email Notifications:** Toggles notification preferences (saves immediately)
4. **Log Out:** Signs out user from current device

### Switch Components
- Two-Factor Authentication: Toggle to enable/disable
- Email Notifications: Toggle to enable/disable (default enabled)
- Both switches save state immediately on toggle

---

## Responsive Behavior

### Layout Breakpoints
- **Desktop (≥1024px):** 3-column grid (col-span-1 + col-span-2)
- **Tablet (768px-1023px):** Consider 2-column (full width sidebar + stacked main)
- **Mobile (<768px):** Single column stack (all sections full width)

### Considerations
- Form grid (grid-cols-2) should collapse to grid-cols-1 on mobile
- Stats grid remains 2x2 on tablet, 1x4 on mobile
- Buttons may need size adjustment for touch targets
- Progress bar width may scale

---

## Integration Points

### Authentication Required
- Page should only be accessible to authenticated users
- User data pre-populated from auth context/API
- Non-logged-in users redirected to Screen12 (Login)

### API Endpoints (Backend Integration)
```
GET /api/user/profile - Fetch user data
PUT /api/user/profile - Update personal information
POST /api/user/upload-avatar - Upload profile picture
GET /api/user/subscription - Fetch subscription details
POST /api/user/upgrade-plan - Upgrade subscription
POST /api/user/change-password - Change password
POST /api/user/logout - Logout user
PUT /api/user/settings - Update security settings
```

### Data Model
```javascript
{
  id: string,
  fullName: string,
  username: string,
  email: string,
  phone: string,
  bio: string,
  avatar: string (URL),
  memberTier: "Free" | "Pro" | "Premium",
  subscription: {
    plan: string,
    price: number,
    startDate: Date,
    renewDate: Date,
    status: "Active" | "Cancelled" | "Expired",
    quizzesUsed: number,
    quizzesLimit: number
  },
  location: string,
  joinDate: Date,
  security: {
    twoFactorEnabled: boolean,
    emailNotificationsEnabled: boolean,
    lastPasswordChange: Date
  },
  stats: {
    quizzesCreated: number,
    totalAttempts: number,
    avgScore: number,
    studentsReached: number
  }
}
```

---

## Navigation Links

### From Screen10
- **Dashboard:** Navigate to Screen2
- **Quizzes:** Navigate to Screen4
- **Results:** Navigate to Screen3
- **Pricing:** Navigate to Screen9
- **Logo:** Return to Screen2 (Dashboard)

### To Screen10
- **From Header Dropdown:** Profile option leads here
- **From Screen2:** User profile link
- **From Settings:** Profile management section

---

## Accessibility Features

- **Color Contrast:** All text meets WCAG AA standards
- **Button Focus States:** Clear focus indicators for keyboard navigation
- **Form Labels:** Associated with inputs via htmlFor
- **Icon Accessibility:** Icons paired with text labels
- **Switch Components:** Labeled and keyboard accessible
- **Avatar Alt Text:** "Alex Morgan" provided

---

## Summary

Screen10 provides a complete user profile management experience with:
- ✅ Profile customization with picture upload
- ✅ Personal information management
- ✅ Subscription and billing details
- ✅ Security and account settings
- ✅ Quick statistics overview
- ✅ Consistent design matching QuizMind AI brand

The page is production-ready with exact Tailwind CSS classes, spacing, colors, and component hierarchy matching Screen10.tsx implementation.
