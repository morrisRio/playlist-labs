import { MdRemoveCircleOutline, MdAddCircleOutline } from "react-icons/md";
import Marquee from "react-fast-marquee";

export interface Seed {
    spotify: string;
    type: string;
    id: string;
    title: string;
    description: string;
    thumbnail: string;
}

type SeedEntryProps = {
    seedObj: Seed;
    index: number;
    onRemove?: (index: number) => void;
    onAdd?: (seed: Seed) => void;
    small?: boolean;
};

export function SeedEntry({
    seedObj,
    index,
    onRemove,
    onAdd,
    small = false,
}: SeedEntryProps): JSX.Element {
    const imgSize = small ? "size-10" : "w-16 h-16";
    const imgRound = seedObj.type === "artist" ? "rounded-full" : "rounded-md";
    const imgClass = `${imgSize} ${imgRound}`;

    const gapSize = small ? "mb-3" : "mb-6";
    const fontSize = small ? "text-base" : "text-lg";

    return (
        <div className={`flex gap-4 items-center justify-between ${gapSize}`}>
            {seedObj.thumbnail ? (
                <img
                    className={`${imgClass} flex-none object-cover`}
                    src={seedObj.thumbnail}
                    alt={seedObj.title}
                />
            ) : (
                <div className={`${imgClass} flex-none bg-zinc-800`}></div>
            )}
            <div className="flex-grow">
                <p className={fontSize}>{seedObj.title}</p>
                {!small ? (
                    <Marquee
                        play={seedObj.description.length > 60 ? true : false}
                        speed={30}
                    >
                        <p className={`text-zinc-500 ${fontSize}`}>
                            {seedObj.description}
                        </p>
                    </Marquee>
                ) : (
                    <p className="text-zinc-500">{seedObj.type}</p>
                )}
            </div>
            {onRemove && (
                <button className="justify-end" onClick={() => onRemove(index)}>
                    <MdRemoveCircleOutline size={small ? "1rem" : "2rem"} />
                </button>
            )}
            {onAdd && (
                <button className="justify-end" onClick={() => onAdd(seedObj)}>
                    <MdAddCircleOutline size={small ? "1rem" : "1.4rem"} />
                </button>
            )}
        </div>
    );
}

export default Seed;
