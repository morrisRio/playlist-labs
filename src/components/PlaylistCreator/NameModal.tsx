import { MdClose } from "react-icons/md";
import { useRef, useState } from "react";
import { on } from "events";
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
        <div className="fixed inset-0 w-full h-full p-4 flex bg-ui-950/80 z-50 md:items-center">
            <div className="w-full flex flex-col md:max-w-96 md:m-auto h-fit p-6 bg-ui-900 border-t border-ui-800 backdrop-blur-md rounded-xl">
                <h4 className="mb-4 text-zinc-300">Name your Playlist</h4>
                <input
                    autoFocus
                    ref={inputElement}
                    type="text"
                    name="name"
                    value={newName}
                    onChange={onChangeName}
                    placeholder="Playlist Name"
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
            </div>
        </div>
    );
}

export default InfoModal;
