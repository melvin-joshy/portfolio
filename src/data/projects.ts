export type Media = {
  src: string;
  caption?: string;
  aspect?: "wide" | "square" | "tall";
  label?: string;
  status?: "iteration" | "final" | "neutral";
  annotations?: { n: number; text: string }[];
  /** Set to "video" for MP4/WebM walkthrough clips; renders full-width autoplay muted loop */
  type?: "video";
  /** Optional poster frame shown before the video loads */
  poster?: string;
  /** "contain" shows the full asset with a background; "cover" fills the box (default) */
  fit?: "cover" | "contain";
};

export type Chapter = {
  eyebrow: string;
  title: string;
  body: string;
  media?: Media[];
};

type Common = {
  id: string;
  name: string;
  tag: string;
  year: string;
  description: string;
  bg: string;
  accent: string;
  heroImage?: string;
  heroAnimation?: string;   // path to Lottie JSON in /public, used as the card face
  cover?: string;
  externalUrl?: string;
  behanceUrl?: string;
};

export type SolutionBlock = {
  index?: string;
  title: string;
  body: string;
  media?: Media[];
};

export type Metric = { value: string; label: string };

export type ClientProject = Common & {
  kind: "client";
  client: string;
  role: string;
  team?: string;
  industry?: string;
  scope: string[];
  overview?: string;
  problem: string;
  problemImage?: string;
  goals?: string[];
  approach: string;
  solutionBlocks?: SolutionBlock[];
  outcome: string;
  metrics?: Metric[];
  reflection?: string;
  gallery: Media[];
  deliverables?: string[];
};

export type BuildProject = Common & {
  kind: "build";
  stack: string[];
  oneLiner: string;
  whyIBuiltIt: string;
  whatItDoes?: string;
  insight?: string;
  insightLabel?: string;
  status?: string;
  liveUrl?: string;
  repoUrl?: string;
  gallery: Media[];
};

export type CaseStudyProject = Common & {
  kind: "case-study";
  role: string;
  team?: string;
  duration: string;
  tools?: string[];
  problem: string;
  chapters: Chapter[];
  reflection: string;
  outcome?: string;
};

export type Project = ClientProject | BuildProject | CaseStudyProject;

export const projects: Project[] = [
  {
    kind: "case-study",
    id: "clarity",
    name: "CLARITY",
    tag: "Voice AI · Personal Project · 2025",
    year: "2025",
    description:
      "Voice-first AI journaling that captures thoughts freely and organises them into life themes.",
    bg: "linear-gradient(155deg, #1e2a3a 0%, #101828 55%, #060a10 100%)",
    accent: "#4a7abf",
    role: "Designer & Builder",
    duration: "Personal Project",
    tools: ["Next.js", "OpenAI Whisper", "Supabase", "Framer Motion", "Tailwind"],
    problem: "Built because I kept forgetting things that mattered.",
    chapters: [
      {
        eyebrow: "Why it exists",
        title: "The friction killed the habit",
        body: "I never journaled. The friction of processing a thought and then writing it down meant the moment was gone before I started.\n\nThen I started juggling more at once and forgetting things that mattered. Not big things, small ones: an idea at 11pm, a follow-up, a thought to revisit later.\n\nI didn't need a notes app or a to-do list. I needed somewhere to dump whatever was in my head, move on, and trust it would be there later.\n\nSo I built Clarity.",
      },
      {
        eyebrow: "The core problem",
        title: "Too much friction between thought and capture",
        body: "Every existing tool demanded the same thing: process the thought, then write it. Notes apps, journal apps, voice memos all made you do the work before anything went down.\n\nThoughts don't work that way. They arrive unformed, messy, usually mid-task.\n\nThe insight: capture should cost nothing. Organisation comes later.",
      },
      {
        eyebrow: "The design challenge",
        title: "Reducing, not adding",
        body: "The hardest problem wasn't what to build. It was what to remove.\n\nEvery feature created friction: a category picker, a priority flag, a due date field. Each made sense alone. Together they turned a thought dump into a form.\n\nThe goal was calm, not productivity. You're not rushing or being evaluated, you're speaking, and the interface had to understand that.\n\nNo urgency: nothing on screen should make you feel behind. No friction: the path from thought to captured stays as short as possible. No pressure: this isn't a task manager, so you never have to act on what you capture.",
      },
      {
        eyebrow: "How it works",
        title: "Speak. We'll organise it.",
        body: "Tap the microphone and speak. Clarity transcribes live, word by word, the way lyrics surface in a music app, so you watch the thought form as you talk.\n\nWhen you stop, AI does three things. It categorises the thought into one of your four life themes, extracts any task buried inside, and headlines it with a short summary.\n\nThe raw transcription and the AI summary sit side by side in the detail view: your words, and what the AI understood. You stay in control.",
      },
      {
        eyebrow: "The categorisation decision",
        title: "AI does the heavy lifting. You keep the final say.",
        body: "Early versions asked people to tag their own thoughts, typing @work or @personal before speaking. Logical, but it felt like homework.\n\nIf you categorise before you capture, you're processing before dumping, which defeats the point. So categorisation moved to AI: speak freely, and it figures out where the thought goes.\n\nFull AI control felt wrong too. These are your thoughts, so you see what the AI decided and why. That's \"AI UNDERSTOOD\": transparent AI, not invisible AI.",
      },
      {
        eyebrow: "The two modes",
        title: "One question: what do you need right now?",
        body: "Organise mode was always the plan: a categorised view of everything, browsable by theme, sortable by date.\n\nFocus mode wasn't. It emerged from using the app, because the organised view showed everything, good thoughts, anxious late-night ones, half-formed ideas, when sometimes you only need to know what deserves attention today.\n\nFocus mode answers that. Just the tasks pulled from your voice: no context, no clutter, one clean list.\n\nThe first version put tasks front and centre with a badge count and an urgency flag, and it instantly felt like a to-do app you were behind on. So those came out: no count, no urgency, just the tasks waiting quietly when you need them.",
      },
      {
        eyebrow: "The waveform",
        title: "Calm before you tap",
        body: "The radial waveform on the home screen isn't the recording visualiser; that's a separate bottom waveform that glows as you speak. The radial is abstract, a signal that this is calm and breathing, alive but unhurried, not a productivity tool.\n\nA small detail that sets the tone before you tap the microphone.",
      },
    ],
    reflection:
      "The native app exists for one reason: a home screen widget. The PWA still makes you open an app; a widget collapses that to one tap from the home screen, mic open, speak, done. That's the version of Clarity that changes how people capture.",
    outcome:
      "Live PWA, used daily and in active testing with early users. The native app is in progress, with the widget as the goal. Built because I needed it.",
  },
  {
    kind: "client",
    id: "marys-land-farm",
    name: "MARY'S LAND FARM",
    tag: "Booking & Operations Platform · 2025–Present",
    year: "2025–Present",
    description: "They came to replace one tool. They left with one platform that replaced seven.",
    bg: "linear-gradient(155deg, #2a3a1e 0%, #161f0f 55%, #080c06 100%)",
    accent: "#7c8f4a",
    cover: "/Marysfarm -cover.webp",
    heroImage: "/Marysfarm -cover.webp",
    client: "Mary's Land Farm",
    role: "Sole Designer",
    scope: ["End-to-end admin platform"],
    industry: "Farm Experiences · Hospitality",
    deliverables: ["Live · Tempo YC S23"],
    overview:
      "Mary's Land Farm runs farm experiences across multiple locations: alpaca encounters, cooking classes, barn stays, weddings. The brief was to replace Roller, their booking backend.\n\nMapping how the team actually worked, I found seven tools doing the job of one, and no single view of the business. So I made the case to replace all seven with one platform.",
    problem:
      "Each tool did its job; the problem was the gaps between them. A single guest message meant four context switches: read it in Wavelength, open Roller to find the booking, copy the details, switch back to reply.\n\nThe platform had to close those gaps, not compete with the tools.",
    problemImage: "/Marysfarm -problem.webp",
    goals: [
      "No context switching: every decision made without opening another tab.",
      "One source of truth: bookings, messages, experiences, and reports in one system.",
      "Role-based access: each employee sees exactly what they need, nothing more.",
    ],
    approach:
      "One constraint drove every screen: the information to make a decision had to live where the work was happening, not a click away, not in another app. Every tool-switch the team used to make became a panel instead.",
    solutionBlocks: [
      {
        index: "01",
        title: "Appointments, Venues & Rooms",
        body:
          "Every experience is an image card: photo, price, duration, capacity, tags. Publishing one auto-creates the customer-facing listing, replacing WordPress. Cards, not a data table: the team sees the product the way a guest does, which keeps decisions grounded.",
        media: [{ src: "/Marysfarm-1.webp", label: "Experience cards: price, capacity, tags", aspect: "wide" }],
      },
      {
        index: "02",
        title: "Bookings Management",
        body:
          "235 bookings in one table: reference, customer, experience, check-in/out, guests, status, balance, source. The Source column (Web or Admin) replaced manual Excel tracking; filters, calendar view, and Add Booking are always one click away.",
        media: [{ src: "/Marysfarm-2.webp", label: "235 bookings, one table with Web/Admin source", aspect: "wide" }],
      },
      {
        index: "03",
        title: "Messaging",
        body:
          "Guest SMS lived in Wavelength, so every reply meant four context switches. I built two-way SMS into the platform, with a guest-profile panel showing booking reference, experience, date, and status beside each conversation. Not in the original brief. Should have been.",
        media: [{ src: "/Marysfarm-3.webp", label: "Messaging with live booking context alongside", aspect: "wide" }],
      },
      {
        index: "04",
        title: "Notification Templates",
        body:
          "The team ran automated emails through SendGrid but couldn't manage templates without technical help; broken formatting and wrong timing were routine. I built a simple editor: rich text, variable insertion, trigger rules (\"24 hours before check-in\"), and a live desktop/mobile preview. They went from filing a request to doing it themselves.",
        media: [{ src: "/Marysfarm-4.webp", label: "Template editor: variables, triggers, live preview", aspect: "wide" }],
      },
      {
        index: "05",
        title: "Dashboard",
        body:
          "Revenue, bookings, average order value, 12-month trend, today's schedule: one screen. Before, assembling that picture meant opening Excel, Roller, and Google Calendar separately. Quick Actions surface the four most-used tasks; no buried navigation.",
        media: [{ src: "/Marysfarm-5.webp", label: "Dashboard: the whole business, one screen", aspect: "wide" }],
      },
      {
        index: "06",
        title: "Reports",
        body:
          "The team needed answers about revenue, bookings, and payment status without rebuilding spreadsheets by hand every month. I built a report builder: pick a type, set a date range, choose the fields you need, preview, then export. One place to answer \"how did we do?\", no reconciliation, no spreadsheets.",
        media: [{ src: "/Marysfarm-6.webp", label: "Report builder: sales summary, fields, live preview", aspect: "wide" }],
      },
    ],
    outcome:
      "Seven tools replaced by one platform. Live across farm locations, 235+ bookings managed, every employee on one system.",
    metrics: [
      { value: "7 → 1", label: "Tools consolidated into one platform" },
      { value: "235+", label: "Bookings managed" },
      { value: "Live", label: "Used daily across farm locations" },
    ],
    reflection:
      "The biggest decision wasn't a UI call, it was the scope conversation.\n\nThey asked for a Roller replacement. I mapped their actual workflow first, found seven tools doing the work of one, and made the case to consolidate. That decision changed what we built.\n\nThe messaging panel is where it shows most clearly: a farm host reads a guest message and sees the full booking context (experience, date, status, reference) without leaving the screen. That's the standard every feature gets measured against.",
    gallery: [],
  },
  {
    kind: "client",
    id: "ontra",
    name: "ONTRA",
    tag: "Multimodal Transit Platform · YC · 2024",
    year: "2024",
    description: "Making public transit readable at every zoom level.",
    bg: "linear-gradient(155deg, #3a2e18 0%, #201a0f 55%, #0c0906 100%)",
    accent: "#8f7a3a",
    cover: "/ontra-cover.webp",
    heroImage: "/ontra-cover.webp",
    client: "Ontra (YC)",
    role: "Product Designer",
    industry: "Transit Technology",
    scope: ["Trip planner", "Map view", "Iconography"],
    deliverables: ["Live · YC-backed"],
    overview:
      "Ontra is a YC-backed platform helping cities build multimodal transit systems. The public trip planner lets riders plan journeys across bus, rail, and bike using live transit data.\n\nI joined with an existing product. The brief was to redesign the side panel. But redesigning how information is shown in the panel meant redesigning how it's reflected on the map. One component became a connected system.",
    problem:
      "Everything had equal visual weight. Every stop looked the same. Every route line had the same treatment. The map didn't react when you selected something in the panel.\n\nTwo things needed fixing: the side panel had no progressive disclosure, and the map was static with no visual connection to user actions.",
    problemImage: "/ontra-problem.webp",
    goals: [
      "Progressive disclosure: a journey timeline riders can read at any depth, from summary to turn-by-turn.",
      "Map-panel sync: selecting a route in the panel should immediately reflect on the map.",
      "Iconography system: a consistent visual language across transit modes and zoom levels.",
    ],
    approach:
      "One constraint drove both tracks: a daily commuter and a tourist should use the same interface at different depths. The panel needed progressive disclosure; the map needed to be reactive. Both needed a shared visual language.",
    solutionBlocks: [
      {
        index: "01",
        title: "Journey Timeline",
        body: "A full journey timeline breaking every trip into readable segments. Summary at the top: mode icons, total time, visual progress bar. Below that, each segment is collapsible.\n\n\"6 mins, 5 stops\" has a Show Stops toggle. Walking directions collapse to \"Walk 2 mins\" until you need turn-by-turn. A daily commuter never expands. A tourist expands everything. Same interface, different depth.",
        media: [
          { src: "/ontra-1.webp", label: "Trip Plan · Collapsed", aspect: "wide" },
          { src: "/ontra-2.webp", label: "Trip Plan · Expanded with stops", aspect: "wide" },
        ],
      },
      {
        index: "02",
        title: "The faded stop pattern",
        body: "Past stops are faded. Current stop is highlighted. Future stops are full opacity.\n\nNo legend needed. Riders instinctively understand their position. The hierarchy comes from the rider's perspective, not the data's.",
        media: [{ src: "/ontra-3.webp", label: "Route detail · past / current / future stops", aspect: "wide" }],
      },
      {
        index: "03",
        title: "Map Iconography System",
        body: "Bus stops as dark square icons. Current bus position in green, instantly scannable. Each route in its own color. Icons adapt across zoom levels.\n\nThe hardest part: multiple routes passing through shared stops. Tested outlines, color blocks, and split indicators. Final solution: individual colored lines maintaining identity through shared stops. You can trace any route with your finger across the entire map.",
        media: [
          { src: "/ontra-4.webp", label: "Map · Route lines and stops", aspect: "wide" },
        ],
      },
      {
        index: "04",
        title: "Bike Stations",
        body: "A completely new layer. The badge answers one question at map level: is it worth walking here? Two numbers side by side: 12 manual, 2 electric. One glance, no tap required.\n\nTapping opens a compact detail: name, distance, counts, free spaces, and a direct deep link to unlock in the Lyft Bos app. Two interactions from \"should I bike?\" to unlocking one.",
        media: [
          { src: "/ontra-5.webp", label: "Bike station badges · map view", aspect: "wide" },
          { src: "/ontra-6.webp", label: "Bike station · detail panel", aspect: "wide" },
        ],
      },
      {
        index: "05",
        title: "Map-Panel Sync",
        body: "Before: selecting a route changed nothing on the map. Panel and map were disconnected.\n\nNow: select a route in the panel, the map highlights it. Active route becomes prominent, others fade. Current bus position appears as a live marker. Walking segments trace in grey. Panel and map are one system.",
        media: [{ src: "/ontra-7.webp", label: "Trip plan · highlighted route on map", aspect: "wide" }],
      },
    ],
    outcome:
      "Live trip planner serving Boston and expanding to new cities. Trusted by DC Department of Transportation, City of Fresno, and others. Selected for the 2026 Transit Tech Lab with MTA NYCT and LIRR.",
    metrics: [
      { value: "Live", label: "Boston trip planner" },
      { value: "DC · Fresno", label: "City partners" },
      { value: "MTA · LIRR", label: "2026 Transit Tech Lab" },
    ],
    reflection:
      "The route line treatment at shared stops.\n\nMultiple routes through one stop is surprisingly hard to show clearly. The final solution lets you trace any single route across the map without losing it, even through intersections with four overlapping routes.\n\nThe kind of detail transit planners notice and daily commuters feel without knowing why.",
    gallery: [],
  },
  {
    kind: "client",
    id: "crewslink",
    name: "CREWSLINK",
    tag: "Enterprise Operations Platform",
    year: "2024–2025",
    description: "Designed for dispatchers who can't afford to look twice.",
    bg: "linear-gradient(155deg, #1e3a2f 0%, #0f2018 55%, #060c09 100%)",
    accent: "#3a8f62",
    client: "CrewsLink",
    role: "Sole Designer",
    scope: ["End-to-end admin platform"],
    industry: "Aviation Ground Transport",
    deliverables: ["Live"],
    overview:
      "The person behind every on-time pickup.\n\nCrewsLink coordinates ground transportation for airlines like WestJet and Air Canada across 37+ airports. The platform moves 24,000+ crew members monthly. Behind that is a dispatcher, someone on screen for 10-hour shifts, managing live trips, tracking drivers, and rebooking pickups in under 4 minutes when flights change.\n\nThat person is who I designed for.",
    problem:
      "Dispatch software is built for completeness, not speed. Every field present. Every option visible. The result: dense interfaces that slow down the people who need to move fastest.\n\nOne principle guided every decision: can a tired dispatcher at hour 10 understand this in 2 seconds?",
    goals: [
      "Status legibility: every driver's state visible at a glance, no dropdowns.",
      "Trip flow: booking, managing, and reconciling trips in fewer screens.",
      "Operational truth: contracts, billing, and permissions in one platform.",
    ],
    approach:
      "Five interconnected modules (Map Overview, New Booking, Trip Management, Contract & Billing, Permissions) built around one principle: every unnecessary click is friction. Friction costs time. Time costs crews.",
    solutionBlocks: [
      {
        index: "01",
        title: "Map Overview",
        body:
          "The command center. Live driver positions on the map. Left panel shows all drivers with color-coded status. Persistent pill filter bar at the top, one click to isolate Available, On the way, or Arrived drivers. No dropdowns. No nested menus.",
      },
      {
        index: "02",
        title: "New Booking",
        body:
          "Trip details and passenger info side by side. Live trip summary updates as fields are filled. Map visible throughout, so dispatchers confirm pickup and dropoff visually without switching screens.",
      },
      {
        index: "03",
        title: "Trip Management",
        body:
          "65 trips in one view. The Flight Connected column tells dispatchers instantly which bookings auto-update with flight data and which need manual attention. Active and Closed trips separated by a single toggle.",
      },
      {
        index: "04",
        title: "Contract & Billing Management",
        body:
          "Airlines operate on complex contracts per airport, route, and vehicle type. The contract table surfaces expiring contracts proactively. Billing consolidates Client, Vendor, and Driver pay into one place, with no reconciliation across systems.",
      },
      {
        index: "05",
        title: "Permissions",
        body:
          "Role-based access across every module. Dispatchers, vendor admins, drivers, and airline clients each see only what they need. New users onboarded with one template click.",
      },
    ],
    outcome:
      "Replacing the status filter dropdown with a persistent pill bar. Dispatchers filter by driver status dozens of times per shift. Three clicks became one. For someone doing it 50 times a day, that's hundreds of saved interactions per shift.\n\nThe best dispatch software feels like an extension of instinct. Every unnecessary click is friction. Friction costs time. Time costs crews.",
    metrics: [
      { value: "99.7%", label: "On-time pickup rate" },
      { value: "24,000+", label: "Crew moved monthly" },
      { value: "37+", label: "Airports · 3 airlines" },
    ],
    reflection:
      "Designing for dispatchers means designing for hour ten of a ten-hour shift. The benchmark isn't \"does this look good?\" It's \"can someone exhausted still get it right at 2 a.m.?\" That question quietly rewrote every layout decision.\n\nWestJet · Air Canada · SkyWest · 37+ airports. The full platform is live.",
    gallery: [],
  },
  {
    kind: "build",
    id: "frame-studio",
    name: "FRAME STUDIO",
    tag: "PWA Dev Tool · Personal Project · 2025",
    year: "2025",
    description:
      "PWA showcase tool for presenting web apps inside device frames with custom backgrounds and recordings.",
    bg: "linear-gradient(155deg, #2a1e38 0%, #180f25 55%, #090610 100%)",
    accent: "#8a5abf",
    oneLiner: "Showing my work deserved a better tool. So I built one.",
    stack: ["Next.js", "Tailwind", "Canvas API", "PWA"],
    status: "Live PWA",
    whyIBuiltIt:
      "Clarity needed to be shown without anyone installing it or opening a raw localhost URL. Screenshots fell flat; screen recordings ran too long.\n\nA PWA should look as good as a native app: device frame, custom background, a demo recorded in seconds.\n\nNothing did exactly that. So I built one.",
    whatItDoes:
      "Paste any public URL. Frame Studio loads it inside a device mockup: mobile, tablet, or wide tablet. Choose your background: clean white, grid, dots, or one of six gradient presets. Record a demo or export a still PNG. Copy a shareable link.\n\nThat's it. No setup. No account. Just paste and present.",
    insightLabel: "The meta moment",
    insight:
      "Frame Studio was built to showcase Clarity. Then I used Frame Studio to showcase Frame Studio. Then I used both to build my portfolio.\n\nA tool that builds itself into the story of everything else I've made.",
    gallery: [
      { src: "", label: "Frame Studio · Clarity loaded · terracotta bg", aspect: "wide" },
      { src: "", label: "Frame Studio · Maryland Farm dashboard · moss bg", aspect: "wide" },
      { src: "", label: "Background options panel", aspect: "wide" },
    ],
  },
  {
    kind: "case-study",
    id: "aura",
    heroAnimation: "/Aura.json",
    heroImage: "/intro 2.webp",
    cover: "/over aura.webp",
    behanceUrl: "https://www.behance.net/gallery/202910085/AURA-Your-personal-mental-health-partner",
    name: "AURA",
    tag: "UX Case Study",
    year: "2023",
    description:
      "A personal well-being companion for young people who feel alone.",
    bg: "linear-gradient(155deg, #1e2040 0%, #101228 55%, #060709 100%)",
    accent: "#3a4a8f",
    role: "Full-Stack Designer",
    team: "UX Case Study",
    duration: "10 weeks",
    tools: ["Research", "Architecture", "High-fidelity prototype"],
    problem:
      "A personal well-being companion for young people who feel alone.",
    chapters: [
      {
        eyebrow: "Context",
        title: "Support that meets people where they are",
        body: "One in seven people aged 16–29 lives with a mental health issue. Technology connects us, yet accessible support hasn't followed. Aura is a companion that meets people where they are, not where a clinic needs them to be.",
        media: [
          {
            src: "/aura full.mp4",
            type: "video",
            caption: "Full app walkthrough · onboarding through daily flow",
            aspect: "tall",
            fit: "contain",
          },
        ],
      },
      {
        eyebrow: "The Problem",
        title: "Help should feel approachable, not clinical",
        body: "Young people know they need help. Cost, scheduling, and stigma keep them from it, and existing apps feel clinical or ignore how someone feels day to day. The bar: support that reads like a friend, not a product.",
        media: [
          {
            src: "/aura 1.png",
            caption: "Onboarding · meet Aura",
            aspect: "tall",
            fit: "contain",
          },
          {
            src: "/aura 2.mp4",
            type: "video",
            caption: "Home · today's flow",
            aspect: "tall",
            fit: "contain",
          },
        ],
      },
      {
        eyebrow: "What I Designed",
        title: "A daily experience shaped by mood",
        body: "Six onboarding questions shape the first session. Today's Flow builds the home screen around mood instead of features, paired with a gesture-based Mood Tracker and an AI Companion that recommends the right exercise. A Therapy Bridge matches licensed therapists by specialty and insurance; a Journal captures reflection by prompt or free-form, with photos.",
        media: [
          {
            src: "/aura 3.mp4",
            type: "video",
            caption: "Mood tracker · gesture-based check-in",
            aspect: "tall",
            fit: "contain",
          },
          {
            src: "/aura 4.mp4",
            type: "video",
            caption: "AI companion · tailored exercises",
            aspect: "tall",
            fit: "contain",
          },
        ],
      },
    ],
    reflection:
      "Three principles guided every decision: Growth, Companionship, Understanding. The result is an app that feels like it knows you, not about you.",
    outcome:
      "End-to-end UX case study covering research, architecture, and a high-fidelity prototype. Full process available on Behance.",
  },
  {
    kind: "case-study",
    id: "deco-ar",
    heroAnimation: "/deco AR.json",
    heroImage: "/intro 1.webp",
    cover: "/deco cover.jpg",
    behanceUrl: "https://www.behance.net/gallery/205109665/DecoAR-Reimagining-Home-Design-with-AR",
    name: "DECO AR",
    tag: "AR Furniture Shopping",
    year: "2023",
    description:
      "See it in your space before you buy it.",
    bg: "linear-gradient(155deg, #3a1e2e 0%, #20101a 55%, #0c060a 100%)",
    accent: "#8f3a6a",
    role: "Full-Stack Designer",
    team: "UX Case Study",
    duration: "8 weeks",
    tools: ["Research", "Competitive analysis", "High-fidelity prototype"],
    problem:
      "See it in your space before you buy it.",
    chapters: [
      {
        eyebrow: "Context",
        title: "AR furniture shopping should feel natural",
        body: "Furniture returns are among the highest in e-commerce, and the reason rarely changes: it looked different online. IKEA Place and Houzz tried AR but fell short, with inaccurate measurements, confusing calibration, and the feel of a tech demo rather than a shopping tool. Deco AR makes AR furniture shopping feel natural, not technical.",
        media: [
          {
            src: "/decoAR full.mp4",
            type: "video",
            caption: "Full app walkthrough · discovery through AR checkout",
            aspect: "tall",
            fit: "contain",
          },
        ],
      },
      {
        eyebrow: "The Problem",
        title: "Closing the gap between online and in-room",
        body: "People can't picture how a piece will look or fit in their own room. The gap between \"looks good online\" and \"works in my room\" drives frustration, returns, and lost trust. The bar: AR effortless enough to use mid-purchase, not a feature people abandon.",
        media: [
          {
            src: "/deco AR 1.mp4",
            type: "video",
            caption: "Home & Style Discovery · curated lookbooks",
            aspect: "tall",
            fit: "contain",
          },
          {
            src: "/Deco AR 2.mp4",
            type: "video",
            caption: "AR placement · true-to-scale in your room",
            aspect: "tall",
            fit: "contain",
          },
        ],
      },
      {
        eyebrow: "What I Designed",
        title: "From inspiration to purchase inside AR",
        body: "Home & Style Discovery opens with curated lookbooks and style guides, with AR entry one tap from any product page. Guided onboarding removes calibration confusion; placement is true-to-scale, with real dimensions, materials, and textures. Advanced controls handle color, dimensions, and lighting, saved rooms enable sharing, and checkout happens inside the AR view.",
        media: [
          {
            src: "/Deco AR 3.png",
            caption: "AR controls · color, dimensions, lighting",
          },
          {
            src: "/Deco AR 4.png",
            caption: "Checkout · cart to order confirmation",
          },
        ],
      },
    ],
    reflection:
      "Onboarding was the whole product. Vague prompts like \"move closer\" made people quit before shopping began, so I broke entry into three guided steps that show what to do and why. Everything downstream only worked because that first step did.",
    outcome:
      "End-to-end UX case study covering research, competitive analysis, and a high-fidelity prototype. Full process available on Behance.",
  },
  {
    kind: "client",
    id: "tempo",
    name: "TEMPO",
    tag: "YC S23 · Design Lead · 2024–Present",
    year: "2024–Present",
    description: "5+ products shipped. AI-native design tooling for the next generation of builders.",
    bg: "linear-gradient(155deg, #0f1a2e 0%, #090f1a 55%, #040609 100%)",
    accent: "#4a7abf",
    heroImage: "/intro 4.webp",
    externalUrl: "https://www.tempo.new/",
    client: "Tempo",
    role: "Design Lead",
    scope: ["Product Design", "AI Tools", "Design Systems"],
    problem: "Shipping AI-native design tools at Tempo (YC S23).",
    approach: "Led design across 5+ products as the founding design lead, from zero to launch.",
    outcome: "Products live. Details available on request.",
    gallery: [],
  },
];

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function getNextProject(id: string): Project | undefined {
  const i = projects.findIndex((p) => p.id === id);
  if (i === -1) return undefined;
  return projects[(i + 1) % projects.length];
}

export function getNextProjects(id: string, count = 2): Project[] {
  const i = projects.findIndex((p) => p.id === id);
  if (i === -1) return [];
  const out: Project[] = [];
  for (let k = 1; k <= count; k++) {
    out.push(projects[(i + k) % projects.length]);
  }
  return out;
}
