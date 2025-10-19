"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export interface CardStackItem {
  id: number
  title: string
  description: string
  icon?: React.ReactNode
}

interface CardStackProps {
  items: CardStackItem[]
  className?: string
  interval?: number
}

export const CardStack = ({ items, className, interval = 4000 }: CardStackProps) => {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length)
    }, interval)

    return () => clearInterval(timer)
  }, [items.length, interval])

  return (
    <div className={cn("relative h-80 w-full", className)}>
      {items.map((item, index) => {
        const offset = (index - activeIndex + items.length) % items.length
        const isActive = offset === 0

        return (
          <motion.div
            key={item.id}
            className={cn(
              "absolute inset-0 rounded-xl border bg-card p-6 shadow-lg",
              isActive && "shadow-[0_0_30px_rgba(20,184,166,0.4)] border-primary/50"
            )}
            initial={false}
            animate={{
              rotateZ: offset * 3,
              scale: 1 - offset * 0.05,
              y: offset * 20,
              zIndex: items.length - offset,
              opacity: offset > 2 ? 0 : 1 - offset * 0.2,
            }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
            }}
          >
            <div className="flex h-full flex-col justify-center">
              {item.icon && (
                <div className="mb-4 flex justify-center text-primary">
                  {item.icon}
                </div>
              )}
              <h3 className="mb-2 text-center text-xl font-bold text-foreground">
                {item.title}
              </h3>
              <p className="text-center text-muted-foreground">
                {item.description}
              </p>
            </div>
          </motion.div>
        )
      })}

      {/* Navigation dots */}
      <div className="absolute -bottom-8 left-1/2 flex -translate-x-1/2 space-x-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              activeIndex === index
                ? "w-8 bg-primary shadow-[0_0_10px_rgba(20,184,166,0.6)]"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to card ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
