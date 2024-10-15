"use client";
import { useState, ReactNode, useEffect, useRef, useCallback } from "react";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";

import Lottie from "lottie-react";
import Loading from "@/lib/lotties/loading.json";
import { useTimeout } from "@/lib/hooks/useTimeout";

interface TransitionLinkProps extends LinkProps {
    children: ReactNode;
    href: string;
    enter?: boolean;
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function TransitionLink({ children, href, enter = false, ...props }: TransitionLinkProps) {
    const router = useRouter();
    const pathname = usePathname();

    // const enterRef = useRef<boolean>(enter);
    const enterRef = useRef<boolean>(enter);
    const hrefRef = useRef<string | null>(null);
    // console.log(href + " enterState in client: ", enterState);
    const handleTransition = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        const main = document.querySelector("main");
        hrefRef.current = href;

        //fade out to the left
        if (enterRef.current) main?.classList.add("page-transition-left");
        else main?.classList.add("page-transition-right");

        //sleep for animation duration
        console.log("sleep for 1000ms");
        await sleep(1000);
        console.log("slept for 1000ms");

        //navigate to the new page
        console.log("router pushing");
        router.push(href);
    };

    useEffect(() => {
        //use effect runs after the navigation is done
        return () => {
            //when it was previously shown hide it again
            async function animateBack() {
                console.log("href:", href);
                console.log("hrefRef:", hrefRef.current);
                console.log("pathname: ", pathname);
                console.log("enterRef: ", enterRef.current);
                const main = document.querySelector("main");
                if (!main) return;

                main.style.transitionProperty = "none";
                await sleep(10);
                if (enterRef.current) {
                    main.classList.remove("page-transition-left");
                    main.classList.add("page-transition-right");
                } else {
                    main.classList.add("page-transition-left");
                    main.classList.remove("page-transition-right");
                }
                await sleep(10);

                console.log(href + " reseting transition property to 1000ms");
                main.style.transitionProperty = "opacity, filter, transform";
                await sleep(10);
                if (enterRef.current) main?.classList.remove("page-transition-right");
                else main?.classList.remove("page-transition-left");
            }

            if (hrefRef.current === href) animateBack();
        };
    }, []);

    return (
        <>
            <Link
                {...props}
                href={href}
                onClick={(e) => {
                    handleTransition(e);
                }}
                className=""
            >
                {children}
            </Link>
        </>
    );
}
