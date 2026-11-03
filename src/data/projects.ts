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
  /** "phone" wraps the video inside an iOS-style phone frame mockup */
  mockup?: "phone";
  /** Background image URL for the phone mockup scene */
  videoBg?: string;
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
  heroVideo?: string;       // muted loop played on the homepage card; heroImage is its poster/fallback
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

/** A reserved visual in a story-style client case study.
 *  Files live in /public/<story.assetDir>/<file>. Leave `ready` off to show a
 *  labelled placeholder (filename + brief visible in dev only); set `ready: true`
 *  once the real file has been dropped in. */
export type StorySlot = {
  file: string;
  /** "embed" = a live, looping HTML/SVG diagram (e.g. the Anatomy-style
   *  system diagram) loaded in an iframe instead of a static image. */
  kind: "image" | "video" | "embed";
  /** Production note — never rendered in production builds */
  brief: string;
  alt: string;
  caption?: string;
  /** Static fallback for videos (also used when reduced motion is on) */
  poster?: string;
  /** column = text width · wide = breakout · full = largest showcase */
  size?: "column" | "wide" | "full";
  aspect?: "16/9" | "16/10" | "4/3" | "21/9" | "3/2" | "72/25";
  ready?: boolean;
  /** For "image" slots whose asset already carries its own background
   *  (e.g. a diagram exported with a matching stage color) — skips the
   *  padded blue-stage treatment and renders the image flush, full width. */
  bare?: boolean;
};

/** One slide of a StorySection's carousel. */
export type CarouselSlide = {
  file: string;
  brief: string;
  alt: string;
  /** Small label above the caption, e.g. "Unassigned" */
  label: string;
  caption: string;
  ready?: boolean;
};

export type StorySection = {
  id: string;
  /** Short label for the side navigation */
  nav: string;
  eyebrow: string;
  title: string;
  body?: string;
  /** A second paragraph — used for problem/decision/trade-off beats that read
   *  better as two short paragraphs than one run-on. */
  body2?: string;
  facts?: { label: string; value: string }[];
  /** Short list items, e.g. learnings */
  list?: string[];
  /** Editing note shown above the list in dev only */
  listNote?: string;
  slots?: StorySlot[];
  /** stack = one after another · gallery = first slot large, rest in pairs */
  slotLayout?: "stack" | "gallery";
  /** A labelled-slide carousel placed after the section's text. */
  carousel?: { assetDir?: string; slides: CarouselSlide[] };
};

/** A TL;DR impact strip shown near the top of the story, after the cover
 *  credits. Stats here are modelled/estimated unless explicitly marked
 *  otherwise — `note` should say so plainly rather than let a number stand
 *  in as a measured result. */
export type StoryImpact = {
  body: string;
  /** A second paragraph — used here for the before/after summary. */
  body2?: string;
  stats: { value: string; label: string }[];
};

export type Story = {
  assetDir: string;
  cover: { headline: string; descriptor: string; slot: StorySlot };
  impact?: StoryImpact;
  sections: StorySection[];
};

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
  outcome?: string;
  metrics?: Metric[];
  reflection?: string;
  gallery: Media[];
  deliverables?: string[];
  /** When set, the page renders as a story (sections + reserved visuals)
   *  instead of the standard client layout. */
  story?: Story;
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
    tag: "Voice Journaling App · Personal Project · 2025",
    year: "2025",
    description:
      "Voice-first AI journaling that captures thoughts freely and organises them into life themes.",
    bg: "linear-gradient(155deg, #1e2a3a 0%, #101828 55%, #060a10 100%)",
    accent: "#4a7abf",
    role: "Designer & Builder",
    duration: "Personal Project",
    tools: ["Next.js", "OpenAI Whisper", "Supabase", "Framer Motion", "Tailwind"],
    problem: "Built because I kept forgetting things that mattered.",
    cover: "/Clarity cover.webp",
    heroImage: "/Clarity cover.webp",
    chapters: [
      {
        eyebrow: "Why it exists",
        title: "The friction killed the habit",
        body: "I never journaled. The friction of processing a thought and then writing it down meant the moment was gone before I started.\n\nThen I started juggling more at once and forgetting things that mattered. Not big things, small ones: an idea at 11pm, a follow-up, a thought to revisit later.\n\nI needed somewhere to dump whatever was in my head, move on, and trust it would be there later.\n\nSo I built Clarity.",
        media: [],
      },
      {
        eyebrow: "The core problem",
        title: "Too much friction between thought and capture",
        body: "Every existing tool demanded the same thing: process the thought, then write it. Notes apps, journal apps, voice memos all made you do the work before anything went down.\n\nThoughts don't work that way. They arrive unformed, messy, usually mid-task.\n\nThe insight: capture should cost nothing. Organisation comes later.",
        media: [
          { src: "/Clarity Too much friction.webp" },
        ],
      },
      {
        eyebrow: "The design challenge",
        title: "Reducing, not adding",
        body: "The hardest problem wasn't what to build. It was what to remove.\n\nEvery feature created friction: a category picker, a priority flag, a due date field. Each made sense alone. Together they turned a thought dump into a form.\n\nThe goal was calm, not productivity.\n\nNo urgency: nothing on screen should make you feel behind. No friction: the path from thought to captured stays as short as possible. No pressure: this isn't a task manager, so you never have to act on what you capture.",
        media: [
          { src: "/Clarity Reducing, not adding.webp" },
        ],
      },
      {
        eyebrow: "How it works",
        title: "Speak. We'll organise it.",
        body: "Tap the microphone and speak. Clarity transcribes live, word by word, the way lyrics surface in a music app, so you watch the thought form as you talk.\n\nWhen you stop, AI does three things. It categorises the thought into one of your four life themes, extracts any task buried inside, and headlines it with a short summary.\n\nThe raw transcription and the AI summary sit side by side in the detail view: your words, and what the AI understood. You stay in control.",
        media: [
          {
            src: "/clarity main.mp4",
            type: "video",
            mockup: "phone",
            videoBg: "/Clarity bg for main.webp",
            caption: "End-to-end flow: tap, speak, organised.",
          },
        ],
      },
      {
        eyebrow: "The categorisation decision",
        title: "AI does the heavy lifting. You keep the final say.",
        body: "Early versions asked people to tag their own thoughts, typing @work or @personal before speaking. Logical, but it felt like homework.\n\nIf you categorise before you capture, you're processing before dumping, which defeats the point. So categorisation moved to AI: speak freely, and it figures out where the thought goes.\n\nFull AI control felt wrong too. These are your thoughts, so you see what the AI decided and why. That's \"AI UNDERSTOOD\": transparent AI, not invisible AI.",
        media: [
          { src: "/Clarity AI does the heavy lifting.webp" },
        ],
      },
      {
        eyebrow: "The two modes",
        title: "One question: what do you need right now?",
        body: "Organise mode was always the plan: a categorised view of everything, browsable by theme, sortable by date.\n\nFocus mode wasn't. It emerged from using the app, because the organised view showed everything when sometimes you only need to know what deserves attention today.\n\nFocus mode answers that. Just the tasks pulled from your voice: no context, no clutter, one clean list.\n\nThe first version had a badge count and urgency flags. It instantly felt like a to-do app you were behind on. So those came out.",
        media: [
          { src: "/Clarity what do you need right now_.webp" },
        ],
      },
      {
        eyebrow: "The waveform",
        title: "Calm before you tap",
        body: "The radial waveform on the home screen isn't the recording visualiser; that's a separate bottom waveform that glows as you speak. The radial is abstract, a signal that this is calm and breathing, alive but unhurried, not a productivity tool.\n\nA small detail that sets the tone before you tap the microphone.",
        media: [
          { src: "/Clarity Calm before you tap.webp" },
        ],
      },
    ],
    reflection:
      "The native app exists for one reason: a home screen widget. The PWA still makes you open an app; a widget collapses that to one tap from the home screen, mic open, speak, done. That's the version of Clarity that changes how people capture.",
    outcome:
      "Live PWA, used daily and in active testing with early users. The native app is in progress, with the widget as the goal. Built because I needed it.",
  },
  {
    kind: "client",
    id: "crewslink",
    name: "CREWSLINK",
    tag: "Enterprise Operations Platform",
    year: "2024–2025",
    description: "Keeping crew transportation moving.",
    bg: "linear-gradient(155deg, #1e3a2f 0%, #0f2018 55%, #060c09 100%)",
    accent: "#3a8f62",
    cover: "/crewslink/00_card_poster.webp",
    heroImage: "/crewslink/00_card_poster.webp",
    heroVideo: "/crewslink/00_card_loop.mp4",
    client: "CrewsLink",
    role: "Product Designer",
    scope: ["Trip management", "Booking", "Live dispatch"],
    industry: "Airline crew transportation",
    problem:
      "CrewsLink coordinates ground transportation for airline crews. I worked on the experience across booking, trip management, and live dispatch.",
    approach:
      "Booking, trip management, and live dispatch brought into one connected workflow.",
    gallery: [],
    story: {
      assetDir: "crewslink",
      cover: {
        headline: "Keeping crew transportation moving.",
        descriptor:
          "CrewsLink Connect coordinates ground transportation for airline crews. I worked on the experience across booking, trip management, and live dispatch, bringing the information and actions needed to manage a trip into a connected workflow.",
        slot: {
          file: "00_cover_dispatch_loop.mp4",
          kind: "video",
          poster: "00_cover_poster.webp",
          brief:
            "32s loop, 1920×1080. Real product states. Poster: 00_cover_poster.webp",
          alt: "Live dispatch map: an urgent trip is selected and a driver offer is sent.",
          size: "full",
          aspect: "16/9",
          ready: true,
        },
      },
      impact: {
        body:
          "CrewsLink coordinates ground transportation for airline crews, where booking changes, driver availability, and pickup timing all affect daily operations.",
        body2:
          "I worked on connecting the booking, trip management, and live dispatch experiences, with a focus on making operational information easier to find and decisions easier to act on.",
        stats: [
          { value: "99.7%", label: "On-Time Pickup Rate" },
          { value: "24,000+", label: "Crew Members Moved Monthly" },
          { value: "37+", label: "Airports Served" },
        ],
      },
      sections: [
        {
          id: "context",
          nav: "Context",
          eyebrow: "Context",
          title: "A schedule that rarely stays still.",
          body:
            "Ground transportation for airline crews depends on a chain of time-sensitive decisions. Trips need to be created, drivers assigned, pickups monitored, and unexpected changes handled without losing track of the wider operation.",
          body2:
            "A delayed driver or a change in flight timing can affect more than one trip. Dispatchers need to understand what is happening, identify what requires attention, and act before a small issue becomes a missed pickup.\n\nCrewsLink was building an in-house platform to support its transportation operations, bringing booking and dispatch workflows into a more connected experience.",
          slots: [
            {
              file: "system-overview.html",
              kind: "embed",
              brief:
                "Live looping isometric diagram (Anatomy-style): Booking → Trip Management → Live Dispatch, a job card pulses along the bench to each instrument.",
              alt: "System overview: Booking, Trip Management, and Live Dispatch as three connected instruments on one bench, with a job card pulsing between them.",
              size: "column",
              aspect: "72/25",
              ready: true,
            },
          ],
        },
        {
          id: "challenge",
          nav: "The challenge",
          eyebrow: "The challenge",
          title: "Making the next action clear.",
          body:
            "Dispatchers needed to see which trips were progressing normally and which needed attention, without opening every booking to check. And once a trip did need attention, the relevant context and the available options had to sit in the same place instead of being scattered across screens.",
          body2:
            "Booking added its own layer of complexity. A single booking already involves flight details, pickup information, passengers, and vehicles, and bulk manifests pile inconsistent or incomplete data on top of that.\n\nThese challenges shaped the experience around three connected activities: creating bookings, managing trips, and responding to live operational changes.",
        },
        {
          id: "approach",
          nav: "Approach",
          eyebrow: "Approach",
          title: "One operation, different levels of attention.",
          body:
            "Each workflow calls for a different level of attention. Booking prioritizes accurate inputs, Trip Management supports scanning and comparison, and Live Dispatch brings urgent decisions into focus.",
          body2:
            "I used this distinction to determine what information should remain visible and what could be revealed when needed.",
          slots: [
            {
              file: "approach_relationship.webp",
              kind: "image",
              brief:
                "Map of the three modules and how their surfaces connect: New Booking (single/bulk), Trip Management (trip table, columns, peek panel), and Live Dispatch (attention queue, fleet map, driver overview, selected trip), converging on assigning a driver and sending an offer.",
              alt: "A map of CrewsLink's three modules, New Booking, Trip Management, and Live Dispatch, and how their surfaces connect, converging on assigning a driver and sending an offer.",
              size: "column",
              aspect: "16/9",
              ready: true,
              bare: true,
            },
          ],
        },
        {
          id: "trip-management",
          nav: "Trip management",
          eyebrow: "Design decision 01",
          title: "Keeping the operation visible.",
          body:
            "The trip table had to serve two purposes: help dispatchers monitor the wider operation and identify trips that needed intervention.",
          body2:
            "I organized trips around their operational status and timing, bringing delayed and unassigned trips into clearer focus. A contextual panel keeps the selected trip and its available actions alongside the table, so dispatchers can investigate an issue without losing their place in the queue.\n\nThe key trade-off was deciding what belonged in the table and what could wait until a trip was selected. Keeping the overview focused made it easier to scan, while the panel provided the detail needed to act.",
          slots: [
            {
              file: "04_trip_management_full.webp",
              kind: "image",
              brief: "The trip table: booking ID, status, driver due, driver, ETA, and flight, in one scannable view.",
              alt: "The trip table with status, timing, driver, and flight columns for every open trip.",
              caption: "Status, timing, and driver information scannable in one table.",
              size: "wide",
              aspect: "16/10",
              ready: true,
            },
            {
              file: "04_trip_side_panel.webp",
              kind: "image",
              brief: "A trip selected, with its contextual side panel open: driver arrival estimates and a Review offer action, table still visible behind it.",
              alt: "A trip selected from the list, its side panel open showing driver arrival estimates while the table stays visible.",
              caption: "Selecting a trip opens its panel without leaving the table.",
              size: "wide",
              aspect: "16/10",
              ready: true,
            },
          ],
        },
        {
          id: "live-dispatch",
          nav: "Live dispatch",
          eyebrow: "Design decision 02",
          title: "Responding when plans change.",
          body:
            "When a trip needs a driver, proximity alone isn't enough. The dispatcher needs to know who can reach the pickup before it becomes late.",
          body2:
            "I brought the trip route, driver availability, and estimated arrival times into one workspace, allowing dispatchers to compare options in context before sending an offer.\n\nThe map was designed to support that decision, not simply display vehicle locations. Selecting a trip connects its operational status with the route and the available response options.",
          slots: [
            {
              file: "07_dispatch_hero.mp4",
              kind: "video",
              poster: "07_dispatch_hero_poster.webp",
              brief:
                "Main showcase: map overview → select unassigned trip → compare drivers → send offer. Real redesigned Map Overview UI, restrained zoom and cursor.",
              alt: "An unassigned trip is selected, drivers are compared, and an offer is sent.",
              size: "full",
              aspect: "16/9",
              ready: true,
            },
            {
              file: "07_driver_comparison.webp",
              kind: "image",
              brief: "The trip's route and ranked driver arrival estimates, shown together for the send-offer decision.",
              alt: "A trip's route on the map beside ranked driver arrival estimates, before an offer is sent.",
              caption: "Route and driver estimates shown together before an offer is sent.",
              size: "wide",
              aspect: "16/10",
              ready: true,
            },
          ],
          carousel: {
            slides: [
              {
                file: "carousel_dispatch_offered.webp",
                brief: "An offer sent to a driver, awaiting their acceptance.",
                alt: "A trip with an offer pending, awaiting driver acceptance.",
                label: "Offer pending",
                caption: "An offer is sent and awaiting acceptance.",
                ready: true,
              },
              {
                file: "carousel_dispatch_late.webp",
                brief: "A trip running late, with its timing signal visible.",
                alt: "A trip showing a late-driver state.",
                label: "Late driver",
                caption: "A trip needs attention because of timing.",
                ready: true,
              },
              {
                file: "carousel_dispatch_monitoring.webp",
                brief: "An active trip, crew on board, being tracked en route to drop-off.",
                alt: "An active trip being monitored on the map, crew on board.",
                label: "In progress",
                caption: "An active trip is being tracked.",
                ready: true,
              },
            ],
          },
        },
        {
          id: "booking",
          nav: "Booking",
          eyebrow: "Design decision 03",
          title: "From trip details to a ready booking.",
          body:
            "Before a trip can be dispatched, its information needs to be complete enough to act on. Flight details, pickup timing, passengers, and vehicle requirements all need to come together in one booking.",
          body2:
            "The single-booking flow organizes these inputs into a guided process, with flight-linked information helping reduce repetitive entry where available. The final review state gives the user an opportunity to verify the booking before it is created.",
          carousel: {
            slides: [
              {
                file: "carousel_single_start.webp",
                brief: "The booking flow at its starting state.",
                alt: "Beginning a single booking: flight lookup linked to client and contract.",
                label: "Start",
                caption: "Flight lookup fills client, route, and contract.",
                ready: true,
              },
              {
                file: "carousel_single_ready.webp",
                brief: "The completed booking details ready for review.",
                alt: "A completed booking summary with route map, before saving.",
                label: "Ready",
                caption: "Reviewing the completed details before saving.",
                ready: true,
              },
              {
                file: "carousel_single_saved.webp",
                brief: "The booking confirmation state.",
                alt: "A confirmation dialog for a newly created, unassigned booking.",
                label: "Saved",
                caption: "Booking created, unassigned until a driver is sent.",
                ready: true,
              },
            ],
          },
        },
        {
          id: "bulk-booking",
          nav: "Bulk booking",
          eyebrow: "Design decision 04",
          title: "Handling incomplete data without blocking the batch.",
          body:
            "Crew manifests aren't always ready to import. Columns may not match the system's fields, and individual rows can contain missing information.",
          body2:
            "I structured bulk booking around three steps: upload, map, and review. Rather than treating the entire file as valid or invalid, the review stage identifies rows that need correction while keeping the rest of the batch visible.\n\nThis allows dispatchers to identify and correct individual issues before creating bookings, while keeping the rest of the batch visible for review.",
          slotLayout: "gallery",
          slots: [
            {
              file: "06_bulk_upload.webp",
              kind: "image",
              brief: "The upload step: drop a manifest or try a sample file, with a template download for the expected columns.",
              alt: "Uploading a crew manifest spreadsheet, with a sample file and template download available.",
              caption: "Upload a manifest. No bookings are created yet.",
              size: "wide",
              aspect: "16/10",
              ready: true,
            },
            {
              file: "06_bulk_mapping.webp",
              kind: "image",
              brief: "Matching spreadsheet columns to CrewsLink fields, with a live first-row preview per field.",
              alt: "Mapping spreadsheet columns to CrewsLink fields, with a preview of the first row for each field.",
              caption: "Each column is matched to a field, with a live preview.",
              aspect: "16/10",
              ready: true,
            },
            {
              file: "06_bulk_row_edit.webp",
              kind: "image",
              brief: "Editing one row flagged as needing details. The rest of the batch stays available for review.",
              alt: "A single flagged row being corrected, with missing passenger and luggage counts called out.",
              caption: "A flagged row is corrected without blocking the rest of the batch.",
              aspect: "16/10",
              ready: true,
            },
          ],
        },
        {
          id: "reflection",
          nav: "Reflection",
          eyebrow: "Reflection",
          title: "Designing for the moments that need attention.",
          body:
            "The hardest part of this project wasn't fitting more information onto a screen. It was deciding which information deserved attention at each moment.",
          body2:
            "Trip Management needed to preserve the bigger picture, while Live Dispatch needed to support immediate decisions. Designing both experiences showed me how much the same operational data can change in importance depending on the task.\n\nIf I were extending the work, I'd focus on validating how dispatchers handle overlapping exceptions during busy periods, when several trips require attention at once.",
        },
      ],
    },
  },
  {
    kind: "client",
    id: "marys-land-farm",
    name: "MARY'S LAND FARM",
    tag: "Booking & Operations Platform · 2025–2026",
    year: "2025–2026",
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
        body: "Bus stops as dark square icons. Current bus position in green, instantly scannable. Each route in its own colour. Icons adapt across zoom levels.\n\nThe hardest part: multiple routes passing through shared stops. Tested outlines, colour blocks, and split indicators. Final solution: individual coloured lines maintaining identity through shared stops. You can trace any route with your finger across the entire map.",
        media: [
          { src: "/ontra-4.webp", label: "Map · Route lines and stops", aspect: "wide" },
        ],
      },
      {
        index: "04",
        title: "Bike Stations",
        body: "A completely new layer. The badge answers one question at map level: is it worth walking here? Two numbers side by side: 12 manual, 2 electric. One glance, no tap required.\n\nTapping opens a compact detail: name, distance, counts, free spaces, and a direct deep link to unlock in the Lyft app. Two interactions from \"should I bike?\" to unlocking one.",
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
    kind: "build",
    id: "frame-studio",
    name: "FRAME STUDIO",
    tag: "PWA Dev Tool · Personal Project · 2025",
    year: "2025",
    description:
      "PWA showcase tool for presenting web apps inside device frames with custom backgrounds and recordings.",
    bg: "linear-gradient(155deg, #2a1e38 0%, #180f25 55%, #090610 100%)",
    accent: "#8a5abf",
    cover: "/Framestudio cover.webp",
    heroImage: "/Framestudio cover.webp",
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
      { src: "/Framestudio -1.webp", label: "Frame Studio · app loaded in a device frame", aspect: "wide" },
      { src: "/Framestudio -3.webp", label: "Background presets: gradients, grid, dots", aspect: "wide" },
      { src: "/Framestudio -3-1.webp", label: "Export & shareable link", aspect: "wide" },
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
            src: "/aura 1.webp",
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
        body: "Home & Style Discovery opens with curated lookbooks and style guides, with AR entry one tap from any product page. Guided onboarding removes calibration confusion; placement is true-to-scale, with real dimensions, materials, and textures. Advanced controls handle colour, dimensions, and lighting, saved rooms enable sharing, and checkout happens inside the AR view.",
        media: [
          {
            src: "/Deco AR 3.webp",
            caption: "AR controls · colour, dimensions, lighting",
          },
          {
            src: "/Deco AR 4.webp",
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
    tag: "YC S23 · Product Designer · 2024–Present",
    year: "2024–Present",
    description: "Product designer on Tempo's agent side. Sole designer for 5+ product companies, taking their products from zero to launch.",
    bg: "linear-gradient(155deg, #0f1a2e 0%, #090f1a 55%, #040609 100%)",
    accent: "#4a7abf",
    heroImage: "/intro 4.webp",
    externalUrl: "https://www.tempo.new/",
    client: "Tempo",
    role: "Product Designer",
    scope: ["Product Design", "AI Tools", "Design Systems"],
    problem: "Designing AI-native tooling at Tempo (YC S23), and helping companies building on its agent platform ship real products.",
    approach: "Worked on the agent side of Tempo as the sole designer for 5+ product companies, taking each from zero to launch.",
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
