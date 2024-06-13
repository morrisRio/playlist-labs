import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import UniModal from "@/components/UniModal";
import { color } from "html2canvas/dist/types/css/types/color";

interface GradientModalProps {
    onSave: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClose: () => void;
}

const GradientModal = ({ onSave, onClose }: GradientModalProps) => {
    const [color1, setColor1] = useState(180);
    const color1Ref = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        //workarround to only chnage settings on save
        const pseudoElement = {
            value: color1,
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
                    background: `radial-gradient(circle at 30% 30%, hsl(${
                        (color1 - 100) % 360
                    } 100% 50% / 30%), hsl(${color1} 100% 50% / 10%)), linear-gradient(-20deg, hsl(${color1} 80% 50%), hsl(${
                        (color1 - 100) % 360
                    } 80% 50%)) `,
                }}
            />
            <div className="p-6">
                <label>Color 1: </label>
                <input
                    type="range"
                    min="0"
                    max="360"
                    value={color1}
                    onChange={(e) => setColor1(parseInt(e.target.value))}
                    style={{ background: `linear-gradient(in hsl longer hue 45deg, hsl(0 70 40) 0 0)` }}
                />
            </div>
        </UniModal>
    );
};

export default GradientModal;
