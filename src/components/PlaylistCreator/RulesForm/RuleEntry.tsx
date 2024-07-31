import { MdRemoveCircleOutline, MdAddCircleOutline, MdInfoOutline } from "react-icons/md";
import { Rule } from "@/types/spotify";
import { useState } from "react";
import { TwoAxisSlider } from "./TwoAxis";
import UniModal from "../../UniModal";

import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@/../tailwind.config";

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

    const ruleCard = control ? "bg-ui-900" : "mb-4 bg-zinc-700/40";
    const fontSize = "text-base";
    const nameConatiner = control ? "border border-b-0 rounded-t-lg" : "border rounded-lg";

    const fullConfig = resolveConfig(tailwindConfig);
    //@ts-expect-error
    const interactColor = fullConfig.theme.colors.themetext["DEFAULT"] + "a8"; //a8 is 65% opacity
    //@ts-expect-error
    const infoColor = fullConfig.theme.colors.ui[600]; //a8 is 65% opacity

    const openModal = () => {
        setShowInfo(true);
    };

    const closeModal = () => {
        setShowInfo(false);
    };

    return (
        //it was the backdrop blur that was causing the issue
        <div className={`flex flex-col ${ruleCard} overflow-hidden`}>
            {showInfo && (
                <UniModal title={`Control the ${rule.name}`} onClose={closeModal} closeTitle="Got it" position="center">
                    <p>{rule.description}</p>
                </UniModal>
            )}
            <div
                className={`w-full flex items-center justify-between gap-4 bg-ui-900
                  border-ui-700 p-5 ${nameConatiner} shadow-md shadow-neutral-950/30 z-10`}
            >
                {/* Info _____________________________________________________________________ */}
                <div className="flex-grow flex items-center gap-4">
                    <h4 className={fontSize}>{rule.name}</h4>
                    <MdInfoOutline size="1.2rem" color={infoColor} onClick={openModal}></MdInfoOutline>
                    {rule.type === "range" && rule.name === "Tempo" && control && onChange && (
                        <>
                            <input
                                type="number"
                                className="text-sm hide-arrows p-2 rounded-lg border border-ui-700 bg-ui-850 max-w-12  text-ui-500"
                                name="amount"
                                value={rule.value}
                                min="40"
                                max="250"
                                disabled={true}
                            />
                            <p className="text-ui-600 -m-2">BPM</p>
                        </>
                    )}
                </div>
                {/* Toggles ___________________________________________________________________ */}
                {added && (
                    <button onClick={() => onRemove(rule.name)} type="button">
                        <MdRemoveCircleOutline size="1.5em" color={interactColor} />
                    </button>
                )}
                {!added && onAdd && (
                    <button onClick={() => onAdd(rule)} type="button">
                        <MdAddCircleOutline size="1.5em" color={interactColor} />
                    </button>
                )}
            </div>
            {/* Controls ___________________________________________________________________ */}
            {control && onChange && (
                <div>
                    {{
                        range: rule.type === "range" && (
                            <div className="w-full relative">
                                <input
                                    className="rule-slider"
                                    type="range"
                                    name={rule.name}
                                    min={rule.name === "Tempo" && typeof rule.range[0] === "number" ? rule.range[0] : 0}
                                    max={
                                        rule.name === "Tempo" && typeof rule.range[1] === "number" ? rule.range[1] : 100
                                    }
                                    value={rule.value}
                                    onChange={onChange}
                                />
                                <div className="absolute p-3 top-2 w-full flex justify-between pointer-events-none">
                                    <span className="text-invertme mix-blend-difference text-sm">{rule.range[0]}</span>
                                    <span className="text-invertme mix-blend-difference text-sm">{rule.range[1]}</span>
                                </div>
                            </div>
                        ),
                        boolean: rule.type === "boolean" && (
                            <div className="h-16 relative flex justify-between bg-ui-800 rounded-b-lg">
                                <div
                                    className={`mx-4 -top-2 bottom-3 bg-ui-500 absolute rounded-b-lg transition-all duration-200 ${
                                        rule.value ? "left-1/2 right-0" : "left-0 right-1/2"
                                    }`}
                                ></div>
                                <button
                                    className="relative -top-1 w-1/2 p-3 m-1 bg-transparent text-center rounded-lg z-10 text-invertme mix-blend-difference"
                                    name={rule.name}
                                    value={"false"}
                                    onClick={onChange}
                                    disabled={!rule.value}
                                    type="button"
                                >
                                    {rule.range[0]}
                                </button>
                                <button
                                    className="relative -top-1 w-1/2 p-3 m-1  bg-transparent text-center rounded-lg z-10 text-invertme mix-blend-difference"
                                    type="button"
                                    name={rule.name}
                                    value={"true"}
                                    onClick={onChange}
                                    disabled={rule.value}
                                >
                                    {rule.range[1]}
                                </button>
                            </div>
                        ),
                        axis: rule.type === "axis" && <TwoAxisSlider rule={rule} onChange={onChange}></TwoAxisSlider>,
                    }[rule.type] || <h3>Something went wrong</h3>}
                </div>
            )}
        </div>
    );
}
