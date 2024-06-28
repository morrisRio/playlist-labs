/* eslint-disable @next/next/no-img-element */
"use client";
import { MdLogout, MdOutlineDelete } from "react-icons/md";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import UniModal from "@/components/UniModal";
import ContextMenu from "./Context";

const Profile = () => {
    const { data: session } = useSession();
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const deleteAccount = async () => {
        console.log("Deleting Account");
    };

    const UserImage = (
        <div className="relative">
            {session?.user?.image ? (
                <img src={session.user.image as string} alt="user image" className="size-6 rounded-full" />
            ) : (
                <div aria-label="profile" className="size-6 rounded-full bg-lime-400"></div>
            )}
        </div>
    );

    return (
        <>
            {showConfirmModal && (
                <UniModal
                    title="Delete Account"
                    action={deleteAccount}
                    actionTitle="Delete"
                    actionDanger={true}
                    onClose={() => setShowConfirmModal(false)}
                >
                    <p>
                        This action will delete your account and all associated data irreversibly. This includes all
                        playlists and preferences. In fact that&apos;s all we store for you
                        <br />
                        <br />
                        For security reasons we won&apos;t delete generated playlists on Spotify.
                    </p>
                </UniModal>
            )}
            <ContextMenu contextTitle={session?.user?.name || "no title"} contextIcon={UserImage}>
                <button onPointerDown={() => signOut()}>
                    <MdLogout />
                    Sign Out
                </button>
                <button
                    className="text-red-800"
                    onPointerDown={() => {
                        setShowConfirmModal(true);
                    }}
                >
                    <MdOutlineDelete />
                    Delete Account
                </button>
            </ContextMenu>
        </>
    );
};

export default Profile;
