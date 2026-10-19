# SDC Website — Deep Scan Findings Report

> **Scan Date**: 2026-10-13  
> **Codebase**: `/home/zephyr/sdc-website`  
> **Scope**: Security vulnerabilities, broken features, incomplete features, missing features

---

## Quick Stats

| Category | Count |
|:---|:---:|
| 🔴 CRITICAL Security Vulnerabilities | 6 |
| 🟠 HIGH Security Vulnerabilities | 6 |
| 🟡 MEDIUM Security Issues | 7 |
| 💀 BROKEN Features | 11 |
| ⚠️ INCOMPLETE Features | 9 |
| ❌ MISSING Features (should exist) | 13 |
| 🗑️ Dead Code Components | 8 |
| **TOTAL FINDINGS** | **60** |

---

# PART 1: SECURITY VULNERABILITIES

## 🔴 CRITICAL (6)

### C1. Role Escalation on INSERT — Anyone Can Self-Promote to SUPER_ADMIN

- **File**: [schema.sql](file:///home/zephyr/sdc-website/supabase/schema.sql) — trigger definition
- **Problem**: The `prevent_unauthorized_role_change()` trigger only fires on `UPDATE`, not `INSERT`. A new user can insert a row into `members` with `role: 'SUPER_ADMIN'` and immediately gain full admin privileges.
- **Fix**: Change trigger to `BEFORE INSERT OR UPDATE ON members`.

### C2. `is_admin()` Function Matches Wrong Roles

- **File**: [schema.sql](file:///home/zephyr/sdc-website/supabase/schema.sql) — `is_admin()` function
- **Problem**: Uses `LIKE '%LEAD%'` which matches "Web Dev Lead", and `LIKE '%MASTER%'` which matches "Scrum Master". Anyone with these titles passes admin checks.
- **Fix**: Use exact `IN ('ADMIN', 'SUPER_ADMIN', 'MASTER_ADMIN')` instead of LIKE patterns.

### C3. Storage Upload Has No Auth Check — Anonymous File Uploads

- **File**: [schema.sql](file:///home/zephyr/sdc-website/supabase/schema.sql) — storage INSERT policies (around L147-149)
- **Problem**: Storage bucket INSERT policies don't check `auth.uid() IS NOT NULL`. Anyone (including unauthenticated visitors) can upload files to your storage buckets.
- **Fix**: Add `auth.uid() IS NOT NULL` to all storage INSERT policies.

### C4. Member INSERT Allows NULL user_id — Anonymous DB Flooding

- **File**: [schema.sql](file:///home/zephyr/sdc-website/supabase/schema.sql) — members INSERT policy
- **Problem**: The INSERT policy on `members` doesn't require `user_id IS NOT NULL`. Anon users can flood the members table with garbage rows.
- **Fix**: Add `WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id)`.

### C5. Ticket INSERT is `WITH CHECK (true)` — Unlimited Anonymous Ticket Minting

- **File**: [schema.sql](file:///home/zephyr/sdc-website/supabase/schema.sql) — tickets INSERT policy
- **Problem**: Any unauthenticated user can mint unlimited tickets directly through the Supabase API.
- **Fix**: Add `WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id)`.

### C6. Offline Auth Bypass — Fake Email Verification & Password Reset

- **Files**: 
  - [EmailVerificationModal.tsx](file:///home/zephyr/sdc-website/src/components/auth/EmailVerificationModal.tsx) — simulated inbox
  - [AuthModal.tsx](file:///home/zephyr/sdc-website/src/components/auth/AuthModal.tsx) — "Set New Password Directly" shortcut
- **Problem**: When Supabase is offline, the email verification modal has a simulated inbox that auto-verifies any email. The auth modal has a direct password set shortcut. Both completely bypass actual verification.

---

## 🟠 HIGH (6)

### H1. localStorage Session Hijacking — Inject SUPER_ADMIN Role

- **File**: [AuthContext.tsx](file:///home/zephyr/sdc-website/src/context/AuthContext.tsx) ~L88-98
- **Problem**: If Supabase session is null on mount, `currentUser` is loaded from localStorage and never cleared. An attacker can open DevTools, set `localStorage.sdc_users_accounts_v2` with `role: 'SUPER_ADMIN'`, reload, and get admin access.

### H2. App.tsx Auto-Syncs localStorage Role to Database

- **File**: [App.tsx](file:///home/zephyr/sdc-website/src/App.tsx) ~L89-109
- **Problem**: On every auth change, the app writes `currentUser.role` from state to Supabase. Combined with H1, a localStorage-injected SUPER_ADMIN role gets permanently cemented into the live database.

### H3. deleteAccount Doesn't Delete from auth.users

- **File**: [AuthContext.tsx](file:///home/zephyr/sdc-website/src/context/AuthContext.tsx) — deleteAccount function
- **Problem**: Account deletion only removes rows from `members` and `tickets` tables. The actual Supabase auth.users entry persists. The "deleted" user can still log in with their credentials — they just won't have a member profile.

### H4. Ticket IDOR — Any Authenticated User Can Read All Tickets

- **File**: [schema.sql](file:///home/zephyr/sdc-website/supabase/schema.sql) — tickets SELECT policy
- **Problem**: The SELECT policy is `auth.uid() IS NOT NULL` without filtering by `user_id = auth.uid()`. Any logged-in user can read every ticket in the system, including other users' pass details and personal info.

### H5. SVG/HTML Upload XSS — No MIME Type Validation

- **Files**: [memberService.ts](file:///home/zephyr/sdc-website/src/services/memberService.ts), [galleryService.ts](file:///home/zephyr/sdc-website/src/services/galleryService.ts)
- **Problem**: Avatar and gallery uploads don't validate MIME types. An attacker can upload an SVG containing embedded JavaScript. When the SVG is rendered in an `<img>` tag served from your Supabase storage URL, the XSS payload executes.

### H6. RSVP RPCs Callable by Anonymous Users

- **File**: [schema.sql](file:///home/zephyr/sdc-website/supabase/schema.sql) — `increment_rsvp` / `decrement_rsvp` functions
- **Problem**: These RPCs have no auth checks. Anonymous users can call them to arbitrarily inflate or deflate RSVP counts.

---

## 🟡 MEDIUM (7)

### M1. Client-Side roleUtils.ts Has Same Substring Bug as DB

- **File**: [roleUtils.ts](file:///home/zephyr/sdc-website/src/utils/roleUtils.ts)
- **Problem**: Client-side role checks use the same broad substring matching as the DB `is_admin()` function, granting admin UI access to "Scrum Master" etc.

### M2. Inconsistent Password Minimums

- **Files**: [EmailVerificationModal.tsx](file:///home/zephyr/sdc-website/src/components/auth/EmailVerificationModal.tsx) (4 chars), [AuthContext.tsx](file:///home/zephyr/sdc-website/src/context/AuthContext.tsx) (6 chars)
- **Problem**: Different parts of the app enforce different password minimum lengths. A user setting a password through email verification can use a 4-character password.

### M3. OAuth Token Left in localStorage

- **File**: [AuthContext.tsx](file:///home/zephyr/sdc-website/src/context/AuthContext.tsx) — OAuth flow
- **Problem**: `sdc_oauth_exchange` is written to localStorage during OAuth flow but never cleaned up after use.

### M4. Missing search_path on SECURITY DEFINER Functions

- **File**: [schema.sql](file:///home/zephyr/sdc-website/supabase/schema.sql) — `set_member_role`, `is_admin`
- **Problem**: SECURITY DEFINER functions without explicit `search_path` can be exploited via schema poisoning if a user creates objects in a schema that appears earlier in the search path.

### M5. Placeholder Supabase URL Could Leak Credentials

- **File**: [supabase.ts](file:///home/zephyr/sdc-website/src/lib/supabase.ts)
- **Problem**: Falls back to `https://placeholder.supabase.co` with `autoRefreshToken: true`. If env vars aren't set in production, the client sends auth tokens to a domain you don't control.

### M6. Offline Passwordless Sign-In

- **File**: [AuthContext.tsx](file:///home/zephyr/sdc-website/src/context/AuthContext.tsx) — offline fallback login
- **Problem**: When Supabase is unavailable, the login fallback accepts username-only authentication without any password check. Anyone can log in as any user.

### M7. Ticket Scanner Matches Substrings — False Positive Check-Ins

- **File**: [TicketScannerModal.tsx](file:///home/zephyr/sdc-website/src/components/ticketing/TicketScannerModal.tsx)
- **Problem**: Typing "A" in the scanner matches the first ticket whose ID contains "A". Combined with check-ins never persisting to the DB, this is unreliable for event management.

---

# PART 2: BROKEN FEATURES

## B1. Browser Back/Forward Navigation Doesn't Work

- **File**: [App.tsx](file:///home/zephyr/sdc-website/src/App.tsx#L37) — `useState<NavTab>('dashboard')`
- **Problem**: Tab navigation only updates React state. No history entries are pushed. Back button navigates away from the site entirely.

## B2. Page Refresh Resets to Dashboard

- **File**: [App.tsx](file:///home/zephyr/sdc-website/src/App.tsx#L37)
- **Problem**: `activeTab` always defaults to `'dashboard'` on mount. Refreshing while on Schedule, Roster, Gallery, or Profile dumps you back to the landing page.

## B3. Dashboard Stats Are All Hardcoded to Zero

- **Files**: 
  - [mockData.ts](file:///home/zephyr/sdc-website/src/data/mockData.ts#L3-L11) — all stats = 0
  - [GlobalDashboard.tsx](file:///home/zephyr/sdc-website/src/components/dashboard/GlobalDashboard.tsx#L8-L19) — stats prop is accepted but **never rendered**
  - [DomainRadar.tsx](file:///home/zephyr/sdc-website/src/components/dashboard/DomainRadar.tsx#L11-L46) — hardcoded track hours
  - [StatCounter.tsx](file:///home/zephyr/sdc-website/src/components/dashboard/StatCounter.tsx) — orphaned, never used
- **Problem**: No statistics are calculated from real data. Everything is either hardcoded to 0 or ignored.

## B4. New Members Created via AddMemberModal Have Broken Display Names

- **Files**: [memberService.ts](file:///home/zephyr/sdc-website/src/services/memberService.ts#L136), [AddMemberModal.tsx](file:///home/zephyr/sdc-website/src/components/roster/AddMemberModal.tsx#L84-L120)
- **Problem**: PostgreSQL returns snake_case (`full_name`, `avatar_url`, `github_url`). The service casts it directly as `ClubMember` without mapping to camelCase. Result: `member.fullName` is `undefined`, name shows as "Club Member", avatar is missing.
- **Also**: `hours_contributed` is omitted from the DB insert payload — admin-entered hours are silently discarded.

## B5. Ticket Minting Never Persists to Database

- **File**: [App.tsx](file:///home/zephyr/sdc-website/src/App.tsx#L218-L220)
- **Problem**: `handleSaveTicket` only does `setTickets(prev => [newTicket, ...prev])`. `ticketService.mintTicket()` is **never called**. Tickets exist only in React state and vanish on page refresh.

## B6. Ticket Check-In Never Persists to Database

- **File**: [App.tsx](file:///home/zephyr/sdc-website/src/App.tsx#L222-L226)
- **Problem**: `handleCheckInTicket` only updates local state. `ticketService.checkInTicket()` is **never called**. Check-in status resets on page reload.

## B7. Duplicate RSVP Prevention Is Bypassable

- **File**: [EventRSVPModal.tsx](file:///home/zephyr/sdc-website/src/components/ticketing/EventRSVPModal.tsx#L63-L75)
- **Problem**: Duplicate check matches on `attendeeEmail`, but the email input field is freely editable. Changing the email bypasses detection — one user can mint unlimited passes.

## B8. QR Scanner Is Fake — No Camera Access

- **File**: [TicketScannerModal.tsx](file:///home/zephyr/sdc-website/src/components/ticketing/TicketScannerModal.tsx#L102-L144)
- **Problem**: The "scanner" is a CSS animation with crosshairs. There's no `getUserMedia`, no `<video>`, no QR decoding library. It's manual text input only, dressed up to look like a scanner.

## B9. Navbar Is Invisible on Initial Page Load

- **File**: [Navbar.tsx](file:///home/zephyr/sdc-website/src/components/common/Navbar.tsx#L55-L65)
- **Problem**: `navVisible` is false until scroll > 2.6× viewport height. First-time visitors see **no navigation, no sign-in button, no hamburger menu** — they must scroll through the entire 350vh pinned hero section to discover navigation exists.

## B10. Landing GIF Broken on Tablets and Mobile Landscape

- **File**: [GlobalDashboard.tsx](file:///home/zephyr/sdc-website/src/components/dashboard/GlobalDashboard.tsx#L84-L95)
- **Problem**: At 769-1024px portrait (iPad), the 16:9 desktop GIF renders with `object-cover`, cropping 50%+ of the content. On mobile landscape, the portrait GIF gets cropped top and bottom. Also uses `100vh` instead of `100dvh`, causing jitter on mobile browsers.

## B11. Session Deletion Orphans Tickets

- **File**: [App.tsx](file:///home/zephyr/sdc-website/src/App.tsx#L271-L274), [eventService.ts](file:///home/zephyr/sdc-website/src/services/eventService.ts#L264-L274)
- **Problem**: Deleting a session removes the event row but doesn't cascade-delete associated tickets. Users holding passes for deleted events see broken event details.

---

# PART 3: INCOMPLETE FEATURES

## I1. Admin Accounts Table — Role Assignment Is Broken

- **Files**: [MemberDirectory.tsx](file:///home/zephyr/sdc-website/src/components/roster/MemberDirectory.tsx#L84-L128), [AuthContext.tsx](file:///home/zephyr/sdc-website/src/context/AuthContext.tsx#L991-L1004)
- **Problem**: Saves the role *title string* (e.g. "Lead Designer") to `members.role`, not the actual security role (`ADMIN`, `SUPER_ADMIN`). Status messages are a single global variable — editing multiple rows causes messages to overwrite each other.

## I2. Profile Photo Upload — Not Persisted Until Save

- **File**: [UserProfile.tsx](file:///home/zephyr/sdc-website/src/components/profile/UserProfile.tsx#L125-L142)
- **Problem**: Upload goes to Supabase storage but isn't linked to the user record until "SAVE CHANGES" is clicked. Navigating away loses the upload. In offline mode, uploading stores a base64 blob in localStorage which can exceed the 5MB quota and crash.

## I3. ID Card Download — Breaks with OAuth Avatars

- **File**: [UserProfile.tsx](file:///home/zephyr/sdc-website/src/components/profile/UserProfile.tsx#L105-L123)
- **Problem**: `html2canvas` capturing a Google OAuth avatar (`lh3.googleusercontent.com`) fails CORS, tainting the canvas. Export produces a blank/missing avatar in the downloaded image.

## I4. Pass PDF/PNG Export — Distorted by 3D Transforms

- **Files**: [PassExporter.ts](file:///home/zephyr/sdc-website/src/components/ticketing/PassExporter.ts), [PhysicalPass.tsx](file:///home/zephyr/sdc-website/src/components/ticketing/PhysicalPass.tsx#L114-L116)
- **Problem**: The pass is wrapped in a 3D transform component. `html2canvas` captures the transformed element with skewed geometry. Also, Tailwind v4's `oklch()` colors cause `html2canvas` to produce blank images.

## I5. Session Editing — Double Database Update

- **Files**: [AddSessionModal.tsx](file:///home/zephyr/sdc-website/src/components/schedule/AddSessionModal.tsx#L147-L156), [App.tsx](file:///home/zephyr/sdc-website/src/App.tsx#L259-L269)
- **Problem**: Editing a session calls `eventService.updateEvent()` inside AddSessionModal, then App.tsx calls it **again**. Redundant double database roundtrip on every edit.

## I6. Gallery Upload — Offline Photos Vanish on Refresh

- **File**: [galleryService.ts](file:///home/zephyr/sdc-website/src/services/galleryService.ts#L41-L134)
- **Problem**: Offline gallery uploads use `URL.createObjectURL()` which creates a temporary blob URL. Gone on page refresh.

## I7. Loading Screen — Crashes in Private Browsing

- **File**: [GlobalLoadingScreen.tsx](file:///home/zephyr/sdc-website/src/components/common/GlobalLoadingScreen.tsx#L31)
- **Problem**: `sessionStorage.getItem('sdc_has_booted')` is called without try/catch. In private browsing modes or iframes where storage is blocked, this throws `SecurityError` and crashes the entire app on startup.

## I8. Mobile Navbar Missing Key Buttons

- **File**: [Navbar.tsx](file:///home/zephyr/sdc-website/src/components/common/Navbar.tsx#L158, L268-L300)
- **Problem**: "RSVP PASS" button has `hidden sm:flex` — invisible on mobile. `onOpenScanner` prop exists but is **never rendered anywhere** in the component.

## I9. Member Creation Fails Entirely When Offline

- **File**: [memberService.ts](file:///home/zephyr/sdc-website/src/services/memberService.ts#L71-L73)
- **Problem**: If Supabase isn't configured, `createOrUpdateMember` returns `null` with no fallback. Admin sees "Failed to save member" with no way to add members offline.

---

# PART 4: MISSING FEATURES

These are features that should exist on a club management website but are completely absent:

| # | Feature | Impact |
|:---|:---|:---|
| **X1** | **Client-Side Routing** | No `react-router-dom`. URL is always `/`. Can't bookmark or share links to specific pages. |
| **X2** | **React Error Boundary** | Any unhandled exception crashes the entire app to a white screen with no recovery. |
| **X3** | **Editing Existing Members** | [MemberModal.tsx](file:///home/zephyr/sdc-website/src/components/roster/MemberModal.tsx) is read-only. No edit button, no edit form. Once a member is created, their bio/skills/links can't be modified through the UI. |
| **X4** | **Gallery Lightbox / Fullscreen Preview** | No click-to-enlarge. Photos are stuck in fixed `aspect-video` thumbnails with no way to view full resolution. |
| **X5** | **Gallery Photo Deletion UI** | `galleryService.deletePhoto()` exists in code but there's no delete button anywhere in [GalleryView.tsx](file:///home/zephyr/sdc-website/src/components/gallery/GalleryView.tsx). |
| **X6** | **Schedule Date/Time Validation** | No validation on dates (can create events in the past) or times (end time can be before start time). Date field isn't even required. |
| **X7** | **Attendance Tracking System** | No attendance tables, session rosters, check-in histories, or exportable attendance reports. |
| **X8** | **Notification System** | No notification bell, drawer, banner, or toast. Users get zero feedback on event updates or confirmations. |
| **X9** | **Contact / About Page** | No dedicated page with contact info, campus map, or inquiry form. |
| **X10** | **Accessibility (ARIA & Keyboard)** | All modals lack `role="dialog"`, `aria-modal`, focus trapping, and Escape-to-close. Low-contrast `text-[9px] text-zinc-600` on black fails WCAG AA. |
| **X11** | **SEO & Social Metadata** | No Open Graph tags, no Twitter Cards, no canonical links, no `robots.txt`, no `sitemap.xml`. |
| **X12** | **Analytics Integration** | No GA, PostHog, Plausible, or any tracking. |
| **X13** | **Member Data Export** | No way for admins to export member lists to CSV/Excel/JSON. |

---

# PART 5: DEAD CODE

These components exist in the codebase but are **never imported or rendered**:

| Component | File | Lines | Notes |
|:---|:---|:---:|:---|
| `ProjectPortfolio` | `src/components/profile/ProjectPortfolio.tsx` | 251 | Abandoned project showcase. Not hooked to any data source. |
| `SkillHexGrid` | `src/components/profile/SkillHexGrid.tsx` | 51 | Renders bars (not hex grid). Ignores its `skills` prop and hardcodes mock data. |
| `StatCounter` | `src/components/dashboard/StatCounter.tsx` | 83 | Animated counter. Never rendered. |
| `BlueprintManual` | `src/components/common/BlueprintManual.tsx` | 159 | Never imported. |
| `LandingHeroStage` | `src/components/dashboard/LandingHeroStage.tsx` | 95 | Never imported. |
| `ChromeOrbScene` | `src/components/3d/ChromeOrbScene.tsx` | 202 | 3D scene. Never imported. |
| `GlbModelViewer` | `src/components/3d/GlbModelViewer.tsx` | 124 | GLB viewer. Never imported. |
| `CustomCursor` | `src/components/common/CustomCursor.tsx` | 85 | Never imported. |

**Total dead code: ~1,050 lines** that can be safely deleted.

---

# Priority Fix Order (Recommended)

### Do First (Security — your app is exploitable right now)
1. **C1**: Fix trigger to fire on INSERT too
2. **C2 + M1**: Fix `is_admin()` and `roleUtils.ts` to use exact role matching
3. **C3 + C4 + C5**: Add auth checks to all INSERT policies
4. **H1 + H2**: Stop trusting localStorage for role, stop syncing it to DB
5. **H4**: Scope ticket SELECT to `user_id = auth.uid()`
6. **C6 + M6**: Remove offline auth bypasses or gate them behind dev-only flags

### Do Next (Core features are broken)
7. **B5 + B6**: Wire ticket mint/check-in to actual service calls
8. **B4**: Fix snake_case→camelCase mapping in memberService
9. **B9**: Make navbar visible immediately on page load
10. **I7**: Wrap sessionStorage access in try/catch
11. **B7**: Fix duplicate RSVP bypass

### Do Later (Quality & completeness)
12. **X1**: Add routing (even simple hash-based)
13. **X2**: Add React Error Boundary
14. **X3**: Add member edit capability
15. **B3**: Wire dashboard stats to real data
16. Clean up dead code (Part 5)
17. Add missing features (X4–X13) based on priority
