import { useState } from "react";
import { MdAddCircleOutline } from "react-icons/md";

import { Rule } from "@/types/spotify";
import RuleModal from "./RuleModal";
import { RuleEntry } from "./RuleEntry";

interface RulesProps {
    rules: Rule[];
    onAdd: (rule: Rule) => void;
    onRemove: (id: string) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => void;
}

function Rules({ rules, onAdd, onRemove, onChange }: RulesProps) {
    const [showModal, setShowModal] = useState(false);

    const openModal = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleRuleAdd = (rule: Rule) => {
        onAdd(rule);
        closeModal();
    };

    return (
        <div className="px-4 mb-16">
            <div className="flex mb-6 justify-between">
                <h3>Tuning</h3>
                <button
                    className="p-1 px-2 rounded-lg flex items-center justify-center gap-2 text-themetext border border-ui-700 bg-ui-900 text-base"
                    onClick={openModal}
                    type="button"
                >
                    <MdAddCircleOutline />
                    Add Rule
                </button>
            </div>
            {rules.length == 0 ? (
                <div
                    onClick={openModal}
                    className="flex rounded-lg bg-ui-900 text-ui-600 border border-ui-800 justify-between items-center p-6"
                >
                    <p className="mx-auto text-center self-center text-base">Fine tune your Playlist by adding rules</p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
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
