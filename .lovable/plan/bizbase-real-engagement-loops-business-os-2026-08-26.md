# BizBase: Real Engagement Loops + Business OS

Do tracks, ek ke baad ek. Track A users ko laata aur rokta hai. Track B businesses ko poora real system deta hai (koi demo/fake nahi).

---

## Track A — Users aayein, ruken, kaam karein

### 1. First-action onboarding (sabse bada lever)
New user signup ke baad 3-step checklist (dismiss ho sakti hai, dashboard ke top par):
- Profile complete karo (photo + headline + skills)
- Pehla post / pehla ask daalo
- 3 log follow/connect karo
Har step par BizCoins + progress bar. Jo user pehle din ek action kar leta hai wahi wapas aata hai.

### 2. Share = reward loop
Aaj share par kuch nahi milta. Add:
- Post/job/profile share par BizCoins (duplicate-proof: per-target ek hi baar)
- Weekly "Top Sharers" + "Top Contributors" leaderboard (existing Leaderboard page me tab)
- Share card par "Powered by BizBase" already hai — job aur community share cards bhi add

### 3. Empty state kabhi khaali na dikhe
Feed, Communities, Events, Jobs — jab kuch na ho to "aap pehle ho" CTA + suggested people/communities, na ki blank screen.

### 4. Public SEO pages (Google se free traffic)
Jobs ke liye pehle se hain. Wahi pattern:
- `/communities/:slug` aur `/events/:slug` — public, JSON-LD (`Event`, `Organization`), sitemap me
- `/business/:username` — public business profile page (Track B se juda)

### 5. Return triggers
- Weekly digest email: "aapke area me 12 nayi jobs, 3 naye asks, 5 log jinse connect karna chahiye" (existing digest function extend)
- In-app notification jab koi aapki profile dekhe / aapke skill ki job aaye
- Invite flow: har page se "Invite karo, dono ko coins" (referral system already hai, bas surface karna hai)

---

## Track B — Business OS (chhota/bada, national/international, product/service)

"Launching Soon" overlay hataana hai aur asli modules dene hain.

### Business public page — `/business/:username`
Logo, banner, about, services/products, team, contact form, jobs by this business, reviews-ready structure. SEO + `Organization` JSON-LD. Yahi page business share karega — organic traffic laayega.

### Modules (sab real CRUD, RLS ke saath)
| Module | Kya milega |
|---|---|
| Dashboard | Real KPIs: revenue, outstanding, leads by stage, team count, jobs |
| Catalog | Products **aur** Services — price, currency, SKU, tax rate, images, active/inactive |
| CRM | Leads + Customers, pipeline stages (New → Contacted → Qualified → Won/Lost), notes, activity timeline |
| Finance | Invoices with line items, tax (GST% India / VAT / none), multi-currency, paid/unpaid/overdue, PDF-style print view |
| Projects | Projects + tasks, assignee (team member), due date, status |
| Team | Invite by email, roles (owner/admin/manager/staff), permissions enforced in DB |
| Hiring | Business ke naam se job post + applicants inbox |
| Settings | Profile, username, currency, tax defaults, business type (product/service/both), country |

### Data import (CSV) — "easily data import"
Ek shared importer: file upload → column mapping UI → preview → validate → bulk insert.
Support: Leads, Customers, Products/Services, Invoices. Duplicate detection email/phone/SKU par. Export bhi (CSV) — lock-in ka feel nahi hona chahiye.

### National / International readiness
- Country + currency per business; invoice currency per invoice
- Tax mode: GST (CGST/SGST/IGST split), VAT, none
- Number/date formatting locale ke hisaab se (India default `en-IN`)

### "Sab log milke grow karein"
- Business Directory (`/businesses`) — public, searchable by industry/city/type, SEO indexed
- B2B connect: business se business connection + intro request
- Lead handoff: user kisi business ko referral bhej sake (referral coins)

---

## Technical notes

**New tables** (public schema, GRANTs + RLS + updated_at triggers, business_id scoped, `is_business_team_member()` se access):
`business_products`, `business_customers`, `business_invoices`, `business_invoice_items`, `business_invites`, `business_activities` (timeline), `business_reviews` (later phase).
Existing `business_leads`, `business_services`, `business_projects`, `business_transactions`, `business_team_members` reuse honge — leads me `stage` column add.

`businesses` me add: `country`, `currency`, `tax_mode`, `default_tax_rate`, `business_type`.

Team roles DB-level check ke through enforce honge (roles alag table me, profile par nahi).

**Frontend**: existing `BusinessLayout` + `BusinessContext` reuse. Shared `<CsvImporter />` aur `<DataTable />` components. Sab colors semantic tokens se (naya hardcoded color nahi).

**Edge functions**: `business-csv-import` (bulk validate/insert), weekly digest extend. Emails existing SMTP/Resend path se.

---

## Build order

1. Business schema migration + `businesses` extra fields
2. Business public page `/business/:username` + directory `/businesses` (SEO)
3. Launching Soon hatao → Catalog, CRM (stages), Finance (invoices), Team invites, Projects real
4. CSV import/export
5. Track A: onboarding checklist, share rewards + leaderboard, empty states, weekly digest, invite surfacing
6. Communities/Events public SEO pages + sitemap

Har phase ke baad build + preview verify.
