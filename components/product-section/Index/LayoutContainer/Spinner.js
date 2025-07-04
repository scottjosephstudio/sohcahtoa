"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { gsap } from "gsap";

import { ShapeContainerType, Coin } from "../css/Spinner";
import useSpinnerAnimation from "../../../../hooks/TypefaceSlotMachine/useSpinnerAnimation";

const Spinner = () => {
  const router = useRouter();
  const [animationState, setAnimationState] = useState("visible");

  const containerVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, delay: 0.1 },
    },
    exit: { opacity: 0, scale: 0, transition: { duration: 0.5 } },
  };

  const coinVariants = {
    hidden: { opacity: 0, scale: 0, rotateY: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 360,
      transition: {
        duration: 2,
        rotateY: {
          repeat: Infinity,
          ease: "linear",
          duration: 1,
        },
      },
    },
    exit: { opacity: 0, scale: 0, transition: { duration: 0.2 } },
  };

  const handleClick = (e) => {
    e.preventDefault();

    // Start spinner exit animation
    setAnimationState("exit");

    // Coordinate all exit animations
    gsap.to(".slot-machine-page", {
      x: "0vw",
      scale: 0,
      duration: 0.25,
      ease: "power3.in",
    });

    gsap.to(".banner-container", {
      y: "100%",
      duration: 0.3,
      ease: "power3.in",
      onComplete: () => {
        // Navigate after all animations complete
        router.push("/Typeface");
      },
    });
  };

  return (
    <ShapeContainerType
      as={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate={animationState}
    >
      <a
        href="/Typeface"
        className="no-hover custom-tooltip"
        onClick={handleClick}
      >
        <Coin as={motion.div} variants={coinVariants} animate={animationState}>
          <svg
            className="w-[120px] h-[120px]"
            viewBox="0 0 198.43 198.43"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="linear-gradient"
                x1="-195.77"
                y1="524.31"
                x2="-194.78"
                y2="524.31"
                gradientTransform="translate(16888.5 45180.01) scale(85.98 -85.98)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="rgb(255, 255, 255)" />
                <stop offset="1" stopColor="rgb(29, 29, 27)" />
              </linearGradient>
              <linearGradient
                id="linear-gradient-2"
                y1="523.85"
                y2="523.85"
                gradientTransform="translate(16888.5 45084.75) scale(85.98 -85.98)"
                href="#linear-gradient"
              />
              <linearGradient
                id="linear-gradient-3"
                y1="523.86"
                y2="523.86"
                gradientTransform="translate(16888.5 45197.64) scale(85.98 -85.98)"
                href="#linear-gradient"
              />
              <linearGradient
                id="linear-gradient-4"
                x1="-201.78"
                y1="522.43"
                x2="-200.79"
                y2="522.43"
                gradientTransform="translate(-44763.19 17406.41) rotate(90) scale(85.98 -85.98)"
                href="#linear-gradient"
              />
              <linearGradient
                id="linear-gradient-5"
                x1="-201.78"
                y1="522.44"
                x2="-200.79"
                y2="522.44"
                gradientTransform="translate(-44763.19 17406.41) rotate(90) scale(85.98 -85.98)"
                href="#linear-gradient"
              />
            </defs>
            <path
              className="fill-current"
              d="M99.21,198.43c54.79,0,99.21-44.42,99.21-99.21S154.01,0,99.21,0,0,44.42,0,99.21s44.42,99.21,99.21,99.21"
            />
            <rect
              x="56.49"
              y="57.72"
              width="85.3"
              height="85.3"
              fill="url(#linear-gradient)"
            />
            <rect
              x="56.49"
              y="40.23"
              width="85.3"
              height="7.98"
              fill="url(#linear-gradient-2)"
            />
            <rect
              x="56.49"
              y="152.23"
              width="85.3"
              height="7.98"
              fill="url(#linear-gradient-3)"
            />
            <rect
              x="151.16"
              y="57.57"
              width="7.98"
              height="85.3"
              fill="url(#linear-gradient-4)"
            />
            <rect
              x="39.16"
              y="57.57"
              width="7.98"
              height="85.3"
              fill="url(#linear-gradient-5)"
            />
          </svg>
        </Coin>
        <span className="tooltip-text tooltip-spinner">Keep In The Loop</span>
      </a>
    </ShapeContainerType>
  );
};

export default React.memo(Spinner);
