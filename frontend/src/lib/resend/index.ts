import { Resend } from "resend";
import { RESEND_API_KEY } from "@/config/secrets";

export const resend = new Resend(RESEND_API_KEY);