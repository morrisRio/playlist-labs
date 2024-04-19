import { MdRemoveCircleOutline, MdAddCircleOutline } from "react-icons/md";
import SeedModal from "./SeedModal";
import { SeedEntry, Seed } from "./Seed";
import { useState, Fragment } from "react";

interface SeedsProps {
    seeds: Seed[];
    onRemove: (index: number) => void;
    onAdd: (seed: Seed) => void;
}

export default function Seeds({ seeds, onRemove, onAdd }: SeedsProps) {
    const [showModal, setShowModal] = useState(false);
    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);
    return (
        <div className="flex flex-col">
            {seeds.map((seed, index) => (
                <SeedEntry
                    seedObj={seed}
                    index={index}
                    onRemove={onRemove}
                    key={seed.id}
                    small={true}
                />
            ))}
            <button
                className="flex items-center justify-center gap-2"
                onClick={openModal}
            >
                <MdAddCircleOutline /> <h4>Add Seed</h4>
            </button>
            {showModal && (
                <SeedModal onAdd={onAdd} onClose={closeModal} seeds={seeds} />
            )}
        </div>
    );
}
