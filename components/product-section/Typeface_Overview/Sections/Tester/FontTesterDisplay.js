import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container, TextContainer, EditableText } from "./StyledComponents";

export const FontTesterDisplay = ({
  textRef,
  isTyping,
  setIsTyping,
  setText,
  text,
  settings,
  isNavigatingHome,
  font_weight,
  selectedFont,
  testText,
  currentLetterSpacing,
  currentLineHeight,
  currentFontSize,
  isReady,
}) => {
  const handleInput = (e) => {
    const content = e.currentTarget.textContent || "";

    // Save cursor position
    const selection = window.getSelection();
    const cursorPos = selection.anchorOffset;

    setText(content);

    // Restore cursor position after React re-renders (only if element is focused)
    requestAnimationFrame(() => {
      if (textRef.current && document.activeElement === textRef.current) {
        if (content.trim() === "") {
          // Empty text - cursor should already be showing since element is focused
        } else {
          // Has text - restore cursor position
          const textNode = textRef.current.firstChild;
          if (textNode && textNode.nodeType === Node.TEXT_NODE) {
            const range = document.createRange();
            const sel = window.getSelection();
            const pos = Math.min(cursorPos, textNode.textContent.length);
            range.setStart(textNode, pos);
            range.setEnd(textNode, pos);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      }
    });
  };

  // Ensure empty field stays focused with blinking cursor
  useEffect(() => {
    if (
      !isTyping &&
      text.trim() === "" &&
      textRef.current &&
      document.activeElement === textRef.current
    ) {
      // Position cursor at the beginning of empty field (only if already focused)
      const range = document.createRange();
      const selection = window.getSelection();
      range.setStart(textRef.current, 0);
      range.setEnd(textRef.current, 0);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [text, isTyping]);

  // Get font family from selected font
  const fontFamily = selectedFont?.name ? `"${selectedFont.name}", sans-serif` : '"Jant", sans-serif';

  return (
    <AnimatePresence mode="wait">
      {!isNavigatingHome && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: [0.25, 0.1, 0.25, 1],
            },
          }}
        >
          <Container>
            <TextContainer>
              <EditableText
                ref={textRef}
                contentEditable="true"
                spellCheck="false"
                onFocus={() => setIsTyping(false)}
                onInput={handleInput}
                onBlur={handleInput}
                $isTyping={isTyping}
                fontFamily={fontFamily}
                style={{
                  fontSize: `${settings?.fontSize}px`,
                  lineHeight: settings?.lineHeight,
                  letterSpacing: `${settings?.letterSpacing}px`,
                  opacity: isReady ? 1 : 0,
                }}
                suppressContentEditableWarning={true}
              >
                {text || "\u00A0"}
              </EditableText>
            </TextContainer>
          </Container>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FontTesterDisplay;
