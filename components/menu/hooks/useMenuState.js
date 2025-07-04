"use client";

import { useState } from "react";

export const usePortal = () => ({
  isModalOpen: false,
  isTypefacesPath: false,
});

export const useMenuOverlay = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  return { openDropdown, setOpenDropdown };
};
