import Sidebar from "@/components/Sidebar";
// import Center from "@/components/Dashboard";

export default async function Home() {
    return (
        <div className="h-full">
            <div className="flex">
                <Sidebar></Sidebar>
                {/* <Center></Center>
            </div>

            <div>
                <h2 className="bg-slate-600">this is da control</h2> */}
            </div>
        </div>
    );
}
