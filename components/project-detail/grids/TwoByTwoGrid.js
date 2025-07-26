"use client";

import React from 'react';
import styled from 'styled-components';
import ProjectImage from '../ProjectImage';
import { aspectRatios } from '../../../lib/projectUtils';

const TwobyTwoGridContainer = styled.div`
  display: grid;
  width: 100%;
  margin-left: 0px;
  margin-right: 0px;
  gap: 20px;
  margin-bottom: 36px;

   @media (min-width: 1440px) {
   width: 70%;
     margin: 0 auto; /* Center the grid */
    grid-template-columns: repeat(2, 1fr);
    
    & > .description {
      grid-column: 1 / span 2;
      grid-row: 1;
    }
    
    & > .image1 {
      grid-column: 1;
      grid-row: 2;
    }
    
    & > .image2 {
      grid-column: 2;
      grid-row: 2;
    }
    
    & > .image3 {
      grid-column: 1;
      grid-row: 3;
    }
    
    & > .image4 {
      grid-column: 2;
      grid-row: 3;
    }
  }
  
  @media (max-width: 1439px) and (min-width: 1024px) {
    grid-template-columns: 1fr 1fr 1fr;

    
    & > .image1 {
      grid-column: 1;
      grid-row: 1;
    }
    
    & > .image2 {
      grid-column: 2;
      grid-row: 1;
    }
    
    & > .image3 {
      grid-column: 1;
      grid-row: 2;
    }
    
    & > .image4 {
      grid-column: 2;
      grid-row: 2;
    }
    
    & > .description {
      grid-column: 3;
      grid-row: 1 / span 3;
    }
  }
  
  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, 1fr);
          margin-bottom: 30px;
    
    & > .description {
      grid-column: 1 / span 2;
      grid-row: 1;
    }
    
    & > .image1 {
      grid-column: 1;
      grid-row: 2;
    }
    
    & > .image2 {
      grid-column: 2;
      grid-row: 2;
    }
    
    & > .image3 {
      grid-column: 1;
      grid-row: 3;
    }
    
    & > .image4 {
      grid-column: 2;
      grid-row: 3;
    }
  }
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  margin-bottom: 6px;
    
    & > .description {
      grid-column: 1;
      grid-row: 1;
    }
    
    & > .image1 {
      grid-column: 1;
      grid-row: 2;
    }
    
    & > .image2 {
      grid-column: 1;
      grid-row: 3;
    }
    
    & > .image3 {
      grid-column: 1;
      grid-row: 4;
    }
    
    & > .image4 {
      grid-column: 1;
      grid-row: 5;
    }
  }
`;

export default function TwoByTwoGrid({ 
  descriptionSection, 
  project, 
  placeholders, 
  isExiting 
}) {
  return (
    <TwobyTwoGridContainer>
      {descriptionSection}
      
      <ProjectImage
        images={project.imageGroups?.position1}
        aspectRatio={aspectRatios.TwobyTwo.image1}
        placeholders={placeholders.position1}
        title={project.title}
        index={0}
        isExiting={isExiting}
        className="image1"
      />
      
      <ProjectImage
        images={project.imageGroups?.position2}
        aspectRatio={aspectRatios.TwobyTwo.image2}
        placeholders={placeholders.position2}
        title={project.title}
        index={1}
        isExiting={isExiting}
        className="image2"
      />
      
      <ProjectImage
        images={project.imageGroups?.position3}
        aspectRatio={aspectRatios.TwobyTwo.image3}
        placeholders={placeholders.position3}
        title={project.title}
        index={2}
        isExiting={isExiting}
        className="image3"
      />
      
      <ProjectImage
        images={project.imageGroups?.position4}
        aspectRatio={aspectRatios.TwobyTwo.image4}
        placeholders={placeholders.position4}
        title={project.title}
        index={3}
        isExiting={isExiting}
        className="image4"
      />
    </TwobyTwoGridContainer>
  );
} 