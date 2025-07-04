import styled from 'styled-components'
import { motion } from 'framer-motion'

export const TypefaceOverviewContainer = styled(motion.div)`
  width: 100%;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 0;
  background-color: #f9f9f9;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.2;
    mix-blend-mode: multiply;
    z-index: -1;
    pointer-events: none;
    -webkit-transition: opacity 0.05s, -webkit-transform 0.05s;
    transition: opacity 0.05s, transform 0.05s;
  }
`;

export const TypefaceTabWrapper = styled.div`
  position: fixed;
`;

export const TypefaceTabContainer = styled.div`
  background: rgba(145, 145, 145, 0.4);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: 9999px;
  display: inline-flex;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.25);
  font-size: 20px;
  margin: 0;
  z-index: 3;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-end;
    background: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    box-shadow: none;
    overflow: visible;
  }
`;

export const TypefaceTab = styled(motion.button)`
  padding: 7px;
  border: none;
  background: none;
  cursor: pointer;
  position: relative;
  z-index: 4;
  color: ${props => props.$isActive ? '#000' : '#333'};
  text-align: center;
  white-space: nowrap;
  min-width: max-content;
  padding-left: 16px;
  padding-right: 16px;
  font-family: inherit;
  line-height: normal;
  letter-spacing: normal;

  span {
    display: inline-block;
    transform: translateY(1px);
    font-size: 20px;
    line-height: normal;
    letter-spacing: normal;

    @media (max-width: 600px) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
      line-height: 20px;
    }
  }

  @media (max-width: 600px) {
    background: ${props => props.$isActive ? '#fff' : 'rgba(145, 145, 145, 0.4)'};
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    border-radius: 9999px;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.25);
  }
`;

// Motion variants for TypefaceTab
export const typefaceTabVariants = {
  hover: (props) => ({
    color: props.$isActive ? '#000' : '#fff',
    transition: { duration: 0.2 }
  })
};

export const TypefaceSlider = styled(motion.div)`
  position: absolute;
  height: 100%;
  top: 0;
  background-color: #fff;
  border-radius: 9999px;
  z-index: 3;

  @media (max-width: 600px) {
    display: none;
  }
`;

export const TypefaceContentContainer = styled.div`
  margin-top: 2rem;
  position: relative;
  z-index: 1;
  padding-left: 30px;
  padding-right: 30px;
  height: 100vh;
  overflow-y: hidden;
  padding-bottom: 0px;
  isolation: isolate;
`;