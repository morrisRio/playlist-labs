import { useEffect, RefObject } from "react";

interface useInputKeyboardProps {
    onEnter?: () => void;
    onEscape?: () => void;
    inputRef: RefObject<HTMLInputElement>;
    enabled?: boolean;
}

export function useInputKeyboard({ onEnter, onEscape, inputRef, enabled = true }: useInputKeyboardProps) {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle events when this input is focused
            if (document.activeElement !== inputRef.current) return;

            if (e.key === "Enter" && onEnter) {
                e.preventDefault();
                e.stopPropagation();
                onEnter();
            } else if (e.key === "Escape" && onEscape) {
                e.preventDefault();
                e.stopPropagation();
                onEscape();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onEnter, onEscape, inputRef, enabled]);
}
