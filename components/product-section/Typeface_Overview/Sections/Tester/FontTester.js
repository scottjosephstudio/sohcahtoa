import React from 'react'
import { useFontTesterState } from '../hooks/useFontTesterState'
import { FontTesterDisplay } from './FontTesterDisplay'

export default function FontTester({ fontSettings, isNavigatingHome }) {
  const {
    settings,
    text,
    setText,
    isTyping,
    setIsTyping,
    textRef,
    isReady
  } = useFontTesterState(fontSettings)

  return (
    <FontTesterDisplay
      textRef={textRef}
      isTyping={isTyping}
      setIsTyping={setIsTyping}
      setText={setText}
      text={text}
      settings={fontSettings || settings}
      isNavigatingHome={isNavigatingHome}
      isReady={isReady}
    />
  )
}