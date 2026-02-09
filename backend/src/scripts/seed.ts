import { db, skills, projects, workExperience, education, hobbies, testimonials, contactInfo } from "../lib/db";

async function seed() {
  try {
    console.log("Starting database seed...");

    // Skip if database was already seeded (e.g. volume persisted across restarts)
    const existing = await db.select().from(skills).limit(1);
    if (existing.length > 0) {
      console.log("Database already has data, skipping seed to avoid duplicates.");
      return;
    }

    // Seed Skills (CV + full list — AMINE BAHA)
    console.log("Seeding skills...");
    const skillsData = [
      // Languages
      { name: { en: "Java", fr: "Java" }, category: "Languages", order: 1 },
      { name: { en: "C#", fr: "C#" }, category: "Languages", order: 2 },
      { name: { en: "Kotlin", fr: "Kotlin" }, category: "Languages", order: 3 },
      { name: { en: "PHP", fr: "PHP" }, category: "Languages", order: 4 },
      { name: { en: "JavaScript", fr: "JavaScript" }, category: "Languages", order: 5 },
      { name: { en: "TypeScript", fr: "TypeScript" }, category: "Languages", order: 6 },
      { name: { en: "Python", fr: "Python" }, category: "Languages", order: 7 },
      { name: { en: "SQL", fr: "SQL" }, category: "Languages", order: 8 },
      { name: { en: "HTML/CSS", fr: "HTML/CSS" }, category: "Languages", order: 9 },
      // Back-End
      { name: { en: "Spring Boot", fr: "Spring Boot" }, category: "Back-End", order: 10 },
      { name: { en: "ASP.NET MVC", fr: "ASP.NET MVC" }, category: "Back-End", order: 11 },
      { name: { en: "Laravel", fr: "Laravel" }, category: "Back-End", order: 12 },
      { name: { en: "Node.js", fr: "Node.js" }, category: "Back-End", order: 13 },
      { name: { en: "REST APIs", fr: "API REST" }, category: "Back-End", order: 14 },
      { name: { en: "GraphQL", fr: "GraphQL" }, category: "Back-End", order: 15 },
      { name: { en: "JWT", fr: "JWT" }, category: "Back-End", order: 16 },
      // Front-End & Mobile
      { name: { en: "React", fr: "React" }, category: "Front-End & Mobile", order: 17 },
      { name: { en: "Next.js", fr: "Next.js" }, category: "Front-End & Mobile", order: 18 },
      { name: { en: "Android", fr: "Android" }, category: "Front-End & Mobile", order: 19 },
      { name: { en: "Tailwind CSS", fr: "Tailwind CSS" }, category: "Front-End & Mobile", order: 20 },
      { name: { en: "Bootstrap", fr: "Bootstrap" }, category: "Front-End & Mobile", order: 21 },
      { name: { en: "Blade", fr: "Blade" }, category: "Front-End & Mobile", order: 22 },
      // Databases
      { name: { en: "MySQL", fr: "MySQL" }, category: "Databases", order: 23 },
      { name: { en: "PostgreSQL", fr: "PostgreSQL" }, category: "Databases", order: 24 },
      { name: { en: "MongoDB", fr: "MongoDB" }, category: "Databases", order: 25 },
      { name: { en: "SQLite", fr: "SQLite" }, category: "Databases", order: 26 },
      { name: { en: "TimescaleDB", fr: "TimescaleDB" }, category: "Databases", order: 27 },
      // DevOps & Tools
      { name: { en: "Docker", fr: "Docker" }, category: "DevOps & Tools", order: 28 },
      { name: { en: "Git", fr: "Git" }, category: "DevOps & Tools", order: 29 },
      { name: { en: "Linux/Bash", fr: "Linux/Bash" }, category: "DevOps & Tools", order: 30 },
      { name: { en: "Gradle", fr: "Gradle" }, category: "DevOps & Tools", order: 31 },
      { name: { en: "Postman", fr: "Postman" }, category: "DevOps & Tools", order: 32 },
      { name: { en: "Jira", fr: "Jira" }, category: "DevOps & Tools", order: 33 },
      { name: { en: "VS Code", fr: "VS Code" }, category: "DevOps & Tools", order: 34 },
      // AI & Data
      { name: { en: "OpenAI API", fr: "API OpenAI" }, category: "AI & Data", order: 35 },
      { name: { en: "Langchain", fr: "Langchain" }, category: "AI & Data", order: 36 },
      { name: { en: "PDF Processing", fr: "Traitement PDF" }, category: "AI & Data", order: 37 },
      { name: { en: "Audio Processing", fr: "Traitement audio" }, category: "AI & Data", order: 38 },
      { name: { en: "Prompt Engineering", fr: "Ingénierie de prompts" }, category: "AI & Data", order: 39 },
      // Concepts
      { name: { en: "OOP", fr: "POO" }, category: "Concepts", order: 40 },
      { name: { en: "Data structures & algorithms", fr: "Structures de données et algorithmes" }, category: "Concepts", order: 41 },
      { name: { en: "MVC", fr: "MVC" }, category: "Concepts", order: 42 },
      { name: { en: "DB design & security", fr: "Conception & sécurité BD" }, category: "Concepts", order: 43 },
      { name: { en: "Unit testing", fr: "Tests unitaires" }, category: "Concepts", order: 44 },
      { name: { en: "Agile/Scrum", fr: "Agile/Scrum" }, category: "Concepts", order: 45 },
    ];

    for (const skill of skillsData) {
      try {
        await db.insert(skills).values(skill);
      } catch (error) {
        // Skip if already exists
        console.log(`Skill ${skill.name.en} already exists, skipping...`);
      }
    }

    // Seed Projects (aligned with CV — AMINE BAHA)
    console.log("Seeding projects...");
    const projectsData = [
      {
        title: { en: "PassionJerseysStore (Full-Stack E-commerce)", fr: "PassionJerseysStore (E-commerce Full-stack)" },
        description: { 
          en: "Bilingual (EN/FR) full-stack e-commerce store", 
          fr: "Boutique e-commerce full-stack bilingue (FR/EN)" 
        },
        fullDescription: {
          en: "Product Owner and developer for a bilingual (EN/FR) full-stack e-commerce store; delivered iteratively using Agile/Scrum. Deployed the application; implemented Stripe checkout, authentication, and role-based admin access with transactional emails.",
          fr: "Product Owner et développeur d'une boutique e-commerce full-stack bilingue (FR/EN); développement itératif en Agile/Scrum. Application déployée; paiement/checkout Stripe, authentification et gestion des rôles (admin) avec courriels transactionnels."
        },
        technologies: ["Next.js", "Spring Boot", "PostgreSQL", "Docker", "Stripe"],
        color: "#EFE8D3",
        status: "published",
        featured: true,
      },
      {
        title: { en: "Retail Inventory Management Platform", fr: "Plateforme de gestion d'inventaire (Retail)" },
        description: { 
          en: "Multi-store inventory with ML forecasting and real-time updates", 
          fr: "Plateforme multi-magasins avec prévisions ML et mises à jour temps réel" 
        },
        fullDescription: {
          en: "Built a multi-store inventory platform with automated purchasing and reorder points powered by ML forecasting; developed iteratively using Agile/Scrum. Implemented secure APIs (REST/GraphQL) with JWT/RBAC and real-time updates (SSE).",
          fr: "Plateforme multi-magasins avec achats automatisés et points de réapprovisionnement (prévisions ML); développement en Agile/Scrum. APIs REST/GraphQL (JWT/RBAC) et mises à jour temps réel (SSE); pile conteneurisée via Docker Compose."
        },
        technologies: ["Java", "Spring Boot", "Docker", "PostgreSQL", "MySQL"],
        color: "#8C8C8C",
        status: "published",
        featured: true,
      },
      {
        title: { en: "Champlain Petclinic (Open-Source Microservices)", fr: "Champlain Petclinic (Microservices open-source)" },
        description: { 
          en: "Spring Boot microservices stack with auth and API Gateway", 
          fr: "Stack microservices Spring Boot avec auth et API Gateway" 
        },
        fullDescription: {
          en: "Contributed to authentication/authorization in a Spring Boot microservices stack; collaborated using Agile/Scrum ceremonies and Jira tracking. Scrum Master: led stand-ups/sprint ceremonies and validated integration via API Gateway.",
          fr: "Contribution à l'authentification/autorisation; travail en équipe avec cérémonies Agile/Scrum et suivi Jira. Scrum Master : animation des cérémonies et validation de l'intégration via l'API Gateway."
        },
        technologies: ["Java", "Spring Boot", "Docker Compose", "Jira"],
        color: "#2D5A27",
        status: "published",
        featured: true,
      },
      {
        title: { en: "Code Quest Hackathon — CityPulse Montréal 2035", fr: "Hackathon Code Quest — CityPulse Montréal 2035" },
        description: { 
          en: "City Stress Index map (21.5k cells) with AI insights from 2M+ open data", 
          fr: "Carte CSI (21.5k cellules) avec insights IA à partir de 2M+ données ouvertes" 
        },
        fullDescription: {
          en: "Next.js + Flask: processed 2M+ Montréal open-data into a City Stress Index map (21.5k cells) with AI insights.",
          fr: "Next.js + API Flask : 2M+ données ouvertes de Montréal pour une carte CSI (21.5k cellules) avec insights IA."
        },
        technologies: ["Next.js", "Flask", "Open Data", "AI"],
        color: "#1a365d",
        status: "published",
        featured: true,
      },
    ];

    for (const project of projectsData) {
      try {
        await db.insert(projects).values(project);
      } catch (error) {
        console.log(`Project ${project.title.en} already exists, skipping...`);
      }
    }

    // Seed Work Experience (aligned with CV — AMINE BAHA)
    console.log("Seeding work experience...");
    const experienceData = [
      {
        position: { en: "Full-Stack Developer Intern", fr: "Stagiaire développeur Full-stack" },
        company: { en: "Loriginal.org / Artur.art", fr: "Loriginal.org / Artur.art" },
        location: { en: "Montréal, QC", fr: "Montréal, QC" },
        description: {
          en: "Contribute to an AI + RAG integration platform using Next.js and RAG orchestration (LangChain/LlamaIndex) for e-commerce/CRM workflows.\nWork on ingestion/ETL automation (n8n) and vector search (Postgres + pgvector / Supabase or Qdrant) powering personalization and support.",
          fr: "Contribution à une plateforme d'intégration IA + RAG en Next.js et orchestration (LangChain/LlamaIndex) pour des workflows e-commerce/CRM.\nTravail sur l'ingestion/ETL (n8n) et la recherche vectorielle (Postgres + pgvector / Supabase ou Qdrant) pour personnalisation et support.",
        },
        startDate: "2026-03-01",
        endDate: null,
        current: true,
        order: 1,
      },
      {
        position: { en: "Peer Tutor — Computer Science", fr: "Tuteur pair — Informatique" },
        company: { en: "Champlain College Saint-Lambert", fr: "Collège Champlain Saint-Lambert" },
        location: { en: "Saint-Lambert, QC", fr: "Saint-Lambert, QC" },
        description: {
          en: "Tutored peers in Java, C#, data structures, SQL, and web fundamentals; guided debugging and Git workflows.",
          fr: "Tutorat en Java, C#, structures de données, SQL et bases du web; aide au débogage et aux workflows Git.",
        },
        startDate: "2025-09-01",
        endDate: "2025-12-31",
        current: false,
        order: 2,
      },
    ];

    for (const exp of experienceData) {
      try {
        await db.insert(workExperience).values(exp);
      } catch (error) {
        console.log(`Experience already exists, skipping...`);
      }
    }

    // Seed Education (aligned with CV — AMINE BAHA)
    console.log("Seeding education...");
    const educationData = [
      {
        degree: { en: "Diploma of College Studies (DEC) — Computer Science Technology", fr: "Diplôme d'études collégiales (DEC) — Techniques de l'informatique" },
        institution: { en: "Champlain College Saint-Lambert", fr: "Collège Champlain Saint-Lambert" },
        location: { en: "Saint-Lambert, QC", fr: "Saint-Lambert, QC" },
        description: {
          en: "Aug 2023 – Jun 2026 (Expected)\nComputer Science Technology, Software Development, Database Design, Agile/Scrum",
          fr: "Août 2023 – Juin 2026 (prévu)\nTechniques de l'informatique, développement logiciel, conception BD, Agile/Scrum",
        },
        startDate: "2023-08-01",
        endDate: "2026-06-30",
        gpa: null,
        order: 1,
      },
    ];

    for (const edu of educationData) {
      try {
        await db.insert(education).values(edu);
      } catch (error) {
        console.log(`Education already exists, skipping...`);
      }
    }

    // Seed Hobbies
    console.log("Seeding hobbies...");
    const hobbiesData = [
      { title: { en: "Running", fr: "Course à pied" }, description: { en: "Staying active and healthy", fr: "Rester actif et en bonne santé" }, color: "#2D3748", order: 1 },
      { title: { en: "Photography", fr: "Photographie" }, description: { en: "Capturing moments and landscapes", fr: "Capturer des moments et des paysages" }, color: "#4A5568", order: 2 },
      { title: { en: "Gaming", fr: "Jeux vidéo" }, description: { en: "Strategy and puzzle games", fr: "Jeux de stratégie et de réflexion" }, color: "#1A202C", order: 3 },
      { title: { en: "Travel", fr: "Voyage" }, description: { en: "Exploring new places and cultures", fr: "Explorer de nouveaux lieux et cultures" }, color: "#744210", order: 4 },
      { title: { en: "Music", fr: "Musique" }, description: { en: "Playing guitar and producing beats", fr: "Jouer de la guitare et produire des beats" }, color: "#553C9A", order: 5 },
    ];

    for (const hobby of hobbiesData) {
      try {
        await db.insert(hobbies).values(hobby);
      } catch (error) {
        console.log(`Hobby ${hobby.title.en} already exists, skipping...`);
      }
    }

    // Seed Testimonials
    console.log("Seeding testimonials...");
    const testimonialsData = [
      {
        name: "John Doe",
        position: "CEO",
        company: "Tech Corp",
        email: "john@techcorp.com",
        message: "Exceptional developer with great attention to detail. Delivered the project on time and exceeded expectations.",
        rating: 5,
        status: "approved",
      },
      {
        name: "Jane Smith",
        position: "Product Manager",
        company: "Innovation Labs",
        email: "jane@innovationlabs.com",
        message: "Professional, communicative, and highly skilled. A pleasure to work with!",
        rating: 5,
        status: "approved",
      },
      {
        name: "Mike Johnson",
        position: "Startup Founder",
        company: "StartupXYZ",
        email: "mike@startupxyz.com",
        message: "Transformed our vision into reality. Highly recommended for any web development project.",
        rating: 5,
        status: "approved",
      },
    ];

    for (const testimonial of testimonialsData) {
      try {
        await db.insert(testimonials).values(testimonial);
      } catch (error) {
        console.log(`Testimonial already exists, skipping...`);
      }
    }

    // Seed Contact Info (AMINE BAHA)
    console.log("Seeding contact info...");
    const contactInfoData = [
      { type: "phone", value: "+1 (438) 227-7034", order: 1 },
      { type: "location", value: "Longueuil, QC", order: 2 },
      { type: "email", value: "aminebaha115@gmail.com", order: 3 },
      { type: "github", value: "https://github.com/AmineBaha-oss", order: 4 },
      { type: "linkedin", value: "https://www.linkedin.com/in/amine-baha-oss", order: 5 },
    ];

    for (const info of contactInfoData) {
      try {
        await db.insert(contactInfo).values(info);
      } catch (error) {
        console.log(`Contact info already exists, skipping...`);
      }
    }

    console.log("Database seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    // Don't exit with error code - allow container to start even if seeding has issues
    // (e.g., data already exists from previous runs)
    console.log("Continuing despite seeding errors...");
  }
}

seed();
