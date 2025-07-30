import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

const SearchWrapper = styled(motion.div)`
  width: 300px;
  margin: 0 auto;
  position: relative;

  @media (max-width: 768px) {
    width: 100%;
  }

  @media (max-width: 600px) {
    width: 100%;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  font-family: "Jant", sans-serif;
  width: 100%;
  padding: 10px 42px 8px 12px;
  border: 2px solid var(--border-color);
  box-shadow: 0 4px 8px var(--border-color);
  border-radius: 10px;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  transition: all 0.2s ease;
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  @media (max-width: 600px) {
    width: 100%;
  }

  &:focus {
    outline: none;
    border: 2px solid var(--border-color);
    box-shadow: 0 4px 8px var(--border-color);
  }

  &::placeholder {
    color: ${(props) => (props.error ? "red" : "var(--text-primary)")};
    text-overflow: ellipsis;
      font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  }
`;

const SearchIcon = styled.svg`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  color: var(--text-primary);
  pointer-events: none;
  background: none;
`;

export const SearchPanel = ({
  onSearch,
  placeholder = "Search for a character",
  isNavigatingHome = false,
  isGlyphsExiting = false,
}) => {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Handle animation visibility separately from navigation state
  useEffect(() => {
    if (!isNavigatingHome && !isGlyphsExiting) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isNavigatingHome, isGlyphsExiting]);

  const handleChange = (event) => {
    const newValue = event.target.value;

    // If user is typing a new character and there's already a character,
    // replace the existing character with the new one
    if (newValue.length > 1) {
      const newChar = newValue[newValue.length - 1]; // Get the last typed character
      setQuery(newChar);
      setError("");
      onSearch(newChar);
      return;
    }

    setQuery(newValue);
    setError("");
    onSearch(newValue);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      onSearch(query);
    }
  };

  const slideVariants = {
    initial: {
      y: 100,
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: {
      y: 100,
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <SearchWrapper
          key="search-input"
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          layout
        >
          <InputWrapper>
            <SearchInput
              type="text"
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={error || placeholder}
              spellCheck="false"
              autoComplete="off"
              $error={!!error}
            />
            <SearchIcon viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </SearchIcon>
          </InputWrapper>
        </SearchWrapper>
      )}
    </AnimatePresence>
  );
};

export default SearchPanel;
