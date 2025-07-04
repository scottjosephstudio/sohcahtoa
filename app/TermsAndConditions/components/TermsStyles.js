import styled from "styled-components";
import { motion } from "framer-motion";

// Styled components based on the grid you provided
export const Container = styled.div`
  max-width: 100%;
  transition: all 0.3s ease-in-out;
  -webkit-transition: all 0.3s ease-in-out;
  -webkit-transition: all 0.3s ease-in-out;

  @media (min-width: 1581px) {
    display: flex;
    justify-content: center;
  }

  @media (min-width: 1025px) and (max-width: 1580px) {
    display: flex;
    justify-content: center;
  }
`;

export const GridTCs = styled.div`
  display: grid;
  gap: 30px;
  margin: 86px 20px 120px 20px;
  transition: all 0.3s ease-in-out;
  -webkit-transition: all 0.3s ease-in-out;

  @media (min-width: 1421px) {
    margin: 86px 20px 120px 20px;
  }

  @media (min-width: 1581px) {
    width: 70%;
    grid-template-areas: "description";
    grid-template-columns: 1fr;

    .project-description {
      grid-area: description;
    }

    .project-description .content {
      column-count: 3;
      column-gap: 24px;
    }

    .project-description .background-wrapper {
      column-count: 1;
      column-gap: 24px;
    }

    .project-description .title {
      column-count: 1;
    }
  }

  @media (min-width: 1025px) and (max-width: 1580px) {
    width: 70%;
    grid-template-areas: "description";
    grid-template-columns: 1fr;

    .project-description {
      grid-area: description;
    }

    .project-description .content {
      column-count: 2;
      column-gap: 24px;
    }

    .project-description .background-wrapper {
      column-count: 1;
      column-gap: 24px;
    }

    .project-description .title {
      column-count: 1;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    grid-template-areas: "description";
    grid-template-columns: 1fr;

    .project-description {
      grid-area: description;
    }

    .project-description .content {
      column-count: 2;
      column-gap: 24px;
    }

    .project-description .background-wrapper {
      column-count: 1;
      column-gap: 24px;
    }

    .project-description .title {
      column-count: 1;
    }
  }

  @media (min-width: 601px) and (max-width: 768px) {
    grid-template-areas: "description";
    grid-template-columns: 1fr;

    .project-description {
      grid-area: description;
    }

    .project-description .content {
      column-count: 1;
      column-gap: 24px;
    }

    .project-description .background-wrapper {
      column-count: 1;
      column-gap: 24px;
    }

    .project-description .title {
      column-count: 1;
    }
  }

  @media (max-width: 600px) {
    grid-template-areas: "description";
    grid-template-columns: 1fr;

    .project-description {
      grid-area: description;
    }

    .project-description .background-wrapper,
    .project-description .content {
      column-count: 1;
      column-gap: 24px;
    }

    .project-description .title {
      column-count: 1;
    }
  }
`;

export const DescriptionItem = styled(motion.div)`
  will-change: opacity, transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-perspective: 1000;
  perspective: 1000;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);

  /* Preserve title margin when wrapping titles */
  & .title {
    margin-bottom: 12px;
  }

  /* Extra margin before "How information is protected" */
  &.before-protection {
    @media (min-width: 769px) and (max-width: 1580px) {
      margin-top: 12px;
    }
  }

  /* Extra margin before "Third-party Websites" */
  &.before-third-party {
    @media (min-width: 1581px) {
      margin-top: 12px;
    }
  }

  /* Extra margin before "How collected information is used" */
  &.before-collected-info {
    @media (min-width: 1581px) {
      margin-top: 12px;
    }
  }

  /* Extra margin before "How information is shared" */
  &.before-shared-info {
    margin-top: 12px;
  }

  /* Extra margin before "How information is shared" (non-Safari only) */
  &.before-shared-info-nonsafari {
    margin-top: 12px;
  }
`;

export const TechnologiesContainer = styled(motion.div)`
  will-change: opacity, transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-perspective: 1000;
  perspective: 1000;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
`;

export const ProjectDescription = styled(motion.div)`
  width: 100%;
  color: rgb(16, 12, 8);
  margin-top: 3px;
  position: relative;
  text-align: left;
  will-change: transform, opacity;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-perspective: 1000;
  perspective: 1000;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);

  .background-wrapper {
    background-color: #e0e0e0;
    border-radius: 10px;
    padding: 24px;
    position: relative;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      background-size: 200px 200px;
      background-repeat: repeat;
      opacity: 0.5;
      mix-blend-mode: multiply;
      z-index: 0;
      pointer-events: none;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
      border-radius: 10px;
    }
  }

  /* Regular content styles for CSS columns (non-Safari) */
  .content {
    position: relative;
    z-index: 1;
  }

  /* Title styles */
  .content .title {
    text-decoration: underline !important;
    text-decoration-color: #39ff14 !important;
    text-decoration-thickness: 2px !important;
    text-underline-offset: 3px;
    font-size: 20px;
    letter-spacing: 0.8px;
    line-height: 24px;
    margin-bottom: 12px;
    margin-top: 0;
    position: relative;
    z-index: 1;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }

  /* Paragraph styles for content */
  .content p {
    position: relative;
    z-index: 1;
    font-size: 20px;
    letter-spacing: 0.8px;
    line-height: 24px;
    color: rgb(16, 12, 8) !important;
    margin-bottom: 12px;
    margin-top: 0;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }

  /* Style for email links within paragraphs - matching title formatting */
  .content p a {
    color: rgb(16, 12, 8) !important;
    text-decoration: underline !important;
    text-decoration-color: #39ff14 !important;
    text-decoration-thickness: 2px !important;
    text-underline-offset: 3px !important;
    font-size: 20px;
    letter-spacing: 0.8px;
    line-height: 24px;
    transition: all 0.2s ease;
    -webkit-transition: all 0.2s ease;
  }

  .content p a:hover {
    color: #39ff14 !important;
    text-decoration-color: rgb(16, 12, 8) !important;
  }

  .technologies {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 20px;
    position: relative;
    z-index: 1;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }

  .technology-tag {
    background: #f3f4f6;
    padding: 6px 12px;
    border-radius: 30px;
    font-size: 12px;
    letter-spacing: 0.8px;
    color: rgb(16, 12, 8);
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }

  /* Safari columns with responsive breakpoints matching CSS columns */
  .safari-columns {
    display: flex;
    gap: 24px;
    position: relative;
    z-index: 1;

    /* Single column on mobile */
    @media (max-width: 600px) {
      flex-direction: column;
      gap: 0;
    }

    @media (min-width: 601px) and (max-width: 768px) {
      flex-direction: column;
      gap: 0;
    }

    /* 2 columns for tablet */
    @media (min-width: 769px) and (max-width: 1024px) {
      flex-direction: row;
    }

    @media (min-width: 1025px) and (max-width: 1580px) {
      flex-direction: row;
    }

    /* 3 columns for large desktop */
    @media (min-width: 1581px) {
      flex-direction: row;
    }
  }

  .safari-column {
    flex: 1;
    position: relative;
    z-index: 1;

    /* Hide extra columns when not needed */
    @media (max-width: 768px) {
      &:nth-child(n + 2) {
        display: none;
      }
    }

    @media (min-width: 769px) and (max-width: 1580px) {
      &:nth-child(n + 3) {
        display: none;
      }
    }
  }

  /* Safari balanced columns (legacy) */
  .safari-balanced-columns {
    display: flex;
    gap: 24px;
    position: relative;
    z-index: 1;
  }

  .safari-column .title {
    text-decoration: underline !important;
    text-decoration-color: #39ff14 !important;
    text-decoration-thickness: 2px !important;
    text-underline-offset: 3px;
    font-size: 20px;
    letter-spacing: 0.8px;
    line-height: 24px;
    margin-bottom: 12px;
    margin-top: 0;
    position: relative;
    z-index: 1;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }

  .safari-column p {
    position: relative;
    z-index: 1;
    font-size: 20px;
    letter-spacing: 0.8px;
    line-height: 24px;
    color: rgb(16, 12, 8) !important;
    margin-bottom: 12px;
    margin-top: 0;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }

  .safari-column p a {
    color: rgb(16, 12, 8) !important;
    text-decoration: underline !important;
    text-decoration-color: #39ff14 !important;
    text-decoration-thickness: 2px !important;
    text-underline-offset: 3px !important;
    font-size: 20px;
    letter-spacing: 0.8px;
    line-height: 24px;
    transition: all 0.2s ease;
    -webkit-transition: all 0.2s ease;
  }

  .safari-column p a:hover {
    color: #39ff14 !important;
    text-decoration-color: rgb(16, 12, 8) !important;
  }

  /* Safari-specific fixes for column layout */
  html.safari & .content p,
  html.safari & .content .title,
  html.safari & .content .technologies {
    -webkit-column-break-inside: avoid;
    page-break-inside: avoid;
    break-inside: avoid;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
`;
