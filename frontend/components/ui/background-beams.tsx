"use client";
import { cn } from "@/lib/utils";
import React, { useRef } from "react";

export const BackgroundBeams = ({ className }: { className?: string }) => {
    const beamsRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={beamsRef}
            className={cn(
                "pointer-events-none absolute inset-0 z-0 overflow-hidden",
                className
            )}
        >
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 h-full w-full"
            >
                <g clipPath="url(#clip0_17_60)">
                    <g filter="url(#filter0_f_17_60)">
                        <path
                            d="M128.6 0H0V322.2L106.2 134.75L128.6 0Z"
                            fill="url(#paint0_linear_17_60)"
                        />
                        <path
                            d="M0 322.2V400H240H320L106.2 134.75L0 322.2Z"
                            fill="url(#paint1_linear_17_60)"
                        />
                        <path
                            d="M320 400H400V78.75L106.2 134.75L320 400Z"
                            fill="url(#paint2_linear_17_60)"
                        />
                        <path
                            d="M400 0V78.75L106.2 134.75L128.6 0H400Z"
                            fill="url(#paint3_linear_17_60)"
                        />
                    </g>
                </g>
                <defs>
                    <filter
                        id="filter0_f_17_60"
                        x="-50"
                        y="-50"
                        width="500"
                        height="500"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                    >
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="BackgroundImageFix"
                            result="shape"
                        />
                        <feGaussianBlur
                            stdDeviation="25"
                            result="effect1_foregroundBlur_17_60"
                        />
                    </filter>
                    <clipPath id="clip0_17_60">
                        <rect width="400" height="400" fill="white" />
                    </clipPath>
                    <linearGradient
                        id="paint0_linear_17_60"
                        x1="64.3"
                        y1="161.1"
                        x2="174.5"
                        y2="37.6"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#4F46E5" stopOpacity="0" />
                        <stop offset="1" stopColor="#4F46E5" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient
                        id="paint1_linear_17_60"
                        x1="120.1"
                        y1="267.6"
                        x2="177.2"
                        y2="333.8"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#4F46E5" stopOpacity="0" />
                        <stop offset="1" stopColor="#4F46E5" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient
                        id="paint2_linear_17_60"
                        x1="253.1"
                        y1="239.4"
                        x2="363.3"
                        y2="115.9"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#4F46E5" stopOpacity="0" />
                        <stop offset="1" stopColor="#4F46E5" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient
                        id="paint3_linear_17_60"
                        x1="264.3"
                        y1="39.4"
                        x2="174.1"
                        y2="162.9"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#4F46E5" stopOpacity="0" />
                        <stop offset="1" stopColor="#4F46E5" stopOpacity="0.2" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};
