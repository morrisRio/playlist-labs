"use client";

function FetchButton() {
    const testFunction = async () => {
        console.log("Test started");
        const res = await fetch("/api/spotify/playlist/cover-image", {
            method: "POST",
            body: JSON.stringify({ test: "test" }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(async (res) => {
                await res.json();
            })
            .then((data) => {
                return data;
            })
            .catch((err) => console.error(err));
        console.log("Test ended", res);
    };
    return (
        <div className="flex flex-col p-6 gap-10 rounded-md border border-pink-600">
            TestComponent
            <button
                className="p-4 rounded-md bg-pink-950 border border-pink-500 text-white"
                type="button"
                onClick={testFunction}
            >
                Test Me
            </button>
        </div>
    );
}

export default FetchButton;
