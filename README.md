# IAM, IP - Amigos Ocultos (Secret Santa)

A modern web application for managing a Secret Santa gift exchange system for employees and agents of the Instituto de Amêndoas de Moçambique, IP - Sede.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Database Schema](#database-schema)
- [Authentication Flow](#authentication-flow)
- [User Workflow](#user-workflow)
- [Admin Features](#admin-features)
- [Configuration](#configuration)
- [Deployment](#deployment)

## 🎯 Overview

This application facilitates a Secret Santa gift exchange where:

- Participants receive a unique 6-digit OTP via email
- Participants log in using their email and OTP
- Participants set their gift amount (minimum 1,000 MZN)
- Participants can view other participants grouped by gift amount ranges
- Participants select their Secret Santa recipient (one choice per participant)
- Admins can upload participants via Excel and manage the system

## ✨ Features

### User Features

- **OTP-based Authentication**: Secure login using email and 6-digit OTP
- **Gift Amount Management**: Set and update gift amount (minimum 1,000 MZN)
- **Participant Selection**: Choose a Secret Santa recipient from amount-based groups
- **Dashboard**: View all participants and their selection status
- **Account Management**: Reset choice, change amount, or quit participation

### Admin Features

- **Excel Upload**: Upload participants via Excel file (Name and Email columns)
- **Participant Management**: View all participants with details and delete participants
- **Automated OTP Generation**: System automatically generates unique OTPs for each participant
- **Email Notifications**: Automatic email sending with OTP and login link

### Security Features

- **Unique OTPs**: 6-digit OTPs that expire in 24 hours
- **Unique Participant Codes**: 8-digit codes for each participant
- **One Choice Per User**: Participants can only select one recipient at a time
- **Admin Protection**: Admin routes are protected and only accessible to authorized admin

## 🛠️ Tech Stack

### Frontend

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **TanStack Router** - Type-safe file-based routing
- **TanStack Form** - Type-safe form management
- **Zod** - Schema validation
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Accessible UI components
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **ExcelJS** - Excel file parsing

### Backend & Database

- **Supabase** - PostgreSQL database and Edge Functions
- **Resend** - Email delivery service
- **PostgreSQL** - Relational database

## 📁 Project Structure

```
src/
├── routes/                    # File-based routing
│   ├── _auth/                # Authentication routes
│   │   ├── login.tsx         # OTP and email login
│   │   ├── enter-amount.tsx  # Gift amount input
│   │   ├── request-otp.tsx   # Request new OTP
│   │   └── route.tsx         # Auth layout
│   ├── _protected/           # Protected routes
│   │   ├── dashboard.tsx    # Main dashboard
│   │   ├── admin/            # Admin routes
│   │   │   ├── upload-participants.tsx  # Excel upload
│   │   │   ├── participants.tsx         # Participant management
│   │   │   └── route.tsx               # Admin protection
│   │   └── route.tsx         # Protected layout
│   ├── __root.tsx           # Root layout
│   └── index.tsx            # Homepage redirect
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── layouts/             # Layout components
│   │   ├── navbar.tsx       # Top navigation bar
│   │   ├── footer.tsx       # Footer component
│   │   └── authenticated-layout.tsx  # Main layout
│   └── custom-ui/           # Custom components
├── hooks/
│   └── use-user.ts          # User state management
├── lib/
│   ├── supabase/            # Supabase client
│   └── resend/              # Resend client
├── models/                   # Database schemas
│   ├── index.sql            # Main schema
│   └── setup-admin.sql      # Admin setup script
└── config/
    └── secrets.ts           # API keys and configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Resend account (for email sending)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd secretsanta
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a Supabase project
   - Run the SQL schema from `src/models/index.sql`
   - Set up the Edge Function for sending emails (see `supabase/functions/send-otp-email/`)

4. **Configure environment**
   - Update `src/config/secrets.ts` with your Supabase credentials
   - Set up Resend API key in Supabase Edge Function environment variables

5. **Set up Admin**
   - Run the admin setup script: `src/models/setup-admin.sql`
   - Save the generated OTP securely

6. **Start development server**

   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🗄️ Database Schema

### Tables

#### `participants`

- `id` (uuid, primary key)
- `name` (text)
- `email` (text, unique)
- `amount` (text, default: "1000")
- `code` (text, unique, 8-digit)
- `is_verified` (boolean, default: false)
- `is_admin` (boolean, default: false)

#### `verifications`

- `id` (uuid, primary key)
- `otp` (text, 6-digit)
- `expires_at` (text, ISO timestamp)
- `participant_id` (uuid, foreign key to participants)

#### `hidden_friendships`

- `id` (uuid, primary key)
- `participant_id` (uuid, foreign key to participants, unique)
- `friend_id` (uuid, foreign key to participants, unique)

## 🔐 Authentication Flow

### User Login Process

1. **Admin Uploads Participants**
   - Admin uploads Excel file with Name and Email columns
   - System generates unique 8-digit codes for each participant
   - System generates unique 6-digit OTPs (expires in 24 hours)
   - Emails are sent to participants with OTP and login link

2. **User Requests OTP** (Optional)
   - User visits `/request-otp`
   - Enters email address
   - System generates new OTP and sends email

3. **User Logs In**
   - User visits `/login`
   - Enters email and 6-digit OTP
   - System verifies OTP and email match
   - If first login and amount is default (1000), redirects to `/enter-amount`
   - Otherwise, redirects to `/dashboard`

4. **User Sets Amount** (First time only)
   - User enters gift amount (minimum 1,000 MZN)
   - Amount is saved to database
   - User is redirected to dashboard

### Admin Login

- Admin uses special email: `musekwa2011@gmail.com`
- Admin OTP expires after 1 year (not 24 hours)
- Admin OTP is not deleted after login (reusable)
- Only admin can access `/admin/*` routes

## 👤 User Workflow

### Dashboard Features

1. **Amount Range Cards**
   - View participants grouped by gift amount ranges:
     - 1.000 - 2.000 MZN
     - 2.001 - 3.000 MZN
     - 3.001 - 3.999 MZN
     - 4.000+ MZN
   - Click on a card to see participants in that range

2. **Participant Selection**
   - Open modal by clicking on amount range card
   - View participant codes (names hidden)
   - Select one participant by clicking
   - Confirm selection
   - Cannot select another until resetting current choice

3. **Participants Table**
   - View all participants with:
     - Numbering
     - Name
     - "Escolheu" status (has chosen someone)
   - Sorted alphabetically

4. **Account Actions** (Dropdown menu for own account)
   - **Resetar Escolha**: Reset your current selection
   - **Alterar Valor**: Change your gift amount
   - **Sair da Participação**: Delete account and logout

## 👨‍💼 Admin Features

### Upload Participants

1. Navigate to `/admin/upload-participants`
2. Upload Excel file with columns:
   - **Nome** (or "Name")
   - **Email** (or "E-mail", "Correio")
3. Preview participants
4. Click "Salvar" to:
   - Generate unique 8-digit codes
   - Generate unique 6-digit OTPs
   - Create verification records (24-hour expiration)
   - Send emails to all participants

### Manage Participants

1. Navigate to `/admin/participants`
2. View all participants with:
   - Name, Email, Amount
   - Chosen friend name
   - Verification status
3. Delete participants (except admin)

## ⚙️ Configuration

### Supabase Setup

1. Create a Supabase project
2. Run `src/models/index.sql` to create tables
3. Set up Edge Function for email sending:
   - Deploy `supabase/functions/send-otp-email/`
   - Set environment variables:
     - `RESEND_API_KEY`
     - `RESEND_FROM_EMAIL`

### Resend Integration

The app uses Resend via Supabase Edge Functions. Configure:

- Resend API key in Edge Function environment
- From email address
- Email templates in `supabase/functions/send-otp-email/index.ts`

### Admin Setup

Run `src/models/setup-admin.sql` in Supabase SQL Editor:

- Creates admin user: Musekwa Evariste (musekwa2011@gmail.com)
- Generates unique 6-digit OTP (expires in 1 year)
- Sets `is_admin` flag to true

See `src/models/README-admin-setup.md` for detailed instructions.

## 🔄 Key Workflows

### Participant Registration Flow

```
Admin Uploads Excel
    ↓
System Generates Codes & OTPs
    ↓
Emails Sent to Participants
    ↓
User Receives Email with OTP
    ↓
User Logs In with Email + OTP
    ↓
If First Login → Enter Amount
    ↓
Redirect to Dashboard
```

### Participant Selection Flow

```
User Opens Amount Range Card
    ↓
Modal Shows Participant Codes
    ↓
User Selects One Code
    ↓
User Confirms Selection
    ↓
System Validates (no duplicate choices)
    ↓
Saves to hidden_friendships
    ↓
Dashboard Updates
```

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

Ensure these are configured:

- Supabase URL and Anon Key (in `src/config/secrets.ts`)
- Resend Supabase URL and Key (for Edge Functions)
- Resend API Key (in Edge Function environment)

### Deployment Options

- **Vercel**: Connect GitHub repo, set environment variables
- **Netlify**: Deploy from Git, configure build settings
- **AWS S3 + CloudFront**: Upload `dist` folder, configure CDN
- **Supabase Hosting**: Deploy directly from Supabase dashboard

## 📝 API & Edge Functions

### Supabase Edge Function: `send-otp-email`

**Endpoint**: `https://<your-project>.supabase.co/functions/v1/send-otp-email`

**Method**: POST

**Headers**:

- `Content-Type: application/json`
- `Authorization: Bearer <anon-key>`

**Body**:

```json
{
  "to": "participant@email.com",
  "subject": "Seu código de acesso - Amigos Ocultos IAM, IP",
  "participantName": "Participant Name",
  "otp": "123456",
  "loginUrl": "https://yourapp.com/login"
}
```

**Response**:

```json
{
  "success": true,
  "messageId": "email-id",
  "message": "Email sent successfully"
}
```

## 🔒 Security Considerations

- OTPs expire after 24 hours (admin OTP: 1 year)
- Email validation prevents enumeration attacks
- Admin routes are protected server-side
- Foreign key constraints prevent invalid data
- Unique constraints prevent duplicate emails/codes
- Cascade deletes maintain data integrity

## 🐛 Troubleshooting

### Common Issues

1. **OTP not received**
   - Check Resend API key configuration
   - Verify Edge Function is deployed
   - Check CORS settings in Edge Function

2. **Upload fails**
   - Ensure Excel has correct column names
   - Check for duplicate emails
   - Verify database connection

3. **Login redirects incorrectly**
   - Check localStorage for user ID
   - Verify participant exists in database
   - Check amount value (default redirects to enter-amount)

## 📄 License

This project is for internal use by Instituto de Amêndoas de Moçambique, IP - Sede.

## 🙏 Acknowledgments

- Built with [TanStack Router](https://tanstack.com/router) and [TanStack Form](https://tanstack.com/form)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Database powered by [Supabase](https://supabase.com/)
- Email delivery by [Resend](https://resend.com/)
