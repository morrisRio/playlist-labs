import { useState, useRef } from "react";
import UniModal from "@/components/UniModal";
import { getCssHueGradient } from "@/lib/utils";

interface GradientModalProps {
    onSave: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClose: () => void;
}

const GradientModal = ({ onSave, onClose }: GradientModalProps) => {
    const [hue, setHue] = useState(180);

    const handleSave = async () => {
        //workarround to only change settings on save
        const pseudoElement = {
            value: hue,
            name: "hue",
        };
        onSave({ target: pseudoElement } as unknown as React.ChangeEvent<HTMLInputElement>);
        onClose();
    };

    return (
        <UniModal
            title="Customize Playlist Thumbnail"
            onClose={onClose}
            action={handleSave}
            actionTitle="Done"
            bodyFullSize={true}
        >
            <div
                className="w-full aspect-square mb-5"
                style={{
                    background: `${getCssHueGradient(hue)}`,
                }}
            />
            <div className="p-6">
                <label>Thumbnail Color </label>
                <input
                    type="range"
                    min="0"
                    max="360"
                    value={hue}
                    onChange={(e) => setHue(parseInt(e.target.value))}
                    className="noprogress"
                    style={{ background: `linear-gradient(in hsl longer hue 45deg, hsl(0 70 40) 0 0)` }}
                />
            </div>
        </UniModal>
    );
};

export default GradientModal;
