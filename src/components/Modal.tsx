type ModalProps = {
    children: React.ReactNode;
    onModalBlur?: (() => void) | false;
    position?: "top" | "center" | "bottom";
};

function Modal({ onModalBlur = false, position = "center", children }: ModalProps) {
    const positionClasses = {
        top: "items-start",
        center: "items-center",
        bottom: "items-end",
    };

    return (
        <div
            className={`fixed inset-0 w-full h-full p-6 flex justify-center bg-ui-950/80 z-50 ${positionClasses[position]}`}
            onPointerDown={onModalBlur ? onModalBlur : undefined}
        >
            <div className="w-full flex flex-col md:max-w-96 md:m-auto h-fit p-6 bg-ui-900 border border-ui-800 backdrop-blur-md rounded-xl">
                {children}
            </div>
        </div>
    );
}

export default Modal;
