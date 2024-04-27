import { MdRemoveCircleOutline, MdAddCircleOutline } from "react-icons/md";
import { Rule } from "@/types/spotify";
import { useState } from "react";
import { TwoAxisSlider, AxisRule } from "./TwoAxis";

type RuleEntryProps = {
    rule: Rule;
    onRemove: (id: string) => void;
    onAdd: (rule: Rule) => void;
    control?: boolean;
    added?: boolean;
    onChange?: (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.MouseEvent<HTMLButtonElement>
    ) => void;
};

export function RuleEntry({
    rule,
    onRemove,
    onAdd,
    control = false,
    added = false,
    onChange,
}: RuleEntryProps): JSX.Element {
    const [showInfo, setShowInfo] = useState(false);

    const gapSize = control ? "mb-4" : "mb-0";
    const fontSize = control ? "text-lg" : "text-base";
    const removeColor = control ? "white" : "lightgreen";

    return (
        <div
            className={`flex flex-col border border-zinc-800 rounded-md p-4 bg-zinc-800/30 backdrop-blur-md mb-4`}
        >
            <div
                className={`w-full flex items-center justify-between gap-4 ${gapSize}`}
            >
                {/* Info _____________________________________________________________________ */}
                <div className="flex-grow">
                    <p className={fontSize}>{rule.name}</p>
                    {/* {showInfo && (
                        <p className={`text-zinc-400 ${fontSize}`}>
                            {rule.description}
                        </p>
                    )} */}
                </div>
                {/* Toggles ___________________________________________________________________ */}
                {added && (
                    <button onClick={() => onRemove(rule.name)}>
                        <MdRemoveCircleOutline
                            size="1.5em"
                            color={removeColor}
                        />
                    </button>
                )}
                {!added && onAdd && (
                    <button onClick={() => onAdd(rule)}>
                        <MdAddCircleOutline size="1.5em" />
                    </button>
                )}
            </div>
            {control && onChange && (
                <div>
                    {rule.type === "range" && typeof rule.value === "number" ? (
                        <div className="w-full">
                            <input
                                type="range"
                                name={rule.name}
                                min={0}
                                max={100}
                                value={rule.value}
                                onChange={onChange}
                            />
                        </div>
                    ) : typeof rule.value === "boolean" ? (
                        <div className="relative flex justify-between bg-zinc-800 rounded-md shadow-lg">
                            <div
                                className={`w-1/2 h-full bg-zinc-600 border-4 border-zinc-800 absolute rounded-md transition-all duration-200 ${
                                    rule.value ? "left-0" : "left-1/2"
                                }`}
                            ></div>
                            <button
                                className="w-1/2 p-2 m-1 bg-transparent text-center rounded-md z-10"
                                name={rule.name}
                                value={"true"}
                                onClick={onChange}
                                disabled={rule.value}
                            >
                                {rule.range[0]}
                            </button>
                            <button
                                className="w-1/2 p-2 m-1 bg-transparent text-center rounded-md z-10"
                                type="button"
                                name={rule.name}
                                value={"false"}
                                onClick={onChange}
                                disabled={!rule.value}
                            >
                                {rule.range[1]}
                            </button>
                        </div>
                    ) : Array.isArray(rule.value) && rule.value.length === 2 ? (
                        <TwoAxisSlider
                            rule={rule as AxisRule}
                            onChange={onChange}
                        ></TwoAxisSlider>
                    ) : (
                        <h2>Something went wrong</h2>
                    )}
                </div>
            )}
        </div>
    );
}
