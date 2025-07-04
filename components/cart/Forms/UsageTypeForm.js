// src/components/cart/UsageSelection.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import {
 StepContainer,
 OptionHeader,
 RadioGroup,
 RadioLabel,
 RadioInput,
 UsageText,
 EulaContainer,
 EulaCheckboxWrapper,
 EulaCheckbox,
 EulaLabel,
 EulaLink,
 FormContainer,
 AnimatedContent,
 FormRow,
 FormGroup,
 FormLabel,
 FormInput,
 Button as RegisterButton,
 radioInputVariants,
 buttonVariants,
 radioLabelVariants,
 eulaCheckboxVariants
} from '../styles';

const UsageFormWrapper = styled(motion.div)`
  overflow: hidden;
`;

export const UsageSelection = ({
 selectedUsage,
 onUsageTypeChange,
 eulaAccepted,
 onEulaChange,
 savedRegistrationData,
 clientData,
 onClientDataChange,
 onUsageComplete,
 isClientDataValid,
 usageTypeButtonRef
}) => {
 const [isPersonalRadioHovered, setIsPersonalRadioHovered] = useState(false);
 const [isClientRadioHovered, setIsClientRadioHovered] = useState(false);
 const [isEulaHovered, setIsEulaHovered] = useState(false);

 return (
   <StepContainer isUsageForm>
     <OptionHeader>Usage Type</OptionHeader>
     <RadioGroup>
       <RadioLabel
         variants={radioLabelVariants}
         initial="initial"
         whileHover="hover"
         onHoverStart={() => setIsPersonalRadioHovered(true)}
         onHoverEnd={() => setIsPersonalRadioHovered(false)}
       >
         <RadioInput
           type="radio"
           name="usage"
           value="personal"
           checked={selectedUsage === 'personal'}
           onChange={(e) => onUsageTypeChange(e.target.value)}
           variants={radioInputVariants}
           initial="initial"
           whileHover={selectedUsage === 'personal' ? "checkedHover" : "hover"}
           animate={
             selectedUsage === 'personal' 
               ? "checked"
               : (isPersonalRadioHovered ? "hover" : "initial")
           }
         />
         <UsageText>Personal Use</UsageText>
       </RadioLabel>
       <RadioLabel
         variants={radioLabelVariants}
         initial="initial"
         whileHover="hover"
         onHoverStart={() => setIsClientRadioHovered(true)}
         onHoverEnd={() => setIsClientRadioHovered(false)}
       >
         <RadioInput
           type="radio"
           name="usage"
           value="client"
           checked={selectedUsage === 'client'}
           onChange={(e) => onUsageTypeChange(e.target.value)}
           variants={radioInputVariants}
           initial="initial"
           whileHover={selectedUsage === 'client' ? "checkedHover" : "hover"}
           animate={
             selectedUsage === 'client' 
               ? "checked"
               : (isClientRadioHovered ? "hover" : "initial")
           }
         />
         <UsageText>Client Use</UsageText>
       </RadioLabel>
     </RadioGroup>

     <EulaContainer 
       $hasSelections={!!selectedUsage}
       style={{ marginBottom: selectedUsage ? '18px' : '0px' }}
     >
       <EulaCheckboxWrapper>
         <EulaCheckbox
           type="checkbox"
           id="eula"
           checked={eulaAccepted}
           disabled={!selectedUsage}
           onChange={(e) => onEulaChange(e.target.checked)}
           variants={eulaCheckboxVariants}
           initial="initial"
           whileHover={selectedUsage ? (eulaAccepted ? "checkedHover" : "hover") : "initial"}
           animate={
             eulaAccepted 
               ? "checked"
               : (isEulaHovered && selectedUsage ? "hover" : "initial")
           }
         />
       </EulaCheckboxWrapper>
       <EulaLabel 
          htmlFor="eula" 
          $selectedUsage={selectedUsage}
          onMouseEnter={() => setIsEulaHovered(true)}
          onMouseLeave={() => setIsEulaHovered(false)}
        >
          I agree to the terms and conditions of the{' '}
          <EulaLink
            href="/eula"
            target="_blank"
            rel="noopener noreferrer"
            $selectedUsage={selectedUsage}
          >
            EULA
          </EulaLink>
        </EulaLabel>
     </EulaContainer>

     <AnimatePresence>
       {selectedUsage && (
         <UsageFormWrapper
           initial={{ opacity: 0 }}
           animate={{ 
             opacity: 1,
             transition: {
               opacity: { duration: 0.3, ease: "easeInOut" }
             }
           }}
           exit={{ 
             opacity: 0,
             transition: {
               opacity: { duration: 0.2, ease: "easeInOut" }
             }
           }}
         >
           <FormContainer>
             <AnimatePresence mode="wait">
               {selectedUsage === 'personal' && (
                 <AnimatedContent
                   key="personal"
                   style={{ position: 'relative' }}
                   initial={{ opacity: 0 }}
                   animate={{ 
                     opacity: 1,
                     transition: {
                       opacity: { duration: 0.15, ease: "easeInOut" }
                     }
                   }}
                   exit={{ 
                     opacity: 0,
                     transition: {
                       opacity: { duration: 0.05, ease: "easeInOut" }
                     }
                   }}
                 >
                   <OptionHeader $isFormHeader>Personal Details</OptionHeader>
                   <FormRow>
                     <FormGroup style={{ marginBottom: 0 }}>
                       <FormLabel>Name</FormLabel>
                       <FormInput
                         type="text"
                         value={`${savedRegistrationData?.firstName || ''} ${savedRegistrationData?.surname || ''}`}
                         disabled
                       />
                     </FormGroup>
                     <FormGroup style={{ marginBottom: 0 }}>
                       <FormLabel>Address</FormLabel>
                       <FormInput
                         type="text"
                         value={`${savedRegistrationData?.street || ''}, ${savedRegistrationData?.city || ''}, ${savedRegistrationData?.postcode || ''}`}
                         disabled
                       />
                     </FormGroup>
                   </FormRow>
                 </AnimatedContent>
               )}
               {selectedUsage === 'client' && (
                 <AnimatedContent
                   key="client"
                   style={{ position: 'relative' }}
                   initial={{ opacity: 0 }}
                   animate={{ 
                     opacity: 1,
                     transition: {
                       opacity: { duration: 0.15, ease: "easeInOut" }
                     }
                   }}
                   exit={{ 
                     opacity: 0,
                     transition: {
                       opacity: { duration: 0.05, ease: "easeInOut" }
                     }
                   }}
                 >
                   <OptionHeader $isFormHeader>Client Details</OptionHeader>
                   <FormRow>
                     <FormGroup style={{ marginBottom: 0 }}>
                       <FormLabel>Company Name</FormLabel>
                       <FormInput
                         type="text"
                         value={clientData.companyName}
                         onChange={(e) => onClientDataChange('companyName', e.target.value)}
                       />
                     </FormGroup>
                     <FormGroup style={{ marginBottom: 0 }}>
                       <FormLabel>Contact Name</FormLabel>
                       <FormInput
                         type="text"
                         value={clientData.contactName}
                         onChange={(e) => onClientDataChange('contactName', e.target.value)}
                       />
                     </FormGroup>
                   </FormRow>
                   <FormRow>
                     <FormGroup fieldName="contactEmail" style={{ marginBottom: 0 }}>
                       <FormLabel>Contact Email</FormLabel>
                       <FormInput
                         type="email"
                         value={clientData.contactEmail}
                         onChange={(e) => onClientDataChange('contactEmail', e.target.value)}
                       />
                     </FormGroup>
                     <FormGroup style={{ marginBottom: 0 }}>
                       <FormLabel>Contact Phone</FormLabel>
                       <FormInput
                         type="tel"
                         value={clientData.contactPhone}
                         onChange={(e) => onClientDataChange('contactPhone', e.target.value)}
                       />
                     </FormGroup>
                   </FormRow>
                 </AnimatedContent>
               )}
             </AnimatePresence>
           </FormContainer>

           <RegisterButton
             ref={usageTypeButtonRef}
             onClick={onUsageComplete}
             variants={buttonVariants}
             initial="initial"
             animate={(!selectedUsage || (selectedUsage === 'client' && !isClientDataValid()) || !eulaAccepted) ? "disabled" : "enabled"}
             whileHover={(!selectedUsage || (selectedUsage === 'client' && !isClientDataValid()) || !eulaAccepted) ? {} : "hover"}
             whileTap={(!selectedUsage || (selectedUsage === 'client' && !isClientDataValid()) || !eulaAccepted) ? {} : "hover"}
             disabled={!selectedUsage || (selectedUsage === 'client' && !isClientDataValid()) || !eulaAccepted}
           >
             Specify Usage Type
           </RegisterButton>
         </UsageFormWrapper>
       )}
     </AnimatePresence>
   </StepContainer>
 );
};

export default UsageSelection;