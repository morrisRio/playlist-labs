import { MdClose } from "react-icons/md";
interface InfoModalProps {
    title: string;
    body: string;
    onClose: () => void;
}

function InfoModal({ title, body, onClose }: InfoModalProps) {
    return (
        <div
            className="fixed inset-0 w-full h-full p-4 flex bg-zinc-950/80 z-50 items-end md:items-center"
            onPointerDown={onClose}
        >
            <div className="w-full md:max-w-96 md:m-auto sm:min-h-64 p-6 bg-zinc-800/40 backdrop-blur-md rounded-xl">
                <div className="flex justify-between">
                    <h4 className="mb-4 text-zinc-300">{title}</h4>
                    <button className="self-start" type="button">
                        <MdClose size="1.5em" onClick={onClose}></MdClose>
                    </button>
                </div>
                <p className="mb-4 text-zinc-300 text-sm">{body}</p>
            </div>
        </div>
    );
}

export default InfoModal;
