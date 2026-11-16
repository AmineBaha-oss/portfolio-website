import type { Project, Skill, Education, WorkExperience } from '../api/client';

// Public portfolio content, aligned with Amine's November 2026 bilingual CV.
// Homepage order is intentional; administrative database records remain intact.
type Copy = [en: string, fr: string];
const text = (copy: Copy, lang: string) => copy[lang === 'fr' ? 1 : 0];

const projectContent: Array<{
  id: string; title: Copy; description: Copy; details: Copy;
  technologies: string[]; githubUrl: string; projectUrl?: string; color: string;
}> = [
  {
    id: 'passion-jerseys', title: ['PassionJerseysStore', 'PassionJerseysStore'],
    description: ['Bilingual e-commerce store — Product Owner & full-stack developer.', 'Boutique e-commerce bilingue — Product Owner et développeur full-stack.'],
    details: ['Product Owner and developer for a bilingual English/French sports jersey store, delivered using Agile/Scrum. Deployed a full-stack application with Stripe checkout, authentication, role-based admin access and transactional emails. Separate storefront, administration, authentication and email services connect to a Spring Boot API and PostgreSQL databases.', 'Product Owner et développeur d’une boutique de maillots bilingue français/anglais, réalisée avec Agile/Scrum. Déploiement d’une application complète avec paiement Stripe, authentification, accès administrateur par rôle et courriels transactionnels. Les services de boutique, d’administration, d’authentification et de courriel communiquent avec une API Spring Boot et des bases PostgreSQL.'],
    technologies: ['Next.js', 'Spring Boot', 'PostgreSQL', 'Docker', 'Stripe', 'Better Auth', 'Agile/Scrum'],
    githubUrl: 'https://github.com/AmineBaha-oss/PassionJerseysStore',
    projectUrl: 'https://passion-jerseys-preview-store.vercel.app', color: '#572a28',
  },
  {
    id: 'levsq', title: ['levsq — Local-First Desktop Search', 'levsq — Recherche documentaire locale'],
    description: ['Search course materials from any Windows app. Your files stay on your device.', 'Recherchez vos cours depuis toute application Windows. Vos fichiers restent sur votre appareil.'],
    details: ['Developed a private Windows desktop companion for students to instantly search local course materials from any application. Implemented SQLite FTS5 full-text indexing, a global keyboard shortcut and navigation to the exact page or slide. Rust handles indexing and operating-system integration; Tauri 2 and Svelte 5 provide the desktop interface. All course data stays on-device.', 'Développement d’une application Windows privée permettant aux étudiants de rechercher leurs supports de cours depuis toute application. Indexation plein texte avec SQLite FTS5, raccourci clavier global et navigation vers la page ou diapositive exacte. Rust gère l’indexation et l’intégration au système; Tauri 2 et Svelte 5 composent l’interface. Les données de cours restent sur l’appareil.'],
    technologies: ['Rust', 'Tauri 2', 'Svelte 5', 'TypeScript', 'SQLite FTS5'],
    githubUrl: 'https://github.com/AmineBaha-oss/levsq', color: '#243a36',
  },
  {
    id: 'portfolio-website', title: ['Personal Portfolio Website', 'Site web portfolio personnel'],
    description: ['Bilingual portfolio with separate frontend, API and authentication services.', 'Portfolio bilingue avec services frontend, API et authentification séparés.'],
    details: ['Built and deployed a personal portfolio with separate frontend, API and authentication services using Docker Compose. Implemented Better Auth, JWT-protected APIs, role-based access, separate PostgreSQL databases and GitHub Actions CI. Includes English/French content, project detail pages and an administrative dashboard.', 'Création et déploiement d’un portfolio avec services frontend, API et authentification séparés via Docker Compose. Implémentation de Better Auth, d’API protégées par JWT, d’accès par rôle, de bases PostgreSQL séparées et de CI GitHub Actions. Contenu français/anglais, pages détaillées de projets et tableau de bord administratif.'],
    technologies: ['Next.js', 'Better Auth', 'PostgreSQL', 'Docker', 'GitHub Actions', 'JWT/RBAC'],
    githubUrl: 'https://github.com/AmineBaha-oss/portfolio-website', projectUrl: 'https://aminebaha.dev', color: '#2b293d',
  },
  {
    id: 'landerprint', title: ['LANDERPRINT', 'LANDERPRINT'],
    description: ['Interactive 3D lunar landing-site explorer — NASA Space Apps Challenge 2026.', 'Explorateur 3D de sites d’alunissage — NASA Space Apps Challenge 2026.'],
    details: ['Co-developed an interactive 3D lunar landing-site explorer for NASA Space Apps Challenge 2026. Compare solar power, battery reserves and Earth visibility using NASA terrain data. Integrated Python-processed datasets covering seven sites and 2,352 hourly samples into a browser-based simulation deployed on Vercel. Explore location, date, lander heading and solar-array configuration in 2D and 3D. An educational research prototype, not a flight-certified or NASA-endorsed planning system.', 'Codéveloppement d’un explorateur 3D de sites d’alunissage pour le NASA Space Apps Challenge 2026, comparant production solaire, réserves de batterie et visibilité de la Terre à partir de données NASA. Intégration de données traitées en Python couvrant sept sites et 2 352 observations horaires dans une simulation web déployée sur Vercel. Exploration du lieu, de la date, de l’orientation et des panneaux solaires en 2D et 3D. Prototype de recherche pédagogique, sans certification de vol ni approbation de la NASA.'],
    technologies: ['React', 'TypeScript', 'Three.js', 'Python', 'React Three Fiber', 'Vite'],
    githubUrl: 'https://github.com/AmineBaha-oss/Nasa', projectUrl: 'https://landerprint.vercel.app', color: '#141820',
  },
];

export function featuredProjects(lang: string): Project[] {
  return projectContent.map(p => ({
    id: p.id, title: text(p.title, lang), description: text(p.description, lang),
    fullDescription: text(p.details, lang), technologies: p.technologies,
    githubUrl: p.githubUrl, projectUrl: p.projectUrl, color: p.color,
    imageUrl: `/projects/${p.id}.svg`, status: 'published', featured: true,
  }));
}
const normalized = (value?: string | null) => (value || '').toLowerCase().replace(/\/$/, '').replace(/\.git$/, '');
export function isFeaturedProject(project: Project): boolean {
  return projectContent.some(p => p.id === project.id || normalized(p.githubUrl) === normalized(project.githubUrl)
    || (!!p.projectUrl && normalized(p.projectUrl) === normalized(project.projectUrl))
    || normalized(project.title).includes(p.id === 'passion-jerseys' ? 'passionjerseys' : p.id === 'landerprint' ? 'landerprint' : p.id === 'levsq' ? 'levsq' : 'personal portfolio')
    || (p.id === 'portfolio-website' && /portfolio personnel/i.test(project.title)));
}

const groups: Array<{ category: Copy; names: string[] }> = [
  { category: ['Languages', 'Langages'], names: ['Java', 'C#', 'Rust', 'Kotlin', 'PHP', 'JavaScript', 'TypeScript', 'SQL', 'HTML/CSS'] },
  { category: ['Back-End', 'Back-End'], names: ['Spring Boot', 'ASP.NET MVC', 'Laravel', 'Node.js', 'Flask', 'Prisma ORM', 'Better Auth', 'Stripe'] },
  { category: ['Front-End / Desktop', 'Front-End / Bureau'], names: ['Next.js', 'React', 'Svelte 5', 'Tauri 2', 'Android (Kotlin)', 'Tailwind', 'Bootstrap'] },
  { category: ['AI / RAG', 'IA / RAG'], names: ['LangChain', 'LlamaIndex', 'Gemini AI', 'pgvector', 'Qdrant', 'Supabase', 'n8n (ETL/ingestion)'] },
  { category: ['Databases', 'Bases de données'], names: ['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite (FTS5)'] },
  { category: ['DevOps / Tools', 'DevOps / Outils'], names: ['Docker & Docker Compose', 'GitHub Actions', 'Linux/Bash', 'Git', 'PowerShell', 'Cargo', 'pnpm', 'Jira'] },
  { category: ['Concepts', 'Concepts'], names: ['OOP', 'Data structures / algorithms', 'MVC', 'JWT/RBAC', 'Database design', 'Full-text search', 'Unit testing', 'Agile/Scrum'] },
];
const frenchConcepts = ['POO', 'Structures de données / algorithmes', 'MVC', 'JWT/RBAC', 'Conception de bases de données', 'Recherche plein texte', 'Tests unitaires', 'Agile/Scrum'];
const skillIcons: Record<string, string> = {
  Java: 'SiOpenjdk', Rust: 'SiRust', Kotlin: 'SiKotlin', PHP: 'SiPhp', JavaScript: 'SiJavascript', TypeScript: 'SiTypescript',
  'Spring Boot': 'SiSpringboot', 'Node.js': 'SiNodedotjs', Laravel: 'SiLaravel', Flask: 'SiFlask', 'Prisma ORM': 'SiPrisma', Stripe: 'SiStripe',
  'Next.js': 'SiNextdotjs', React: 'SiReact', 'Svelte 5': 'SiSvelte', 'Tauri 2': 'SiTauri', 'Android (Kotlin)': 'SiAndroid', Tailwind: 'SiTailwindcss', Bootstrap: 'SiBootstrap',
  Supabase: 'SiSupabase', MySQL: 'SiMysql', PostgreSQL: 'SiPostgresql', MongoDB: 'SiMongodb', 'SQLite (FTS5)': 'SiSqlite',
  'GitHub Actions': 'SiGithubactions', Git: 'SiGit', pnpm: 'SiPnpm', Jira: 'SiJira', 'Docker & Docker Compose': 'SiDocker',
};
export function profileSkills(lang: string): Skill[] {
  return groups.flatMap((g, gi) => g.names.map((name, i) => ({
    id: `cv-skill-${gi}-${i}`, name: lang === 'fr' && gi === 6 ? frenchConcepts[i] : name,
    category: text(g.category, lang), order: gi * 20 + i, icon: skillIcons[name] || null,
  })));
}
export function profileEducation(lang: string): Education[] {
  return [
    { id: 'concordia', degree: text(['Bachelor of Computer Science (BCompSc) — Joint Major in Data Science', 'Baccalauréat en informatique (BCompSc) — Majeure conjointe en science des données'], lang), institution: text(['Concordia University', 'Université Concordia'], lang), location: 'Montréal, QC', startDate: '2026-09-01', endDate: null, description: text(['Expected graduation: 2029', 'Diplôme prévu en 2029'], lang), order: 0 },
    { id: 'champlain', degree: text(['College Diploma (DEC) — Computer Science Technology', 'Diplôme d’études collégiales (DEC) — Techniques de l’informatique'], lang), institution: 'Champlain College Saint-Lambert', location: 'Saint-Lambert, QC', startDate: '2023-08-01', endDate: '2026-06-01', description: text(['Completed June 2026.', 'Diplôme obtenu en juin 2026.'], lang), order: 1 },
  ];
}
export function profileExperience(lang: string): WorkExperience[] {
  return [
    { id: 'loriginal-artur', position: text(['Full-Stack Developer Intern', 'Stagiaire développeur full-stack'], lang), company: 'Loriginal.org / Artur.art', location: 'Montréal, QC', startDate: '2026-03-01', endDate: '2026-05-01', current: false, order: 0, description: text(['Delivered 13 production PRs across eight sprints on a multi-tenant Next.js + MySQL platform serving two brands.\nShipped a Gemini AI image pipeline with batch processing.\nResolved a Stripe concurrent-purchase race condition via webhooks.\nImplemented GA4 e-commerce tracking with GTM and server-side events.\nReduced asset size by 76%.', 'Livré 13 PR en production sur huit sprints sur une plateforme Next.js + MySQL multi-tenant desservant deux marques.\nConçu un pipeline d’images Gemini AI avec traitement par lot.\nRésolu une condition de concurrence Stripe lors d’achats simultanés via webhooks.\nImplémenté le suivi e-commerce GA4 avec GTM et événements côté serveur.\nRéduit la taille des ressources de 76 %.'], lang) },
    { id: 'peer-tutor', position: text(['Peer Tutor — Computer Science', 'Tuteur pair — Informatique'], lang), company: 'Champlain College Saint-Lambert', location: 'Saint-Lambert, QC', startDate: '2025-09-01', endDate: '2025-12-01', current: false, order: 1, description: text(['Tutored peers in Java, C#, data structures, SQL and web fundamentals.\nGuided debugging and Git workflows.', 'Tutorat de pairs en Java, C#, structures de données, SQL et fondamentaux du web.\nAccompagnement en débogage et dans les flux de travail Git.'], lang) },
  ];
}
export const activities = [
  { title: ['Cursor Community Hackathon — Botpress MTL', 'Hackathon Cursor Community — Botpress MTL'] as Copy, year: '2026', description: ['Built PeerTemp, a TypeScript Botpress ADK agent scoring team GitHub activity; shipped in under three hours.', 'Développé PeerTemp, un agent Botpress ADK en TypeScript évaluant l’activité GitHub d’une équipe; livré en moins de trois heures.'] as Copy },
  { title: ['Code Quest Hackathon — CityPulse Montréal 2035', 'Hackathon Code Quest — CityPulse Montréal 2035'] as Copy, year: ['November 2025', 'Novembre 2025'] as Copy, description: ['Turned more than two million Montréal open-data points into an AI-assisted City Stress Index map with Next.js and Flask.', 'Transformé plus de deux millions de données ouvertes de Montréal en carte d’indice de stress urbain avec analyses IA, Next.js et Flask.'] as Copy },
];
export { text as profileText };
