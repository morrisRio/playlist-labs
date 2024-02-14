import Image from "next/image";
import Sidebar from "./components/Sidebar";

export default function Home() {
    return (
        <div className="min-h-screen flex-col">
            <main className="flex row overflow-hidden">
                {/* sidebar */}
                <Sidebar></Sidebar>
                {/* playlist */}
                <h1>this is de main surface</h1>
            </main>
            <div>
                {/* control */}
                <h1>this is da control</h1>
            </div>
        </div>
    );
}
