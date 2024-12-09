"use client";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

import ContextMenu from "./Context";
import UniModal from "@/components/Modals/UniModal";

import { CgProfile } from "react-icons/cg";
import { MdLogout, MdOutlineDelete } from "react-icons/md";

const Profile = () => {
    const { data: session } = useSession();

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showNoModal, setShowNoModal] = useState(false);

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
            {showConfirmModal && (
                <UniModal
                    title="Delete Account"
                    action={() => setShowNoModal(true)}
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
                    <br />
                    <p className="text-ui-700">In Demo Mode, you can&apos;t delete the account. </p>
                </UniModal>
            )}
            {showNoModal && (
                <UniModal
                    title="You really can't delete this"
                    onClose={() => setShowNoModal(false)}
                    closeTitle="Ok, sorry"
                >
                    <p>
                        I appreciate you looking around, but trust me, i won&#39;t let you delete the Demo Account{" "}
                        <br />
                    </p>
                </UniModal>
            )}
            <ContextMenu contextTitle={session?.user?.name || "no title"} contextIcon={UserImage}>
                <button onPointerDown={() => signOut()}>
                    <MdLogout />
                    Sign Out
                </button>
                <button
                    className="text-red-800/40"
                    onPointerDown={() => {
                        setShowConfirmModal(true);
                    }}
                >
                    <MdOutlineDelete />
                    Delete Account
                </button>
                <p className="text-xs text-ui-700">{"(Can't delete Demo Account)"}</p>
            </ContextMenu>
        </>
    );
};

export default Profile;
