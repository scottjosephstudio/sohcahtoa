// lib/utils.js

// Import data sources directly
import projects from "../data/projects";
import menuData from "../data/menuData";
import imageData from "../data/indeximageData";

// Utility function to get all projects
export async function getAllProjects() {
  return projects;
}

// Utility function to get a single project by ID
export async function getProjectById(id) {
  const projects = await getAllProjects();
  return projects.find((project) => project.id === id);
}

// Get the next project ID (for navigation)
export async function getNextProjectId(currentId) {
  const projects = await getAllProjects();
  const currentIndex = projects.findIndex(
    (project) => project.id === currentId,
  );

  // If it's the last project, go to the first one
  if (currentIndex === projects.length - 1 || currentIndex === -1) {
    return projects[0].id;
  }

  // Otherwise, go to the next project
  return projects[currentIndex + 1].id;
}

// Get the previous project ID (for navigation)
export async function getPrevProjectId(currentId) {
  const projects = await getAllProjects();
  const currentIndex = projects.findIndex(
    (project) => project.id === currentId,
  );

  // If it's the first project, go to the last one
  if (currentIndex === 0 || currentIndex === -1) {
    return projects[projects.length - 1].id;
  }

  // Otherwise, go to the previous project
  return projects[currentIndex - 1].id;
}

// Get all gallery images for the homepage
export async function getAllImages() {
  return imageData;
}

// Get menu data
export async function getMenuData() {
  return menuData;
}

// Format date helper
export function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

// Delay function for animations
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Utility to shuffle an array (Fisher-Yates algorithm)
export function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Get featured projects
export async function getFeaturedProjects() {
  const projects = await getAllProjects();
  return projects.filter((project) => project.featured);
}

// Get projects by category
export async function getProjectsByCategory(category) {
  const projects = await getAllProjects();
  return projects.filter((project) => project.category === category);
}

// Get related projects (same category, excluding current)
export async function getRelatedProjects(currentId, limit = 3) {
  const currentProject = await getProjectById(currentId);
  if (!currentProject) return [];

  const projects = await getProjectsByCategory(currentProject.category);
  return projects.filter((project) => project.id !== currentId).slice(0, limit);
}
