import { MdRemoveCircleOutline, MdAddCircleOutline } from "react-icons/md";
import SeedModal from "./SeedModal";
import { SeedEntry } from "./Seed";
import { useState } from "react";
import { Seed } from "@/types/spotify";

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
        <div>
            <div className="border border-zinc-800 rounded-md p-4 bg-zinc-800/30 backdrop-blur-md mt-8">
                {/* <hr className="border-zinc-500 -mx-4 my-8" /> */}
                <div className="flex mb-4 gap-4">
                    <h3>Seeds</h3>
                    <p className="text-zinc-500 text-sm self-end">
                        {seeds?.length} /5 used
                    </p>
                </div>
                {seeds.map((seed, index) => (
                    <SeedEntry
                        seedObj={seed}
                        onRemove={onRemove}
                        key={seed.id}
                        small={true}
                        added={true}
                    />
                ))}
                <button
                    className="w-full flex items-center justify-center gap-2 mt-2"
                    onClick={openModal}
                >
                    <MdAddCircleOutline size="1.5em" /> <h4>Add Seed</h4>
                </button>
            </div>
            {showModal && (
                <SeedModal
                    onAdd={onAdd}
                    onRemove={onRemove}
                    onClose={closeModal}
                    seeds={seeds}
                />
            )}
        </div>
    );
}
