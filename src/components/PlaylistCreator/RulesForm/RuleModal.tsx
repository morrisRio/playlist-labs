import React from "react";
import { Rule } from "@/types/spotify";
import { MdOutlineArrowBackIos } from "react-icons/md";
import { RuleEntry } from "./Rule";

interface RuleModalProps {
    onAdd: (rule: Rule) => void;
    onRemove: (id: string) => void;
    onClose: () => void;
    rules: Rule[];
}

function RuleModal({ onAdd, onRemove, onClose, rules }: RuleModalProps) {
    const ruleArray: Rule[] = [
        {
            name: "Danceability",
            type: "range",
            value: 0.5,
            range: ["Not Dancable", "Danceable"],
            description:
                "How suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity.",
        },
        {
            name: "Mood",
            type: "axis",
            value: [0.5, 0.5],
            range: [
                ["negative", "positive"],
                ["low arousal", "high arousal"],
            ],
            description:
                "Choose the Mood according to the Arousal-Valence model of emotions (Amount of Arousal and Valence of a Track).",
        },
        {
            name: "Instrumentalness",
            type: "range",
            value: 0.5,
            range: ["Vocal", "Instrumental"],
            description:
                "High value represents more instrumental tracks, low represents more vocals in tracks.",
        },
        {
            name: "Accousticness",
            type: "range",
            value: 0.5,
            range: ["Synthetic", "Accoustic"],
            description: "Whether the Song is accoustic or not.",
        },
        {
            name: "Liveness",
            type: "range",
            value: 0.5,
            range: ["Studio", "Live"],
            description:
                "Want to listen to live performances? Detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live. A value above 0.8 provides strong likelihood that the track is live.",
        },
        {
            name: "Popularity",
            type: "range",
            value: 0.5,
            range: ["Underground", "Mainstream"],
            description:
                "Want to filter out mainstream music? Or only listen to what others approved by listening to it? This is the right filter for you.",
        },
        {
            name: "Mode",
            type: "boolean",
            value: false,
            range: ["Minor", "Major"],
            description: "Choose between Tracks using Minor or Major mode.",
        },
        {
            name: "Tempo",
            type: "range",
            value: 100,
            range: ["40", "200"],
            description: "Choose the Tempo of the Track.",
        },
    ];

    return (
        <div className="absolute h-full w-full top-0 left-0 p-4 bg-gradient">
            <header className="flex items-center gap-4">
                <button onClick={onClose}>
                    <MdOutlineArrowBackIos size="2em" />
                </button>
                <h2>Add Rule</h2>
            </header>
            <div className="relative mt-8">
                {ruleArray.map(
                    (rule, index) =>
                        !rules.some((r) => r.name === rule.name) && (
                            <RuleEntry
                                rule={rule}
                                onRemove={onRemove}
                                onAdd={onAdd}
                                control={false}
                                key={index}
                                added={rules.some((r) => r.name === rule.name)}
                            ></RuleEntry>
                        )
                )}
            </div>
        </div>
    );
}

export default RuleModal;
