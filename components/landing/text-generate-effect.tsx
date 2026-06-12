"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

export function TextGenerateEffect({
  words,
  className,
  wordClassName,
}: {
  words: string;
  className?: string;
  wordClassName?: string;
}) {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      "span",
      { opacity: 1, filter: "blur(0px)", y: 0 },
      { duration: 0.6, delay: stagger(0.08) }
    );
  }, [animate]);

  return (
    <motion.div ref={scope} className={cn(className)}>
      {wordsArray.map((word, idx) => (
        <motion.span
          key={word + idx}
          className={cn("inline-block opacity-0", wordClassName)}
          style={{ filter: "blur(8px)", transform: "translateY(8px)" }}
        >
          {word}
          {idx < wordsArray.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.div>
  );
}
