// All site content lives here. Edit freely — every section reads from this file.

export const profile = {
  name: "Nithin Nandakumar",
  firstName: "Nithin",
  lastName: "Nandakumar",
  role: "AI automation & full-stack developer",
  locations: "London / Bangalore",
  email: "nithinjayaraj2612@gmail.com",
  github: "https://github.com/Nithin-mdx",
  githubHandle: "Nithin-mdx",
  cv: "/Nithin_Nandakumar_CV.pdf",
  intro: "I build AI agents, automations and full-stack web apps. Computer Science at Middlesex University, London.",
  statement:
    "I build practical software and AI-powered tools that quietly take the busywork off people's plates.",
  summary:
    "Computer Science student with experience in full-stack development, AI automation, agentic chatbot development and Python application development. Gained hands-on experience through internships at Sirpi Products and Services in Bangalore and through Roblox game development. Interested in building practical software and AI-powered applications.",
  facts: [
    { label: "Internships", value: "3× Sirpi" },
    { label: "Projects", value: "4+ shipped" },
    { label: "Based in", value: "London · Bangalore" },
    { label: "Studying", value: "BSc CS, Middlesex" },
  ],
  languages: [
    { name: "English", level: "First language" },
    { name: "Hindi", level: "Fluent" },
    { name: "Kannada", level: "Fluent" },
    { name: "French", level: "Intermediate" },
  ],
};

export const clocks = [
  { city: "London", tz: "Europe/London" },
  { city: "Bangalore", tz: "Asia/Kolkata" },
];

export const skills = [
  { category: "Programming", items: ["Python", "Java", "C#", "SQL", "JavaScript", "TypeScript"] },
  {
    category: "Development",
    items: ["Full-stack", "Web apps", "REST APIs", "API integration", "Git", "Docker"],
  },
  {
    category: "AI & Automation",
    items: ["Machine learning", "LLMs / OpenAI", "AI automation", "Agentic AI", "n8n"],
  },
  { category: "Other", items: ["Roblox game dev", "Data analysis"] },
];

export type Project = {
  slug: string;
  title: string;
  year: string;
  tagline: string;
  overview: string;
  context: string; // e.g. personal project / coursework
  stack: string[];
  highlights: string[];
  links: { label: string; href: string }[];
  tint?: string; // blob reflection colour while this project is hovered
  // Optional screenshot in /public/work/, e.g. "/work/nova.png". Adds the hover preview + distortion when set.
  image?: string;
};

export const projects: Project[] = [
  {
    slug: "nova",
    tint: "#c6ff3d",
    title: "NOVA",
    year: "2026",
    tagline: "AI command centre with a 3D audio-reactive orb and voice control.",
    overview:
      "A JARVIS-style AI command centre: speak to it, a 3D audio-reactive orb responds, and Claude-powered tool use carries out the request.",
    context: "Personal project",
    stack: ["Next.js", "TypeScript", "React Three Fiber", "GSAP", "Claude API", "Supabase"],
    highlights: [
      "3D audio-reactive orb built with React Three Fiber.",
      "Voice control as the primary interface.",
      "Claude API tool use to act on requests, with Supabase as the backend.",
    ],
    links: [], // TODO: add GitHub / live link, e.g. { label: "GitHub", href: "https://github.com/..." }
  },
  {
    slug: "shelfaware",
    tint: "#f2c14e",
    title: "ShelfAware",
    year: "2026",
    tagline: "Supermarket management system for small shops, built on custom data structures.",
    overview:
      "An ASP.NET Core Razor Pages web app that runs a small supermarket end to end: products, categories, suppliers, stock, sales and reports. Searching runs on hand-written data structures and algorithms instead of built-in collections.",
    context: "University coursework — CST2550",
    stack: ["C#", ".NET 8", "ASP.NET Core Razor Pages", "Entity Framework Core", "SQL Server", "xUnit"],
    highlights: [
      "Custom linked list, binary search tree and hash table — no built-in collections.",
      "Four search strategies: BST by name (O(log n)), hash table by barcode (O(1)), linear filters, and quicksort + binary search.",
      "Multi-item sales with automatic stock reduction, receipts and a logged stock-movement history.",
      "Low-stock alerts, sales and supplier reports, and a live dashboard.",
      "xUnit test suite on EF Core InMemory covering validation, sales, stock and every data structure.",
    ],
    links: [{ label: "GitHub", href: "https://github.com/Nithin-mdx/ShelfAware" }],
  },
  {
    slug: "pestpro",
    tint: "#ff7a45",
    title: "PestPro",
    year: "2026",
    tagline: "Full-stack pest control booking system with a Claude-powered AI agent.",
    overview:
      "A booking and management platform for a pest control business: a .NET Web API over SQL Server with a single-page vanilla JS frontend covering bookings, customers, technicians, pest types, treatments and inspection reports.",
    context: "Group coursework — CST2550",
    stack: [".NET Web API", "C#", "SQL Server", "JavaScript", "Claude API", "MSTest"],
    highlights: [
      "AI agent chatbot: keyword-weighted intent matching picks one of 7 read \"arms\", gathers SQL data as context, then Claude answers in natural language.",
      "Custom generic binary search tree for O(log n) in-memory search and insert.",
      "Repository pattern with interchangeable SQL Server and in-memory implementations.",
      "Cross-entity search with clickable results, plus a real-time dashboard.",
      "Dependency-free SPA frontend in vanilla HTML, CSS and JavaScript.",
    ],
    links: [{ label: "GitHub", href: "https://github.com/ved2406/Pest-Control-Management-system" }],
  },
  {
    slug: "deck-royale",
    tint: "#8e7cff",
    title: "Deck Royale",
    year: "2025",
    tagline: "AI-powered Clash Royale deck builder with a social network built in.",
    overview:
      "A deck builder for Clash Royale players: AI generates competitive 8-card decks on demand, and players share them on a social platform where they follow each other, comment, like and message one another directly.",
    context: "University coursework — CST2120",
    stack: ["Node.js", "Express", "MongoDB", "OpenAI API", "JavaScript", "Multer"],
    highlights: [
      "AI deck generation with GPT-4o-mini, constrained to the real card pool, returned as JSON and validated server-side before it reaches the player.",
      "Direct messaging between players, with conversation threads and unread counts.",
      "Follow system with a feed of decks from people you follow, suggested players and user search with recent searches.",
      "Deck likes and comments with image uploads, plus profile avatars.",
      "Single-page vanilla JS frontend over a JSON REST API, with MongoDB through the official driver (no ORM).",
    ],
    links: [{ label: "GitHub", href: "https://github.com/Nithin-mdx/Deck-Royale" }],
  },
];

export const experience = [
  {
    role: "Data Science Intern",
    company: "Sirpi Products and Services Pvt. Ltd.",
    place: "Bangalore",
    period: "May 2026 — Sep 2026",
    points: [
      "Worked on multiple projects as a full-stack developer across front end and back end.",
      "Taught n8n and automated multiple tasks.",
    ],
  },
  {
    role: "Data Science Intern",
    company: "Sirpi Products and Services Pvt. Ltd.",
    place: "Bangalore",
    period: "May 2025 — Aug 2025",
    points: [
      "Built automated AI agents and created n8n templates.",
      "Connected applications including Zoho and Google services to n8n.",
      "Developed website chatbots using agentic AI to answer user queries.",
    ],
  },
  {
    role: "Sales Assistant",
    company: "Derma Skin Space",
    place: "London",
    period: "Sep 2024 — Nov 2024",
    points: [
      "Personalised skincare consultations; consistent monthly sales growth of 10–20%.",
      "Resolved customer complaints, increasing satisfaction rates by 15%.",
    ],
  },
  {
    role: "Intern",
    company: "Sirpi Products & Services Pvt. Ltd.",
    place: "Bangalore",
    period: "Apr 2024 — Sep 2024",
    points: [
      "Developed Shiny Express applications in Python.",
      "Contributed to project delivery through creative problem-solving.",
      "Supported meetings by preparing materials, setting up meeting spaces and taking notes.",
    ],
  },
];

export const education = [
  {
    title: "BSc Computer Science",
    place: "Middlesex University, London",
    period: "Expected Sep 2027",
    note: "Year 2: First Class with Distinction. Year 3 in progress.",
  },
  { title: "PCMC", place: "Sindhi High School, Bangalore", period: "2024", note: "" },
  { title: "ICSE (Grades 1–10)", place: "Vidya Niketan School, Bangalore", period: "2022", note: "Grade 10: 76%" },
];

export const awards = [
  {
    title: "Shot Put",
    detail:
      "Multiple 1st places at state & district school meets and the Buddha Karnataka Meet; 2nd at CBSE Clusters State-Level; 9th at CBSE Clusters National-Level.",
    year: "2023–24",
  },
  {
    title: "1st Place — FIFA Esports",
    detail: "Delhi Public School Bangalore North tournament.",
    year: "2023–24",
  },
];

export const socialService = {
  org: "Mathru Prathisthana (NGO)",
  points: [
    "Fitness advice and football coaching for underprivileged children",
    "Summer camp support",
    "Reduce, Reuse, Recycle initiative",
  ],
};

export const marqueeWords = ["AI Automation", "Full-stack", "Agentic AI", "n8n", "WebGL", "Python", "LLMs"];
