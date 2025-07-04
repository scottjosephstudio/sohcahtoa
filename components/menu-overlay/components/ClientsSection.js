import { SectionContainer, SectionTitle, ClientsGrid, ClientItem, ClientLocation, Divider } from '../styles/MenuOverlayStyles';
import { fadeInUp } from '../styles/animationVariants';

const ClientsSection = ({ selectedClients, sectionsLength }) => {
  return (
    <SectionContainer 
      variants={fadeInUp} 
      custom={sectionsLength + 2}
    >
      <SectionTitle>Selected Clients</SectionTitle>
      <ClientsGrid
        variants={fadeInUp}
        custom={1}
      >
        {selectedClients.map((client) => (
           <ClientItem key={client.name}>—&ensp;
            {client.name}
            <br />
            <ClientLocation>{client.location}</ClientLocation> 
          </ClientItem>
        ))}
      </ClientsGrid>
      <Divider 
        variants={fadeInUp}
        custom={2}
      />
    </SectionContainer>
  );
};

export default ClientsSection; 