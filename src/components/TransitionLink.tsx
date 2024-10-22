"use client";
import { ReactNode, useEffect, useRef } from "react";
import Link, { LinkProps } from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { sleep } from "@/lib/utils";

interface TransitionLinkProps extends LinkProps {
    children: ReactNode;
    href: string;
    enter?: boolean;
}

export default function TransitionLink({ children, href, enter = false, ...props }: TransitionLinkProps) {
    const router = useRouter();

    const navigateToRef = useRef<string | null>(null);

    const handleTransition = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        const main = document.querySelector("main");
        navigateToRef.current = href;

        //fade out to the left
        if (enter) main?.classList.add("page-transition-left");
        else main?.classList.add("page-transition-right");

        //sleep for animation duration
        await sleep(100);

        //navigate to the new page
        console.log("router pushing");
        router.push(href);
    };

    useEffect(() => {
        //use effect runs after the navigation is done
        return () => {
            async function animateBack() {
                const main = document.querySelector("main");
                if (!main) return;

                //siwtch to opposite sides
                main.style.transitionProperty = "none";
                if (enter) {
                    main.classList.remove("page-transition-left");
                    main.classList.add("page-transition-right");
                } else {
                    main.classList.add("page-transition-left");
                    main.classList.remove("page-transition-right");
                }
                await sleep(5);

                console.log(href + " reseting transition property to 1000ms");
                main.style.transitionProperty = "opacity, filter, transform";

                if (enter) main?.classList.remove("page-transition-right");
                else main?.classList.remove("page-transition-left");
            }

            if (navigateToRef.current === href) animateBack();
        };
    }, [enter, href]);

    return (
        <>
            <Link
                {...props}
                href={href}
                onClick={(e) => {
                    handleTransition(e);
                }}
                className="py-2 px-4 -mx-4 -my-2"
            >
                {children}
            </Link>
        </>
    );
}
