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

    // Seed Skills
    console.log("Seeding skills...");
    const skillsData = [
      { name: { en: "Java", fr: "Java" }, category: "Languages", order: 1 },
      { name: { en: "C#", fr: "C#" }, category: "Languages", order: 2 },
      { name: { en: "Kotlin", fr: "Kotlin" }, category: "Languages", order: 3 },
      { name: { en: "PHP", fr: "PHP" }, category: "Languages", order: 4 },
      { name: { en: "JavaScript", fr: "JavaScript" }, category: "Languages", order: 5 },
      { name: { en: "TypeScript", fr: "TypeScript" }, category: "Languages", order: 6 },
      { name: { en: "Python", fr: "Python" }, category: "Languages", order: 7 },
      { name: { en: "SQL", fr: "SQL" }, category: "Languages", order: 8 },
      { name: { en: "HTML/CSS", fr: "HTML/CSS" }, category: "Languages", order: 9 },
      { name: { en: "Spring Boot", fr: "Spring Boot" }, category: "Back-End", order: 10 },
      { name: { en: "ASP.NET MVC", fr: "ASP.NET MVC" }, category: "Back-End", order: 11 },
      { name: { en: "Laravel", fr: "Laravel" }, category: "Back-End", order: 12 },
      { name: { en: "Node.js", fr: "Node.js" }, category: "Back-End", order: 13 },
      { name: { en: "REST APIs", fr: "API REST" }, category: "Back-End", order: 14 },
      { name: { en: "GraphQL", fr: "GraphQL" }, category: "Back-End", order: 15 },
      { name: { en: "JWT", fr: "JWT" }, category: "Back-End", order: 16 },
      { name: { en: "React", fr: "React" }, category: "Front-End & Mobile", order: 17 },
      { name: { en: "Next.js", fr: "Next.js" }, category: "Front-End & Mobile", order: 18 },
      { name: { en: "Android", fr: "Android" }, category: "Front-End & Mobile", order: 19 },
      { name: { en: "Tailwind CSS", fr: "Tailwind CSS" }, category: "Front-End & Mobile", order: 20 },
      { name: { en: "Bootstrap", fr: "Bootstrap" }, category: "Front-End & Mobile", order: 21 },
      { name: { en: "Blade", fr: "Blade" }, category: "Front-End & Mobile", order: 22 },
      { name: { en: "MySQL", fr: "MySQL" }, category: "Databases", order: 23 },
      { name: { en: "PostgreSQL", fr: "PostgreSQL" }, category: "Databases", order: 24 },
      { name: { en: "MongoDB", fr: "MongoDB" }, category: "Databases", order: 25 },
      { name: { en: "SQLite", fr: "SQLite" }, category: "Databases", order: 26 },
      { name: { en: "TimescaleDB", fr: "TimescaleDB" }, category: "Databases", order: 27 },
      { name: { en: "Docker", fr: "Docker" }, category: "DevOps & Tools", order: 28 },
      { name: { en: "Git", fr: "Git" }, category: "DevOps & Tools", order: 29 },
      { name: { en: "Linux/Bash", fr: "Linux/Bash" }, category: "DevOps & Tools", order: 30 },
      { name: { en: "Gradle", fr: "Gradle" }, category: "DevOps & Tools", order: 31 },
      { name: { en: "Postman", fr: "Postman" }, category: "DevOps & Tools", order: 32 },
      { name: { en: "Jira", fr: "Jira" }, category: "DevOps & Tools", order: 33 },
      { name: { en: "VS Code", fr: "VS Code" }, category: "DevOps & Tools", order: 34 },
      { name: { en: "OpenAI API", fr: "API OpenAI" }, category: "AI & Data", order: 35 },
      { name: { en: "Langchain", fr: "Langchain" }, category: "AI & Data", order: 36 },
      { name: { en: "PDF Processing", fr: "Traitement PDF" }, category: "AI & Data", order: 37 },
      { name: { en: "Audio Processing", fr: "Traitement audio" }, category: "AI & Data", order: 38 },
      { name: { en: "Prompt Engineering", fr: "Ingénierie de prompts" }, category: "AI & Data", order: 39 },
    ];

    for (const skill of skillsData) {
      try {
        await db.insert(skills).values(skill);
      } catch (error) {
        // Skip if already exists
        console.log(`Skill ${skill.name.en} already exists, skipping...`);
      }
    }

    // Seed Projects
    console.log("Seeding projects...");
    const projectsData = [
      {
        title: { en: "Passion Sports Jerseys", fr: "Maillots Passion Sports" },
        description: { 
          en: "E-commerce platform for custom sports jerseys", 
          fr: "Plateforme e-commerce pour maillots de sport personnalisés" 
        },
        fullDescription: {
          en: "A full-stack e-commerce solution allowing customers to customize and order sports jerseys with team logos and player names.",
          fr: "Une solution e-commerce full-stack permettant aux clients de personnaliser et commander des maillots de sport avec logos d'équipes et noms de joueurs."
        },
        technologies: ["React", "Node.js", "PostgreSQL", "Stripe"],
        color: "#EFE8D3",
        status: "published",
        featured: true,
      },
      {
        title: { en: "Retail Inventory Platform", fr: "Plateforme d'inventaire de détail" },
        description: { 
          en: "Inventory management system for retail stores", 
          fr: "Système de gestion d'inventaire pour magasins de détail" 
        },
        fullDescription: {
          en: "Comprehensive inventory management platform with real-time tracking, automated reordering, and analytics dashboard.",
          fr: "Plateforme complète de gestion d'inventaire avec suivi en temps réel, réapprovisionnement automatisé et tableau de bord analytique."
        },
        technologies: ["Spring Boot", "React", "PostgreSQL", "Docker"],
        color: "#8C8C8C",
        status: "published",
        featured: true,
      },
      {
        title: { en: "CityPulse Montreal", fr: "CityPulse Montréal" },
        description: { 
          en: "Real-time city information and events platform", 
          fr: "Plateforme d'information et d'événements en temps réel pour la ville" 
        },
        fullDescription: {
          en: "A mobile and web application providing real-time information about events, transportation, and services in Montreal.",
          fr: "Une application mobile et web fournissant des informations en temps réel sur les événements, le transport et les services à Montréal."
        },
        technologies: ["Next.js", "TypeScript", "MongoDB", "Android"],
        color: "#000000",
        status: "published",
        featured: true,
      },
      {
        title: { en: "Study Guide Generator", fr: "Générateur de guides d'étude" },
        description: { 
          en: "AI-powered study guide generation tool", 
          fr: "Outil de génération de guides d'étude alimenté par l'IA" 
        },
        fullDescription: {
          en: "An intelligent study guide generator that uses AI to create personalized study materials from course content and notes.",
          fr: "Un générateur de guides d'étude intelligent qui utilise l'IA pour créer du matériel d'étude personnalisé à partir du contenu et des notes du cours."
        },
        technologies: ["Python", "OpenAI API", "React", "PostgreSQL"],
        color: "#706D63",
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

    // Seed Work Experience
    console.log("Seeding work experience...");
    const experienceData = [
      {
        position: { en: "Peer Tutor — Computer Science", fr: "Tuteur par les pairs — Informatique" },
        company: { en: "Champlain College Saint-Lambert", fr: "Collège Champlain Saint-Lambert" },
        location: { en: "Saint-Lambert, QC", fr: "Saint-Lambert, QC" },
        description: {
          en: "Provided one-on-one and group tutoring in computer science fundamentals.\nTutored in Java, C#, data structures, SQL, and web fundamentals\nGuided debugging, schema design, and exam preparation\nCreated practice exercises and reviewed Git workflows and Linux tooling",
          fr: "Tutorat individuel et en groupe en fondements de l'informatique.\nTutorat en Java, C#, structures de données, SQL et bases du web\nAide au débogage, conception de schémas et préparation aux examens\nCréation d'exercices et revue des flux Git et des outils Linux",
        },
        startDate: "2025-09-01",
        endDate: "2025-12-31",
        current: false,
        order: 1,
      },
    ];

    for (const exp of experienceData) {
      try {
        await db.insert(workExperience).values(exp);
      } catch (error) {
        console.log(`Experience already exists, skipping...`);
      }
    }

    // Seed Education
    console.log("Seeding education...");
    const educationData = [
      {
        degree: { en: "Diploma of College Studies (DEC) — Computer Science Technology", fr: "Diplôme d'études collégiales (DEC) — Techniques de l'informatique" },
        institution: { en: "Champlain College Saint-Lambert", fr: "Collège Champlain Saint-Lambert" },
        location: { en: "Saint-Lambert, QC", fr: "Saint-Lambert, QC" },
        description: {
          en: "Computer Science Technology\nSoftware Development\nDatabase Design\nAgile/Scrum methodologies",
          fr: "Techniques de l'informatique\nDéveloppement logiciel\nConception de bases de données\nMéthodologies Agile/Scrum",
        },
        startDate: "2023-08-01",
        endDate: "2026-06-30",
        gpa: "3.8",
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

    // Seed Contact Info
    console.log("Seeding contact info...");
    const contactInfoData = [
      {
        type: "email",
        value: "aminebaha115@gmail.com",
        order: 1,
      },
      {
        type: "github",
        value: "https://github.com/AmineBaha-oss",
        order: 2,
      },
      {
        type: "linkedin",
        value: "https://www.linkedin.com/in/amine-baha-oss",
        order: 3,
      },
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
