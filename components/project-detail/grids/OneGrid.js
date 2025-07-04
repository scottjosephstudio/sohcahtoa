"use client";

import React from "react";
import styled from "styled-components";
import ProjectImage from "../ProjectImage";
import { aspectRatios } from "../../../lib/projectUtils";

const OneGridContainer = styled.div`
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
      grid-row: 1 / span 1;
    }

    & > .image1 {
      grid-column: 1 / span 2;
      grid-row: 2 / span 2;
    }
  }

  @media (max-width: 1439px) and (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);

    & > .image1 {
      grid-column: 1 / span 2;
      grid-row: 1 / span 2;
    }

    & > .description {
      grid-column: 3;
      grid-row: 1 / span 2;
    }
  }

  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, 1fr);
    margin-bottom: 30px;

    & > .description {
      grid-column: 1 / span 2;
      grid-row: 1 / span 1;
    }

    & > .image1 {
      grid-column: 1 / span 2;
      grid-row: 2 / span 2;
    }
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    margin-bottom: 6px;

    & > .description {
      grid-column: 1 / span 2;
      grid-row: 1 / span 1;
    }

    & > .image1 {
      grid-column: 1 / span 2;
      grid-row: 2 / span 2;
    }
  }
`;

export default function OneGrid({
  descriptionSection,
  project,
  placeholders,
  isExiting,
}) {
  return (
    <OneGridContainer>
      {descriptionSection}

      <ProjectImage
        images={project.imageGroups?.position1}
        aspectRatio={aspectRatios.One.image1}
        placeholders={placeholders.position1}
        title={project.title}
        index={0}
        isExiting={isExiting}
        className="image1"
      />
    </OneGridContainer>
  );
}
