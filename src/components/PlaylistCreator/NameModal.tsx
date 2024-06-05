import { useRef, useState } from "react";
import Modal from "@/components/Modal";

interface NameModalProps {
    name: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClose: () => void;
}

function InfoModal({ name, onClose, onChange }: NameModalProps) {
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

    return (
        <Modal position="top">
            <h4 className="mb-4 text-zinc-300">How should we name your Playlist?</h4>
            <input
                autoFocus
                ref={inputElement}
                type="text"
                name="name"
                value={newName}
                onChange={onChangeName}
                placeholder="playlist-name"
                className="w-full pb-2 bg-transparent border-b border-b-zinc-500 focus:outline-none focus:border-b-white placeholder-zinc-500 text-lg"
            />
            <div className="flex justify-between mt-8">
                <button
                    onClick={onClose}
                    className="p2 min-w-32 bg-transparent border border-white text-white rounded-xl font-semibold"
                    type="button"
                >
                    Cancel
                </button>
                <button
                    onClick={saveName}
                    className="p-2 min-w-32 bg-white text-zinc-950 rounded-xl text-center font-semibold"
                    type="button"
                >
                    Save
                </button>
            </div>
        </Modal>
    );
}

export default InfoModal;
