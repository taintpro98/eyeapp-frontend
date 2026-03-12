# ALumiEye User App — Cursor Prompt

## Goal

Build a **desktop-first user app** for **ALumiEye**, a subscription-based market intelligence and trading insights platform.

The app should feel like a **premium SaaS dashboard** for active traders and market-focused users. It is **not** a mobile-first product. Optimize for **desktop web experience**.

Use the attached **ALumiEye logo** as the visual anchor for the brand identity.

---

## Brand direction

### Brand feel
- Clean
- Premium
- Analytical
- Confident
- Modern
- Slightly mysterious / visionary
- Not flashy like a meme-coin site
- Not too corporate and boring either

### Logo-inspired visual language
The logo uses:
- a **deep purple** primary stroke
- a **soft warm light background**
- a geometric and symbolic style: **eye + triangle + circular arcs**

The UI should subtly inherit this identity:
- use **deep purple / violet** as the primary brand accent
- use **soft off-white / warm neutral** backgrounds
- use **muted grays / warm gray text**
- use triangle / eye / ring-inspired geometry very subtly in spacing, cards, icon treatment, dividers, glow, focus rings, and empty states
- keep it modern and restrained, not overly decorative

### Suggested color direction
Use these as inspiration, not as rigid brand rules:
- Primary brand: `#6F2C91` or similar deep purple
- Darker accent: `#4B1F63`
- Soft highlight purple: `#8B5FBF`
- Background: `#F4F0EA` / `#F7F4EF`
- Surface: `#FFFFFF`
- Border: `#E7DFD6`
- Text primary: `#2E2630`
- Text secondary: `#6E6470`

Use tasteful contrast. The app should look premium and readable for long sessions.

---

## Tech stack

Build the app with:

- **React**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **shadcn/ui**
- **TanStack Query**
- **Zustand**
- **React Router**
- **lucide-react**

If needed, create mock API layers and mock data so the app is fully navigable.

---

## App concept

This is the **user app** for ALumiEye.  
Users buy subscription plans. The backend controls:

- which sidebar items are shown
- which market options are available in the market toggle
- which features are locked
- which pages are accessible

The frontend must be **data-driven** and **flexible**.

Do **not** hardcode the sidebar or market toggle.  
Instead, simulate a backend bootstrap response and render from arrays.

---

## Layout requirements

Create a **desktop-first application layout** with:

### 1. Left sidebar
- flat sidebar only
- **no nested children**
- supports:
  - visible item
  - locked item
  - active item
  - hidden item (not rendered)
- elegant icons
- optional badge like `Pro`, `Premium`, `Locked`
- collapsible behavior is welcome if implemented cleanly

### 2. Top bar
Contains:
- page title / breadcrumb area
- **market toggle** (important)
- search input or quick search placeholder
- notifications icon
- user profile dropdown

### 3. Main content
Main content changes by feature page.
All complexity should live here, not inside the sidebar.

---

## Navigation model

The UI must be driven by backend-like data such as:

```ts
type SidebarItem = {
  key: string
  label: string
  path: string
  icon: string
  visible: boolean
  accessible: boolean
  reason?: string | null
  badge?: string | null
}

type MarketToggleItem = {
  code: string
  label: string
  accessible: boolean
  selected: boolean
  reason?: string | null
}
```

Create a mock bootstrap response like:

```ts
type BootstrapResponse = {
  user: {
    id: string
    displayName: string
    role: "user" | "admin"
    status: "active" | "blocked"
  }
  subscription: {
    planCode: "free" | "pro" | "premium"
    status: "active" | "expired"
    expiresAt: string
  }
  navigation: {
    sidebar: SidebarItem[]
    marketToggle: MarketToggleItem[]
  }
}
```

Use this data to render the app.

---

## Default UX behavior

### Sidebar
- render only items with `visible = true`
- if `accessible = false`, show the item in a locked state
- clicking a locked item should open an **upgrade modal**
- do not use nested navigation

### Market toggle
- render from backend data
- only one selected market at a time
- inaccessible markets may still be shown as locked for upsell
- clicking a locked market should also trigger an upgrade modal
- selected market should update page state cleanly

---

## Suggested free-user bootstrap data

Use a realistic default state for a **free user**:

### Sidebar items
- Dashboard
- Market
- Signals
- Watchlist
- Portfolio (locked)
- AI Insights (locked)
- Billing
- Settings

### Market toggle
- Crypto (accessible, selected)
- Forex (accessible or preview, your choice)
- Stocks (locked)

This is only a suggestion. Structure it cleanly.

---

## Pages to build

Build these pages/components so the app feels real:

### 1. Dashboard
Show:
- welcome header
- plan summary card
- current market summary
- KPI cards
- recent signals preview
- quick actions
- upgrade card for premium features

### 2. Market
Show:
- market overview cards
- top movers
- sentiment blocks
- trend summary panels
- clean table/list modules

### 3. Signals
Show:
- signals list/table
- filters in main content
- market-aware content
- some rows available for free
- premium/locked panel or blurred advanced section

### 4. Watchlist
Show:
- tracked assets
- small stats
- free-plan limitation UI, such as a cap on number of items

### 5. Portfolio (locked state demo)
Even if locked, create the page structure or preview state:
- premium feature hero
- sample portfolio cards
- CTA to upgrade

### 6. AI Insights (locked state demo)
Show a premium preview:
- insight cards
- confidence score examples
- premium CTA

### 7. Billing
Show:
- current plan
- next billing date
- invoice history mock
- compare plans card

### 8. Settings
Show:
- profile section
- security section
- preferences section
- plan / entitlement summary

---

## Upgrade modal

Create a polished modal for locked features and locked markets.

The modal should:
- explain the locked feature or market
- mention plan upgrade
- use elegant brand styling
- include CTA buttons:
  - Upgrade now
  - Maybe later

Make this modal reusable across the app.

---

## Visual design rules

### General style
- high-quality SaaS dashboard aesthetic
- spacious layout
- rounded cards
- soft borders
- subtle shadows
- restrained gradients
- premium but not noisy

### Use of purple
- use purple intentionally for:
  - primary buttons
  - active nav state
  - focus rings
  - selected market
  - chart accents
  - upgrade highlights
- avoid flooding the whole UI with purple

### Background treatment
- app shell can use a very light warm neutral background
- cards should remain clean white or lightly tinted
- use soft contrast between app background and surfaces

### Logo alignment
Design the app so it visibly belongs to the same brand family as the logo:
- geometric precision
- subtle circular motifs
- calm premium palette
- intelligent, observant feeling

Do not literally repeat triangle-eye graphics everywhere. Keep it subtle.

---

## Components to include

Build reusable components where appropriate:
- AppShell
- Sidebar
- SidebarItem
- TopBar
- MarketToggle
- PageHeader
- StatCard
- LockedCard
- UpgradeModal
- PlanBadge
- SectionCard
- DataTable
- EmptyState
- PremiumPreviewCard

---

## State management

Use:
- **TanStack Query** for mocked async bootstrap fetching
- **Zustand** for lightweight UI state such as:
  - selected market
  - upgrade modal state
  - sidebar collapsed state (if implemented)

---

## Routing

Use React Router.

Suggested routes:
- `/app/dashboard`
- `/app/market`
- `/app/signals`
- `/app/watchlist`
- `/app/portfolio`
- `/app/ai-insights`
- `/app/billing`
- `/app/settings`

If a locked route is opened, show either:
- locked page state
- or redirect to a premium preview state

Keep this clean and intentional.

---

## Code quality requirements

- organize the project cleanly
- use reusable components
- avoid giant monolithic files
- keep types explicit
- create mock data in a dedicated module
- create a clear folder structure
- make the design production-quality, not a rough wireframe
- no unnecessary complexity

---

## Deliverable expectation

Generate a polished, working frontend prototype that looks like a real desktop SaaS product for ALumiEye.

The result should:
- feel brand-aligned with the uploaded logo
- support backend-driven sidebar and market toggle arrays
- support locked and unlocked states
- have premium upgrade cues
- be visually convincing enough to demo to stakeholders

---

## Extra polish ideas

If time allows, add:
- subtle page transitions
- hover polish on sidebar items
- premium glow treatment for locked cards
- keyboard shortcut hint for search
- dark mode structure preparation, but keep the default design in light mode
