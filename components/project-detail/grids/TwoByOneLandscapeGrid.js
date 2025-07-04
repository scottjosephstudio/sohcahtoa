"use client";

import React from "react";
import styled from "styled-components";
import ProjectImage from "../ProjectImage";
import { aspectRatios } from "../../../lib/projectUtils";

const TwoByOneLandscapeGridContainer = styled.div`
  display: grid;
  width: 100%;
  margin-left: 0px;
  margin-right: 0px;
  gap: 20px;
  margin-bottom: 36px;

  @media (min-width: 1440px) {
    width: 70%;
    margin: 0 auto;
    grid-template-columns: repeat(2, 1fr);

    & > .description {
      grid-column: 1 / span 2;
      grid-row: 1;
    }

    & > .image1 {
      grid-column: 1 / span 2;
      grid-row: 2;
    }

    & > .image2 {
      grid-column: 1;
      grid-row: 3;
    }

    & > .image3 {
      grid-column: 2;
      grid-row: 3;
    }
  }

  @media (max-width: 1439px) and (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);

    & > .image1 {
      grid-column: 1 / span 2;
      grid-row: 1;
    }

    & > .image2 {
      grid-column: 1;
      grid-row: 2;
    }

    & > .image3 {
      grid-column: 2;
      grid-row: 2;
    }

    & > .description {
      grid-column: 3;
      grid-row: 1 / span 2;
    }
  }

  @media (max-width: 1023px) and (min-width: 601px) {
    grid-template-columns: repeat(2, 1fr);
    margin-bottom: 30px;

    & > .description {
      grid-column: 1 / span 2;
      grid-row: 1;
    }

    & > .image1 {
      grid-column: 1 / span 2;
      grid-row: 2;
    }

    & > .image2 {
      grid-column: 1;
      grid-row: 3;
    }

    & > .image3 {
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
  }
`;

export default function TwoByOneLandscapeGrid({
  descriptionSection,
  project,
  placeholders,
  isExiting,
}) {
  return (
    <TwoByOneLandscapeGridContainer>
      {descriptionSection}

      <ProjectImage
        images={project.imageGroups?.position1}
        aspectRatio={aspectRatios.TwobyOneLandscape.image1}
        placeholders={placeholders.position1}
        title={project.title}
        index={0}
        isExiting={isExiting}
        className="image1"
      />

      <ProjectImage
        images={project.imageGroups?.position2}
        aspectRatio={aspectRatios.TwobyOneLandscape.image2}
        placeholders={placeholders.position2}
        title={project.title}
        index={1}
        isExiting={isExiting}
        className="image2"
      />

      <ProjectImage
        images={project.imageGroups?.position3}
        aspectRatio={aspectRatios.TwobyOneLandscape.image3}
        placeholders={placeholders.position3}
        title={project.title}
        index={2}
        isExiting={isExiting}
        className="image3"
      />
    </TwoByOneLandscapeGridContainer>
  );
}
