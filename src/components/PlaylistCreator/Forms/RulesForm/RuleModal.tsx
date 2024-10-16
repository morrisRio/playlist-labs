import { useEffect } from "react";

import { RuleEntry } from "./RuleEntry";

import { allRules } from "@/lib/spotifyConstants";
import { Rule } from "@/types/spotify";

import { MdOutlineArrowBackIos } from "react-icons/md";

interface RuleModalProps {
    onAdd: (rule: Rule) => void;
    onRemove: (id: string) => void;
    onClose: () => void;
    rules: Rule[];
}

function RuleModal({ onAdd, onRemove, onClose, rules }: RuleModalProps) {
    //note: possible rules imported from lib spotifyActions

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <div className="bg-ui-950 fixed h-screen w-full overflow-scroll top-0 left-0 p-4 z-50">
            <header className="flex items-center gap-2">
                <button onClick={onClose} type="button">
                    <MdOutlineArrowBackIos />
                </button>
                <h3>Add Rule</h3>
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
