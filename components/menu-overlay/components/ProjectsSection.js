import {
  SectionContainer,
  SectionTitle,
  SectionGrid,
  MenuItem,
} from "../styles/MenuOverlayStyles";
import { fadeInUp } from "../styles/animationVariants";
import NavigationLink from "./NavigationLink";
import { getSafeUrl } from "../utils/urlUtils";

const ProjectsSection = ({ sections, handleLinkClick, onClose }) => {
  return (
    <>
      {sections.map((section, sectionIndex) => (
        <SectionContainer
          key={section.title}
          variants={fadeInUp}
          custom={sectionIndex + 1}
        >
          <SectionTitle>{section.title}</SectionTitle>
          <SectionGrid>
            {section.items.map((item) => {
              // Extract the project ID from the link path and make it URL-safe
              const baseProjectId = item.link.split("/").pop();
              const safeProjectId = getSafeUrl(baseProjectId);
              const projectPath = `/Projects/${safeProjectId}`;

              return (
                <MenuItem key={item.name} className={item.className}>
                  <NavigationLink
                    href={projectPath}
                    label={
                      item.name === "Like A Tongue That Tried To Speak"
                        ? "Like A Tongue That\nTried To Speak"
                        : item.name ===
                            "Speech Flies Away, Written Words Remain"
                          ? "Speech Flies Away,\nWritten Words Remain"
                          : item.name
                    }
                    onClick={handleLinkClick(onClose)}
                  />
                </MenuItem>
              );
            })}
          </SectionGrid>
          {sectionIndex < sections.length - 1}
        </SectionContainer>
      ))}
    </>
  );
};

export default ProjectsSection;
