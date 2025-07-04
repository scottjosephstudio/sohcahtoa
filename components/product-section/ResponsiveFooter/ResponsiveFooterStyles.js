// ResponsiveFooterStyles.js
import styled from "styled-components"; // Add this import

export const FooterWrapper = styled.div`
  position: fixed;
  bottom: 0px;
  left: 0;
  right: 0;
  z-index: 45;
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`;

export const ControlsContainer = styled.div`
  position: fixed;
  bottom: 28px;
  left: 132px;
  right: ${(props) => (props.$isViewCart ? "154px" : "174px")};
  pointer-events: auto;
  transition: right 0.5s ease;

  @media (max-width: 768px) {
    left: 20px;
    right: 20px;
    width: calc(100% - 40px);
    bottom: 120px;
    display: ${(props) => (props.$isOpen ? "block" : "none")};
  }
`;

export const ToggleButton = styled.button`
  display: none;
  position: fixed;
  bottom: 27px;
  right: ${(props) => (props.$isViewCart ? "60px" : "60px")};
  transform: translateX(-50%);
  width: 47px;
  height: 47px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(6px);
  border: 2px solid rgb(16, 12, 8);
  border-radius: 10px;
  cursor: pointer;
  z-index: 30;
  padding: 12px 8px;
  box-shadow: 0 4px 8px rgb(16, 12, 8);

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
  }

  span {
    display: block;
    width: 100%;
    height: 2px;
    background: rgb(16, 12, 8);
    transition: all 0.3s ease;
    transform-origin: center;
  }
`;

export const SearchContainer = styled.div`
  position: fixed;
  bottom: 28px;
  left: 132px;
  right: ${(props) => (props.$isViewCart ? "154px" : "154px")};
  pointer-events: auto;
  z-index: 46;
  transition: right 0.2s ease;

  @media (max-width: 768px) {
    right: ${(props) => (props.$isViewCart ? "84px" : "84px")};
  }
`;

export const CartButtonWrapper = styled.div`
  position: fixed;
  right: 20px;
  bottom: 32px;
  white-space: nowrap;
  pointer-events: auto;
  display: flex;
  width: ${(props) => (props.$isViewCart ? "120px" : "108px")};
  transition: width 0.5s ease;
  justify-content: flex-end;
`;
