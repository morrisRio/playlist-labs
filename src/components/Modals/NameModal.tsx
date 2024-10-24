import { useEffect, useRef, useState } from "react";
import UniModal from "@/components/Modals/UniModal";
import { useInputKeyboard } from "@/lib/hooks/useInputKeyboard";

interface NameModalProps {
    name: string;
    initialName: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClose: () => void;
    triggerTimestamp?: number;
}

function NameModal({ name, onClose, onChange, initialName, triggerTimestamp }: NameModalProps) {
    const inputElement = useRef<HTMLInputElement>(null);
    const [newName, setNewName] = useState(name);

    const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewName(e.target.value);
    };

    const saveName = () => {
        if (inputElement.current === null) return;
        onChange({
            target: inputElement.current,
        } as React.ChangeEvent<HTMLInputElement>);
        onClose();
    };

    useEffect(() => {
        if (triggerTimestamp && inputElement.current) {
            setFocus();
            setTimeout(() => {
                setFocus();
            }, 50);
        }
    }, [triggerTimestamp]);

    const setFocus = () => {
        inputElement.current?.focus();
    };

    useInputKeyboard({
        inputRef: inputElement,
        onEnter: saveName,
        onEscape: onClose,
    });

    return (
        <UniModal
            position="top"
            title="Give Your Playlist a Name"
            onClose={onClose}
            action={saveName}
            actionTitle={initialName === name ? "Done" : "Rename"}
            bodyFullSize={true}
        >
            <input
                autoFocus
                ref={inputElement}
                type="text"
                name="name"
                value={newName}
                onChange={onChangeName}
                onFocus={(e) => e.target.select()}
                placeholder="Playlist Name"
                className="p-3 px-6 w-full bg-ui-850 focus:outline-none placeholder-ui-600 text-lg text-ui-400 -mb-3 border border-ui-700 border-x-0 rounded-none"
            />
        </UniModal>
    );
}

export default NameModal;
