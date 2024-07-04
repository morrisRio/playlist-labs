import { useState, useEffect, useCallback, RefObject } from "react";

interface HeaderState {
    headerHeight: number;
    collapsed: boolean;
    handleScroll: () => void;
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
            setTriggerPoint(actionButtonRef.current.clientHeight + window.scrollY);
        }
    }, [actionButtonRef]);

    const handleScroll = useCallback(() => {
        const currentScrollY = window.scrollY;

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
    };
};
