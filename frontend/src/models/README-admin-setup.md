# Admin Setup Instructions

This script sets up the admin user for the Secret Santa application.

## Admin Details

- **Name**: Musekwa Evariste
- **Email**: musekwa2011@gmail.com
- **OTP Expiration**: 1 year from creation date
- **OTP Behavior**: The OTP is reusable and will NOT be deleted after login (unlike regular users)

## How to Run

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `setup-admin.sql`
4. Click "Run" to execute the script
5. Check the output for the generated OTP (it will be displayed in the NOTICE messages)

### Option 2: Using psql Command Line

```bash
psql -h <your-supabase-host> -U postgres -d postgres -f src/models/setup-admin.sql
```

### Option 3: Using Supabase CLI

```bash
supabase db execute -f src/models/setup-admin.sql
```

## What the Script Does

1. **Adds `is_admin` column** to the `participants` table (if it doesn't exist)
2. **Creates or updates the admin participant** with:
   - Name: Musekwa Evariste
   - Email: musekwa2011@gmail.com
   - Code: 00000000 (8-digit admin code)
   - is_admin: true
   - is_verified: true
3. **Generates a unique 6-digit OTP** that expires in 1 year
4. **Creates a verification record** with the OTP and expiration date

## Important Notes

- The OTP will be displayed in the SQL output (NOTICE messages)
- **Save the OTP securely** - it will be used repeatedly for admin login
- The OTP expires after 1 year - you'll need to run the script again to generate a new one
- Only the admin email (musekwa2011@gmail.com) can access admin routes
- The admin OTP is NOT deleted after login (unlike regular user OTPs)

## Security

- The admin OTP should be kept secure and only shared with authorized personnel
- The admin has full access to upload participants and manage the system
- Regular users cannot access admin routes even if they try

## Troubleshooting

If you encounter errors:

1. Make sure the `participants` table exists
2. Check that the email `musekwa2011@gmail.com` is not already in use by a non-admin user
3. Verify that the `verifications` table exists and has the correct structure
4. Check the Supabase logs for detailed error messages
