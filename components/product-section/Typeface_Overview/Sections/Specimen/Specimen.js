import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

const Section = styled.div`
  margin-top: 2rem;
`;

// Fade variants for consistent animations
const fadeVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};


const FontInfo = styled.div`
  margin-bottom: 12px;
  padding: 15px;

`;

const FontName = styled.div`
  font-size: 16px;
  letter-spacing: 0.8px;
  line-height: 20px;
  color: rgb(16, 12, 8);
`;

const FontDetails = styled.p`
    font-size: 16px;
  letter-spacing: 0.8px;
  line-height: 20px;
  margin: 0;
  color: rgb(16, 12, 8);
`;


export default function SpecimenSection({ selectedFont, isSpecimenExiting, isNavigatingHome }) {
  const fontFamily = selectedFont?.name || 'inherit';
  const fontStyle = selectedFont?.font_styles?.[0]; // Get first style (usually Regular)
  
  return (
    <AnimatePresence mode="wait">
      {!isNavigatingHome && !isSpecimenExiting && (
        <motion.div
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Section>
            {selectedFont && (
              <FontInfo>
                <FontName>{selectedFont.name}</FontName>
                <FontDetails>
                  {selectedFont.designer && `Designer: ${selectedFont.designer}`}
                  {selectedFont.foundry && ` • Foundry: ${selectedFont.foundry}`}
                  {fontStyle && ` • Style: ${fontStyle.name}`}
                </FontDetails>
              </FontInfo>
            )}
          </Section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
