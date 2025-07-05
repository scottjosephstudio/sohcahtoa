import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { AnimatePresence } from "framer-motion";
import {
  CountryPostcodeContainer,
  CountryContainer,
  PostcodeContainer,
  Label,
  InputContainer,
  InputField,
  HintText,
  StripeErrorMessage,
  inputContainerVariants,
} from "../PaymentSectionStyles";

export const AddressInputs = ({
  country,
  postcode,
  errors,
  onInputChange,
  onInputBlur,
}) => (
  <CountryPostcodeContainer>
    <CountryContainer>
      <Label
        name="country"
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        Country
      </Label>
      <InputContainer
        $hasError={!!errors.country}
        variants={inputContainerVariants}
        initial="initial"
        whileHover="hover"
        custom={{ $hasError: !!errors.country }}
      >
        <InputField
          type="text"
          value={country}
          onChange={onInputChange("country")}
          onBlur={onInputBlur("country")}
          $hasError={!!errors.country}
        />
      </InputContainer>
      <AnimatePresence>
        {errors.country && (
          <StripeErrorMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {errors.country}
          </StripeErrorMessage>
        )}
      </AnimatePresence>
      <HintText
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Examples: UK, United Kingdom, US, United States
      </HintText>
    </CountryContainer>

    <PostcodeContainer>
      <Label
        name="postcode"
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        Postal Code
      </Label>
      <InputContainer
        $hasError={!!errors.postcode}
        variants={inputContainerVariants}
        initial="initial"
        whileHover="hover"
        custom={{ $hasError: !!errors.postcode }}
      >
        <InputField
          type="text"
          value={postcode}
          onChange={onInputChange("postcode")}
          onBlur={onInputBlur("postcode")}
          $hasError={!!errors.postcode}
        />
      </InputContainer>
      <AnimatePresence>
        {errors.postcode && (
          <StripeErrorMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {errors.postcode}
          </StripeErrorMessage>
        )}
      </AnimatePresence>
    </PostcodeContainer>
  </CountryPostcodeContainer>
);

AddressInputs.propTypes = {
  country: PropTypes.string.isRequired,
  postcode: PropTypes.string.isRequired,
  errors: PropTypes.shape({
    country: PropTypes.string,
    postcode: PropTypes.string,
  }).isRequired,
  onInputChange: PropTypes.func.isRequired,
  onInputBlur: PropTypes.func.isRequired,
};

export default AddressInputs;
