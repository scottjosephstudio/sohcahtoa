"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import TransitionWrapper from "../../../components/providers/TransitionWrapper";
import HomeIcon from "../../../components/home-icon";
import NavigationArrows from "../../../components/navigation-arrows";
import {
  getProjectType,
  generatePlaceholder,
  processLongDescription,
} from "../../../lib/projectUtils";
import { ensureImageGroups } from "../../../lib/compatibilityUtils";
import { isSafari } from "../../../lib/browserUtils";

// Import refactored components
import ProjectDescription from "../../../components/project-detail/ProjectDescription";
import { getGridComponent } from "../../../components/project-detail/grids";
import {
  getAnimationVariants,
  getDescriptionDelay,
} from "../../../components/project-detail/animations/animationVariants";

// Dynamically import animation components
const ParticleAnimation = dynamic(
  () =>
    import("../../../components/animation/ParticleCloud/Particle_Cloud")
      .then((mod) => mod.default)
      .catch(() => () => <div>Error loading animation</div>),
  { ssr: false },
);

const ParticleInfo = dynamic(
  () =>
    import("../../../components/animation/ParticleCloud/Particle_Info")
      .then((mod) => mod.default)
      .catch(() => () => null),
  { ssr: false },
);

// Animation container
const AnimationContainer = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 5;
`;

const ProjectContainer = styled.div`
  padding: 88px 20px;
  width: 100%;
  box-sizing: border-box;
`;

const ProjectContent = styled.div`
  max-width: 100%;
  margin: 0 auto;
`;

export default function ProjectDetail({
  project,
  prevProjectId,
  nextProjectId,
}) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [projectId, setProjectId] = useState(project?.id || "");
  const [isMounted, setIsMounted] = useState(false);
  const [animationMounted, setAnimationMounted] = useState(false);
  const [isSafariBrowser, setIsSafariBrowser] = useState(false);

  // Ensure project data is in the new format with imageGroups
  const compatibleProject = useMemo(
    () => ensureImageGroups(project),
    [project],
  );

  // Determine the project type using the utility function
  const projectType = getProjectType(compatibleProject);

  // Check if this is the Particle Cloud project
  const isParticleCloud = compatibleProject?.id === "Particle_Cloud";

  useEffect(() => {
    // When the component mounts, trigger the entrance animation
    setIsVisible(true);
    setIsMounted(true);

    // Detect Safari browser
    if (typeof window !== "undefined") {
      const safariCheck = isSafari();
      setIsSafariBrowser(safariCheck);

      // Add or remove HTML class for CSS selector
      if (safariCheck) {
        document.documentElement.classList.add("safari");
      } else {
        document.documentElement.classList.remove("safari");
      }
    }

    if (isParticleCloud) {
      setAnimationMounted(true);
    }

    // Track project changes for transition effects
    if (projectId !== compatibleProject.id) {
      // Start exit animation
      setIsExiting(true);

      // After exit animation, update project ID and start entrance animation
      const timer = setTimeout(() => {
        setProjectId(compatibleProject.id);
        setIsExiting(false);
        setIsVisible(true);
      }, 0); // Match the exit animation duration

      return () => clearTimeout(timer);
    }

    // Clear exit state on unmount
    return () => {
      setIsExiting(false);
      setIsMounted(false);
    };
  }, [compatibleProject.id, projectId, isParticleCloud]);

  // Generate placeholders for image groups
  const placeholders = useMemo(() => {
    const placeholderMap = {};

    if (compatibleProject.imageGroups) {
      Object.entries(compatibleProject.imageGroups).forEach(
        ([position, images]) => {
          placeholderMap[position] = images.map((img) =>
            generatePlaceholder(img),
          );
        },
      );
    }

    return placeholderMap;
  }, [compatibleProject.imageGroups]);

  // Process the longDescription for consistent rendering using the utility function
  const processedLongDescription = useMemo(() => {
    return processLongDescription(compatibleProject.longDescription);
  }, [compatibleProject.longDescription]);

  // For animation projects, directly render the animation
  if (isParticleCloud) {
    return (
      <>
        <TransitionWrapper>
          <AnimationContainer>
            <ParticleAnimation />
            {animationMounted && <ParticleInfo />}
          </AnimationContainer>
        </TransitionWrapper>

        {/* Navigation components outside TransitionWrapper to avoid transform inheritance */}
        <HomeIcon />
        <NavigationArrows
          prevProjectId={prevProjectId}
          nextProjectId={nextProjectId}
        />
      </>
    );
  }

  // Get animation variants
  const { containerVariants, itemVariants } =
    getAnimationVariants(getDescriptionDelay);

  // Determine which grid layout to render
  const renderGrid = () => {
    const GridComponent = getGridComponent(projectType);

    const descriptionSection = (
      <ProjectDescription
        project={compatibleProject}
        processedLongDescription={processedLongDescription}
        isVisible={isVisible}
        isExiting={isExiting}
        isSafari={isSafariBrowser}
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />
    );

    return (
      <GridComponent
        descriptionSection={descriptionSection}
        project={compatibleProject}
        placeholders={placeholders}
        isExiting={isExiting}
      />
    );
  };

  return (
    <>
      <TransitionWrapper>
        <ProjectContainer>
          <ProjectContent>{renderGrid()}</ProjectContent>
        </ProjectContainer>
      </TransitionWrapper>

      {/* Navigation components outside TransitionWrapper to avoid transform inheritance */}
      <HomeIcon />
      <NavigationArrows
        prevProjectId={prevProjectId}
        nextProjectId={nextProjectId}
      />
    </>
  );
}
