"use client";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import Modal from "./Modal";

const Profile = () => {
    const { data: session } = useSession();

    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const initDeleteAccount = () => {
        setShowConfirmModal(true);
        deleteAccount();
    };

    const deleteAccount = async () => {
        await fetch("/api/user/delete", {
            method: "DELETE",
        });
        signOut();
    };
    return (
        <header>
            {showProfileModal && (
                <Modal onModalBlur={() => setShowProfileModal(false)}>
                    <div className="flex flex-col items-center">
                        {session?.user?.image ? (
                            <img src={session.user.image as string} alt="user image" className="size-8 rounded-full" />
                        ) : (
                            <div aria-label="profile" className="h-10 w-10 rounded-full bg-lime-400"></div>
                        )}
                        <h5>{session?.user?.name}</h5>
                        <button
                            className="text-ui-600 text-left hover:text-neutral-400"
                            onClick={() => signOut()}
                            type="button"
                        >
                            Sign out
                        </button>
                        <button onPointerDown={initDeleteAccount}>Delete my playlistLabs account</button>
                    </div>
                </Modal>
            )}
            <div className="flex gap-3 items-center" onPointerDown={() => setShowProfileModal(true)}>
                {session?.user?.image ? (
                    <img src={session.user.image as string} alt="user image" className="size-8 rounded-full" />
                ) : (
                    <div aria-label="profile" className="h-10 w-10 rounded-full bg-lime-400"></div>
                )}
            </div>
        </header>
    );
};

export default Profile;
