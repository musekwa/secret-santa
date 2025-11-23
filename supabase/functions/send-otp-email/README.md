# Send OTP Email Edge Function

This Supabase Edge Function sends OTP emails to participants using Resend API.

## Setup

1. **Set Environment Variables** in your Supabase project:
   - `RESEND_API_KEY`: Your Resend API key (starts with `re_`)
   - `RESEND_FROM_EMAIL`: Email address to send from (optional, defaults to `noreply@iam.gov.mz`)

2. **Deploy the Function**:
   ```bash
   supabase functions deploy send-otp-email
   ```

## Usage

### Request Body:

```json
{
  "to": "participant@example.com",
  "subject": "Seu código de acesso - Amigos Ocultos IAM, IP",
  "participantName": "John Doe",
  "otp": "123456",
  "loginUrl": "https://yourapp.com/login"
}
```

### Response:

```json
{
  "success": true,
  "messageId": "resend_message_id",
  "message": "Email sent successfully"
}
```

## Features

- ✅ CORS support for browser requests
- ✅ Input validation
- ✅ Error handling
- ✅ HTML email template
- ✅ Environment variable configuration
- ✅ TypeScript type safety
