"use client";
import { useState, FormEvent } from "react";
import PreferencesForm from "./PreferencesForm";
import Rules from "./RulesForm/Rules";
import Seeds from "./SeedsForm/Seeds";
import { Seed } from "@/types/spotify";
import { Rule } from "@/types/spotify";

interface Preferences {
    frequency: string;
    amount: number;
    description?: string;
}

function PlaylistForm() {
    //Preferences ______________________________________________________________________________________________
    const [preferences, setPreferences] = useState<Preferences>({
        frequency: "daily",
        amount: 25,
        description: "",
    });
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

    //Seeds ______________________________________________________________________________________________
    const [seeds, setSeeds] = useState<Seed[]>([
        {
            spotify: "https://open.spotify.com/track/2gcpea4r4aH9Hm0Ty0kmNt",
            id: "2gcpea4r4aH9Hm0Ty0kmNt",
            title: "Fruchtsaft",
            description: "LAYLA",
            type: "track",
            thumbnail:
                "https://i.scdn.co/image/ab67616d00001e02785f9cdda48d87d8b3757ae7",
        },
        {
            spotify: "todo: find genre links",
            id: "hip-hop",
            title: "hip-hop",
            description: "genre",
            type: "genre",
            thumbnail: "",
        },
        {
            spotify: "https://open.spotify.com/artist/4XvKzACpcdk5iiZbWNvfbq",
            id: "4XvKzACpcdk5iiZbWNvfbq",
            title: "Monolake",
            description:
                "abstract, ambient, ambient dub, ambient techno, dub techno, intelligent dance music, microhouse, minimal techno · 41.2 k followers",
            type: "artist",
            thumbnail:
                "https://i.scdn.co/image/a2a0779f11ef5a1b566fde579a3a9676f60a37ac",
        },
    ]);
    const addSeed = (seed: Seed) => {
        // console.log(seed);

        if (seeds.length < 5) {
            setSeeds((prevState) => {
                return [...prevState, seed];
            });
        } else {
            //TODO: show a toast or something
            alert("You can only add 5 seeds");
        }
    };

    const removeSeed = (id: string) => {
        setSeeds((prevState) => {
            const newSeeds = [...prevState];
            const i = newSeeds.findIndex((seed) => seed.id === id);
            newSeeds.splice(i, 1);
            return newSeeds;
        });
    };

    //Rules ______________________________________________________________________________________________
    const [rules, setRules] = useState<Rule[]>([
        {
            name: "Mood",
            type: "axis",
            value: [0.5, 0.5],
            range: [
                ["negative", "positive"],
                ["intense", "mild"],
            ],
            description:
                "Choose the Mood according to the Arousal-Valence model of emotions (Amount of Arousal and Valence of a Track).",
        },
    ]);

    const handleRuleChange = (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.MouseEvent<HTMLButtonElement>
    ) => {
        const { name, value, type } = e.target;
        setRules((prevState) => {
            const newRules = [...prevState];
            const i = newRules.findIndex((r) => r.name === name);
            //parse the value to the correct type
            //if the type is range, parse it to a float
            //if the type is boolean, parse it to a boolean
            const valueParsed =
                type === "range"
                    ? parseFloat(value)
                    : type === "axis"
                    ? value
                    : value === "true"
                    ? true
                    : false;

            newRules[i].value = valueParsed;
            return newRules;
        });
        // }
    };

    const addRule = (rule: any) => {
        setRules((prevState) => {
            return [...prevState, rule];
        });
    };

    const removeRule = (name: string) => {
        setRules((prevState) => {
            const newRules = [...prevState];
            const i = newRules.findIndex((rule) => rule.type === name);
            newRules.splice(i, 1);
            return newRules;
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
        <div className="flex justify-center text-white">
            <form className="w-full p-4 flex flex-col" onSubmit={handleSubmit}>
                <h1>Create Playlist</h1>
                <PreferencesForm
                    preferences={preferences}
                    onChange={handlePrefChange}
                />
                <Seeds seeds={seeds} onRemove={removeSeed} onAdd={addSeed} />
                <Rules
                    rules={rules}
                    onAdd={addRule}
                    onRemove={removeRule}
                    onChange={handleRuleChange}
                ></Rules>
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
