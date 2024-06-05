import { DefaultSession } from "next-auth";
import { Document } from "mongoose";

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
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    external_urls: { spotify: string };
    explicit: boolean;
    external_ids: { isrc: string };
    href: string;
    id: string;
    name: string;
    popularity: number;
    preview_url: string | null;
    track_number: number;
    type: string;
    uri: string;
}

export interface Seed {
    spotify: string;
    type: string;
    id: string;
    title: string;
    description: string;
    thumbnail: string | number;
}

export type Rule = BooleanRule | AxisRule | RangeRule;

export interface BooleanRule {
    name: string;
    type: "boolean";
    value: boolean;
    range: string[];
    description: string;
}

export interface AxisRule {
    name: string;
    type: "axis";
    value: [number, number];
    range: [string[], string[]];
    description: string;
}

export interface RangeRule {
    name: string;
    type: "range";
    value: number;
    range: number[] | string[];
    description: string;
}

export interface Preferences {
    name: string;
    frequency: string;
    amount: number;
    hasChanged?: boolean;
}

export interface RuleInput extends EventTarget {
    name: string;
    value: string | [number, number];
    type: string;
}

//Mongo Types================================================================

export interface PlaylistData {
    playlist_id?: string;
    preferences: Preferences;
    seeds: Seed[];
    rules?: Rule[];
}

export interface MongoPlaylistData extends Document {
    playlist_id?: string | boolean;
    preferences: Preferences;
    seeds: Seed[];
    rules?: Rule[];
}
