"use client";
import { useState, useLayoutEffect, useRef } from "react";
import Marquee from "react-fast-marquee";

interface SmartMarqueeProps {
    children: React.ReactNode;
    title: string;
}

function SmartMarquee({ children, title }: SmartMarqueeProps) {
    const [childrenTooLong, setChildrenTooLong] = useState(false);

    const childRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const childDiv = childRef.current;
        const containerDiv = containerRef.current;

        const checkOverflow = () => {
            console.log("checkOverflow called");

            if (childDiv && containerDiv) {
                console.log(title, "containerDiv", containerDiv.clientWidth);
                console.log(title, "childDiv.clientWidth", childDiv.clientWidth);
                console.log(title, "childDiv.scrollWidth", childDiv.scrollWidth);
                console.log("tooLong", title, childDiv.scrollWidth > containerDiv.clientWidth);
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
    console.log(childrenTooLong, "childrenTooLong");
    return (
        <div ref={containerRef}>
            {childrenTooLong ? (
                <Marquee play={true} speed={30} delay={1}>
                    <div>{children}</div>
                </Marquee>
            ) : (
                <div>{children}</div>
            )}
            <div ref={childRef} className="invisible absolute">
                {children}
            </div>
        </div>
    );
}

export default SmartMarquee;
