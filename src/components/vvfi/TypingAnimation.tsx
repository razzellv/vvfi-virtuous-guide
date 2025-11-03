import { useState, useEffect } from "react";

interface TypingAnimationProps {
  text: string;
  speed?: number;
}

export const TypingAnimation = ({ text, speed = 30 }: TypingAnimationProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  return (
    <pre className="text-sm text-foreground font-mono whitespace-pre-wrap">
      {displayedText}
      {currentIndex < text.length && (
        <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
      )}
    </pre>
  );
};
