"use client";
import { signOut, useSession } from "next-auth/react";

const Profile = () => {
    const { data: session } = useSession();

    // console.log("session on clientComponent: ", session);

    return (
        <header>
            <div className="flex p-5 gap-3 items-center">
                {session?.user?.image ? (
                    <img
                        src={session.user.image as string}
                        alt="user image"
                        className="h-10 w-10 rounded-full"
                    />
                ) : (
                    <div
                        aria-label="profile"
                        className="h-10 w-10 rounded-full bg-fuchsia-500"
                    ></div>
                )}
                <div className="flex flex-col">
                    <h5>{session?.user?.name}</h5>
                    <button
                        className=" text-neutral-500 text-left hover:text-neutral-400"
                        onClick={() => signOut()}
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Profile;
