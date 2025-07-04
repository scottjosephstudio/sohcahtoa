import React from "react";
import { CookiesContainer, CookiesTitle, CookiesText } from "../styles";

export default function CookiesBanner({ isExiting, children }) {
  return (
    <CookiesContainer $isExiting={isExiting}>
      <CookiesTitle>Cookie Notice</CookiesTitle>
      <CookiesText>
        This website uses cookies to enhance your browsing experience and
        analyze site traffic. By clicking "Accept", you consent to our use of
        cookies.
      </CookiesText>
      {children}
    </CookiesContainer>
  );
}
