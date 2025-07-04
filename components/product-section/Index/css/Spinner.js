import styled, { keyframes } from "styled-components";

// Keyframes for Spin Animation
const spin = keyframes`
  0% {
    transform: rotateY(0deg) scale(1);
  }
  25% {
    transform: rotateY(90deg) scale(1);
  }
  50% {
    transform: rotateY(180deg) scale(1); /* Change to blue */
  }
  75% {
    transform: rotateY(270deg) scale(1);
  }
  100% {
    transform: rotateY(360deg) scale(1);
  }
`;

// Shape Container Type
export const ShapeContainerType = styled.div`
  position: absolute;
  top: 20px; /* Adjust as needed */
  right: 30px; /* Adjust as needed */
  z-index: 10;
  cursor: pointer;
  transform: scale(1); /* Default scale */

  /* Scale to 0.6 at 600px */
  @media (max-width: 600px) {
    transform: scale(0.6);
  }

  /* Intermediate scale at 1024px */
  @media (min-width: 601px) and (max-width: 1024px) {
    transform: scale(0.8); /* Adjust this value as needed */
  }

  /* Intermediate scale at 1440px */
  @media (min-width: 1025px) and (max-width: 1440px) {
    transform: scale(0.9); /* Adjust this value as needed */
  }

  /* Scale to set scale at 1421px and above */
  @media (min-width: 1421px) {
    transform: scale(1);
  }
`;

// Coin
export const Coin = styled.div`
  width: 120px; /* Adjust the width as needed */
  height: 120px; /* Adjust the height as needed */
  animation: ${spin} 1s linear infinite;
  border-radius: 50%; /* Make it a circle */
  cursor: pointer;
`;
