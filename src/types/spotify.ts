import exp from "constants";
import { DefaultSession } from "next-auth";

interface AuthUser {
    name: string;
    email: string;
    picture?: string | null;
    image?: string | null;
    accessToken: string;
    refreshToken: string;
    sub: string;
    expires_at: number;
}

export interface AuthSession extends Omit<DefaultSession, "user"> {
    accessToken: AuthUser;
    user: AuthUser;
}
//Spotify Types================================================================

interface Image {
    height: number | null;
    url: string;
    width: number | null;
}

export interface Playlist {
    collaborative?: boolean;
    description?: string | null;
    external_urls: {
        spotify: string;
    };
    followers: {
        total: number;
    };
    href: string;
    id: string;
    images: Image[];
    name: string;
    owner: {
        id: string;
        display_name?: string;
    };
    items?: [{ added_at: string; track: Track }];
    tracks: {
        items: [{ added_at: string; track: Track }];
        total: number;
    };
    type: string;
    total?: number;
}

export interface Album {
    id: string;
    name: string;
    artists: Artist[];
    images: Image[];
    album_type?: string;
    release_date: string;
    tracks: {
        total: number;
        items: Track[];
    };
}

export interface Artist {
    external_urls: { spotify: string };
    followers: { total: number };
    genres: string[];
    href: string;
    id: string;
    images: { height: number; url: string; width: number }[];
    name: string;
    popularity: number;
    type: string;
    uri: string;
}

export interface Track {
    album: {
        images: { height: number; url: string; width: number }[];
    };
    artists: { name: string }[];
    external_urls: { spotify: string };
    id: string;
    name: string;
    type: string;
}

export interface Seed {
    spotify: string;
    type: string;
    id: string;
    title: string;
    description: string;
    thumbnail: string;
}

export interface Rule {
    name: string;
    type: "boolean" | "axis" | "range";
    value: number | boolean | number[];
    range: string[] | boolean[] | string[][];
    description: string;
}

export interface Preferences {
    name: string;
    frequency: string;
    amount: number;
}
