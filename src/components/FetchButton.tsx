"use client";

import { testFunction } from "@/lib/serverUtils";

function FetchButton() {
    return (
        <div className="flex flex-col p-6 gap-10 rounded-md border border-pink-600">
            TestComponent
            <button
                className="p-4 rounded-md bg-pink-950 border border-pink-500 text-white"
                type="button"
                onClick={() => testFunction()}
            >
                Test Me
            </button>
        </div>
    );
}

export default FetchButton;
