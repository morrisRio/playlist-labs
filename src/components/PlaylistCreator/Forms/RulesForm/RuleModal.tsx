import { useEffect } from "react";

import { RuleEntry } from "./RuleEntry";

import { allRules } from "@/lib/spotifyConstants";
import { Rule } from "@/types/spotify";

import { MdOutlineArrowBackIos } from "react-icons/md";

import { useEscapeKey } from "@/lib/hooks/useEscapeKey";

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

    useEscapeKey(onClose);

    return (
        <>
            <div
                className="bg-ui-800/30 fixed top-0 left-0 w-screen h-screen z-50 sm:backdrop-blur-[1px] sm:backdrop-brightness-75"
                onClick={onClose}
            ></div>
            <div
                className="bg-ui-950 fixed max-sm:h-screen p-4 overflow-hidden max-sm:w-full 
        top-0 max-sm:left-0 z-50 flex flex-col sm:w-[42rem] lg:w-[52rem] sm:-mx-16 
        sm:my-14 sm:rounded-2xl sm:max-h-[calc(100vh-3.5rem*2)] sm:border-ui-700 sm:border"
            >
                <header className="flex items-center gap-4">
                    <button onClick={onClose} type="button" className="p-3 -m-3">
                        <MdOutlineArrowBackIos />
                    </button>
                    <h3>Add Rule</h3>
                </header>
                <div className="relative mt-8 overflow-y-auto overflow-x-hidden h-auto">
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
        </>
    );
}

export default RuleModal;
