import styled from "styled-components";

// Banner Container
export const BannerContainer = styled.div`
  position: fixed;
  width: 100%;
  bottom: env(safe-area-inset-bottom, 0); /* Adjust for safe area insets */
  left: 0;
  right: 0;
  height: 45px;
  background-color: rgb(16, 12, 8);
  overflow: hidden;
  z-index: 10;
  cursor: default;

  @media (max-width: 768px) {
    bottom: env(safe-area-inset-bottom, 0); /* Adjust for safe area insets */
  }
`;

// Banner Content
export const BannerContent = styled.div`
  display: flex;
  white-space: nowrap;
  height: 100%;
  align-items: center; /* Vertically align items in the center */
  justify-content: center; /* Optionally, center items horizontally */
`;

// Banner Text
export const BannerText = styled.span`
  display: inline-block;
  color: rgb(44, 255, 5);
  font-size: 18px;
  letter-spacing: 0.8px;
  font-weight: bold;
  padding-left: 12px;
  padding-right: 12px;

  /* Specific Styles for Arc Browser */
  &.arc-browser {
    margin-top: 6px; /* Example: Change background color */
  }

  @media (max-width: 768px) {
    font-size: 16px; /* Adjust font size for smaller screens */
  }
`;
