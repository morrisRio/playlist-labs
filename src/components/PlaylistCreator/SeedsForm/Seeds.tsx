import { useState } from "react";
import { MdRemoveCircleOutline, MdAddCircleOutline } from "react-icons/md";

import { Seed } from "@/types/spotify";
import SeedModal from "./SeedModal";
import { SeedEntry } from "./SeedEntry";

import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@/../tailwind.config";

interface SeedsProps {
    seeds: Seed[];
    onRemove: (id: string) => void;
    onAdd: (seed: Seed) => void;
}

export default function Seeds({ seeds, onRemove, onAdd }: SeedsProps) {
    const [showModal, setShowModal] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);

    const openModal = () => {
        setScrollPosition(window.scrollY);
        window.scrollTo(0, 0);
        setShowModal(true);
    };

    const closeModal = () => {
        window.scrollTo(0, scrollPosition);
        setShowModal(false);
    };

    const fullConfig = resolveConfig(tailwindConfig);
    //@ts-expect-error
    const interactColor = fullConfig.theme.colors.themetext["DEFAULT"] + "a8"; //a8 is 65% opacity
    return (
        <div className="px-4">
            <div className="flex mb-8 gap-4 justify-between">
                <h3>Seeds</h3>
                <p className="text-ui-600 text-base self-end flex-grow">{seeds?.length} /5 used</p>
                <button className="flex items-center justify-center gap-2 self-end" onClick={openModal} type="button">
                    <MdAddCircleOutline size="1.5em" color={interactColor} /> <h4 className="text-b6b6b6">Add Seed</h4>
                </button>
            </div>
            {seeds.length == 0 ? (
                <div
                    onClick={openModal}
                    className="flex flex-col rounded-md bg-ui-950 justify-between items-center p-4 py-2"
                >
                    <p className="mx-auto text-b6b6b6 text-center self-center text-lg">
                        Add at least one Seed to get started
                    </p>
                    <p className="mx-auto text-themetext/30 text-center self-center text-lg">
                        Choose up to 5 Tracks, Artists or Genres as a foundation for your playlist
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-5 mb-4">
                    {seeds.map((seed) => (
                        <SeedEntry seedObj={seed} onRemove={onRemove} key={seed.id} card={true} added={true} />
                    ))}
                </div>
            )}
            {showModal && <SeedModal onAdd={onAdd} onRemove={onRemove} onClose={closeModal} seeds={seeds} />}
        </div>
    );
}
