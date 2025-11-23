// Setup type definitions for built-in Supabase Runtime APIs
// @deno-types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts"
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Declare Deno global for TypeScript
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

// Type definitions
interface EmailRequest {
  to: string;
  subject: string;
  participantName: string;
  otp: string;
  loginUrl: string;
}

interface ResendResponse {
  id?: string;
  error?: {
    message: string;
    status: number;
  };
}

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get API key from environment variable
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "RESEND_API_KEY environment variable is not set",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get from email address (configurable via env, with fallback)
    const FROM_EMAIL =
      Deno.env.get("RESEND_FROM_EMAIL") || "noreply@iam.gov.mz";

    // Parse and validate request body
    const body: EmailRequest = await req.json();

    // Validate required fields
    if (!body.to || !body.subject || !body.otp || !body.loginUrl) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: to, subject, otp, loginUrl",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.to)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build HTML email template
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${body.subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #008000; margin-top: 0;">IAM, IP</h1>
    <h2 style="color: #333; margin-top: 0;">Amigos Ocultos</h2>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e0e0e0;">
    <p style="font-size: 16px;">Olá ${body.participantName || "Participante"},</p>
    
    <p style="font-size: 16px;">
      Você foi adicionado ao sistema de Amigos Ocultos do Instituto de Amêndoas de Moçambique, IP - Sede.
    </p>
    
    <div style="background-color: #f0f8f0; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; border: 2px solid #008000;">
      <p style="margin: 0; font-size: 14px; color: #666; margin-bottom: 10px;">Seu código de acesso:</p>
      <p style="margin: 0; font-size: 32px; font-weight: bold; color: #008000; letter-spacing: 4px; font-family: 'Courier New', monospace;">
        ${body.otp}
      </p>
    </div>
    
    <p style="font-size: 16px;">
      Use este código junto com seu email para fazer login no sistema.
    </p>
    
    <div style="margin: 30px 0; text-align: center;">
      <a href="${body.loginUrl}" 
         style="display: inline-block; background-color: #008000; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
        Fazer Login
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      <strong>Importante:</strong> Este código expira em 24 horas. Se você não solicitou este código, ignore este email.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999; margin: 0;">
      Este é um email automático, por favor não responda.
      <br>
      Instituto de Amêndoas de Moçambique, IP - Sede
    </p>
  </div>
</body>
</html>
    `;

    // Send email via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: body.to,
        subject: body.subject,
        html: html,
      }),
    });

    const data: ResendResponse = await resendResponse.json();

    // Check if Resend API call was successful
    if (!resendResponse.ok) {
      console.error("Resend API error:", data);
      return new Response(
        JSON.stringify({
          error: data.error?.message || "Failed to send email",
          details: data,
        }),
        {
          status: resendResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        messageId: data.id,
        message: "Email sent successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
