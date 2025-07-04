import { Fragment } from "react";
import {
  Footer,
  FooterLink,
  VerticalDivider,
} from "../styles/MenuOverlayStyles";
import { fadeInUp } from "../styles/animationVariants";
import NavigationLink from "./NavigationLink";
import { getSafeUrl } from "../utils/urlUtils";

const FooterSection = ({ links, sectionsLength, handleLinkClick, onClose }) => {
  return (
    <Footer variants={fadeInUp} custom={sectionsLength + 4}>
      {links.map((link, index) => {
        // If the link is a relative path, ensure it's handled the same way
        const href = link.link.startsWith("/")
          ? link.link
          : `/${getSafeUrl(link.link)}`;

        return (
          <Fragment key={link.name}>
            <FooterLink>
              <NavigationLink
                href={href}
                label={link.name}
                onClick={handleLinkClick(onClose)}
              />
            </FooterLink>
            {/* Add divider after each link except the last one */}
            {index < links.length - 1 && <VerticalDivider />}
          </Fragment>
        );
      })}
    </Footer>
  );
};

export default FooterSection;
