import { getProjectType } from './projectUtils';

/**
 * Convert legacy project data format to the new image groups format
 * This ensures backward compatibility with projects that still use the old format
 * @param {Object} project - Project data that may be in old or new format
 * @returns {Object} Project data with imageGroups structure
 */
export const ensureImageGroups = (project) => {
  // If project already has imageGroups, return as is
  if (project.imageGroups) {
    return project;
  }
  
  // If project has images array but no imageGroups, convert to new format
  if (Array.isArray(project.images)) {
    const convertedProject = { ...project };
    
    // Distribute images to positions based on project type and available images
    const projectType = getProjectType(project);
    const imageGroups = {};
    
    switch (projectType) {
      case '2x2':
        // For 2x2 grid, distribute to positions 1-4
        if (project.images[0]) imageGroups.position1 = [project.images[0]];
        if (project.images[1]) imageGroups.position2 = [project.images[1]];
        if (project.images[2]) imageGroups.position3 = [project.images[2]];
        if (project.images[3]) imageGroups.position4 = [project.images[3]];
        break;
        
      case '3x3+1':
        // For 3x3+1 grid, distribute to positions 1-7
        if (project.images[0]) imageGroups.position1 = [project.images[0]];
        if (project.images[1]) imageGroups.position2 = [project.images[1]];
        if (project.images[2]) imageGroups.position3 = [project.images[2]];
        if (project.images[3]) imageGroups.position4 = [project.images[3]];
        if (project.images[4]) imageGroups.position5 = [project.images[4]];
        if (project.images[5]) imageGroups.position6 = [project.images[5]];
        if (project.images[6]) imageGroups.position7 = [project.images[6]];
        break;
        
      case '1x1':
        // For 1x1 projects, distribute to positions 1-2
        if (project.images[0]) imageGroups.position1 = [project.images[0]];
        if (project.images[1]) imageGroups.position2 = [project.images[1]];
        break;
        
      case '1L':
        // For 1L projects (landscape), distribute to position1
        if (project.images[0]) imageGroups.position1 = [project.images[0]];
        break;
        
      case '1P':
        // For 1P projects (portrait), distribute to position1
        if (project.images[0]) imageGroups.position1 = [project.images[0]];
        break;
        
      case '1x1P':
        // For 1x1P projects (portrait), distribute to positions 1-2
        if (project.images[0]) imageGroups.position1 = [project.images[0]];
        if (project.images[1]) imageGroups.position2 = [project.images[1]];
        break;
        
      case '2x1':
        // For 2x1 projects, distribute to positions 1-3
        if (project.images[0]) imageGroups.position1 = [project.images[0]];
        if (project.images[1]) imageGroups.position2 = [project.images[1]];
        if (project.images[2]) imageGroups.position3 = [project.images[2]];
        break;
        
      case '2x1L':
        // For 2x1L projects (landscape), distribute to positions 1-3
        if (project.images[0]) imageGroups.position1 = [project.images[0]];
        if (project.images[1]) imageGroups.position2 = [project.images[1]];
        if (project.images[2]) imageGroups.position3 = [project.images[2]];
        break;
        
      case '3x3':
        // For 3x3 grid, distribute to positions 1-9
        if (project.images[0]) imageGroups.position1 = [project.images[0]];
        if (project.images[1]) imageGroups.position2 = [project.images[1]];
        if (project.images[2]) imageGroups.position3 = [project.images[2]];
        if (project.images[3]) imageGroups.position4 = [project.images[3]];
        if (project.images[4]) imageGroups.position5 = [project.images[4]];
        if (project.images[5]) imageGroups.position6 = [project.images[5]];
        if (project.images[6]) imageGroups.position7 = [project.images[6]];
        if (project.images[7]) imageGroups.position8 = [project.images[7]];
        if (project.images[8]) imageGroups.position9 = [project.images[8]];
        break;
        
      case '3x3L':
        // For 3x3L grid (landscape), distribute to positions 1-9
        if (project.images[0]) imageGroups.position1 = [project.images[0]];
        if (project.images[1]) imageGroups.position2 = [project.images[1]];
        if (project.images[2]) imageGroups.position3 = [project.images[2]];
        if (project.images[3]) imageGroups.position4 = [project.images[3]];
        if (project.images[4]) imageGroups.position5 = [project.images[4]];
        if (project.images[5]) imageGroups.position6 = [project.images[5]];
        if (project.images[6]) imageGroups.position7 = [project.images[6]];
        if (project.images[7]) imageGroups.position8 = [project.images[7]];
        if (project.images[8]) imageGroups.position9 = [project.images[8]];
        break;
        
      // Animation projects are handled directly in the ProjectDetail component
      // No need to convert them to imageGroups
        
      default:
        // Default fallback - just use position1 for first image
        if (project.images[0]) imageGroups.position1 = [project.images[0]];
        break;
    }
    
    convertedProject.imageGroups = imageGroups;
    return convertedProject;
  }
  
  // If no images at all, return with empty imageGroups
  return {
    ...project,
    imageGroups: {}
  };
};