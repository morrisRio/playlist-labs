import { PlaylistData, Preferences, Rule, Seed } from "@/types/spotify";
import { useState, useCallback, RefObject, useMemo } from "react";

import { MdShuffle } from "react-icons/md";
import { BsStars } from "react-icons/bs";
import { AiOutlineSave } from "react-icons/ai";
import { IconType } from "react-icons";

interface SubmitCaseProps {
    initialState: PlaylistData;
    playlist_id: string | boolean;
    preferences: Preferences;
    seeds: Seed[];
    rules: Rule[];
}

interface SubmitCase {
    submitMethod: string;
    actionName: string;
    actionIcon: IconType;
    sendId: boolean;
    newSongSettings: boolean;
    sendPrefs: boolean;
    sendSeeds: boolean;
    sendRules: boolean;
    somethingToRestore: boolean;
}

export const useSubmitCase = ({
    initialState,
    playlist_id,
    preferences,
    seeds,
    rules,
}: SubmitCaseProps): SubmitCase => {
    const hasChanged = useCallback((a: any, b: any) => JSON.stringify(a) !== JSON.stringify(b), []);

    const settingsToBeSaved = useMemo(
        () =>
            hasChanged(
                {
                    name: preferences.name,
                    hue: preferences.hue,
                    frequency: preferences.frequency,
                    on: preferences.on,
                },
                {
                    name: initialState.preferences.name,
                    hue: initialState.preferences.hue,
                    frequency: initialState.preferences.frequency,
                    on: initialState.preferences.on,
                }
            ),
        [preferences, initialState.preferences]
    );

    console.log("settingsToBeSaved", settingsToBeSaved);

    const settingsToBeApplied = useMemo(
        () =>
            hasChanged(
                {
                    amount: preferences.amount,
                    seeds: seeds,
                    rules: rules,
                },
                {
                    amount: initialState.preferences.amount,
                    seeds: initialState.seeds,
                    rules: initialState.rules,
                }
            ),
        [preferences, initialState.preferences, seeds, rules]
    );
    console.log("settingsToBeApplied", settingsToBeApplied);

    // const getSubmitCase = useCallback((): SubmitCase => {
    const submitCases = {
        regenerate: {
            //if the playlist already exists
            //if everything stays the same, just regenerate the playlist
            submitMethod: "PUT",
            actionName: "Regenerate",
            actionIcon: MdShuffle,
            sendId: true,
            newSongSettings: false,
            sendPrefs: false,
            sendSeeds: false,
            sendRules: false,
            somethingToRestore: false,
        } as SubmitCase,
        saveChanges: {
            //if the playlist already exists
            //if name, hue, frequency changes, save the settings
            submitMethod: "PATCH",
            actionName: "Save Changes",
            actionIcon: AiOutlineSave,
            sendId: true,
            newSongSettings: false,
            sendPrefs: true,
            sendSeeds: false,
            sendRules: false,
            somethingToRestore: true,
        } as SubmitCase,
        applyChanges: {
            //if the playlist already exists
            //if seeds, rules or amount changes, apply the changes
            submitMethod: "PUT",
            actionName: "Apply Changes",
            actionIcon: MdShuffle,
            sendId: true,
            newSongSettings: true,
            sendPrefs: true,
            sendSeeds: true,
            sendRules: true,
            somethingToRestore: true,
        } as SubmitCase,
        createNew: {
            //if the playlist does not exist
            //create a new playlist
            submitMethod: "POST",
            actionName: "Generate",
            actionIcon: BsStars,
            sendId: false,
            newSongSettings: true,
            sendPrefs: true,
            sendSeeds: true,
            sendRules: true,
            somethingToRestore: false,
        } as SubmitCase,
    };

    let submitCase;
    if (!playlist_id) submitCase = submitCases.createNew;
    else if (settingsToBeApplied) submitCase = submitCases.applyChanges;
    else if (settingsToBeSaved) submitCase = submitCases.saveChanges;
    else submitCase = submitCases.regenerate;

    console.log("submitCase", submitCase);

    return submitCase;
};
