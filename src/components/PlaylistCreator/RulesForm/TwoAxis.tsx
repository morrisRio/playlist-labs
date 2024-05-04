import { useState, useEffect, useRef } from "react";
import { Rule } from "@/types/spotify";

export interface AxisRule extends Rule {
    value: [number, number];
    range: [string[], string[]];
}

interface TwoAxisSliderProps {
    rule: AxisRule;
    onChange: (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.MouseEvent<HTMLButtonElement>
    ) => void;
}

export const TwoAxisSlider = ({ rule, onChange }: TwoAxisSliderProps): any => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [dragging, setDragging] = useState(false);

    const height = 20;

    useEffect(() => {
        // Clean up the event listeners when component unmounts
        return () => {
            // console.log("cleanup");
            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerleave", handlePointerLeave);
            document.removeEventListener("pointerup", handlePointerUp);
        };
    }, []);

    // Function to calculate the new values based on mouse position
    const calculateValues = (clientX: number, clientY: number) => {
        const container = containerRef.current;
        if (container !== null) {
            const rect = container.getBoundingClientRect();
            // Calculate the percentage of the mouse position relative to the container
            const x = ((clientX - rect.left) / rect.width) * 100;
            const y = ((clientY - rect.top) / rect.height) * 100;

            // Make sure the values are within the bounds of the container
            // 0% is the left/top edge, 100% is the right/bottom edge
            const cappedX = Math.min(100, Math.max(0, x));
            const cappedY = Math.min(100, Math.max(0, y));

            // console.log("calculateValues", cappedX, cappedY);
            setValues(cappedX, cappedY);
        }
    };

    // Function to set the new values in the parent component
    const setValues = (x: number, y: number) => {
        // console.log("setValues", x, y);
        //this is a bit hacky, but it works
        //we need to create a fake event object to pass to the onChange function
        const pseudoElement = {
            value: [x, y],
            name: rule.name,
            type: "axis",
        };

        onChange({
            target: pseudoElement,
        } as unknown as React.ChangeEvent<HTMLInputElement>);
    };

    // Event handlers for mouse events _______________________________________________________
    const handlePointerMove = (moveEvent: PointerEvent) => {
        // console.log("mouseMove", moveEvent.clientX, moveEvent.clientY);

        calculateValues(moveEvent.clientX, moveEvent.clientY);
    };

    const handlePointerUp = () => {
        // console.log("mouseUp");
        setDragging(false);
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerleave", handlePointerLeave);
        document.removeEventListener("pointerup", handlePointerUp);
    };

    const handlePointerLeave = () => {
        if (dragging) {
            handlePointerUp();
        }
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        console.log("mouseDown", e);
        e.preventDefault();
        calculateValues(e.clientX, e.clientY);
        setDragging(true);

        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
        document.addEventListener("pointerleave", handlePointerLeave);
    };

    return (
        <div
            className="relative w-full h-44 bg-zinc-800 rounded-md"
            style={{ padding: `${height / 2}px` }}
        >
            <div
                ref={containerRef}
                className="relative w-full h-full bg-zinc-800 rounded-md"
                onPointerDown={handlePointerDown}
                style={{ touchAction: "none" }}
            >
                <hr className="relative top-1/2 border-zinc-600" />
                <div className="relative h-full w-1 border-l border-l-zinc-600 left-1/2"></div>
                <span className="absolute top-0 pb-2 left-1/2 -translate-x-1/2 text-zinc-500 bg-zinc-800 text-xs">
                    {rule.range[0][1]}
                </span>
                <span className="absolute bottom-0 pt-2 left-1/2 -translate-x-1/2 text-zinc-500 bg-zinc-800 text-xs">
                    {rule.range[0][0]}
                </span>
                <span className="absolute pr-2 top-1/2 -translate-y-1/2  text-zinc-500 bg-zinc-800 text-xs">
                    {rule.range[1][1]}
                </span>
                <span className="absolute right-0 pl-2 top-1/2 translate-x-1/1 -translate-y-1/2  text-zinc-500 bg-zinc-800 text-xs">
                    {rule.range[1][0]}
                </span>
                <div
                    className={`customThumb ${
                        dragging ? "!border-zinc-600" : "!border-zinc-200"
                    }`}
                    style={{
                        position: "absolute",
                        height: `${height}px`,
                        width: `${height}px`,
                        left: `${rule.value[0]}%`,
                        top: `${rule.value[1]}%`,
                        transform: "translate(-50%, -50%)",
                    }}
                />
            </div>{" "}
        </div>
    );
};

export default TwoAxisSlider;
