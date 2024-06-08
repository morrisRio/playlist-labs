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
            <div className="flex flex-col gap-5">
                <h3 className="text-zinc-300 mb-2">Give your Playlist a name</h3>
                <input
                    autoFocus
                    ref={inputElement}
                    type="text"
                    name="name"
                    value={newName}
                    onChange={onChangeName}
                    onFocus={(e) => e.target.select()}
                    placeholder="Playlist "
                    className="w-full p-3 bg-ui-800 rounded-lg focus:outline-none placeholder-ui-600 text-lg"
                />
                <div className="flex justify-between">
                    <button
                        onClick={onClose}
                        className="p2 min-w-32 bg-transparent text-b6b6b6 rounded-xl text-lg"
                        type="button"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={saveName}
                        className="p-2 min-w-32 border border-themetext-nerfed text-themetext text-lg rounded-md text-center"
                        type="button"
                    >
                        Rename
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default InfoModal;
