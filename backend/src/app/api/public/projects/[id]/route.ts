import { NextRequest, NextResponse } from "next/server";
import { db, projects } from "@/lib/db";
import { validateLanguage, validateUUID } from "@/lib/utils/validation";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const lang = validateLanguage(searchParams.get("lang"));

    if (!validateUUID(id)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.status, "published")))
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Transform to localized format
    const localizedProject = {
      id: project.id,
      title: typeof project.title === 'object' && project.title !== null 
        ? (project.title as any)[lang] || (project.title as any).en 
        : project.title,
      description: typeof project.description === 'object' && project.description !== null
        ? (project.description as any)[lang] || (project.description as any).en
        : project.description,
      fullDescription: typeof project.fullDescription === 'object' && project.fullDescription !== null
        ? (project.fullDescription as any)[lang] || (project.fullDescription as any).en
        : project.fullDescription,
      client: project.client,
      projectUrl: project.projectUrl,
      githubUrl: project.githubUrl,
      technologies: project.technologies,
      imageUrl: project.imageUrl,
      imageKey: project.imageKey,
      color: project.color,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
      featured: project.featured,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };

    return NextResponse.json({ project: localizedProject });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}
