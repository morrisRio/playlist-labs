"use client";
import { useState, FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";

import PlaylistHeader from "./PlaylistHeader";
import PreferencesForm from "./PreferencesForm";
import Rules from "./RulesForm/Rules";
import Seeds from "./SeedsForm/Seeds";
import UniModal from "../UniModal";

import { Seed, Rule, Preferences, RuleInput, PlaylistData } from "@/types/spotify";
import { completeRules } from "@/lib/spotifyUtils";

import Lottie from "lottie-react";
import Loading from "@/lib/lotties/loading.json";

import { preload } from "swr";

interface PlaylistFormProps {
    pageTitle: string;
    playlist?: PlaylistData;
}

function PlaylistForm({ playlist, pageTitle }: PlaylistFormProps) {
    const router = useRouter();

    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    preload(`/api/spotify/top-items/tracks?time_range=short_term`, fetcher);

    const [showSubmitErrors, setShowSubmitErrors] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitErrors, setSubmitErrors] = useState<string[]>([]);

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
    const addSeed = useCallback(
        (seed: Seed) => {
            if (seeds.length < 5) {
                setSeeds((prevState) => {
                    return [...prevState, seed];
                });
            } else {
                alert("You can only add 5 seeds");
            }
        },
        [seeds]
    );

    const removeSeed = useCallback((id: string) => {
        setSeeds((prevState) => {
            const newSeeds = [...prevState];
            const i = newSeeds.findIndex((seed) => seed.id === id);
            newSeeds.splice(i, 1);
            return newSeeds;
        });
    }, []);

    //Rules ______________________________________________________________________________________________
    const [rules, setRules] = useState<Rule[]>(initialState.rules);

    const handleRuleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => {
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
        },
        []
    );

    const addRule = useCallback((rule: any) => {
        setRules((prevState) => {
            return [...prevState, rule];
        });
    }, []);

    const removeRule = useCallback((name: string) => {
        setRules((prevState) => {
            const newRules = [...prevState];
            const i = newRules.findIndex((rule) => rule.name === name);
            newRules.splice(i, 1);
            return newRules;
        });
    }, []);

    //Form Validation ______________________________________________________________________________________________
    const validateForm = useCallback((preferences: Preferences, seeds: Seed[]) => {
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
    }, []);

    //TODO: feature: differentiate saving the settings and regenerating the playlist

    const finishSubmit = useCallback(async () => {
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
                    setSubmitting(false);
                    const data = await res.json();
                    if (!res.ok) {
                        const { message } = data;
                        throw new Error(message || "Network response was not ok");
                    }
                    setSubmitErrors([]);
                    router.replace("/pages/edit-playlist/" + data);
                    router.refresh();
                    setCurrentState({
                        preferences: preferences,
                        seeds: seeds,
                        rules: rules,
                    });
                    setSubmitting(false);
                })
                .catch((err) => {
                    setSubmitting(false);
                    setSubmitErrors([err.message]);
                    setShowSubmitErrors(true);
                    console.error(err);
                });
        };
        finishSubmit();
    }, [preferences, seeds, rules, playlist_id, router]);

    const handleSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            e.stopPropagation();

            const errors = validateForm(preferences, seeds);
            if (errors.length > 0) {
                setSubmitErrors(errors);
                setShowSubmitErrors(true);
                return;
            }
            setSubmitting(true);

            finishSubmit();
        },
        [finishSubmit, preferences, seeds, validateForm]
    );
    const resetSettings = () => {
        setPreferences(initialState.preferences);
        setSeeds(initialState.seeds);
        setRules(initialState.rules);
    };

    //check if the playlist has changed
    const [currentState, setCurrentState] = useState({
        preferences: preferences,
        seeds: seeds,
        rules: rules,
    });

    const changed = JSON.stringify(initialState) !== JSON.stringify(currentState);

    return (
        <>
            {submitting && (
                <div className="fixed inset-0 max-h-screen bg-ui-950/80 z-50 flex items-center">
                    <div className="size-24 mx-auto">
                        <Lottie animationData={Loading}> </Lottie>
                    </div>
                </div>
            )}
            <PlaylistHeader
                pageTitle={pageTitle}
                name={preferences.name}
                playlist_id={playlist_id}
                onChange={handlePrefChange}
                hue={preferences.hue}
                submitting={submitting}
                changed={changed}
                action={handleSubmit}
                resetSettings={resetSettings}
                router={router}
            ></PlaylistHeader>
            <form
                id="playlist-form"
                className="w-full min-h-full flex flex-col gap-6 justify-center text-white mb-16 sm:mb-24"
                onSubmit={handleSubmit}
            >
                {showSubmitErrors && (
                    <UniModal
                        title="We ran into some issues"
                        onClose={() => setShowSubmitErrors(false)}
                        closeTitle="Got it"
                    >
                        {submitErrors.map((error, i) => (
                            <p key={i}>{error}</p>
                        ))}
                    </UniModal>
                )}

                <PreferencesForm preferences={preferences} onChange={handlePrefChange} />
                <hr className="border-ui-700"></hr>
                <Seeds seeds={seeds} onRemove={removeSeed} onAdd={addSeed} />
                <hr className="border-ui-700"></hr>
                <Rules rules={rules} onAdd={addRule} onRemove={removeRule} onChange={handleRuleChange}></Rules>
            </form>
        </>
    );
}

export default PlaylistForm;
