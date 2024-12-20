"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { preload, useSWRConfig } from "swr";

import PlaylistHeader from "./PlaylistHeader";
import PreferencesForm from "./Forms/PreferencesForm";
import Rules from "@/components/PlaylistCreator/Forms/RulesForm/Rules";
import Seeds from "./Forms/SeedsForm/Seeds";
import UniModal from "../Modals/UniModal";

import { useSubmitCase } from "@/lib/hooks/useSubmitCase";
import { completeRules, emptyPlaylist } from "@/lib/spotifyUtils";

import { Seed, Rule, Preferences, RuleInput, PlaylistData } from "@/types/spotify";

import Lottie from "lottie-react";
import Loading from "@/lib/lotties/loading.json";

interface PlaylistEditorProps {
    pageTitle: string;
    playlist?: PlaylistData;
}

function PlaylistEditor({ playlist, pageTitle }: PlaylistEditorProps) {
    const router = useRouter();

    //to differentiate between creating a new playlist and updating an existing one
    const playlist_id = playlist?.playlist_id ? playlist.playlist_id : false;

    const initialState = {
        preferences: playlist?.preferences ? playlist.preferences : emptyPlaylist.preferences,
        seeds: playlist?.seeds ? playlist.seeds : emptyPlaylist.seeds,
        //if the playlist has rules, complete them as the db only stores the name and value
        rules: playlist?.rules && playlist?.rules.length > 0 ? completeRules(playlist.rules) : emptyPlaylist.rules,
    };

    //Preferences ______________________________________________________________________________________________
    const [preferences, setPreferences] = useState<Preferences>(initialState.preferences);

    const handlePrefChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        let valueParsed: string | number = value;
        if (name === "amount" || name === "on") valueParsed = parseInt(value);

        if (name === "frequency") {
            let resettedOn = 0;
            if (value === "weekly") resettedOn = 4;
            else resettedOn = 0;

            setPreferences((prevState) => ({ ...prevState, on: resettedOn }));
        }
        setPreferences((prevState) => {
            const newPrefs = { ...prevState, [name]: valueParsed };
            return { ...newPrefs };
        });
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
            return [rule, ...prevState];
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
            preferences.frequency !== "monthly" &&
            preferences.frequency !== "never"
        )
            errors.push(
                "There's something wrong with the frequency. That's strange 😉\n Try changing it to something supported"
            );
        if (seeds.length < 1) errors.push("We'll need at least one Seed for creating the Playlist.\n");
        if (seeds.length > 5) errors.push("We can only handle 5 seeds at a time.\n");
        return errors;
    }, []);

    const [showSubmitErrors, setShowSubmitErrors] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitErrors, setSubmitErrors] = useState<string[]>([]);

    const {
        submitMethod,
        actionIcon,
        actionName,
        somethingToRestore,
        sendId,
        sendPrefs,
        sendRules,
        sendSeeds,
        newSongSettings,
    } = useSubmitCase({
        initialState,
        playlist_id,
        preferences,
        seeds,
        rules,
    });

    const finishSubmit = useCallback(async () => {
        const finishSubmit = async () => {
            let submitPayload: any = {};
            submitPayload.playlist_id = sendId && playlist_id ? playlist_id : undefined;
            submitPayload.preferences = sendPrefs ? preferences : undefined;
            submitPayload.rules = sendRules ? rules : undefined;
            submitPayload.seeds = sendSeeds ? seeds : undefined;
            submitPayload.newSongsSettings = newSongSettings ? true : undefined;

            console.log("submit payload", submitPayload);
            //create a new playlist and populate it with the tracks
            await fetch("/api/spotify/playlist", {
                method: submitMethod,
                body: JSON.stringify(submitPayload),
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
    }, [
        preferences,
        seeds,
        rules,
        playlist_id,
        router,
        newSongSettings,
        sendId,
        sendPrefs,
        sendRules,
        sendSeeds,
        submitMethod,
    ]);

    const handleSubmit = useCallback(
        (e: React.PointerEvent<HTMLButtonElement>) => {
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

    const resetSettings = useCallback(() => {
        setPreferences(initialState.preferences);
        setSeeds(initialState.seeds);
        setRules(initialState.rules);
    }, [initialState.preferences, initialState.rules, initialState.seeds]);

    const emptySettings = useCallback(() => {
        setPreferences({
            name: preferences.name,
            amount: emptyPlaylist.preferences.amount,
            frequency: emptyPlaylist.preferences.frequency,
            hue: playlist_id ? undefined : emptyPlaylist.preferences.hue,
        });
        setSeeds(emptyPlaylist.seeds);
        setRules(emptyPlaylist.rules);
    }, [playlist_id, preferences.name]);

    const { mutate } = useSWRConfig();

    useEffect(() => {
        const fetcher = (url: string) => fetch(url).then((res) => res.json());
        preload(`/api/spotify/top-items/tracks?time_range=short_term`, fetcher);
        if (playlist) {
            setTimeout(() => mutate(`/api/spotify/playlist/cover/${playlist_id}`), 100);
            setPreferences(playlist.preferences);
            setSeeds(playlist.seeds);
            setRules(playlist.rules ? completeRules(playlist.rules) : emptyPlaylist.rules);
        }
    }, [playlist, mutate, playlist_id]);

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
                initialName={initialState.preferences.name}
                playlist_id={playlist_id}
                onChange={handlePrefChange}
                hue={preferences.hue}
                submitting={submitting}
                action={handleSubmit}
                actionName={actionName}
                actionIcon={actionIcon}
                somethingToRestore={somethingToRestore}
                resetSettings={resetSettings}
                emptySettings={emptySettings}
                router={router}
            ></PlaylistHeader>
            <section
                id="playlist-form"
                className="bg-ui-950 w-full h-fit flex flex-col gap-6 justify-center text-white rounded-b-2xl sm:w-[40rem] lg:w-[50rem] sm:mx-auto sm:px-8"
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
                <hr className="border-ui-700 sm:-mx-8"></hr>
                <Seeds seeds={seeds} onRemove={removeSeed} onAdd={addSeed} />
                <hr className="border-ui-700 sm:-mx-8"></hr>
                <Rules rules={rules} onAdd={addRule} onRemove={removeRule} onChange={handleRuleChange}></Rules>
            </section>
        </>
    );
}

export default PlaylistEditor;
