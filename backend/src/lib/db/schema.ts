import { sql } from "drizzle-orm";

import {
  pgTable,
  check,
  index,
  uuid,
  text,
  integer,
  boolean,
  date,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

// Skills Table
export const skills = pgTable("skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: jsonb("name").$type<{ en: string; fr: string }>().notNull(),
  category: text("category").notNull(),
  icon: text("icon"), // react-icons Simple Icons identifier, e.g. "SiReact"
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Projects Table
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: jsonb("title").$type<{ en: string; fr: string }>().notNull(),
  description: jsonb("description")
    .$type<{ en: string; fr: string }>()
    .notNull(),
  fullDescription: jsonb("full_description").$type<{
    en: string;
    fr: string;
  }>(),
  client: text("client"),
  projectUrl: text("project_url"),
  githubUrl: text("github_url"),
  technologies: text("technologies").array(),
  imageUrl: text("image_url"),
  imageKey: text("image_key"),
  color: text("color"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  inProgress: boolean("in_progress").notNull().default(false),
  status: text("status").notNull().default("draft"),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Work Experience Table
export const workExperience = pgTable("work_experience", {
  id: uuid("id").defaultRandom().primaryKey(),
  position: jsonb("position").$type<{ en: string; fr: string }>().notNull(),
  company: jsonb("company").$type<{ en: string; fr: string }>().notNull(),
  location: jsonb("location").$type<{ en: string; fr: string }>().notNull(),
  description: jsonb("description")
    .$type<{ en: string; fr: string }>()
    .notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  current: boolean("current").notNull().default(false),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Education Table
export const education = pgTable("education", {
  id: uuid("id").defaultRandom().primaryKey(),
  degree: jsonb("degree").$type<{ en: string; fr: string }>().notNull(),
  institution: jsonb("institution")
    .$type<{ en: string; fr: string }>()
    .notNull(),
  location: jsonb("location").$type<{ en: string; fr: string }>().notNull(),
  description: jsonb("description").$type<{ en: string; fr: string }>(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  gpa: text("gpa"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Hobbies Table
export const hobbies = pgTable("hobbies", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: jsonb("title").$type<{ en: string; fr: string }>().notNull(),
  description: jsonb("description").$type<{ en: string; fr: string }>(),
  imageUrl: text("image_url"),
  imageKey: text("image_key"),
  color: text("color"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Testimonials Table
export const testimonials = pgTable("testimonials", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  company: text("company"),
  email: text("email").notNull(),
  message: text("message").notNull(),
  rating: integer("rating").notNull(),
  status: text("status").notNull().default("pending"),
  active: boolean("active").notNull().default(true),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contact Messages Table
export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("unread"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Resume Table
export const resumes = pgTable("resumes", {
  id: uuid("id").defaultRandom().primaryKey(),
  filename: text("filename").notNull(),
  fileUrl: text("file_url").notNull(),
  fileKey: text("file_key"), // Storage key for deletion
  fileSize: integer("file_size"), // File size in bytes
  language: text("language").notNull().default("en"), // 'en' or 'fr'
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Resume Downloads Tracking Table
export const resumeDownloads = pgTable("resume_downloads", {
  id: uuid("id").defaultRandom().primaryKey(),
  resumeId: uuid("resume_id")
    .notNull()
    .references(() => resumes.id, { onDelete: "cascade" }),
  downloadedAt: timestamp("downloaded_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// Contact Information Table
export const contactInfo = pgTable("contact_info", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("type").notNull(),
  value: text("value").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Export types
export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type WorkExperience = typeof workExperience.$inferSelect;
export type NewWorkExperience = typeof workExperience.$inferInsert;

export type Education = typeof education.$inferSelect;
export type NewEducation = typeof education.$inferInsert;

export type Hobby = typeof hobbies.$inferSelect;
export type NewHobby = typeof hobbies.$inferInsert;

export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;

export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;

export type ContactInfo = typeof contactInfo.$inferSelect;
export type NewContactInfo = typeof contactInfo.$inferInsert;

// Hackathons and other community activities, managed through the dashboard.
export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: jsonb("title").$type<{ en: string; fr: string }>().notNull(),
  description: jsonb("description").$type<{ en: string; fr: string }>().notNull(),
  organization: jsonb("organization").$type<{ en: string; fr: string }>(),
  period: jsonb("period").$type<{ en: string; fr: string }>().notNull(),
  location: jsonb("location").$type<{ en: string; fr: string }>(),
  category: text("category").notNull().default("hackathon"),
  technologies: text("technologies").array().notNull().default([]),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  eventUrl: text("event_url"),
  order: integer("order").notNull().default(0),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, table => [
  index("activities_published_order_idx").on(table.order, table.createdAt).where(sql`${table.published} = true`),
  index("activities_project_id_idx").on(table.projectId),
  check("activities_category_check", sql`${table.category} IN ('hackathon', 'community', 'competition', 'volunteering', 'other')`),
  check("activities_order_check", sql`${table.order} >= 0`),
  check("activities_title_check", sql`jsonb_typeof(${table.title}) = 'object' AND length(trim(coalesce(${table.title}->>'en',''))) > 0 AND length(trim(coalesce(${table.title}->>'fr',''))) > 0`),
  check("activities_description_check", sql`jsonb_typeof(${table.description}) = 'object' AND length(trim(coalesce(${table.description}->>'en',''))) > 0 AND length(trim(coalesce(${table.description}->>'fr',''))) > 0`),
  check("activities_period_check", sql`jsonb_typeof(${table.period}) = 'object' AND length(trim(coalesce(${table.period}->>'en',''))) > 0 AND length(trim(coalesce(${table.period}->>'fr',''))) > 0`),
]);
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
