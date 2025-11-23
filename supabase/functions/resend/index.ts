import { RESEND_API_KEY } from "../../../src/config/secrets";

if (!RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set');
}

const handler = async (_request: Request): Promise<Response> => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Amigos Ocultos IAM, IP <noreply@iam.gov.mz>',
      to: ['musekwa2011@gmail.com'],
      subject: 'hello world',
      html: '<strong>it works!</strong>',
    }),
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export default handler;