"use client";
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const HoverBorderGradient = ({
    children,
    containerClassName,
    className,
    as: Tag = "button",
    duration = 1,
    clockwise = true,
    ...props
}: React.PropsWithChildren<
    {
        as?: React.ElementType;
        containerClassName?: string;
        className?: string;
        duration?: number;
        clockwise?: boolean;
    } & React.HTMLAttributes<HTMLElement>
>) => {
    const [hovered, setHovered] = useState<boolean>(false);
    const ref = useRef<HTMLDivElement>(null);

    const variants = {
        initial: {
            backgroundPosition: "0 50%",
        },
        animate: {
            backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
        },
    };

    return (
        <div
            ref={ref}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={cn(
                "group relative flex rounded-full border content-center bg-black/20 hover:bg-black/10 transition duration-500 dark:bg-white/20 items-center justify-center p-[1px] w-fit",
                containerClassName
            )}
            {...props}
        >
            <motion.div
                variants={variants}
                initial="initial"
                animate={hovered ? "animate" : "initial"}
                transition={{
                    duration: duration,
                    repeat: hovered ? Infinity : 0,
                    repeatType: "reverse",
                    ease: "linear",
                }}
                style={{
                    backgroundSize: clockwise ? "400% 400%" : "200% 200%",
                    backgroundImage: `conic-gradient(from 0deg, transparent, ${clockwise ? "#00D2FF, #3A7BD5" : "#3A7BD5, #00D2FF"
                        }, transparent)`,
                }}
                className="absolute inset-0 rounded-full z-[1] opacity-60 group-hover:opacity-100 blur-[2px]"
            />
            <motion.div
                variants={variants}
                initial="initial"
                animate={hovered ? "animate" : "initial"}
                transition={{
                    duration: duration,
                    repeat: hovered ? Infinity : 0,
                    repeatType: "reverse",
                    ease: "linear",
                }}
                style={{
                    backgroundSize: clockwise ? "400% 400%" : "200% 200%",
                    backgroundImage: `conic-gradient(from 0deg, transparent, ${clockwise ? "#00D2FF, #3A7BD5" : "#3A7BD5, #00D2FF"
                        }, transparent)`,
                }}
                className="absolute inset-0 rounded-full z-[1]"
            />

            <Tag className={cn("relative bg-black border-0 text-white rounded-full", className)}>
                {children}
            </Tag>
        </div>
    );
};
