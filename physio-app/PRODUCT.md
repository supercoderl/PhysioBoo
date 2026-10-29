# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Four areas, one app (public site is the current design focus):

- **Public site visitors** (tenant-branded client pages):
  - Patients finding a doctor, clinic or service and sending an appointment request.
  - Readers of health articles on the blog.
  - Referrers and families choosing care on behalf of someone else.
  - Prospective hospital clients evaluating PhysioBoo as a platform.
- **Patients** signed in to the patient portal.
- **Hospital staff** working in `/admin` (registration, doctor desk, nursing, prescription, pharmacy, inventory, admission, surgery). These are tenant users doing dense, repeated clinical and operational tasks.
- **The platform owner**, a single expert operator, in `/superadmin`. Tenants never see it.

## Product Purpose

PhysioBoo is a multi-tenant hospital and physiotherapy clinic management platform. Each tenant (a Hospital Group, with Hospitals as its branches) gets its own branded public site and its own `/admin` workspace, run from one platform the owner operates. Success for the public site is a patient reaching the right doctor or clinic and sending a request the clinic can act on. Success for `/admin` is staff completing clinical and operational work quickly and without error.

## Positioning

A multi-tenant physio SaaS: one platform, many hospital groups, each with its own branding, data and isolated database (DB-per-tenant redesign in progress, see `docs/multi-tenant-database-redesign.md`).

## Operating Context

- Appointments on the public site are a **request**: the visitor sends it from a doctor's profile and the clinic phones back to arrange a time. It is not instant self-scheduling.
- Public site search covers doctors, specialties, clinics, services and articles through one `/search`.
- Tenant identity (name, branding) is injected per tenant; pages must not hard-code a hospital name.
- `/admin` serves hospital staff; platform-level configuration (menus, sequences, print template defaults, master data) belongs to `/superadmin`.
- Backend: .NET 9, PostgreSQL, Clean Architecture. Frontend: Angular 17 (standalone components, signals), Tailwind CSS 3, ng-zorro-antd.

## Capabilities and Constraints

- Public pages share one container, `.public-container`, defined in `src/styles.scss` (see `docs/public-layout-width.md`). Do not hard-code `max-w-[…px] mx-auto px-*`.
- Reuse existing shared components (`boo-button`, `physio-icon`, drawers, dialogs, tables, form controls); do not introduce a competing component set.
- Hospitals are managed by each tenant in `/admin`. Super Admin manages tenants only and offers no hospital CRUD.
- Every redesign starts from `docs/<feature>-redesign.md` before frontend code (project rule in CLAUDE.md).
- Undecided: whether the "prospective hospital clients" audience gets its own marketing surface, or is served by the same tenant-branded pages. Not yet confirmed.

## Brand Commitments

None confirmed beyond the existing implementation. The current look (primary and `primaryDeep` colors, mono eyebrow labels, rounded surfaces) is incumbent evidence, not a binding brand decision.

## Evidence on Hand

- Working public pages: Home, Doctors (list and detail), Hospitals (list and detail), Services (list and detail), Blog (list and article), About, Contact, Search, Privacy, Terms.
- A hero background image at `src/assets/images/background/hero-hospital.png`.
- No testimonials, patient counts, ratings or accreditation claims are on file. Future work must not invent them.

## Product Principles

1. **Tenant-first.** Every public surface must read as the tenant's own site, never a generic template.
2. **Request, don't promise.** Copy and flows describe an appointment as a request the clinic confirms, never a guaranteed slot.
3. **Operate with density, persuade with restraint.** `/admin` and `/superadmin` favour scanability and speed; the public site earns trust through clarity, not decoration.
4. **Reuse before inventing.** Shared components, the shared container and existing tokens come before new patterns.
5. **Health content is not marketing copy.** No unverifiable medical or outcome claims.

## Accessibility & Inclusion

WCAG AA is the required standard (project rule): keyboard navigation, focus management, screen reader support, color contrast and adequate touch targets. Patients may be unwell, older or on slow mobile connections, so mobile-web quality and plain, readable language matter on the public site.
