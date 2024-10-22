import { useEffect, useRef, useState } from "react";
import UniModal from "@/components/Modals/UniModal";

interface NameModalProps {
    name: string;
    initialName: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClose: () => void;
}

function NameModal({ name, onClose, onChange, initialName }: NameModalProps) {
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

    //TODO: fix autofocus
    // const [feedback, setFeedback] = useState(false);

    // useEffect(() => {
    //     setTimeout(setFocus, 1000);
    // }, []);

    //this doesnt work because of browser being cautious of automated actions, would need to be triggered by userEvent.

    //need input ref before clicking on shownamemodal
    // const setFocus = () => {
    //     inputElement.current?.focus();
    //     setFeedback(true);
    // };

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
            {/* <button className="mt-10 p-4" onClick={setFocus}>
                focus
            </button> */}
            {/* {feedback && <p className="text-red-500">Name cannot be empty</p>} */}
        </UniModal>
    );
}

export default NameModal;
