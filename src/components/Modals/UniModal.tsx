"use client";

interface UniModalProps {
    title: string;
    onClose: () => void;
    closeTitle?: string;
    action?: (() => void) | false;
    actionTitle?: string;
    actionDanger?: boolean;
    children: React.ReactNode;
    position?: "top" | "center" | "bottom";
    bodyFullSize?: boolean;
}

function UniModal({
    title,
    closeTitle = "Cancel",
    onClose,
    action = false,
    actionTitle = "Accept",
    actionDanger = false,
    children,
    position = "center",
    bodyFullSize = false,
}: UniModalProps) {
    const positionClasses = {
        top: "items-start",
        center: "items-center",
        bottom: "items-end",
    };
    const triggerClose = (e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault;
        onClose();
    };

    const triggerAction = (e: React.PointerEvent) => {
        if (!action) return;
        e.stopPropagation();
        e.preventDefault;
        action();
    };

    return (
        <div
            className={`${positionClasses[position]} fixed inset-0 w-full h-screen p-6 flex justify-center bg-ui-950/40 backdrop-brightness-50 backdrop-saturate-50 z-40`}
            onPointerDown={(e) => triggerClose(e)}
        >
            <div
                className={`w-full max-w-[450px] md:m-auto h-fit px-6 py-5 bg-ui-900 border border-ui-700 rounded-xl z-50`}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <h4 className="text-themetext mb-5 w-full font-medium">{title}</h4>
                <div className={`text-ui-600 text-base mb-8 ${bodyFullSize && "-mx-6"}`}>{children}</div>
                <div className={`w-full flex items-center ${action ? "justify-between" : "justify-around"}`}>
                    <button
                        type="button"
                        className={`p-2 px-8 min-w-32 text-ui-600 text-base rounded-lg text-center ${
                            action && !actionDanger ? "" : "bg-ui-900 border border-ui-700"
                        }`}
                        onPointerDown={(e) => triggerClose(e)}
                    >
                        {closeTitle}
                    </button>
                    {action && (
                        <button
                            type="button"
                            className={`p-2 px-8 min-w-32 bg-ui-900 border border-ui-700 text-base rounded-lg text-center ${
                                actionDanger ? "border-red-800 text-red-800" : "text-themetext"
                            }`}
                            onPointerDown={(e) => triggerAction(e)}
                        >
                            {actionTitle}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UniModal;
