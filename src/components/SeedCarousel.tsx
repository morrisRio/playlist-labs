import React from "react";
import Marquee from "react-fast-marquee";
import { Seed } from "@/types/spotify";
import SeedEntry from "./PlaylistCreator/Forms/SeedsForm/SeedEntry";
import { twUi900 } from "@/lib/utils";

const Seeds: Seed[] = [
    {
        spotify: "todo: find genre links",
        id: "Hip-hop",
        title: "Hip-hop",
        description: "genre",
        type: "genre",
        thumbnail: 150,
    },
    {
        spotify: "https://open.spotify.com/track/79hOv7F9LKxEBA4Qbfw00i",
        id: "79hOv7F9LKxEBA4Qbfw00i",
        title: "Neoprene",
        description: "Lokane",
        type: "track",
        thumbnail: "https://i.scdn.co/image/ab67616d00001e027642e05bb48c4bd09a77275c",
    },
    {
        spotify: "https://open.spotify.com/track/6pl48pMAN7BTeugCEyYvIb",
        id: "6pl48pMAN7BTeugCEyYvIb",
        title: "Don't Sweat The Technique",
        description: "Eric B. & Rakim",
        type: "track",
        thumbnail: "https://i.scdn.co/image/ab67616d00001e02c6cc7267f314ed4980b2593b",
    },
    {
        spotify: "https://open.spotify.com/track/2rtUDwDS4didOMYoCqPJ1E",
        id: "2rtUDwDS4didOMYoCqPJ1E",
        title: "Mrs Dior",
        description: "Sad Night Dynamite",
        type: "track",
        thumbnail: "https://i.scdn.co/image/ab67616d00001e0257f507a1505ee87100eb6223",
    },
    {
        spotify: "https://open.spotify.com/track/4MyxoX7EMGA1Ndlbmlzj4Z",
        id: "4MyxoX7EMGA1Ndlbmlzj4Z",
        title: "Cotton Candy Lemonade",
        description: "Blu DeTiger",
        type: "track",
        thumbnail: "https://i.scdn.co/image/ab67616d00001e029413d9051a15cdb7e52adce8",
    },
    {
        spotify: "https://open.spotify.com/track/0Inda0GYH0hd78rKSELMvc",
        id: "0Inda0GYH0hd78rKSELMvc",
        title: "Dis Sound",
        description: "Rozz Dyliams",
        type: "track",
        thumbnail: "https://i.scdn.co/image/ab67616d00001e02a465ea5776f370055f7d9f39",
    },
    {
        spotify: "https://open.spotify.com/track/60eKTJqG7nupTaQXthGRUG",
        id: "60eKTJqG7nupTaQXthGRUG",
        title: "Do The Deal",
        description: "Baron Von Trax",
        type: "track",
        thumbnail: "https://i.scdn.co/image/ab67616d00001e02dd684bb23bf071f7f4c811a8",
    },
    {
        spotify: "https://open.spotify.com/track/3tYFg2dWpmtYwgCJ5Rjl7q",
        id: "3tYFg2dWpmtYwgCJ5Rjl7q",
        title: "Yummy",
        description: "Money Boy",
        type: "track",
        thumbnail: "https://i.scdn.co/image/ab67616d00001e0255724a60e058e585eac4897d",
    },
    {
        spotify: "https://open.spotify.com/track/4DIjLPq2INAbUSjW9SRsnm",
        id: "4DIjLPq2INAbUSjW9SRsnm",
        title: "FÜR ALLE",
        description: "LUVRE47",
        type: "track",
        thumbnail: "https://i.scdn.co/image/ab67616d00001e029b310ec0806e04bfa76d59f7",
    },
    {
        spotify: "todo: find genre links",
        id: "Techno",
        title: "Techno",
        description: "genre",
        type: "genre",
        thumbnail: 333,
    },
    {
        spotify: "https://open.spotify.com/track/6tOfb9TXSU11AoYkvgonKY",
        id: "6tOfb9TXSU11AoYkvgonKY",
        title: "Ultramarine",
        description: "Wesley Joseph",
        type: "track",
        thumbnail: "https://i.scdn.co/image/ab67616d00001e02c7f31d09ade27626366bb6c3",
    },
    {
        spotify: "https://open.spotify.com/track/3c9S5evV1wDG6mHzlOXnOP",
        id: "3c9S5evV1wDG6mHzlOXnOP",
        title: "Flying Machine",
        description: "Fancy Wrong",
        type: "track",
        thumbnail: "https://i.scdn.co/image/ab67616d00001e0284d9a470e1c7371863988c55",
    },
    {
        spotify: "https://open.spotify.com/track/6xi63rgWgcKkod0nXVnMMT",
        id: "6xi63rgWgcKkod0nXVnMMT",
        title: "New Lands",
        description: "Justice",
        type: "track",
        thumbnail: "https://i.scdn.co/image/ab67616d00001e02f9171c2b7bab0956cdfbd1fa",
    },
    {
        spotify: "https://open.spotify.com/track/6WY65n6MfeVUhJw02u5yGN",
        id: "6WY65n6MfeVUhJw02u5yGN",
        title: "Hello Dear",
        description: "PawPaw Rod",
        type: "track",
        thumbnail: "https://i.scdn.co/image/ab67616d00001e02a7a789100a548f8f1e7a5979",
    },
    {
        spotify: "todo: find genre links",
        id: "Jazz",
        title: "Jazz",
        description: "genre",
        type: "genre",
        thumbnail: 188,
    },
    {
        spotify: "https://open.spotify.com/track/1AtqXmRHjdgIyE4Nn6uqHC",
        id: "1AtqXmRHjdgIyE4Nn6uqHC",
        title: "Inject",
        description: "Jannik Aßfalg",
        type: "track",
        thumbnail: "https://i.scdn.co/image/ab67616d00001e0249de8266b5c988bd87d13542",
    },
];

function SeedCarousel() {
    const bgGradient = `linear-gradient(to right, ${twUi900} 0%, transparent 20%, transparent 80%, ${twUi900} 100%)`;
    return (
        <div className="relative flex flex-col gap-4">
            <div className="absolute size-full z-10 pointer-events-none" style={{ backgroundImage: bgGradient }}></div>
            <Marquee gradient={false} speed={65}>
                <div className="flex gap-4 mr-4">
                    {Seeds.slice(0, 7).map((seed) => (
                        <SeedEntry key={seed.id} seedObj={seed} card display />
                    ))}
                </div>
            </Marquee>
            <Marquee gradient={false} speed={70}>
                <div className="flex gap-4 mr-4">
                    {Seeds.slice(8, Seeds.length).map((seed) => (
                        <SeedEntry key={seed.id} seedObj={seed} card display />
                    ))}
                </div>
            </Marquee>
        </div>
    );
}

export default SeedCarousel;
