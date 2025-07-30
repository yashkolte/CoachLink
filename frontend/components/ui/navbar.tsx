"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, BarChart3 } from "lucide-react";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            CoachLink
                        </div>
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
                            Beta
                        </Badge>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link
                                href="/"
                                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <Home className="w-4 h-4" />
                                Home
                            </Link>
                            <Link
                                href="/dashboard"
                                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <BarChart3 className="w-4 h-4" />
                                Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-300 hover:text-white"
                        >
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-800">
                            <Link
                                href="/"
                                className="text-gray-300 hover:text-white flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <Home className="w-4 h-4" />
                                Home
                            </Link>
                            <Link
                                href="/dashboard"
                                className="text-gray-300 hover:text-white flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <BarChart3 className="w-4 h-4" />
                                Dashboard
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
