import { notFound } from 'next/navigation';
import { getProjectById, getAllProjects, getNextProjectId, getPrevProjectId } from '../../../lib/utils';
import ProjectDetail from './ProjectDetailClient';

// For completely static data that never changes after build:
export const dynamic = 'force-static';

// Generate metadata for each project page
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const project = await getProjectById(resolvedParams.id);
  
  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }
  
  // Get the first image using a safe method that works with both old and new formats
  let imageUrl;
  if (project.imageGroups && project.imageGroups.position1 && project.imageGroups.position1.length > 0) {
    // New format with imageGroups
    imageUrl = project.imageGroups.position1[0].src;
  } else if (project.images && project.images.length > 0) {
    // Old format with array of images or objects
    imageUrl = typeof project.images[0] === 'object' ? project.images[0].src : project.images[0];
  } else {
    // Fallback if no images
    imageUrl = ''; // Provide a default image path
  }
  
  return {
    title: `${project.title} | Scott Joseph Studio`,
    description: project.description,
    openGraph: {
      title: `${project.title} | Scott Joseph Studio`,
      description: project.description,
      images: [imageUrl],
    },
  };
}

// Generate static params for all projects at build time
export async function generateStaticParams() {
  const projects = await getAllProjects();
  
  return projects.map((project) => ({
    id: project.id,
  }));
}

export default async function ProjectPage({ params }) {
  // Await params before using its properties
  const resolvedParams = await params;
  
  // Fetch project data using Server Component
  const project = await getProjectById(resolvedParams.id);
  
  // Handle 404 if project not found
  if (!project) {
    notFound();
  }
  
  // Get next and previous project IDs for navigation
  const nextProjectId = await getNextProjectId(resolvedParams.id);
  const prevProjectId = await getPrevProjectId(resolvedParams.id);
  
  return (
    <ProjectDetail 
      project={project}
      prevProjectId={prevProjectId} 
      nextProjectId={nextProjectId}
    />
  );
}