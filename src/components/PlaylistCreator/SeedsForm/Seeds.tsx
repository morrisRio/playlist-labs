import { useState } from "react";
import { MdRemoveCircleOutline, MdAddCircleOutline } from "react-icons/md";

import { Seed } from "@/types/spotify";
import SeedModal from "./SeedModal";
import { SeedEntry } from "./SeedEntry";

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
    return (
        <div className="px-4">
            <div className="flex mb-6 gap-4 justify-between items-center">
                <div className="flex flex-grow items-end gap-3">
                    <h3>Seeds</h3>
                    <p className="text-ui-600 text-base flex-grow">{seeds?.length} /5 used</p>
                </div>
                <button
                    className="p-1 px-2 rounded-lg flex items-center justify-center gap-2 text-themetext border border-ui-700 bg-ui-850 text-base"
                    onClick={openModal}
                    type="button"
                >
                    <MdAddCircleOutline />
                    Add Seed
                </button>
            </div>
            {seeds.length == 0 ? (
                <div
                    onClick={openModal}
                    className="flex flex-col rounded-lg bg-ui-850 justify-between items-center p-6 "
                >
                    <p className="mx-auto text-themetext/30 text-center self-center text-base">
                        Add up to 5 Tracks, Artists or Genres as a foundation for your Playlist
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-4 mb-4">
                    {seeds.map((seed) => (
                        <SeedEntry seedObj={seed} onRemove={onRemove} key={seed.id} card={true} added={true} />
                    ))}
                </div>
            )}
            {showModal && <SeedModal onAdd={onAdd} onRemove={onRemove} onClose={closeModal} seeds={seeds} />}
        </div>
    );
}
