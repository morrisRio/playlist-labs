> ⚠️ **IMPORTANT NOTICE**
>
> Spotify has announced the deprecation of several key features in their Web API, effective **27th November**. Unfortunately, they provided limited details regarding this change.
>
> 🔗 For more (but not much) information, see their announcement: [Introducing some changes to our Web API](https://community.spotify.com/t5/Spotify-for-Developers/Changes-to-Web-API/td-p/6540414).
>
> ❤️ Love supporting artists? Consider trying Apple Music, which reportedly pays **double the royalties** to artists: [Subscribe to Apple Music](https://music.apple.com/us/subscribe).

# playlistLabs - Spotify Discover Playlist Generator

Take full control of new music recommendations and dive into fresh tracks with playlists that are made for you, by you.

## Introduction

**playlistLabs** is a Next.js web app that empowers users to create custom Spotify playlists based on set preferences and automatically refreshes them at a specified frequency. It leverages the **Spotify Web API**, **Vercel Cron Jobs**, and a **MongoDB** database (modeled with Mongoose) to offer a tailored, dynamic music discovery experience.

**Inspiration**: This app was inspired by the overwhelming amount of mid lofi hip-hop and and random 'The Three Investigators' episodes in my Spotify Discover Weekly playlists.

## Features

-   **Customizable Playlists**: Users can create playlists by selecting up to five "seed" preferences (artists, tracks, genres) and by setting rules for track characteristics (e.g., danceability, mood, tempo).
-   **Automated Updates**: Set your playlist to refresh at specific intervals, ensuring it stays fresh with the latest recommendations.
-   **Integrated with Spotify API**: Full Spotify API integration allows users to connect directly to their Spotify account for seamless playlist creation and updates.
-   **Coming Soon**: Playlist version review and restoration for tracking playlist history (backend prepared, frontend work in progress).

## Getting Started

To set up and run llaylistLabs locally, follow these steps.

### Prerequisites

1. **Spotify Developer Account**:

    - Create a [Spotify Developer Account](https://developer.spotify.com/dashboard/applications) to obtain a **Client ID** and **Client Secret**.
    - Add your NextAuth callback URL to the callback urls:
        - Go to your app settings in the Spotify Dashboard
        - Add `http://localhost:3000/api/auth/callback/spotify` to the Redirect URIs
        - Save the changes

2. **MongoDB Database**:
    - Set up a MongoDB database (e.g., via MongoDB Atlas) and acquire the connection URI (include your username and password).

### Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/morrisRio/playlistlabs.git
    cd playlistlabs
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Environment Variables**:

    - Create a `.env` file based on the provided `.env.example`, adding your Spotify credentials, MongoDB URI and NextAuth secet.
    - You can generate a secret using the following command in your terminal

    ```bash
    openssl rand -base64 64
    ```

4. **Run the development server**:
    ```bash
    npm run dev
    ```
    - Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## Tech Stack

-   **Frontend**: Next.js with the App Router, Tailwind CSS
-   **API/Backend**: NextAuth.js for authentication, SWR for data fetching, MongoDB for storage
-   **Deployment**: Hosted on Vercel, with Vercel Cron Jobs for scheduled playlist updates

## Roadmap

-   **Playlist Versioning**: Future versions will include the ability to review and restore past playlist versions, allowing users to track the history of their playlist changes.
-   **User Feedback & Suggestions**: As this app is currently in beta, feedback is welcomed to improve the experience.

## Contributing

Contributions are welcome!

1. Fork the Repository
2. Create a Feature Branch (`git checkout -b feature/YourFeature`)
3. Commit Your Changes
4. Push to Branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

For questions or feedback, please contact the maintainer:

-   Email: hello@playlist-labs.com
-   GitHub: morrisRio
