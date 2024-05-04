import { MdRemoveCircleOutline, MdAddCircleOutline } from "react-icons/md";
import SeedModal from "./SeedModal";
import { SeedEntry } from "./SeedEntry";
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
        <div className="rounded-xl p-4 bg-zinc-700/40">
            <div>
                {/* <hr className="border-zinc-500 -mx-4 my-8" /> */}
                <div className="flex mb-4 gap-4 justify-between">
                    <h3 className="font-semibold">Seeds</h3>
                    <p className="text-zinc-400 text-base self-end flex-grow">
                        {seeds?.length} /5 used
                    </p>
                    <button
                        className="flex items-center justify-center gap-2 self-end"
                        onClick={openModal}
                        type="button"
                    >
                        <MdAddCircleOutline
                            size="1.2em"
                            color="rgb(161 161 170)"
                        />{" "}
                        <h5 className="text-zinc-400">Add Seed</h5>
                    </button>
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
