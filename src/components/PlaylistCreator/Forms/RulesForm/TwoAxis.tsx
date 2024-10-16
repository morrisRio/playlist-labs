import { useState, useEffect, useRef } from "react";

import { AxisRule } from "@/types/spotify";

interface TwoAxisSliderProps {
    rule: AxisRule;
    onChange: (e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => void;
}

export const TwoAxisSlider = ({ rule, onChange }: TwoAxisSliderProps): any => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [dragging, setDragging] = useState(false);

    const height = 20;

    // Event handlers for mouse events _______________________________________________________
    useEffect(() => {
        if (!containerRef.current) return;

        // Function to calculate the new values based on mouse position and set the state in parent component
        const setValues = (clientX: number, clientY: number) => {
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

                //this is a bit hacky, but it works
                //we need to create a fake event object to pass to the onChange function

                const pseudoElement = {
                    value: [cappedX, cappedY],
                    name: rule.name,
                    type: "axis",
                };

                onChange({
                    target: pseudoElement,
                } as unknown as React.ChangeEvent<HTMLInputElement>);
            }
        };

        const handlePointerMove = (moveEvent: PointerEvent) => {
            setValues(moveEvent.clientX, moveEvent.clientY);
        };

        const handlePointerLeave = () => {
            handlePointerUp();
        };

        const handlePointerUp = () => {
            setDragging(false);
            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerleave", handlePointerLeave);
            document.removeEventListener("pointerup", handlePointerUp);
        };

        const handlePointerDown = (event: PointerEvent) => {
            event.preventDefault();
            setValues(event.clientX, event.clientY);
            setDragging(true);

            document.addEventListener("pointermove", handlePointerMove);
            document.addEventListener("pointerup", handlePointerUp);
            document.addEventListener("pointerleave", handlePointerLeave);
        };

        const container = containerRef.current;

        container.addEventListener("pointerdown", handlePointerDown);

        return () => {
            document.removeEventListener("pointermove", handlePointerLeave);
            document.removeEventListener("pointerleave", handlePointerMove);
            document.removeEventListener("pointerup", handlePointerUp);
        };
    }, [onChange, rule.name]);

    return (
        <div className="relative w-full h-44 bg-ui-800 rounded-b-lg" style={{ padding: `${height / 2}px` }}>
            <div
                ref={containerRef}
                className="relative w-full h-full bg-ui-800 rounded-b-lg"
                style={{ touchAction: "none" }}
            >
                <hr className="relative top-1/2 border-invertme/60 mix-blend-difference" />
                <div className="relative h-5/6 left-1/2 w-1 border-l border-invertme/60 mix-blend-difference "></div>
                <span className="absolute top-0 pb-2 left-1/2 -translate-x-1/2 bg-ui-800">
                    <p className="text-invertme mix-blend-difference text-xs">{rule.range[0][1]}</p>
                </span>
                <span className="absolute bottom-0 pt-2 left-1/2 -translate-x-1/2 bg-ui-800">
                    <p className="text-invertme mix-blend-difference text-xs">{rule.range[0][0]}</p>
                </span>
                <span className="absolute pr-2 top-1/2 -translate-y-1/2  text-zinc-500 bg-ui-800 text-xs">
                    <p className="text-invertme mix-blend-difference text-xs">{rule.range[1][1]}</p>
                </span>
                <span className="absolute right-0 pl-2 top-1/2 translate-x-1/1 -translate-y-1/2 bg-ui-800 text-xs">
                    <p className="text-invertme mix-blend-difference text-xs">{rule.range[1][0]}</p>
                </span>
                <div
                    className={`rounded-full border-2  ${dragging ? "!border-ui-600" : "!border-themetext-nerfed"}`}
                    style={{
                        position: "absolute",
                        height: `${height * (dragging ? 2 : 1)}px`,
                        width: `${height * (dragging ? 2 : 1)}px`,
                        left: `${rule.value[0]}%`,
                        top: `${rule.value[1]}%`,
                        transform: "translate(-50%, -50%)",
                    }}
                />
            </div>
        </div>
    );
};

export default TwoAxisSlider;
