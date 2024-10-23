"use client";

import { PlaylistVersion } from "@/types/spotify";

interface TrackHistoryProps {
    trackHistory: string[] | PlaylistVersion[];
}
function TrackHistory({ trackHistory }: TrackHistoryProps) {
    console.log("history in component", trackHistory);

    return (
        <>
            {trackHistory && (
                <div className="flex flex-col gap-2 divide-y divide-ui-400">
                    {trackHistory.map((track, index) => (
                        <div key={index} className="flex flex-col items-center gap-2">
                            <p className="text-lg font-semibold">{track.toString()}</p>
                            {/* <p className="text-sm">{track.artist}</p> */}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
export default TrackHistory;
