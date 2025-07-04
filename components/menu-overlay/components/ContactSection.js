import { SectionContainer, SectionTitle, ContactInfo } from '../styles/MenuOverlayStyles';
import { fadeInUp } from '../styles/animationVariants';
import NewsletterSection from './NewsletterSection';

const ContactSection = ({ 
  contactData, 
  sectionsLength, 
  email,
  setEmail,
  isSubmitting,
  submitStatus,
  setSubmitStatus,
  errorMessage,
  setErrorMessage,
  isSupabaseConnected,
  handleNewsletterSubmit
}) => {
  return (
    <SectionContainer 
      variants={fadeInUp} 
      custom={sectionsLength + 3}
    >
      <SectionTitle>{contactData.studioName}</SectionTitle>
      <ContactInfo
        variants={fadeInUp}
        custom={1}
      >
        {contactData.address.street}<br />
        {contactData.address.studio}<br />
        {contactData.address.city}<br />
        {contactData.address.postcode}<br />
        <span style={{ display: 'block', marginTop: '12px' }}>{contactData.email}</span>
        {contactData.phone}
      </ContactInfo>
      
      <NewsletterSection
        email={email}
        setEmail={setEmail}
        isSubmitting={isSubmitting}
        submitStatus={submitStatus}
        setSubmitStatus={setSubmitStatus}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        isSupabaseConnected={isSupabaseConnected}
        handleNewsletterSubmit={handleNewsletterSubmit}
      />
    </SectionContainer>
  );
};

export default ContactSection; 