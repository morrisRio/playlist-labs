import { useState } from "react";
import { MdAddCircleOutline } from "react-icons/md";

import { Rule } from "@/types/spotify";
import RuleModal from "./RuleModal";
import { RuleEntry } from "./RuleEntry";

import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@/../tailwind.config";

interface RulesProps {
    rules: Rule[];
    onAdd: (rule: Rule) => void;
    onRemove: (id: string) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => void;
}

function Rules({ rules, onAdd, onRemove, onChange }: RulesProps) {
    const [showModal, setShowModal] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);

    const openModal = () => {
        setScrollPosition(window.scrollY);
        window.scrollTo(0, 0);
        setShowModal(true);
    };

    const closeModal = () => {
        window.scrollTo(0, scrollPosition);
        setShowModal(false);
    };

    const handleRuleAdd = (rule: Rule) => {
        onAdd(rule);
        closeModal();
    };

    const fullConfig = resolveConfig(tailwindConfig);
    //@ts-expect-error
    const interactColor = fullConfig.theme.colors.themetext["DEFAULT"] + "a8"; //a8 is 65% opacity
    return (
        <div className="px-4">
            <div className="flex mb-8 gap-4 justify-between">
                <h3>Rules</h3>
                <button className="flex items-center justify-center gap-2 self-end" onClick={openModal} type="button">
                    <MdAddCircleOutline size="1.5em" color={interactColor} />
                    <h4 className="text-themetext/60">Add Rule</h4>
                </button>
            </div>
            {rules.length == 0 ? (
                <div>
                    <p className="text-zinc-400 text-base self-end flex-grow">Add at least one Rule</p>
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    {rules.map((rule, index) => (
                        <RuleEntry
                            rule={rule}
                            onRemove={onRemove}
                            onAdd={onAdd}
                            key={index}
                            control={true}
                            added={true}
                            onChange={onChange}
                        />
                    ))}
                </div>
            )}
            {showModal && <RuleModal onAdd={handleRuleAdd} onRemove={onRemove} onClose={closeModal} rules={rules} />}
        </div>
    );
}

export default Rules;
