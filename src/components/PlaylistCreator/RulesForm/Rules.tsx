import { useState } from "react";
import { MdAddCircleOutline } from "react-icons/md";
import { Rule } from "@/types/spotify";

import RuleModal from "./RuleModal";
import { RuleEntry } from "./RuleEntry";

interface RulesProps {
    rules: Rule[];
    onAdd: (rule: Rule) => void;
    onRemove: (id: string) => void;
    onChange: (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.MouseEvent<HTMLButtonElement>
    ) => void;
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

    return (
        <div className="flex flex-col rounded-xl p-4 bg-zinc-700/40 gap-5">
            <div className="flex justify-between items-end">
                <h3 className="font-semibold">Rules</h3>
                <button
                    className="flex items-center justify-center gap-2"
                    onClick={openModal}
                    type="button"
                >
                    <MdAddCircleOutline size="1.2em" color="rgb(161 161 170)" />
                    <h5 className="text-zinc-400 align-bottom">Add Rule</h5>
                </button>
            </div>
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
            {showModal && (
                <RuleModal
                    onAdd={handleRuleAdd}
                    onRemove={onRemove}
                    onClose={closeModal}
                    rules={rules}
                />
            )}
        </div>
    );
}

export default Rules;
