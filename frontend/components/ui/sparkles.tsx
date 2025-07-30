"use client";
import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SparklesCoreProps {
    background?: string;
    minSize?: number;
    maxSize?: number;
    particleDensity?: number;
    className?: string;
    particleColor?: string;
}

export const SparklesCore: React.FC<SparklesCoreProps> = ({
    background = "transparent",
    minSize = 0.4,
    maxSize = 1,
    particleDensity = 1200,
    className,
    particleColor = "#FFF",
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let particles: Array<{
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            opacity: number;
            opacitySpeed: number;
        }> = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createParticles = () => {
            particles = [];
            const numberOfParticles = Math.floor(particleDensity / 10);

            for (let i = 0; i < numberOfParticles; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * (maxSize - minSize) + minSize,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.5,
                    opacity: Math.random(),
                    opacitySpeed: (Math.random() - 0.5) * 0.01,
                });
            }
        };

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle) => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                particle.opacity += particle.opacitySpeed;

                if (particle.opacity <= 0 || particle.opacity >= 1) {
                    particle.opacitySpeed = -particle.opacitySpeed;
                }

                if (particle.x < 0 || particle.x > canvas.width) {
                    particle.speedX = -particle.speedX;
                }
                if (particle.y < 0 || particle.y > canvas.height) {
                    particle.speedY = -particle.speedY;
                }

                ctx.save();
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = particleColor;
                ctx.shadowColor = particleColor;
                ctx.shadowBlur = particle.size * 2;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            animationId = requestAnimationFrame(animateParticles);
        };

        resizeCanvas();
        createParticles();
        animateParticles();

        const handleResize = () => {
            resizeCanvas();
            createParticles();
        };

        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", handleResize);
        };
    }, [minSize, maxSize, particleDensity, particleColor]);

    return (
        <canvas
            ref={canvasRef}
            className={cn("pointer-events-none absolute inset-0", className)}
            style={{
                background,
            }}
        />
    );
};
