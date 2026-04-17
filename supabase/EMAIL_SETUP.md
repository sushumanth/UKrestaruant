# Supabase Booking Email Setup

This project now sends booking confirmation emails through a Supabase Edge Function.

## 1) Prerequisites

1. Install Supabase CLI.
2. Have your Supabase project reference (project-ref).
3. Create a Resend account and API key.
4. Verify a sending domain in Resend, or use the onboarding sender for testing.

## 2) Function Source

Function file:
- supabase/functions/send-booking-email/index.ts

## 3) Configure Local Frontend Env

Set in .env:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_SUPABASE_BOOKING_EMAIL_FUNCTION=send-booking-email

## 4) Login and Link Supabase CLI

Run:
- supabase login
- supabase link --project-ref YOUR_PROJECT_REF

## 5) Set Function Secrets in Supabase

Run:
- supabase secrets set RESEND_API_KEY=YOUR_RESEND_API_KEY RESEND_FROM_EMAIL="LuxeReserve <reservations@yourdomain.com>" ALLOWED_ORIGIN=http://localhost:5173

Notes:
- ALLOWED_ORIGIN should match your frontend origin.
- For production, set ALLOWED_ORIGIN to your live domain.

## 6) Deploy the Function

Run:
- supabase functions deploy send-booking-email --no-verify-jwt

Why no-verify-jwt:
- This booking flow is public (no logged-in user token).
- If you want JWT verification enabled later, add auth and remove this flag.

## 7) Test the Function

Run:
- supabase functions invoke send-booking-email --no-verify-jwt --body '{"booking":{"bookingId":"TEST123","customerName":"Test User","customerEmail":"you@example.com","date":"2026-04-17","time":"22:00","guests":2,"tableNumber":6,"depositAmount":5,"paymentStatus":"paid"}}'

Expected response:
- ok true with an email provider id.

## 8) Application Flow

When payment succeeds in booking flow:
1. Booking is saved.
2. Frontend calls Supabase function send-booking-email.
3. Function sends email through Resend.

## 9) Production Notes

1. Keep RESEND_API_KEY only in Supabase secrets, never in frontend env.
2. Use a verified domain for reliable delivery.
3. Add rate limiting in function if needed for abuse prevention.
4. Add monitoring in Supabase logs for email failures.
