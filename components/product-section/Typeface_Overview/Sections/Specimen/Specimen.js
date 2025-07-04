import styled from "styled-components";

const Section = styled.div`
  margin-top: 2rem;
`;

const Title = styled.h2`
  font-size: 20px;
  margin-bottom: 1rem;
  color: #000;
`;

const Text = styled.p`
  font-size: 20px;
  line-height: 24px;
  color: #333;
`;

export default function SpecimenSection() {
  return (
    <Section>
      <Title></Title>
      <Text></Text>
      {/* Add more specimen content here */}
    </Section>
  );
}
