import styled from "styled-components";
import Link from "next/link";

export const HomeContainer = styled.div`
  padding: 88px 20px 20px 20px;
`;

export const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-auto-rows: max-content;
  gap: 20px;
  max-width: 100%;
  padding: 0px;
  transition: opacity 0.3s ease;
  -webkit-transition: opacity 0.3s ease;
  align-items: start;

  /* Responsive breakpoints for better image distribution */
  @media (min-width: 1400px) {
    grid-template-columns: repeat(5, 1fr);
  }

  @media (min-width: 1100px) and (max-width: 1399px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (min-width: 800px) and (max-width: 1099px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 500px) and (max-width: 799px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 499px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const ProjectTile = styled(Link)`
  display: flex;
  flex-direction: column;
  position: relative;
  text-decoration: none;
  transition: opacity 0.3s ease;
  -webkit-transition: opacity 0.3s ease;

  &:hover {
    .caption {
      opacity: 1;
    }
  }
`;

export const ProjectCaption = styled.div`
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  padding: 12px 0 0 0;
  margin: 0 0 12px 0;
  color: rgba(16, 12, 8);
  text-align: left;
  opacity: 0;
  transition: opacity 0.3s ease;
  -webkit-transition: opacity 0.3s ease; /* Safari-specific transition */
`;

export const LoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0 6px 0px;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: opacity 0.5s ease;
  -webkit-transition: opacity 0.3s ease;
  visibility: ${(props) => (props.$visible ? "visible" : "hidden")};

  @media (max-width: 375px) {
    justify-content: flex-start;
  }
`;

export const LoadMoreButton = styled.button`
  padding: 8.2px 18px;
  background-color: #39ff14;
  color: rgba(16, 12, 8);
  border: none;
  border-radius: 30px;
  font-size: 20px;
  letter-spacing: 0.8px;
  cursor: pointer;
  transition: all 0.3s ease;
  -webkit-transition: opacity 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding-top: 9.2px;
  padding-bottom: 7.2px;

  &:hover {
    transform: translateY(0px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  &:focus {
    outline: none;
  }
`;

// Animation variants with 30px entrance animation
export const containerVariants = {
  hidden: {
    opacity: 0,
    y: 0, // 30px down as requested
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: {
    opacity: 0,
    y: 0, // 30px down as requested
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};
