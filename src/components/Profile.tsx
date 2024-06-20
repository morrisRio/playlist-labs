"use client";
import { MdLogout, MdOutlineDelete } from "react-icons/md";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import UniModal from "@/components/UniModal";

const Profile = () => {
    const { data: session } = useSession();

    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const initDeleteAccount = () => {
        setShowConfirmModal(true);
        deleteAccount();
    };

    const deleteAccount = async () => {
        console.log("Deleting Account");
    };
    return (
        <>
            {showProfileMenu && (
                <div className="absolute inset-0 bg-ui-950/80 z-10" onClick={() => setShowProfileMenu(false)}></div>
            )}
            {showConfirmModal && (
                <UniModal
                    title="Delete Account"
                    action={() => deleteAccount()}
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
            <div className="relative z-20">
                <div className="flex gap-3 items-center " onPointerDown={() => setShowProfileMenu(true)}>
                    {showProfileMenu && (
                        <div className="absolute gap-2 bg-ui-900 border border-ui-700 -right-2 -top-2 rounded-lg p-3">
                            <div className="text-ui-600 text-sm flex gap-4">
                                <div className="pl-3 pb-3">
                                    <span className="text-nowrap">{session?.user?.name}</span>
                                </div>
                                <div className="size-6 rounded-full bg-ui-950"></div>
                            </div>
                            <hr className="border-ui-700 -mx-2"></hr>
                            <button
                                className="text-lg text-themetext text-nowrap flex flex-row items-center gap-2 p-3"
                                onPointerDown={() => signOut()}
                            >
                                <MdLogout />
                                Sign out
                            </button>
                            <button
                                className="text-lg text-red-800 text-nowrap flex flex-row items-center gap-2 p-3"
                                onPointerDown={() => initDeleteAccount()}
                            >
                                <MdOutlineDelete />
                                Delete my Account
                            </button>
                        </div>
                    )}
                    {session?.user?.image ? (
                        <img src={session.user.image as string} alt="user image" className="size-6 rounded-full z-30" /> // eslint-disable-line
                    ) : (
                        <div aria-label="profile" className="size-6 rounded-full bg-lime-400 z-30"></div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Profile;
