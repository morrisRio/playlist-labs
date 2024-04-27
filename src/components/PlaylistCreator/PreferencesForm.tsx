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
    return (
        <div className="flex flex-col gap-2 mt-8">
            <h3>Preferences</h3>
            <label className="flex mb-4 space-between items-center justify-between text-base">
                Update Frequency
                <select
                    className="block mt-1 p-2 rounded-md bg-zinc-800 focus:outline-none focus:ring focus:border-blue-300 text-sm"
                    name="frequency"
                    value={preferences.frequency}
                    onChange={onChange}
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
                    className="flex items-center justify-between text-base"
                >
                    Number of Tracks
                    <input
                        type="number"
                        className="text-sm hide-arrows p-2 rounded-md bg-zinc-800 focus:outline-none focus:ring focus:border-blue-300 max-w-12"
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
                    className="mt-2 block w-full rounded-md bg-zinc-800 focus:outline-none focus:ring focus:border-blue-300"
                    name="amount"
                    value={preferences.amount}
                    min="5"
                    max="50"
                    onChange={onChange}
                    required
                />
            </div>
            <input
                type="text"
                className="border-b border-b-white bg-transparent p-2 focus:outline-none focus:ring focus:border-blue-300"
                name="description"
                value={preferences.description}
                onChange={onChange}
                placeholder="Description (optional)"
            />
        </div>
    );
}
