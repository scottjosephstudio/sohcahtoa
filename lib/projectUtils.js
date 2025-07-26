// Project types: 'printedMatter', 'imageProject', 'objectProject', 'typographyProject', 'animationProject'

// Project type mapping
const projectTypeMap = {
  // Printed Matter Projects
  'TheBeginningofForms': '2x2',
  'PublicLecturePosters': '2x2', 
  'CompanionPlanting': '2x2',
  'SkeletonArgument': '3x3+1', 
  'TheToneIsTheirs': '1x1',
  'MarkAndMeasure': '2x1',
  
  // Image Projects
  'Penumbra': '1L', 
  'LanguageWithoutPlace': '3x3P', 
  'ForAsFarAsICanSee': '2x1L',
  'AlphabeticalPareidolia': '2x1', 
  'MuteWrittenOrchestration': '2x1', 
  'Light': '2x1',
  
  // Object Projects
  'FoundWhenOut': '2x1L', 
  'CombinationPrints': '2x2', 
  'SpiritLevel': '1x1P', 
  'DisplayUnit': '1P',
  
  // Typography Projects
  'Titles': '1x1', 
  'LikeATongueThatTriedToSpeak': '2x2',
  'A-ZWritingDirections': '2x1', 
  'NotesOnAWhitePainting': '3x3L',
  
  // Animation Projects
  'Particle_Cloud': 'animationProject'
};

// Aspect ratio configurations for different project types
export const aspectRatios = {
  One: {
    image1: '300/417',

  },
  
  OneLandscape: {
    image1: '3/2',

  },
  OnebyOne: {
    image1: '300/417,',
    image2: '300/417,',
  },
  OnebyOnePortrait: {
    image1: '2/3',
    image2: '2/3',
  },
  TwobyOne: {
    image1: '3/2',
    image2: '5/7',
    image3: '5/7',
  },
  TwobyOneLandscape: {
    image1: '3/2',
    image2: '3/2',
    image3: '3/2',
  },
  TwobyTwo: {
    image1: '5/7',
    image2: '5/7',
    image3: '5/7',
    image4: '5/7',
  },
  ThreebyThree: {
    image1: '4/3',
    image2: '4/3',
    image3: '4/3',
    image4: '4/3',
    image5: '4/3',
    image6: '4/3',
    image7: '16/9',
  },

  ThreebyThreePortrait: {
    image1: '25/33',
    image2: '25/33',
    image3: '25/33',
    image4: '25/33',
    image5: '25/33',
    image6: '25/33',
  },
  
  ThreebyThreeLandscape: {
    image1: '200/141',
    image2: '200/141',
    image3: '200/141',
    image4: '200/141',
    image5: '200/141',
    image6: '200/141',
  },
};

/**
 * Extracts the source URL from an image (handles both string and object formats)
 * @param {string|Object} image - The image as string or object with src property
 * @returns {string} The image source URL
 */
export function getImageSrc(image) {
  // Handle both string and object formats
  return image && typeof image === 'object' && image.src ? image.src : image;
}

/**
 * Gets the caption for an image (handles both string and object formats)
 * @param {string|Object} image - The image as string or object with caption property
 * @param {string} defaultCaption - The default caption to use if none is found
 * @returns {string} The image caption
 */
export function getImageCaption(image, defaultCaption = "") {
  // Return caption from object if available, otherwise use default
  return image && typeof image === 'object' && image.caption ? image.caption : defaultCaption;
}

/**
 * Determines the project type based on project ID or falls back to category
 * @param {Object} project - The project object containing id and category
 * @returns {string} The determined project type
 */
export function getProjectType(project) {
  // Check if project is undefined or null
  if (!project || !project.id) {
    return '2x2'; // Default fallback
  }
  
  // First check the direct mapping
  if (projectTypeMap[project.id]) {
    return projectTypeMap[project.id];
  }
  
  // Then fall back to category-based selection
  if (project.category) {
    switch(project.category) {
      case 'Printed Matter':
        return '2x2';
      case 'Image':
        return 'imageProject';
      case 'Object':
        return 'objectProject';
      case 'Typography':
        return 'typographyProject'; 
      // For Animation projects, we return animationProject here only as an identifier
      // These projects are actually handled directly in the ProjectDetail component
      // and don't use the standard imageGroups conversion
      case 'Animation':
        return 'animationProject';
    }
  }
  
  return 'printedMatter'; // Default fallback
}

/**
 * Generates a caption text based on image type and index
 * @param {string} imageType - The type of image (featured, image1, etc.)
 * @param {number} index - The index of the image in the array
 * @param {Object} project - The project object containing images
 * @returns {string} Appropriate caption text
 */
export function getCaptionText(imageType, index, project) {
  // First, check if the image at this index has a caption property
  if (project && project.images && project.images[index]) {
    const caption = getImageCaption(project.images[index]);
    if (caption) return caption;
  }
  
  // Fallback to original logic for backward compatibility
  switch(imageType) {
    case 'featured':
      return 'Featured Image';
    case 'image1':
      return 'Main View';
    default:
      if (imageType.startsWith('image')) {
        const num = parseInt(imageType.replace('image', '')) - 1;
        return `Detail ${num}`;
      }
      return `Detail ${index}`;
  }
}

/**
 * Generate placeholder for lazy loading
 * @param {string|Object} image - The image (string URL or object with src)
 * @returns {string} A placeholder URL
 */
export function generatePlaceholder(image) {
  // Extract URL from image object if necessary
  const url = getImageSrc(image);
  
  // If no URL is provided, return a default placeholder
  if (!url) return '/placeholder-image.jpg';
  
  // If it's already a placeholder or data URL, return as-is
  if (url.startsWith('data:') || url.startsWith('/placeholder')) {
    return url;
  }
  
  // For external URLs, you might want to generate a low-res or blurred version
  // This is a simple placeholder approach - you may want to implement a more sophisticated method
  return url;
}

/**
 * Process project description for consistent rendering with enhanced typography
 * @param {any} longDescription - The description in various formats
 * @returns {Array} Standardized description array with typography formatting
 */
export function processLongDescription(longDescription) {
  // Handler for converting a single paragraph with typography enhancements
  const processParagraph = (paragraph) => {
    if (!paragraph) return { text: '', isProductionCredit: false };
    
    // Trim the paragraph
    let processedText = paragraph.trim();
    
    // PRECISE TARGETING for production and credit paragraphs
    // Only match exact patterns that we know should be indented
    const isProductionCredit = (
      // Production specifications with clear prefixes
      /^(Printing:|Edition:|Published by|Production:|Photography by:|Dimensions:)/i.test(processedText) ||
      
      // Physical items and format details
      /^(T-Shirt:|Size:|Format:)/i.test(processedText) ||
      
      // Credit and support acknowledgments
      /^(Made with support from|With thanks to:|Purchase from:)/i.test(processedText) ||
      
      // Venue and location statements (specific format only)
      /^(Williams Lounge, Wellcome Collection|Goldsmiths Allotment|PAKT Gallery|Pump House Gallery|Perdu Literary Foundation|Goethe Institute|San Serriffe|London Design Festival|Moravian Gallery|Brno Biennale)/i.test(processedText) ||
      
      // Publication references
      /^(Idea magazine|AIGA magazine)/i.test(processedText) ||
      
      // Specific exact venue mentions - standalone
      processedText === "Beyond The Visual Arts." ||
      
      // Distribution information
      /^(Purchase from: Lugemik, Tallinn, Estonia\.)/i.test(processedText) ||
      
      // Production statements with specific format
      /^('Display Unit' was originally constructed|Produced while in residence at:)/i.test(processedText) ||
      
      // Typesetting information in parentheses
      /^\(Typeset in/i.test(processedText) ||
      
      // Specific location references that include country codes at the end
      /^[^\.]+, (UK|US|NL|CZ|JP|NO|Estonia)\.$/i.test(processedText) && processedText.length < 60
    );
    
    // Apply typographic enhancements
    
    // Replace [icon] with proper × symbol
    processedText = processedText.replace(/\[icon\]/g, '×');
    
    // Apply small caps to abbreviated terms
    processedText = processedText.replace(/\b(CMYK|RGB|B&W|NO\.|UK|US|NL|CZ|JP)\b/g, 
      match => `<span class="small-caps">${match}</span>`);
    
    // Proper em dashes
    processedText = processedText.replace(/\s+-\s+/g, ' — ');
    
    // Add proper spacing after colons in production details
    processedText = processedText.replace(/(Printing|Edition|Production|Published by|Photography by|Dimensions|T-Shirt|Size|Format|Purchase from):/g, '$1: ');
    
    return {
      text: processedText,
      isProductionCredit
    };
  };

  // Handle the new complex object structure
  if (longDescription && longDescription.content) {
    return longDescription.content
      .filter(item => item.type === 'paragraph' || item.type === 'specs')
      .map(item => {
        const processed = processParagraph(item.text);
        return {
          text: processed.text,
          type: item.type,
          emphasis: item.emphasis,
          isProductionCredit: processed.isProductionCredit
        };
      });
  }
  
  // Handle array format
  if (Array.isArray(longDescription)) {
    return longDescription
      .map(para => processParagraph(para))
      .filter(para => para.text);
  }
  
  // Handle string format
  if (typeof longDescription === 'string') {
    return longDescription
      .split('\n\n')
      .map(para => processParagraph(para))
      .filter(para => para.text);
  }
  
  // Fallback for unexpected formats
  return [];
}