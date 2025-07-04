import React from 'react';
import { DebugButton as StyledDebugButton } from '../styles';

export default function DebugButton({ onClick }) {
  return (
    <StyledDebugButton onClick={onClick}>
      Reset Cookies
    </StyledDebugButton>
  );
} 