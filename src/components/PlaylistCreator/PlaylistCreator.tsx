"use client";
import { useState, FormEvent, useEffect } from "react";
import PreferencesForm from "./PreferencesForm";
import Rules from "./RulesForm/Rules";
import Seeds from "./SeedsForm/Seeds";
import NameModal from "./NameModal";
import { Seed, Rule, Preferences, RuleInput } from "@/types/spotify";
import { MdModeEdit } from "react-icons/md";
import InfoModal from "./InfoModal";
import { PlaylistData } from "@/types/spotify";
import { completeRules } from "@/lib/spotifyUtils";
import { redirect, useRouter } from "next/navigation";

interface SubmitErrorTypes {
    name?: string;
    frequency?: string;
    amount?: string;
    seeds?: string;
}

interface PlaylistFormProps {
    playlist?: PlaylistData;
}

function PlaylistForm({ playlist }: PlaylistFormProps) {
    const router = useRouter();

    const [showNameModal, setShowNameModal] = useState(false);
    const [showSubmitErrors, setShowSubmittErrors] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitErrors, setSubmitErrors] = useState<SubmitErrorTypes>({});
    //to differentiate between creating a new playlist and updating an existing one
    const playlist_id = playlist?.playlist_id ? playlist.playlist_id : false;

    const initialState = {
        preferences: playlist?.preferences
            ? playlist.preferences
            : {
                  name: "Playlist Name",
                  frequency: "Weekly",
                  amount: 25,
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
            //spread the previous state
            ...prevState,
            //update the changed value
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
                    : type === "axis" && Array.isArray(value)
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
        if (preferences.name.length < 1) errors.name = "Your Playlist should have a name";
        if ((typeof preferences.amount !== "number" && preferences.amount < 5) || preferences.amount > 50)
            errors.amount = "The amount of tracks should be between 5 and 50";
        if (
            preferences.frequency !== "daily" &&
            preferences.frequency !== "weekly" &&
            preferences.frequency !== "monthly"
        )
            errors.frequency = "Invalid frequency";
        if (seeds.length < 1) errors.seeds = "You need to add at least one seed";
        if (seeds.length > 5) errors.seeds = "You can only add 5 seeds";
        return errors;
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const errors = validateForm(preferences, seeds);
        if (Object.keys(errors).length > 0) {
            setSubmitErrors(errors);
            setShowSubmittErrors(true);
            return;
        }
        setSubmitting(true);
        finishSubmit();
    };

    const finishSubmit = () => {
        const newPlaylist = async () => {
            //create a new playlist and populate it with the tracks
            const newPlaylistId = await fetch("/api/spotify/playlist", {
                method: playlist_id ? "PUT" : "POST",
                body: JSON.stringify({
                    playlist_id: playlist_id,
                    preferences,
                    seeds,
                    rules,
                }),
            }).then((res) => res.json());
            //revalidate tag playlists with serveraction

            //TODO: ERROR HANDLING
            //TODO: show submitting state
            setSubmitting(false);

            router.replace("/pages/edit-playlist/" + newPlaylistId, { scroll: false });
            router.refresh();
        };

        newPlaylist();
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
        <div className="flex justify-center text-white">
            <form className="w-full flex flex-col gap-2" onSubmit={handleSubmit}>
                {showSubmitErrors && (
                    <InfoModal
                        title="Failed to create the Playlist"
                        body={Object.values(submitErrors).join("\n")}
                        onClose={() => setShowSubmittErrors(false)}
                    ></InfoModal>
                )}
                <div className="flex justify-between p-4">
                    <h2>{preferences.name}</h2>
                    <MdModeEdit size="1.5em" onClick={() => setShowNameModal(true)} />
                    {showNameModal && (
                        <NameModal
                            name={preferences.name}
                            onClose={() => setShowNameModal(false)}
                            onChange={handlePrefChange}
                        />
                    )}
                </div>
                <PreferencesForm preferences={preferences} onChange={handlePrefChange} />
                <hr className="border-ui-700"></hr>
                <Seeds seeds={seeds} onRemove={removeSeed} onAdd={addSeed} />
                <hr className="border-ui-700"></hr>
                <Rules rules={rules} onAdd={addRule} onRemove={removeRule} onChange={handleRuleChange}></Rules>
                <button
                    type="submit"
                    className={`p-2 px-8 rounded-lg text-black bg-white self-end`}
                    disabled={submitting || !changed}
                >
                    {!changed ? "Nothing to Save" : playlist_id ? "Update Playlist" : "Create Playlist"}
                </button>
            </form>
        </div>
    );
}

export default PlaylistForm;
