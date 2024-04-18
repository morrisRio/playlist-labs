"use client";
import { useState, FormEvent } from "react";

interface Preferences {
    frequency: string;
    amount: number;
    description?: string;
}

interface Seed {
    type: string;
    id: string;
    title: string;
    description: string;
    thumbnail: string;
}

interface Rule {
    type: string;
    value: number;
}

type FormData = {
    preferences: Preferences;
    seeds: [Seed, ...Seed[]];
    rules?: Rule[];
};

function PlaylistForm() {
    const [preferences, setPreferences] = useState<Preferences>({
        frequency: "daily",
        amount: 25,
        description: "",
    });
    //should all these be in a separate file?
    const [seeds, setSeeds] = useState<[Seed]>([
        {
            type: "placeholder",
            id: "placeholder",
            title: "Add some stuff you want to hear in your playlist",
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
        console.log(preferences); // You can replace this with your actual form action
    };

    return (
        <div className="flex justify-center bg-zinc-950 text-white">
            <form
                className="w-full p-8 flex flex-col gap-4"
                onSubmit={handleSubmit}
            >
                <h2>Preferences</h2>
                <label className="flex mb-4 space-between items-center justify-between">
                    Update Frequency
                    <select
                        className="block mt-1 p-2 rounded-md bg-zinc-800 focus:outline-none focus:ring focus:border-blue-300"
                        name="frequency"
                        value={preferences.frequency}
                        onChange={handlePrefChange}
                        required
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </label>
                <div>
                    <label
                        htmlFor="amount"
                        className="flex items-center justify-between"
                    >
                        Number of Tracks
                        <input
                            type="number"
                            className="hide-arrows p-2 rounded-md bg-zinc-800 focus:outline-none focus:ring focus:border-blue-300 max-w-12"
                            name="amount"
                            value={preferences.amount}
                            min="5"
                            max="50"
                            onChange={handlePrefChange}
                            required
                        />
                    </label>

                    <input
                        type="range"
                        className="mt-2 block w-full rounded-md bg-zinc-800 focus:outline-none focus:ring focus:border-blue-300"
                        name="amount"
                        value={preferences.amount}
                        min="5"
                        max="50"
                        onChange={handlePrefChange}
                        required
                    />
                </div>
                <input
                    type="text"
                    className="border-b border-b-white bg-transparent p-2 focus:outline-none focus:ring focus:border-blue-300"
                    name="description"
                    value={preferences.description}
                    onChange={handlePrefChange}
                    placeholder="Description (optional)"
                />
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
