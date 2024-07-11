import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../../tailwind.config";

interface PreferencesProps {
    preferences: Preferences;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

interface Preferences {
    frequency: string;
    amount: number;
    description?: string;
}

export default function PreferencesForm({ preferences, onChange }: PreferencesProps) {
    const fullConfig = resolveConfig(tailwindConfig);
    //@ts-expect-error
    const bgColor = fullConfig.theme.colors.ui[700];
    //@ts-expect-error
    const progressColor = fullConfig.theme.colors.ui[500];
    return (
        <div className="flex flex-col gap-4 rounded-xl p-4">
            <label className="flex space-between items-center justify-between text-base text-ui-500">
                Update Frequency
                <select
                    className="block p-2 rounded-lg border border-ui-700 bg-ui-850 text-ui-500 focus:outline-none focus:ring focus:border-themetext text-sm"
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
                <label htmlFor="amount" className="flex items-center justify-between text-base  text-ui-500">
                    Number of Tracks
                    <input
                        type="number"
                        className="text-sm hide-arrows p-2 rounded-lg border border-ui-700 bg-ui-850 max-w-12  text-ui-500"
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
                    style={{
                        backgroundColor: bgColor,
                        background: `linear-gradient(90deg, ${progressColor} ${
                            ((preferences.amount - 5) / 45) * 100
                        }%, ${bgColor} ${((preferences.amount - 5) / 45) * 100}%)`,
                    }}
                />
            </div>
        </div>
    );
}
