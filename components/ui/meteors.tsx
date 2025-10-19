"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

export const Meteors = ({
  number,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const meteors = new Array(number || 20).fill(true);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0"
    >
      {meteors.map((el, idx) => {
        const meteorCount = number || 20;
        // Calculate position to evenly distribute meteors across container width
        const leftPosition = (idx / meteorCount) * 100; // Percentage based positioning

        return (
          <span
            key={"meteor" + idx}
            className={cn(
              "animate-meteor-effect absolute h-1 w-1 rotate-[45deg] rounded-full bg-white shadow-[0_0_10px_2px_#ffffff]",
              "before:absolute before:top-1/2 before:h-[2px] before:w-[80px] before:-translate-y-[50%] before:transform before:bg-gradient-to-r before:from-white before:to-transparent before:content-['']",
              className
            )}
            style={{
              top: "-5%",
              left: `${leftPosition}%`,
              animationDelay: Math.random() * 3 + "s",
              animationDuration: Math.floor(Math.random() * (8 - 4) + 4) + "s",
            }}
          ></span>
        );
      })}
    </motion.div>
  );
};
