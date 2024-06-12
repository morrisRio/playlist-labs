"use client";
import { useState, FormEvent } from "react";
import PreferencesForm from "./PreferencesForm";
import Rules from "./RulesForm/Rules";
import Seeds from "./SeedsForm/Seeds";
import NameModal from "./NameModal";
import PlaylistHeader from "./PlaylistHeader";
import { Seed, Rule, Preferences, RuleInput } from "@/types/spotify";
import { MdModeEdit, MdMoreVert } from "react-icons/md";
import UniModal from "../UniModal";
import { PlaylistData } from "@/types/spotify";
import { completeRules } from "@/lib/spotifyUtils";
import { useRouter } from "next/navigation";
import GradientModal from "../GradientModal";

interface PlaylistFormProps {
    playlist?: PlaylistData;
}

function PlaylistForm({ playlist }: PlaylistFormProps) {
    const router = useRouter();

    const [showSubmitErrors, setShowSubmittErrors] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitErrors, setSubmitErrors] = useState<string[]>([]);
    const [showGradient, setShowGradient] = useState(false);

    //to differentiate between creating a new playlist and updating an existing one
    const playlist_id = playlist?.playlist_id ? playlist.playlist_id : false;

    const initialState = {
        preferences: playlist?.preferences
            ? playlist.preferences
            : {
                  name: "Playlist Name",
                  frequency: "weekly",
                  amount: 25,
                  hue: Math.floor(Math.random() * 360),
              },
        seeds: playlist?.seeds ? playlist.seeds : [],
        //if the playlist has rules, complete them as the db only stores the name and value
        rules: playlist?.rules ? completeRules(playlist.rules) : [],
    };

    //Preferences ______________________________________________________________________________________________
    const [preferences, setPreferences] = useState<Preferences>(initialState.preferences);

    const handlePrefChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setPreferences((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    //Seeds ______________________________________________________________________________________________
    const [seeds, setSeeds] = useState<Seed[]>(initialState.seeds);
    const addSeed = (seed: Seed) => {
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
    const [rules, setRules] = useState<Rule[]>(initialState.rules);

    const handleRuleChange = (e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => {
        const { name, value, type } = e.target as RuleInput;
        setRules((prevState) => {
            const newRules = [...prevState];
            const i = newRules.findIndex((r) => r.name === name);
            //parse the value to the correct type
            //if the type is range, parse it to a float
            //if the type is "axis" (manually set), keep it (value is an array)
            //now it can only be boolean
            //if the type is boolean (value is true), return true, else return false
            const valueParsed =
                type === "range" && typeof value === "string"
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
        let errors: string[] = [];
        //check if the form is valid
        //check if the preferences are valid
        if (preferences.name.length < 1) errors.push("Your Playlist should have a name.\n");
        if ((typeof preferences.amount !== "number" && preferences.amount < 5) || preferences.amount > 50)
            errors.push("The amount of tracks should be between 5 and 50.\n");
        if (
            preferences.frequency !== "daily" &&
            preferences.frequency !== "weekly" &&
            preferences.frequency !== "monthly"
        )
            errors.push(
                "There's something wrong with the frequency. That's strange 😉\n Try changing it to something supported"
            );
        if (seeds.length < 1) errors.push("We'll need atleast one Seed for creating the Playlist.\n");
        if (seeds.length > 5) errors.push("We can only handle 5 seeds at a time.\n");
        return errors;
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const errors = validateForm(preferences, seeds);
        if (errors.length > 0) {
            setSubmitErrors(errors);
            setShowSubmittErrors(true);
            return;
        }
        setSubmitting(true);
        finishSubmit();
    };

    const finishSubmit = async () => {
        //create a new playlist and populate it with the tracks
        await fetch("/api/spotify/playlist", {
            method: playlist_id ? "PUT" : "POST",
            body: JSON.stringify({
                playlist_id: playlist_id,
                preferences,
                seeds,
                rules,
            }),
        })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    const { message } = data;
                    throw new Error(message || "Network response was not ok");
                }
                setSubmitErrors([]);
                setSubmitting(false);
                router.replace("/pages/edit-playlist/" + data, { scroll: false });
                router.refresh();
            })
            .catch((err) => {
                setSubmitting(false);
                setSubmitErrors([...submitErrors, err.message]);
                setShowSubmittErrors(true);
                console.error(err);
            });
        //TODO: show submitting state
        setSubmitting(false);
    };

    //check if the playlist has changed
    const currentState = {
        preferences: preferences,
        seeds: seeds,
        rules: rules,
    };

    const changed = JSON.stringify(initialState) !== JSON.stringify(currentState);

    return (
        <div className="flex justify-center text-white mb-8">
            <form className="w-full flex flex-col gap-8" onSubmit={handleSubmit}>
                {showSubmitErrors && (
                    <UniModal
                        title="We ran into some issues"
                        onClose={() => setShowSubmittErrors(false)}
                        closeTitle="Got it"
                    >
                        {submitErrors.map((error, i) => (
                            <p key={i}>{error}</p>
                        ))}
                    </UniModal>
                )}
                <PlaylistHeader
                    name={preferences.name}
                    playlist_id={playlist_id}
                    onChange={handlePrefChange}
                    coverUrl={playlist?.coverUrl ? playlist.coverUrl : false}
                    hue={preferences.hue ? preferences.hue : false}
                />
                <PreferencesForm preferences={preferences} onChange={handlePrefChange} />
                <hr className="border-ui-700"></hr>
                <Seeds seeds={seeds} onRemove={removeSeed} onAdd={addSeed} />
                <hr className="border-ui-700"></hr>
                <Rules rules={rules} onAdd={addRule} onRemove={removeRule} onChange={handleRuleChange}></Rules>
                <button
                    type="submit"
                    className={`m-4 self-end p-2 px-8 min-w-32 border border-themetext-nerfed text-themetext text-lg rounded-md text-center`}
                    disabled={submitting}
                >
                    {!changed ? "Regenerate" : playlist_id ? "Save Updates" : "Create Playlist"}
                </button>
            </form>
        </div>
    );
}

export default PlaylistForm;
