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
        <div className="p-4">
            <div className="flex mb-4 gap-4 justify-between">
                <h3>Seeds</h3>
                <p className="text-ui-600 text-base self-end flex-grow">{seeds?.length} /5 used</p>
                <button className="flex items-center justify-center gap-2 self-end" onClick={openModal} type="button">
                    <MdAddCircleOutline size="1.5em" color={interactColor} />{" "}
                    <h4 className="text-themetext/60">Add Seed</h4>
                </button>
            </div>
            {seeds.length == 0 ? (
                <div>
                    {/* TODO: UI make fancy */}
                    <p className="mx-auto my-8 text-ui-40000 text-base self-end flex-grow">Add at least one Seed</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {seeds.map((seed, index) => (
                        <SeedEntry seedObj={seed} onRemove={onRemove} key={seed.id} card={true} added={true} />
                    ))}
                </div>
            )}
            {showModal && <SeedModal onAdd={onAdd} onRemove={onRemove} onClose={closeModal} seeds={seeds} />}
        </div>
    );
}
