

## BizBase Growth Control V1
BizBase Business Mode is intentionally centered on a small loop rather than a large ERP surface:
**Business Pulse → Growth Plan → Campaign → Lead Capture → Follow-up → Revenue.**
The product should earn retention through measurable business value, not data lock-in. The first experience is a 30-day free trial with no card or auto-pay; advanced execution can later be metered by usage.


## BizBase Growth Control V1.1

This build focuses on real business workflows: Business Pulse, Growth Engine, lead leakage detection, 7-day growth plans, usage metering, 30-day trial, realtime business synchronization, mobile/PWA support, and safer error handling.

### Production requirements
- Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel.
- Run all Supabase migrations in order.
- Configure Razorpay secrets/webhooks only when live billing is enabled.
- Configure external channel credentials before enabling publishing/lead ingestion.
- Do not ship service-role keys to the browser.
- Verify RLS/advisors and test owner + team-member isolation before onboarding real businesses.
