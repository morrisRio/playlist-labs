"use client";
import { MdModeEdit, MdMoreVert } from "react-icons/md";
import NameModal from "./NameModal";
import GradientModal from "../GradientModal";
import { useState, useEffect } from "react";

interface PlaylistHeaderProps {
    playlist_id: string | false;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
    hue: number | false;
    coverUrl: string | false;
}

function PlaylistHeader({ playlist_id, onChange, name, hue, coverUrl }: PlaylistHeaderProps) {
    const [showNameModal, setShowNameModal] = useState(playlist_id === false);
    const [showGradient, setShowGradient] = useState(false);

    let imgSource = "";

    let blackGradient = "linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.8) 100%)";

    if (!hue && coverUrl) {
        imgSource = `${blackGradient}, url(${coverUrl})`;
        console.log("Image source", imgSource);
    } else if (hue) {
        blackGradient = "linear-gradient(to bottom, rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0, 0.4) 100%)";
        imgSource = `${blackGradient}, radial-gradient(circle at 30% 30%, hsl(${
            (hue - 100) % 360
        } 100% 50% / 30%), hsl(${hue} 100% 50% / 10%)), linear-gradient(-20deg, hsl(${hue} 80% 50%), hsl(${
            (hue - 100) % 360
        } 80% 50%)) `;
    }
    console.log("Image source", imgSource);
    return (
        <div className="flex justify-between">
            <div
                className="flex flex-col justify-between w-full h-64 bg-ui-800 p-4 overflow-hidden relative bg-cover"
                style={{ backgroundImage: imgSource }}
            >
                <MdMoreVert className=" self-end" size="1.5em" onClick={() => setShowGradient(true)} />
                <div className="flex justify-between">
                    <h2>{name}</h2>
                    <MdModeEdit size="1.5em" onClick={() => setShowNameModal(true)} />
                </div>
                {showNameModal && <NameModal name={name} onClose={() => setShowNameModal(false)} onChange={onChange} />}
                {showGradient && <GradientModal onClose={() => setShowGradient(false)} onSave={onChange} />}
            </div>
        </div>
    );
}

export default PlaylistHeader;
