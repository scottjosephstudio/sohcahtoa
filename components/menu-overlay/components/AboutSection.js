import {
  SectionContainer,
  SectionTitle,
  AboutContent,
  Divider,
} from "../styles/MenuOverlayStyles";
import { fadeInUp } from "../styles/animationVariants";

const AboutSection = ({ aboutData, sectionsLength }) => {
  return (
    <SectionContainer variants={fadeInUp} custom={sectionsLength + 1}>
      <Divider
        style={{ width: "100%", marginTop: "-12px", marginBottom: "30px" }}
        variants={fadeInUp}
        custom={0}
      />
      <SectionTitle>{aboutData.title}</SectionTitle>
      <AboutContent variants={fadeInUp} custom={1}>
        {aboutData.content.split("\n\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </AboutContent>
      <Divider variants={fadeInUp} custom={2} />
    </SectionContainer>
  );
};

export default AboutSection;
