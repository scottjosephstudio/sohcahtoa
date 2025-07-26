import dynamic from 'next/dynamic';

// Dynamically import grid components for code splitting
const TwoByTwoGrid = dynamic(() => import('./TwoByTwoGrid'), { ssr: false });
const OneGrid = dynamic(() => import('./OneGrid'), { ssr: false });
const OneLandscapeGrid = dynamic(() => import('./OneLandscapeGrid'), { ssr: false });
const ThreeByThreeGrid = dynamic(() => import('./ThreeByThreeGrid'), { ssr: false });
const ThreeByThreePlusOneGrid = dynamic(() => import('./ThreeByThreePlusOneGrid'), { ssr: false });
const ThreeByThreeLandscapeGrid = dynamic(() => import('./ThreeByThreeLandscapeGrid'), { ssr: false });
const ThreeByThreePortraitGrid = dynamic(() => import('./ThreeByThreePortraitGrid'), { ssr: false });

// Additional grid types from projectUtils.js
const OneByOneGrid = dynamic(() => import('./OneByOneGrid'), { ssr: false });
const OneByOnePortraitGrid = dynamic(() => import('./OneByOnePortraitGrid'), { ssr: false });
const TwoByOneGrid = dynamic(() => import('./TwoByOneGrid'), { ssr: false });
const TwoByOneLandscapeGrid = dynamic(() => import('./TwoByOneLandscapeGrid'), { ssr: false });

export const getGridComponent = (projectType) => {
  switch(projectType) {
    case '2x2':
      return TwoByTwoGrid;
    case '1P':
      return OneGrid;
    case '1L':
      return OneLandscapeGrid;
    case '3x3':
      return ThreeByThreeGrid;
    case '3x3+1':
      return ThreeByThreePlusOneGrid;
    case '3x3L':
      return ThreeByThreeLandscapeGrid;
    case '3x3P':
      return ThreeByThreePortraitGrid;
    case '1x1':
      return OneByOneGrid;
    case '1x1P':
      return OneByOnePortraitGrid;
    case '2x1':
      return TwoByOneGrid;
    case '2x1L':
      return TwoByOneLandscapeGrid;
    default:
      return OneGrid;
  }
}; 