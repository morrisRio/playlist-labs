import { MdClose } from "react-icons/md";
import Modal from "@/components/Modal";

interface InfoModalProps {
    title: string;
    body: string;
    onClose: () => void;
}

function InfoModal({ title, body, onClose }: InfoModalProps) {
    return (
        <Modal onModalBlur={onClose}>
            <div className="flex justify-between">
                <h4 className="mb-4 text-zinc-300">{title}</h4>
                <button className="self-start" type="button">
                    <MdClose size="1.5em" onClick={onClose}></MdClose>
                </button>
            </div>
            <p className="mb-4 text-zinc-300 text-sm">{body}</p>
        </Modal>
    );
}

export default InfoModal;
