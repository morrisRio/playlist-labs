import { useState } from "react";
import { MdAddCircleOutline } from "react-icons/md";
import { Rule } from "@/types/spotify";

import RuleModal from "./RuleModal";
import { RuleEntry } from "./Rule";

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
        <div className="flex flex-col mt-8">
            <h3 className="mb-4">Rules</h3>
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
            <button
                className="flex items-center justify-center gap-2 mt-2"
                onClick={openModal}
            >
                <MdAddCircleOutline size="1.5em" /> <h4>Add Rule</h4>
            </button>
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
