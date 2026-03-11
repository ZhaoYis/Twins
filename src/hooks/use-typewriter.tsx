"use client";

import { useState, useEffect, useCallback } from "react";

interface TypewriterOptions {
  text: string;
  speed?: number;
  delay?: number;
  loop?: boolean;
  cursor?: boolean;
}

export function useTypewriter({
  text,
  speed = 50,
  delay = 0,
  loop = false,
  cursor = true,
}: TypewriterOptions) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(cursor);

  const startTyping = useCallback(() => {
    setIsTyping(true);
    setCurrentIndex(0);
    setDisplayText("");
  }, []);

  useEffect(() => {
    if (!isTyping) return;

    const startDelay = setTimeout(() => {
      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          setDisplayText((prev) => prev + text[currentIndex]);
          setCurrentIndex((prev) => prev + 1);
        }, speed);

        return () => clearTimeout(timeout);
      } else {
        setIsTyping(false);
        if (loop) {
          const restartDelay = setTimeout(() => {
            startTyping();
          }, 2000);
          return () => clearTimeout(restartDelay);
        }
      }
    }, currentIndex === 0 ? delay : 0);

    return () => clearTimeout(startDelay);
  }, [currentIndex, text, speed, delay, loop, isTyping, startTyping]);

  useEffect(() => {
    startTyping();
  }, [startTyping]);

  // Cursor blink effect
  useEffect(() => {
    if (!cursor) return;

    const blinkInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => clearInterval(blinkInterval);
  }, [cursor]);

  return { displayText, showCursor, isTyping };
}

export function TypewriterText({
  text,
  speed = 50,
  delay = 0,
  loop = false,
  className = "",
  cursorClassName = "text-primary",
}: TypewriterOptions & { className?: string; cursorClassName?: string }) {
  const { displayText, showCursor } = useTypewriter({
    text,
    speed,
    delay,
    loop,
    cursor: true,
  });

  return (
    <span className={className}>
      {displayText}
      <span className={`${showCursor ? "opacity-100" : "opacity-0"} transition-opacity duration-100 ${cursorClassName}`}>
        |
      </span>
    </span>
  );
}
