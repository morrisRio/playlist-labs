"use client";
import { useState, useLayoutEffect, useRef } from "react";
import Marquee from "react-fast-marquee";

import { twUi900 } from "@/lib/utils";

interface SmartMarqueeProps {
    children: React.ReactNode;
    divider?: boolean;
}

function SmartMarquee({ children, divider = false }: SmartMarqueeProps) {
    const bgGradient = `linear-gradient(to right, ${twUi900} 0%, transparent 10%, transparent 90%, ${twUi900} 100%)`;

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
                <div className="size-full visible flex flex-nowrap">
                    <div className="absolute size-full z-10" style={{ backgroundImage: bgGradient }}></div>
                    <Marquee play={true} speed={30}>
                        {children}
                        {divider && <span>{"\xa0-\xa0"}</span>}
                    </Marquee>
                </div>
            )}
            <div
                ref={childRef}
                className={`${childrenTooLong ? "invisible absolute" : "visible"} size-full whitespace-nowrap`}
            >
                {children}
            </div>
        </div>
    );
}

export default SmartMarquee;
