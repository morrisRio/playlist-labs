import { useState, useEffect, useCallback, RefObject, useRef } from "react";

interface HeaderState {
    headerHeight: number;
    collapsed: boolean;
    handleScroll: () => void;
    triggerProgress: number;
}

export const useHeaderState = (
    headerRef: RefObject<HTMLElement>,
    actionButtonRef: RefObject<HTMLElement>
): HeaderState => {
    const [headerHeight, setHeaderHeight] = useState(60);
    const [triggerPoint, setTriggerPoint] = useState(0);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        if (headerRef.current) {
            setHeaderHeight(headerRef.current.clientHeight);
        }
    }, [headerRef]);

    useEffect(() => {
        if (actionButtonRef.current) {
            setTriggerPoint(window.scrollY + actionButtonRef.current.getBoundingClientRect().top);
        }
    }, [actionButtonRef]);

    const [triggerProgress, setTriggerProgress] = useState(0);
    const fullTrigger = useRef<boolean>(false);

    const handleScroll = useCallback(() => {
        const currentScrollY = window.scrollY;

        //make sure the triggerState is only updated when the trigger progress changes
        if (window.scrollY / triggerPoint <= 1) {
            setTriggerProgress(Math.min(1, window.scrollY / triggerPoint));
            fullTrigger.current = false;
        } else if (window.scrollY / triggerPoint > 1 && !fullTrigger.current) {
            //only set it to 1 once
            setTriggerProgress(1);
            fullTrigger.current = true;
        }

        if (collapsed && currentScrollY < triggerPoint) {
            setCollapsed(false);
        } else if (!collapsed && currentScrollY > triggerPoint) {
            setCollapsed(true);
        }
    }, [triggerPoint, collapsed]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // Initial check
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [handleScroll]);

    return {
        headerHeight,
        collapsed,
        handleScroll,
        triggerProgress,
    };
};
