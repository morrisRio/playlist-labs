import { twUi700, twUi500 } from "@/lib/utils";

import { MdInfoOutline, MdKeyboardArrowDown } from "react-icons/md";

interface PreferencesProps {
    preferences: Preferences;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

interface Preferences {
    frequency: string;
    amount: number;
    description?: string;
    on?: number;
}

export default function PreferencesForm({ preferences, onChange }: PreferencesProps) {
    const selectStyle =
        "flex-grow p-2 px-3 rounded-lg bg-ui-850 border border-ui-700 text-ui-400 focus:outline-none focus:ring focus:border-themetext text-sm appearance-none";

    return (
        <div className="flex flex-col gap-4 rounded-xl p-4">
            <label htmlFor="frequency" className="flex flex-col justify-between text-base text-ui-500">
                Update Frequency
                <div className="flex w-full justify-between gap-2 items-center mt-4">
                    <div className="flex-grow flex relative items-center">
                        <select
                            className={selectStyle}
                            name="frequency"
                            value={preferences.frequency}
                            onChange={onChange}
                            required
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="never">Never</option>
                        </select>

                        <div className="absolute right-1 pointer-events-none">
                            <MdKeyboardArrowDown></MdKeyboardArrowDown>
                        </div>
                    </div>
                    {
                        {
                            daily: (
                                <>
                                    <MdInfoOutline size="1.5rem" className="text-ui-650"></MdInfoOutline>
                                    <p className="text-sm text-ui-600">
                                        Daily playlists are updated every day at midnight.
                                    </p>
                                </>
                            ),
                            weekly: (
                                <>
                                    <p className="text-base text-ui-600">on</p>
                                    <div className="flex-grow flex relative items-center">
                                        <select
                                            className={selectStyle}
                                            name="on"
                                            value={preferences.on}
                                            onChange={onChange}
                                            required
                                        >
                                            <option value="0">Mondays</option>
                                            <option value="1">Tuesdays</option>
                                            <option value="2">Wednesdays</option>
                                            <option value="3">Thursdays</option>
                                            <option value="4">Fridays</option>
                                            <option value="5">Saturdays</option>
                                            <option value="6">Sundays</option>
                                        </select>
                                        <div className="absolute right-1 pointer-events-none">
                                            <MdKeyboardArrowDown></MdKeyboardArrowDown>
                                        </div>
                                    </div>
                                </>
                            ),
                            monthly: (
                                <>
                                    <p className="text-base text-ui-600">at the</p>
                                    <div className="flex-grow flex relative items-center">
                                        <select
                                            className={selectStyle}
                                            name="on"
                                            value={preferences.on}
                                            onChange={onChange}
                                            required
                                        >
                                            <option value="0">beginning</option>
                                            <option value="15">middle</option>
                                            <option value="28">end</option>
                                        </select>
                                        <div className="absolute right-1 pointer-events-none">
                                            <MdKeyboardArrowDown></MdKeyboardArrowDown>
                                        </div>
                                    </div>
                                    <p className="text-base text-ui-600">of the Month</p>
                                </>
                            ),
                            never: (
                                <>
                                    <MdInfoOutline size="2rem" className="text-ui-700"></MdInfoOutline>
                                    <p className=" flex-grow text-sm text-ui-600">
                                        This Playlist will never be updated automatically.
                                    </p>
                                </>
                            ),
                        }[preferences.frequency]
                    }
                </div>
            </label>
            <div>
                <label htmlFor="amount" className="flex items-center justify-between text-base text-ui-500">
                    Number of Tracks
                    <input
                        type="number"
                        className="text-sm hide-arrows p-2 rounded-lg max-w-12  text-ui-400 bg-ui-850 border border-ui-700"
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
                        backgroundColor: twUi700,
                        background: `linear-gradient(90deg, ${twUi500} ${
                            ((preferences.amount - 5) / 45) * 100
                        }%, ${twUi700} ${((preferences.amount - 5) / 45) * 100}%)`,
                    }}
                />
            </div>
        </div>
    );
}
