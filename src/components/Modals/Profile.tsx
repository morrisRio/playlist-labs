"use client";
import { CgProfile } from "react-icons/cg";

/* eslint-disable @next/next/no-img-element */
import { MdLogout, MdOutlineDelete } from "react-icons/md";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import UniModal from "@/components/Modals/UniModal";
import ContextMenu from "./Context";
import { dbDeleteUser } from "@/lib/db/dbActions";

const Profile = () => {
    const { data: session } = useSession();

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);

    const deleteAccount = async () => {
        if (await dbDeleteUser()) signOut();
        else {
            setShowInfoModal(true);
            console.error("Error deleting user");
        }
    };

    const UserImage = (
        <div className="relative">
            {session?.user?.image ? (
                <img src={session.user.image as string} alt="user image" className="size-6 rounded-full" />
            ) : (
                <div aria-label="profile" className="size-6 rounded-full bg-ui-800 text-ui-500">
                    <CgProfile size="1.5rem" />
                </div>
            )}
        </div>
    );

    return (
        <>
            {showInfoModal && (
                <UniModal
                    title="Problem Deleting Account"
                    action={deleteAccount}
                    actionTitle="Try Again"
                    onClose={() => setShowInfoModal(false)}
                >
                    <p>
                        There was a problem deleting your account. Please try again. <br />
                        <br />
                        If the problem persists please contact me at{" "}
                        <a className="text-themetext/90" href="mailto:contact@maurice-rio.de">
                            contact&#64;maurice-rio.de
                        </a>
                    </p>
                </UniModal>
            )}
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
