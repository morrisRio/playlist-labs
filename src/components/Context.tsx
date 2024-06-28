"use client";
import {
    Children,
    ReactNode,
    cloneElement,
    ReactElement,
    useEffect,
    useState,
    useCallback,
    useMemo,
    isValidElement,
} from "react";
import { MdMoreVert } from "react-icons/md";

// Utility function to add class to React node
const addClassToNode = (node: ReactNode, className: string, key: number): ReactNode => {
    if (node == null || typeof node !== "object") {
        return (
            <span className={className} key={key}>
                {node}
            </span>
        );
    }

    if (isValidElement(node)) {
        const existingClassName = node.props.className || "";
        return cloneElement(node as ReactElement, {
            className: `${className} ${existingClassName}`.trim(),
            key,
        });
    }

    // Handle promises or thenables outside of this function to avoid recursion
    return (
        <div className={className} key={key}>
            {node}
        </div>
    );
};
// Memoized function to process children
const useContextChildren = (children: ReactNode) => {
    return useMemo(() => {
        if (children == null) return null;

        const contextClassName = "text-lg text-nowrap flex flex-row items-center gap-2 px-3 py-2";

        return Children.map(children, (child, index) =>
            isValidElement(child) ? addClassToNode(child, contextClassName, index) : child
        );
    }, [children]);
};

interface ContextProps {
    contextTitle: string;
    contextIcon?: ReactNode;
    children: ReactNode;
    className?: string;
}

function ContextMenu({ contextTitle, contextIcon, children, className = "" }: ContextProps) {
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    const processedChildren = useContextChildren(children);

    const handleScroll = useCallback(() => setShowContextMenu(false), []);

    const handleToggle = useCallback(
        (show: boolean) => {
            if (show) {
                window.addEventListener("scroll", handleScroll);
            } else {
                window.removeEventListener("scroll", handleScroll);
            }
            setShowContextMenu(show);
        },
        [handleScroll]
    );

    useEffect(() => {
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [handleScroll]);

    return (
        <div className={`flex gap-3 items-center ${className}`} onPointerDown={() => handleToggle(true)}>
            {showContextMenu && (
                <div
                    className="fixed inset-0 w-full bg-ui-950/50 z-10"
                    onClick={() => handleToggle(false)}
                    role="presentation"
                ></div>
            )}
            <div className="size-6 z-20 relative">
                {showContextMenu && (
                    <div
                        className="absolute -right-2 -top-2 gap-2 bg-ui-900 border border-ui-700 rounded-lg p-3 "
                        role="menu"
                        aria-label={contextTitle}
                    >
                        <div className="text-ui-600 text-sm flex gap-4 items-center justify-between -mt-3 -mr-3">
                            <span className="text-nowrap ml-2">{contextTitle}</span>
                            <div className="size-6 rounded-full m-2" aria-hidden="true"></div>
                        </div>
                        <hr className="border-ui-700 -mx-3 mb-2" />
                        {processedChildren}
                    </div>
                )}
                <div
                    className="relative size-6 flex items-center justify-center"
                    role="button"
                    aria-haspopup="menu"
                    aria-expanded={showContextMenu}
                >
                    {contextIcon || <MdMoreVert size="1.5em" />}
                </div>
            </div>
        </div>
    );
}

export default ContextMenu;
