// FlashStartSlotMachineStyles.js
import styled, { keyframes } from 'styled-components';

const gradient = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

export const SlotMachinePage = styled.div`
  margin: 0;
  padding: 0;
  z-index: 1;
  height: 100vh; /* Full viewport height */
  width: 100vw; /* Full viewport width */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: fixed; /* Fix the position to prevent scrolling */
  top: 0;
  left: 0;
`;

export const SlotMachineContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 20%) 0 0,
    radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 20%) 5px 5px,
    radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 20%) 10px 10px,
    radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 20%) 15px 15px,
    radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 20%) 20px 20px,
    radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 20%) 25px 25px,
    radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 20%) 30px 30px,
    radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 20%) 35px 35px,
    radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 20%) 40px 40px,
    radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 20%) 45px 45px,
    radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 20%) 50px 50px,
    radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 20%) 55px 55px,
    radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 20%) 60px 60px,
    radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 20%) 65px 65px,
    radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 20%) 70px 70px,
    radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 20%) 75px 75px,
    radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 20%) 80px 80px,
    radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 20%) 85px 85px,
    radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 20%) 90px 90px,
    radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 20%) 95px 95px;
   background-size: 8px 8px;
  background-color: #696969;
  overflow: hidden;
  isolation: isolate;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
`;

export const LetterContainer = styled.div`
  position: relative;
  width: 80vmin; /* Responsive size */
  height: 80vmin; /* Responsive size */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

export const Letter = styled.div`
  font-size: 48vmin; /* Responsive font size */
  font-weight: bold;
  color: white;
  position: relative;
  transition: opacity 200ms;
  filter: blur(20px);
  text-shadow: 10px 15px 15px rgba(255, 255, 255, 0.3);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const LetterOutline = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 48vmin; /* Responsive font size */
  font-weight: bold;
  transition: opacity 200ms;
  z-index: 1;
  -webkit-text-stroke: 10px transparent;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  background-image: linear-gradient(45deg, black, grey, black, grey);
  background-size: 400% 400%;
  animation: ${gradient} 12s ease infinite;
`;

export const LetterShadow = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  padding-left: 3px;
  padding-top: 3px;
  filter: blur(20px);
  opacity: 0.9;
  font-size: 48vmin;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const SlotMachineCursor = styled.div`
  cursor: url('../../../assets/animations/ScrollUpDown.svg'), auto; /* Replace with the path to your custom cursor image */
`;