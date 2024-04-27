import { MdRemoveCircleOutline, MdAddCircleOutline } from "react-icons/md";
import Marquee from "react-fast-marquee";
import { Seed } from "@/types/spotify";

//using marquee. Docs:
//https://www.react-fast-marquee.com/documentation

type SeedEntryProps = {
    seedObj: Seed;
    onRemove: (id: string) => void;
    onAdd?: (seed: Seed) => void;
    small?: boolean;
    added?: boolean;
};

export function SeedEntry({
    seedObj,
    onRemove,
    onAdd,
    small = false,
    added = false,
}: SeedEntryProps): JSX.Element {
    const imgSize = small ? "size-8" : "size-14";
    const imgRound = seedObj.type === "artist" ? "rounded-full" : "rounded-md";
    const imgClass = `${imgSize} ${imgRound}`;

    const gapSize = small ? "mb-3" : "mb-6";
    const fontSize = small ? "text-sm" : "text-base";
    const removeColor = small ? "white" : "lightgreen";

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
                        <p className={`text-zinc-400 ${fontSize}`}>
                            {seedObj.description}
                        </p>
                    </Marquee>
                ) : (
                    <p className={`text-zinc-500 ${fontSize}`}>
                        {seedObj.type[0].toUpperCase() + seedObj.type.slice(1)}
                    </p>
                )}
            </div>
            {added && (
                <button
                    className="justify-end"
                    onClick={() => onRemove(seedObj.id)}
                >
                    <MdRemoveCircleOutline size="1.5rem" color={removeColor} />
                </button>
            )}
            {!added && onAdd && (
                <button className="justify-end" onClick={() => onAdd(seedObj)}>
                    <MdAddCircleOutline size="1.5rem" />
                </button>
            )}
        </div>
    );
}

export default SeedEntry;
