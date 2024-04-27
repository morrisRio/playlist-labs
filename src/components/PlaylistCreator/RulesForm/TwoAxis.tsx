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

    useEffect(() => {
        // Clean up the event listeners when component unmounts
        return () => {
            // console.log("cleanup");
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
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
    const handleMouseMove = (moveEvent: MouseEvent) => {
        // console.log("mouseMove", moveEvent.clientX, moveEvent.clientY);

        calculateValues(moveEvent.clientX, moveEvent.clientY);
    };

    const handleMouseUp = () => {
        // console.log("mouseUp");
        setDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        // console.log("mouseDown", e);
        e.preventDefault();
        calculateValues(e.clientX, e.clientY);
        setDragging(true);

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-44 bg-zinc-800 rounded-md"
            onMouseDown={handleMouseDown}
        >
            <div
                style={{
                    position: "absolute",
                    left: `${rule.value[0]}%`,
                    top: `${rule.value[1]}%`,
                    transform: "translate(-50%, -50%)",
                    width: "20px",
                    height: "20px",
                    background: "blue",
                    borderRadius: "50%",
                }}
            />
        </div>
    );
};

export default TwoAxisSlider;