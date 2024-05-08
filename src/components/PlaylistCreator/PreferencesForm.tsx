import { useState } from "react";
import { MdModeEdit } from "react-icons/md";

interface PreferencesProps {
    preferences: Preferences;
    onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => void;
}

interface Preferences {
    frequency: string;
    amount: number;
    description?: string;
}

export default function PreferencesForm({
    preferences,
    onChange,
}: PreferencesProps) {
    // const [options, setOptions] = useState(["daily", "wely", "monthly"]);

    return (
        <div className="flex flex-col gap-8 rounded-xl p-4">
            <h3 className="font-semibold">Preferences</h3>
            <label className="flex space-between items-center justify-between text-base">
                Update Frequency
                <select
                    className="block mt-1 p-2 rounded-md bg-zinc-800 focus:outline-none focus:ring focus:border-blue-300 text-sm"
                    name="frequency"
                    value={preferences.frequency}
                    onChange={onChange}
                    required
                >
                    // <option value="daily">Daily</option>
                    // <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
            </label>
            <div>
                <label
                    htmlFor="amount"
                    className="flex items-center justify-between text-base"
                >
                    Number of Tracks
                    <input
                        type="number"
                        className="text-sm hide-arrows p-2 rounded-md bg-zinc-800 max-w-12"
                        name="amount"
                        value={preferences.amount}
                        min="5"
                        max="50"
                        onChange={onChange}
                        required
                    />
                </label>

                <input
                    type="range"
                    className="mt-4 w-full"
                    name="amount"
                    value={preferences.amount}
                    min="5"
                    max="50"
                    onChange={onChange}
                    required
                />
            </div>
        </div>
    );
}
