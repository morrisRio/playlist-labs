import { MdRemoveCircleOutline, MdAddCircleOutline, MdInfoOutline } from "react-icons/md";
import { Rule } from "@/types/spotify";
import { useState } from "react";
import { TwoAxisSlider, AxisRule } from "./TwoAxis";
import InfoModal from "../InfoModal";

//TODO: Add numeric input for tempo

type RuleEntryProps = {
    rule: Rule;
    onRemove: (id: string) => void;
    onAdd: (rule: Rule) => void;
    control?: boolean;
    added?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => void;
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

    const ruleCard = control ? "mb-0 bg-zinc-950/60" : "mb-4 bg-zinc-700/40";
    const fontSize = control ? "text-base" : "text-base";
    const removeColor = control ? "white" : "lightgreen";

    const openModal = () => {
        setShowInfo(true);
    };

    const closeModal = () => {
        setShowInfo(false);
    };

    return (
        //it was the backdrop blur that was causing the issue
        <div className={`flex flex-col  p-5 rounded-xl ${ruleCard}`}>
            {showInfo && (
                <InfoModal title={`What is ${rule.name}?`} body={rule.description} onClose={closeModal}></InfoModal>
            )}
            <div className={`w-full flex items-center justify-between gap-4 ${control ? "mb-4" : "mb-0"}`}>
                {/* Info _____________________________________________________________________ */}
                <div className="flex-grow flex items-center gap-4">
                    <h4 className={fontSize}>{rule.name}</h4>
                    <MdInfoOutline size="1.2rem" color="rgb(113 113 122)" onClick={openModal}></MdInfoOutline>
                </div>
                {/* Toggles ___________________________________________________________________ */}
                {added && (
                    <button onClick={() => onRemove(rule.name)} type="button">
                        <MdRemoveCircleOutline size="1.2em" color={removeColor} />
                    </button>
                )}
                {!added && onAdd && (
                    <button onClick={() => onAdd(rule)} type="button">
                        <MdAddCircleOutline size="1.2em" />
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
                            <div className="flex justify-between mt-1">
                                <span className="text-zinc-500 text-sm">{rule.range[0]}</span>
                                <span className="text-zinc-500 text-sm">{rule.range[1]}</span>
                            </div>
                        </div>
                    ) : typeof rule.value === "boolean" ? (
                        <div className="relative flex justify-between bg-zinc-800 rounded-xl shadow-lg">
                            <div
                                className={`w-1/2 h-full bg-zinc-600 border-4 border-zinc-800 absolute rounded-xl transition-all duration-200 ${
                                    rule.value ? "left-0" : "left-1/2"
                                }`}
                            ></div>
                            <button
                                className="w-1/2 p-2 m-1 bg-transparent text-center rounded-md z-10"
                                name={rule.name}
                                value={"true"}
                                onClick={onChange}
                                disabled={rule.value}
                                type="button"
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
                        <TwoAxisSlider rule={rule as AxisRule} onChange={onChange}></TwoAxisSlider>
                    ) : (
                        <h3>Something went wrong</h3>
                    )}
                </div>
            )}
        </div>
    );
}
