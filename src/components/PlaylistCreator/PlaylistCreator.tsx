"use client";
import { useState, FormEvent } from "react";
import PreferencesForm from "./PreferencesForm";
import Seeds from "./Seeds";
import { Seed } from "./Seed";

interface Preferences {
    frequency: string;
    amount: number;
    description?: string;
}

interface Rule {
    type: string;
    value: number;
}

function PlaylistForm() {
    const [preferences, setPreferences] = useState<Preferences>({
        frequency: "daily",
        amount: 25,
        description: "",
    });
    //should all these be in a separate file?
    const [seeds, setSeeds] = useState<Seed[]>([
        {
            spotify: "https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpatF05PJ",
            type: "artist",
            id: "pl1",
            title: "Some example seed title",
            description: "minimum 1 seed required",
            thumbnail: "",
        },
        {
            spotify: "https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpatF05PJ",
            type: "track",
            id: "pl2",
            title: "Some example seed title 2",
            description: "minimum 1 seed required",
            thumbnail: "",
        },
    ]);
    const [rules, setRules] = useState<Rule[]>([
        {
            type: "placeholder",
            value: 0,
        },
    ]);

    const handlePrefChange = (
        e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setPreferences((prevState) => ({
            //spread the previous state
            ...prevState,
            //update the changed value
            [name]: value,
        }));
    };

    const addSeed = (seed: Seed) => {
        console.log(seed);
        setSeeds((prevState) => {
            return [...prevState, seed];
        });
    };

    const removeSeed = (i: number) => {
        setSeeds((prevState) => {
            const newSeeds = [...prevState];
            newSeeds.splice(i, 1);
            return newSeeds;
        });
    };

    const isFormValid =
        preferences.frequency &&
        preferences.amount >= 5 &&
        preferences.amount <= 50;

    // const newPlaylist = async (e: FormEvent, formdata: FormData) => {
    //     //create a new playlist
    //     e.preventDefault();
    //     console.log("fetching create-playlist with fromdata: ", formdata);
    //     await fetch("/api/spotify/create-playlist", {
    //         method: "POST",
    //         body: JSON.stringify({
    //             name: formdata.get("playlistname"),
    //         }),
    //     });
    //     //get recommendations with the parameters from formdata

    //     //add the tracks to the playlist
    // };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // console.log(preferences); // You can replace this with your actual form action
        // console.log(seeds); // You can replace this with your actual form action
    };
    return (
        <div className="flex justify-center bg-zinc-950 text-white">
            <form
                className="w-full p-8 flex flex-col gap-4"
                onSubmit={handleSubmit}
            >
                <h1>Create Playlist</h1>
                <h2>Preferences</h2>
                <PreferencesForm
                    preferences={preferences}
                    onChange={handlePrefChange}
                />
                <h2>Seeds</h2>
                <Seeds seeds={seeds} onRemove={removeSeed} onAdd={addSeed} />
                <button
                    type="submit"
                    className={`block w-full p-2 rounded-md bg-blue-500 text-white ${
                        !isFormValid && "opacity-50 cursor-not-allowed"
                    }`}
                    disabled={!isFormValid}
                >
                    Create Playlist
                </button>
            </form>
        </div>
    );
}

export default PlaylistForm;
