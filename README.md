# TESTOP Platform Frontend

A modern web application built with React, TypeScript, and Vite, featuring a comprehensive routing system and authentication flow.

## 🚀 Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **TanStack Router** - Type-safe routing with file-based routing
- **TanStack Form** - Type-safe form management
- **Tailwind CSS** - Utility-first CSS framework
- **Zod** - TypeScript-first schema validation
- **Lucide React** - Icon library
- **shadcn/ui** - Beautiful, accessible UI components

## 📁 Project Structure

```
src/
├── routes/                    # File-based routing
│   ├── _auth/                # Authentication routes
│   │   ├── login.tsx         # Login with TanStack Form + Zod
│   │   ├── register.tsx      # Registration with password strength
│   │   ├── forgot-password.tsx # Password reset with TanStack Form
│   │   ├── email-verification.$email.tsx # OTP verification
│   │   └── route.tsx         # Auth layout and protection
│   ├── _protected/           # Protected routes
│   │   ├── dashboard.tsx     # Protected user dashboard
│   │   └── route.tsx         # Protection logic
│   ├── -root-components/    # Reusable route components
│   │   ├── custom-link.tsx   # Navigation link component
│   │   └── form-elements.tsx # Shared form components
│   ├── __root.tsx           # Root layout
│   └── index.tsx            # Homepage
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── hooks/                # Custom React hooks
├── lib/                      # Utility functions
│   ├── utils.ts
│   └── mock.ts
└── types/                    # TypeScript types
    └── auth.types.ts
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start development server**

   ```bash
   npm run dev
   ```

3. **Build for production**

   ```bash
   npm run build
   ```

4. **Preview production build**
   ```bash
   npm run preview
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Features

### Authentication System

- **TanStack Form Integration** - Type-safe form management across all auth pages
- **Zod Validation** - Real-time field and form-level validation
- **Password Strength Indicator** - Real-time password requirements checklist
- **Password Visibility Toggle** - Show/hide password fields
- **OTP Verification** - 6-digit OTP input with shadcn input-otp
- **Email Verification Flow** - Complete email verification workflow
- **Forgot Password** - Password recovery with email instructions

### Core Features

- **File-based Routing** - Automatic route generation with TanStack Router
- **Type-Safe Navigation** - Full TypeScript support for routes
- **Protected Routes** - Authentication-based route protection
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Dark Mode Support** - Complete dark theme implementation
- **Portuguese Language** - Full localization support
- **Modern UI/UX** - Beautiful, accessible components with shadcn/ui

## 🔧 Configuration

### ESLint Configuration

The project uses ESLint with TypeScript support. For production applications, consider enabling type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
```

## 📱 Routes

### Public Routes

- `/` - Homepage
- `/login` - User login with TanStack Form + Zod
- `/register` - User registration with password strength indicator
- `/forgot-password` - Password recovery with email instructions

### Authentication Routes

All authentication routes are under `/_auth` layout:

- `/login` - User login with password visibility toggle
- `/register` - Registration with full name, email, and strong password requirements
- `/forgot-password` - Password recovery with email validation
- `/email-verification/:email` - OTP email verification with 6-digit code

### Protected Routes

- `/dashboard` - Protected user dashboard
- Requires authentication via `_protected` layout

## 🔐 Authentication System

### Key Components

**Login** (`/routes/_auth/login.tsx`)

- TanStack Form with Zod validation
- Email and password validation
- Password visibility toggle
- Forgot password link
- Automatic redirect for authenticated users

**Register** (`/routes/_auth/register.tsx`)

- Full name, email, and password fields
- Password strength requirements with visual indicators
- Password match validation
- Real-time validation feedback
- Password visibility toggles

**Forgot Password** (`/routes/_auth/forgot-password.tsx`)

- Email input with Zod validation
- Success state with instructions
- Resend functionality
- Modern, clean UI

**Email Verification** (`/routes/_auth/email-verification.$email.tsx`)

- 6-digit OTP input using shadcn input-otp
- Email parameter from URL
- Resend OTP functionality
- Success handling

### Reusable Components

All authentication forms use shared components from `/routes/-root-components/form-elements.tsx`:

- **SubmitButton** - Consistent submit button with loading states and spinner animations
- **PasswordStrengthIndicator** - Real-time password requirements checklist with visual feedback
- **PasswordMatchIndicator** - Password confirmation matching indicator with checkmarks
- **FieldErrorMessage** - Consistent error message display with red styling
- **PasswordVisibilityToggle** - Eye icon toggle for password visibility
- **PasswordInputWithToggle** - Complete password input with toggle and error handling

### Validation Strategy

All forms use **Zod schemas** for validation:

- Field-level validation on change/blur
- Form-level validation on submit
- Custom error messages in Portuguese
- Type-safe validation with TypeScript

## 🚀 Deployment

The application builds to static files that can be deployed to any static hosting service:

- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## 🎨 Design System

### UI Components (shadcn/ui)

The project uses a comprehensive set of accessible UI components:

- **Button** - Multiple variants (default, outline, ghost, link)
- **Card** - Content containers with header, title, and content sections
- **Input** - Text inputs with focus states and error handling
- **InputOTP** - 6-digit OTP input with visual slots
- **Form** - Form wrapper for validation
- **Label** - Accessible form labels
- And many more...

### Custom Form Elements

Custom components built for the authentication flow:

Located in `/routes/-root-components/form-elements.tsx` - Reusable form components
Located in `/components/ui/` - Base UI components from shadcn

## 📄 License

This project is part of the TESTOP Platform.

## 🙏 Acknowledgments

- Built with [TanStack Form](https://tanstack.com/form) for powerful form management
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Routing powered by [TanStack Router](https://tanstack.com/router)
