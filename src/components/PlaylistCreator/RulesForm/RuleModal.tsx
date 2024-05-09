import React from "react";
import { Rule } from "@/types/spotify";
import { MdOutlineArrowBackIos } from "react-icons/md";
import { RuleEntry } from "./RuleEntry";
import { allRules } from "@/lib/spotifyConstants";

interface RuleModalProps {
    onAdd: (rule: Rule) => void;
    onRemove: (id: string) => void;
    onClose: () => void;
    rules: Rule[];
}

function RuleModal({ onAdd, onRemove, onClose, rules }: RuleModalProps) {
    //possible rules imported from lib spotifyActions
    return (
        <div className="absolute h-full w-full inset-0 p-4 bg-gradient">
            <header className="flex items-center gap-4">
                <button onClick={onClose} type="button">
                    <MdOutlineArrowBackIos size="2em" />
                </button>
                <h2>Add Rule</h2>
            </header>
            <div className="relative mt-8">
                {allRules.map(
                    (rule, index) =>
                        !rules.some((r) => r.name === rule.name) && (
                            <RuleEntry
                                rule={rule}
                                onRemove={onRemove}
                                onAdd={onAdd}
                                control={false}
                                key={index}
                                added={rules.some((r) => r.name === rule.name)}
                            ></RuleEntry>
                        )
                )}
            </div>
        </div>
    );
}

export default RuleModal;
