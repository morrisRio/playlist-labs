"use client";
import { useState, FormEvent, useEffect } from "react";
import PreferencesForm from "./PreferencesForm";
import Rules from "./RulesForm/Rules";
import Seeds from "./SeedsForm/Seeds";
import NameModal from "./NameModal";
import { Seed, Rule, Preferences } from "@/types/spotify";
import { MdModeEdit } from "react-icons/md";
import InfoModal from "./InfoModal";

interface SubmitErrorTypes {
    name?: string;
    frequency?: string;
    amount?: string;
    seeds?: string;
}

function PlaylistForm() {
    const [showNameModal, setShowNameModal] = useState(false);

    const [showSubmitErrors, setShowSubmittErrors] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitErrors, setSubmitErrors] = useState<SubmitErrorTypes>({});

    //Preferences ______________________________________________________________________________________________
    const [preferences, setPreferences] = useState<Preferences>({
        name: "Playlist Name",
        frequency: "daily",
        amount: 25,
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
            value: [50, 50],
            range: [
                ["negative", "positive"],
                ["intense", "mild"],
            ],
            description:
                "Choose the Mood according to the Arousal-Valence model of emotions (Amount of Arousal and Valence of a Track).",
        },
        {
            name: "Danceability",
            type: "range",
            value: 50,
            range: ["Not Dancable", "Danceable"],
            description:
                "How suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity.",
        },
        {
            name: "Mode",
            type: "boolean",
            value: false,
            range: ["Minor", "Major"],
            description: "Choose between Tracks using Minor or Major mode.",
        },
    ]);

    const handleRuleChange = (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.MouseEvent<HTMLButtonElement>
    ) => {
        //@ts-ignore
        //TODO: fix this
        const { name, value, type } = e.target;
        setRules((prevState) => {
            const newRules = [...prevState];
            const i = newRules.findIndex((r) => r.name === name);
            //parse the value to the correct type
            //if the type is range, parse it to a float
            //if the type is "axis" (manually set), keep it (value is an array)
            //now it can only be boolean
            //if the type is boolean (value is true), return true, else return false
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
            const i = newRules.findIndex((rule) => rule.name === name);
            newRules.splice(i, 1);
            return newRules;
        });
    };

    //Form Validation ______________________________________________________________________________________________

    const validateForm = (preferences: Preferences, seeds: Seed[]) => {
        let errors: any = {};
        //check if the form is valid
        //check if the preferences are valid
        if (preferences.name.length < 1)
            errors.name = "Your Playlist should have a name";
        if (
            (typeof preferences.amount !== "number" &&
                preferences.amount < 5) ||
            preferences.amount > 50
        )
            errors.amount = "The amount of tracks should be between 5 and 50";
        if (
            preferences.frequency !== "daily" &&
            preferences.frequency !== "weekly" &&
            preferences.frequency !== "monthly"
        )
            errors.frequency = "Invalid frequency";
        if (seeds.length < 1)
            errors.seeds = "You need to add at least one seed";
        if (seeds.length > 5) errors.seeds = "You can only add 5 seeds";
        console.log(errors);
        return errors;
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("handleSubmit triggered");

        const errors = validateForm(preferences, seeds);
        if (Object.keys(errors).length > 0) {
            setSubmitErrors(errors);
            setShowSubmittErrors(true);
            return;
        }
        setSubmitting(true);
        finishSubmit();
        // console.log(preferences); // You can replace this with your actual form action
        // console.log(seeds); // You can replace this with your actual form action
    };

    const finishSubmit = () => {
        console.log("finishSubmit");
        const newPlaylist = async () => {
            //create a new playlist
            console.log("fetching playlist with fromdata: ", {
                preferences,
                seeds,
                rules,
            });

            const playlistId = await fetch("/api/spotify/playlist", {
                method: "POST",
                body: JSON.stringify({
                    preferences,
                    seeds,
                    rules,
                }),
            }).then((res) => res.json());
            console.log("newPlaylist", playlistId);

            //add the playlist to the database
            const savePlaylist = await fetch(`/api/db/playlist/${playlistId}`, {
                method: "POST",
                body: JSON.stringify({
                    preferences,
                    seeds,
                    rules,
                }),
            }).then((res) => res.json());

            //redirect to the playlist
            console.log("savePlaylist", savePlaylist);
            //add the tracks to the playlist
        };

        newPlaylist();
        setSubmitting(false);
    };

    return (
        <div className="flex justify-center text-white">
            <form
                className="w-full flex flex-col gap-8"
                onSubmit={handleSubmit}
            >
                {showSubmitErrors && (
                    <InfoModal
                        title="Failed to create the Playlist"
                        body={Object.values(submitErrors).join("\n")}
                        onClose={() => setShowSubmittErrors(false)}
                    ></InfoModal>
                )}
                <div className="flex justify-between p-4">
                    <h3>{preferences.name}</h3>
                    <MdModeEdit
                        size="1.5em"
                        onClick={() => setShowNameModal(true)}
                    />
                    {showNameModal && (
                        <NameModal
                            name={preferences.name}
                            onClose={() => setShowNameModal(false)}
                            onChange={handlePrefChange}
                        />
                    )}
                </div>
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
                    className={`p-2 px-8 rounded-md text-black bg-white self-end`}
                >
                    Create Playlist
                </button>
            </form>
        </div>
    );
}

export default PlaylistForm;
