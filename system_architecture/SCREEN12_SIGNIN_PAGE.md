# Screen12: Sign In Page - Complete Design Specifications

## Overview
Screen12 is the **Authentication Sign In / Login** page where users can authenticate using their email and password or social login options (Google/GitHub). The page features a split-screen layout with a branded left panel and login form on the right.

**Key Features:**
- Email and password authentication
- "Forgot password?" link
- Social login options (Google, GitHub)
- Link to sign-up page
- Branded hero section with feature highlights

---

## Page Layout

### Full-Screen Split Layout
```
Min height: min-h-[956px]
Flex layout: flex w-full (2 equal columns)
├── Left Panel (w-1/2): Branded Section
└── Right Panel (w-1/2): Login Form Section
```

---

## Left Panel: Branded Hero Section

### Background & Styling
```
Background: Linear gradient from #2b7fff to #1a5fd4
Gradient: linear-gradient(160deg, #2b7fff 0%, #1a5fd4 100%)
Text color: White (text-white)
Padding: p-12
Layout: flex flex-col justify-between (space-between top, middle, bottom)
Overflow: overflow-hidden (for absolute positioned decorative elements)
```

### Decorative Background Elements
```
3 animated blur circles (positioned absolutely):
1. Top-right: size-72, blur-2xl, rounded-full, bg-white/10, absolute -right-20 -top-20
2. Bottom-left: size-64, blur-2xl, rounded-full, bg-white/10, absolute -left-16 bottom-10
3. These create a modern glassmorphism effect
```

### Logo Section (Top - Relative)
```
Layout: flex items-center gap-2
├── Icon Box:
│   ├── Size: size-10 (40px)
│   ├── Style: rounded-xl, backdrop-blur-sm, bg-white/15
│   └── Icon: Brain (size-6, text-white)
└── Brand Name:
    ├── Text: "QuizMind AI"
    ├── Style: font-bold text-white text-xl leading-7 tracking-tight
```

### Hero Content Section (Middle - Relative with text-center)
```
Layout: flex my-8 flex-col items-center
Margin: my-8 (vertical spacing)

1. Decorative Icon Circle:
   ├── Outer circle: size-56, backdrop-blur-sm, rounded-full, bg-white/10, mb-10
   ├── Inner border: rounded-full, border-white/20, border-1, absolute inset-0
   ├── Middle ring: rounded-full, bg-white/25, border-white/15, border-1, absolute inset-6
   ├── Brain icon box: size-28, backdrop-blur-md, rounded-3xl, bg-white/15
   │   └── Brain icon: size-14, text-white
   ├── Top-right sparkle: size-10, rounded-2xl, bg-white/20, absolute right-6 top-2
   │   └── Sparkles icon: size-5, text-white
   ├── Bottom-left help: size-10, rounded-2xl, bg-white/20, absolute left-2 bottom-4
   │   └── HelpCircle icon: size-5, text-white
   └── Bottom-right chart: size-9, rounded-2xl, bg-white/20, absolute right-0 bottom-8
       └── BarChart3 icon: size-5, text-white

2. Main Heading:
   ├── Text: "Smarter quizzes, powered by AI"
   ├── Max-width: max-w-sm
   ├── Style: font-bold text-white text-4xl leading-10

3. Subheading:
   ├── Text: "Join 12,000+ educators creating engaging assessments in seconds."
   ├── Max-width: max-w-sm
   ├── Style: text-blue-100 text-base leading-6 mt-4
```

### Feature Highlights (Bottom - Relative)
```
Layout: flex flex-col gap-4

3 Feature items (each):
├── Layout: flex items-center gap-3
├── Check circle:
│   ├── Size: size-6
│   ├── Style: rounded-full, bg-white/20
│   └── Icon: Check (size-4, text-white)
└── Feature text:
    ├── Style: text-blue-50 text-sm leading-5
    ├── Features:
    │   1. "AI question generation"
    │   2. "Live & async quiz modes"
    │   3. "Real-time analytics"
```

---

## Right Panel: Sign In Form Section

### Container
```
Width: w-1/2
Layout: flex p-12 flex-col justify-center items-center
Padding: p-12
Content centering: flex-col justify-center items-center
```

### Form Card
```
Component: Card
Max-width: max-w-md (448px)
Width: w-full (100% of container)
Padding: p-10
Border: border-zinc-200, border-0 (no visible border), border-solid
Border radius: rounded-2xl
Box shadow: shadow-sm
Gap: gap-6
Background: white (default)
```

### Card Header (CardHeader)
```
Layout: text-center, flex p-0 flex-col items-center gap-2

1. Icon Box:
   ├── Size: size-12 (48px)
   ├── Style: rounded-xl, bg-[#2b7fff]/10, flex justify-center items-center
   ├── Icon: Brain (size-7, text-[#2b7fff])
   └── Margin: mb-1

2. Title (CardTitle):
   ├── Text: "Welcome back"
   ├── Style: font-bold text-2xl leading-8
   ├── Color: text-zinc-950 (dark)

3. Subtitle:
   ├── Text: "Sign in to your account to continue"
   ├── Style: text-zinc-500 text-sm leading-5
```

### Form Content (CardContent)
```
Layout: flex p-0 flex-col gap-4

Field 1: Email Address
├── Label: "Email Address" (font-medium text-sm leading-5)
├── Input container: relative
├── Icon: Mail (top-1/2, -translate-y-1/2, size-4, text-zinc-400, absolute left-3)
├── Input:
│   ├── Type: email
│   ├── Placeholder: "alex.morgan@quizmind.ai"
│   ├── Class: pl-9 (left padding for icon)
│   └── Height: h-10 (default from Input component)
└── Layout: flex flex-col gap-2

Field 2: Password
├── Label: "Password" (font-medium text-sm leading-5)
├── Input container: relative
├── Icons:
│   ├── Left: Lock (top-1/2, -translate-y-1/2, size-4, text-zinc-400, absolute left-3)
│   └── Right: Eye (top-1/2, -translate-y-1/2, size-4, text-zinc-400, absolute right-3)
├── Input:
│   ├── Type: password
│   ├── Placeholder: "••••••••"
│   ├── Class: px-9 (left and right padding for icons)
│   └── Height: h-10
├── Layout: flex flex-col gap-2
└── Forgot Password Link:
    ├── Text: "Forgot password?" (cursor-pointer, font-medium, text-[#2b7fff], text-sm, leading-5, mt-1, self-end)
    ├── Color: text-[#2b7fff] (primary blue)

Sign In Button:
├── Style: bg-[#2b7fff] text-white, w-full
├── Height: h-10 (default)
├── Icon: LogIn (size-4)
├── Text: "Sign In"
├── Layout: flex items-center gap-2

Divider:
├── Layout: flex my-1 items-center gap-3
├── Left line: bg-zinc-200 flex-1 h-px
├── Text: "or continue with" (text-zinc-400, text-xs, leading-4)
├── Right line: bg-zinc-200 flex-1 h-px

Social Login Buttons:
├── Grid: grid-cols-2 gap-3
├── Button 1 (Google):
│   ├── Variant: outline
│   ├── Color: text-zinc-700, border-zinc-200
│   ├── Border: border-0 border-solid
│   ├── Icon: FallbackComponent (size-4)
│   └── Text: "Google"
└── Button 2 (GitHub):
    ├── Variant: outline
    ├── Color: text-zinc-700, border-zinc-200
    ├── Border: border-0 border-solid
    ├── Icon: FallbackComponent (size-4)
    └── Text: "GitHub"
```

### Card Footer (CardFooter)
```
Layout: p-0 justify-center
Text: "Don't have an account?" (text-zinc-500, text-sm, leading-5)
Sign Up Link: "Sign up" (cursor-pointer, font-medium, text-[#2b7fff])
```

### Bottom Copyright
```
Position: Below card
Text: "© 2025 QuizMind. All rights reserved."
Style: text-center text-zinc-400 text-xs leading-4 mt-8
```

---

## Design System References

### Color Palette
- **Primary Gradient:** linear-gradient(160deg, #2b7fff 0%, #1a5fd4 100%)
- **Primary Blue:** #2b7fff (buttons, links, icons)
- **Dark Gradient Blue:** #1a5fd4 (gradient end)
- **Text:** text-zinc-950 (dark), text-white (on gradient), text-zinc-500 (secondary)
- **Icons:** text-zinc-400 (form icons)
- **Borders:** border-zinc-200

### Gradient Overlay Details
- Background color 1: #2b7fff (RGB: 43, 127, 255)
- Background color 2: #1a5fd4 (RGB: 26, 95, 212)
- Gradient angle: 160deg
- Background on white text: text-blue-100

### Typography
- **Page title:** font-bold text-2xl leading-8
- **Hero heading:** font-bold text-4xl leading-10 text-white
- **Hero subheading:** text-blue-100 text-base leading-6
- **Form labels:** font-medium text-sm leading-5
- **Form subtext:** text-zinc-500 text-sm leading-5
- **Feature text:** text-blue-50 text-sm leading-5
- **Small text:** text-xs leading-4

### Spacing
- **Container padding:** p-12 (both sides)
- **Card padding:** p-10
- **Gap between elements:** gap-6 (card), gap-4 (form), gap-3 (social buttons)
- **Field gaps:** gap-2 (within field)
- **Icon positions:** size-4 (icons), size-6 (check circles), size-12 (header icon)
- **Heights:** h-px (divider line)

### Component Sizing
- **Card max-width:** max-w-md (448px)
- **Left panel width:** w-1/2 (50%)
- **Right panel width:** w-1/2 (50%)
- **Decorative circles:** size-72, size-64 (blurred background)
- **Icon circle:** size-56 (decorative)

---

## Icon List (Lucide React)
```
BarChart3, Brain, Check, Eye, HelpCircle, Lock, LogIn, Mail, Sparkles
```

---

## User Interactions

### Email Input
- Placeholder: "alex.morgan@quizmind.ai"
- Type: email
- Validates: Email format
- Icon: Mail (left side)

### Password Input
- Placeholder: "••••••••"
- Type: password
- Icon: Lock (left side)
- Eye icon (right side): Toggles password visibility
- Shows "Forgot password?" link below

### Sign In Button
- Action: Submits form to backend authentication endpoint
- Loading state: Could show spinner during auth
- Success: Redirects to Screen2 (Dashboard) for authenticated users
- Error: Shows error message below button

### Forgot Password Link
- Action: Navigates to password reset flow or screen
- Style: Blue text with cursor-pointer

### Social Login Buttons
- Google button: Opens OAuth flow for Google
- GitHub button: Opens OAuth flow for GitHub
- Both buttons: Redirect to dashboard on success

### Sign Up Link
- Text: "Sign up" in blue
- Action: Navigates to Screen13 (Sign Up page)

---

## Responsive Behavior

### Desktop (≥1024px)
- Full split-screen layout (50/50)
- Left panel: Hero section visible
- Right panel: Form card visible

### Tablet (768px-1023px)
- Could stack vertically or use different ratio
- Form card: Still max-w-md but full width on smaller screens
- Left panel: May reduce padding

### Mobile (<768px)
- Single column layout
- Hide or minimize left panel (hero section)
- Form card: Full width with appropriate padding
- Consider smaller typography and spacing

---

## Integration Points

### Authentication Required
- This page is for unauthenticated users
- If user already logged in, redirect to Screen2 (Dashboard)
- No authentication token/session should exist on arrival

### API Endpoints (Backend Integration)
```
POST /api/auth/signin - Email/password authentication
  Payload: { email: string, password: string }
  Response: { token: string, user: UserObject, redirectUrl: string }

POST /api/auth/oauth/google - Google OAuth callback
  Payload: { googleToken: string }
  Response: { token: string, user: UserObject }

POST /api/auth/oauth/github - GitHub OAuth callback
  Payload: { githubToken: string }
  Response: { token: string, user: UserObject }

POST /api/auth/forgot-password - Initiate password reset
  Payload: { email: string }
  Response: { success: boolean, message: string }
```

### Form Validation
```javascript
Email:
- Required
- Must be valid email format
- Case-insensitive
- Max 254 characters

Password:
- Required
- Minimum 8 characters (backend enforces)
- Shown as dots for security

Errors:
- "Invalid email format"
- "Password is required"
- "Email not found"
- "Incorrect password"
- "Too many login attempts - try again later"
```

### Session Management
- On successful login: Store JWT token in localStorage/sessionStorage
- Set auth cookie (httpOnly, secure)
- Update app state with user information
- Redirect to Screen2 (Dashboard)

---

## Accessibility Features

- **Color Contrast:** White text on blue gradient meets WCAG AAA
- **Icon Accessibility:** Icons paired with labels
- **Form Labels:** Associated with inputs via htmlFor (not shown but structured)
- **Password Field:** Eye icon clickable to toggle visibility
- **Focus States:** Clear focus indicators for keyboard navigation
- **Keyboard Support:** Tab through form fields, Enter to submit

---

## Performance Considerations

### Rendering
- Decorative elements use backdrop-filter and blur: may impact performance
- Consider using CSS filters for GPU acceleration
- Blur effects: Use will-change CSS for browser optimization

### Images
- No images on this page (all CSS/SVG)
- Icons loaded from Lucide React (lightweight)

### Network
- No external resources except icons library
- Social OAuth: Handled via external provider APIs
- Form submission: Single API call to backend

---

## Error Handling

### Failed Login Scenarios
1. **Invalid credentials:**
   - Message: "Invalid email or password"
   - Color: Red text below sign in button
   - Duration: Persistent until user modifies input

2. **Network error:**
   - Message: "Connection failed. Please try again."
   - Retry button available

3. **Account locked:**
   - Message: "Too many failed attempts. Try again in 15 minutes."
   - Countdown timer (optional)

4. **Email not found:**
   - Message: "No account found with this email"
   - Link to sign up

### Success Handling
- Redirect immediately to Screen2 (Dashboard)
- Or show success message briefly then redirect

---

## Browser Compatibility

- **Chrome/Chromium:** Full support
- **Firefox:** Full support
- **Safari:** Full support (check backdrop-filter support)
- **Edge:** Full support
- **Mobile browsers:** Responsive design supported

---

## Security Considerations

- ✅ HTTPS only (enforce in backend)
- ✅ Password input type (not visible)
- ✅ No password storage in frontend
- ✅ CSRF protection tokens (if needed)
- ✅ Rate limiting on failed attempts
- ✅ Remember me functionality (optional, handled securely)
- ✅ Cookie flags: HttpOnly, Secure, SameSite

---

## Summary

Screen12 provides a professional, modern sign-in experience with:
- ✅ Clean split-screen layout with branded hero section
- ✅ Email/password authentication
- ✅ Social login options
- ✅ Password reset link
- ✅ Link to sign-up page
- ✅ Responsive design
- ✅ Accessible form structure
- ✅ Security best practices

The page is production-ready with exact Tailwind CSS classes, gradient styling, spacing, colors, and component hierarchy matching Screen12.tsx implementation.
