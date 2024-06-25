"use client";
import { useState, useLayoutEffect, useRef } from "react";
import Marquee from "react-fast-marquee";

import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@/../tailwind.config";

interface SmartMarqueeProps {
    children: React.ReactNode;
    divider?: boolean;
}

function SmartMarquee({ children, divider = false }: SmartMarqueeProps) {
    const fullConfig = resolveConfig(tailwindConfig);
    //@ts-expect-error
    const bgColor = fullConfig.theme.colors.ui[900] || "transparent";

    const bgGradient = `linear-gradient(to right, ${bgColor} 0%, transparent 10%, transparent 90%, ${bgColor} 100%)`;
    // const bgGradient = `linear-gradient(to right, red 0%, blue 100%)`;

    const [childrenTooLong, setChildrenTooLong] = useState(false);

    const childRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const childDiv = childRef.current;
        const containerDiv = containerRef.current;

        const checkOverflow = () => {
            if (childDiv && containerDiv) {
                setChildrenTooLong(childDiv.scrollWidth > containerDiv.clientWidth);
            }
        };

        const resizeObserver = new ResizeObserver(checkOverflow);

        if (containerDiv) {
            resizeObserver.observe(containerDiv);
        }

        // Initial check in case the element is already overflowing
        checkOverflow();

        // Cleanup observer on component unmount
        return () => {
            if (containerDiv) {
                resizeObserver.unobserve(containerDiv);
            }
        };
    }, [children]);
    return (
        <div ref={containerRef} className="relative">
            {childrenTooLong && (
                <div className="size-full visible">
                    <div className="absolute size-full z-10" style={{ backgroundImage: bgGradient }}></div>
                    <Marquee play={true} speed={30} delay={1}>
                        {children}
                        {divider && <span>{"\xa0-\xa0"}</span>}
                    </Marquee>
                </div>
            )}
            <div ref={childRef} className={`${childrenTooLong ? "invisible absolute" : "visible"} size-full`}>
                {children}
            </div>
        </div>
    );
}

export default SmartMarquee;
