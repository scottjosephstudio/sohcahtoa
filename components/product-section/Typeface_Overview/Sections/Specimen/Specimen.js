import styled from "styled-components";

const Section = styled.div`
  margin-top: 2rem;
`;



const FontInfo = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;

`;

const FontName = styled.div`
  font-size: 20px;
  letter-spacing: 0.8px;
  line-height: 24px;
  margin: 0 0 0.5rem 0;
  color: #000;
`;

const FontDetails = styled.p`
    font-size: 20px;
  letter-spacing: 0.8px;
  line-height: 24px;
  margin: 0;
  color: #666;
`;


export default function SpecimenSection({ selectedFont }) {
  const fontFamily = selectedFont?.name || 'inherit';
  const fontStyle = selectedFont?.font_styles?.[0]; // Get first style (usually Regular)
  
  return (
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
  );
}
