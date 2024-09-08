"use client";

function FetchButton() {
    const testFunction = async () => {
        console.log("Test started");
        const res = await fetch(`/api/cron`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(async (res) => {
                const response = await res.json();
                return response;
            })
            .catch((err) => {
                console.error(err);
                return { data: null, message: "smthn went wrong" };
            });

        if ("data" in res) console.log("Test ended", res.data);
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
