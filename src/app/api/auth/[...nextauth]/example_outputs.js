//example Outputs:=========

const getServerSession = {
    //Bspw. im Layout aufgerufen:
    user: {
        name: "karate_morris",
        email: "maurice.rio@gmx.de",
        image: "https://i.scdn.co/image/ab67757000003b821f98e5b65389ae5851e831ca",
    },
};

const useSession = {
    //useEffect für session vom sessionProvider
    data: {
        user: {
            name: "karate_morris",
            email: "maurice.rio@gmx.de",
            image: "https://i.scdn.co/image/ab67757000003b821f98e5b65389ae5851e831ca",
        },
    },
    status: "authenticated",
    update: "[Function: update]",
};

//all data that is returned from the next-auth signIn
const JWTcallBackData = {
    token: {
        token: {
            name: "karate_morris",
            email: "maurice.rio@gmx.de",
            picture:
                "https://i.scdn.co/image/ab67757000003b821f98e5b65389ae5851e831ca",
            sub: "karate_morris",
        },
        user: {
            id: "karate_morris",
            name: "karate_morris",
            email: "maurice.rio@gmx.de",
            image: "https://i.scdn.co/image/ab67757000003b821f98e5b65389ae5851e831ca",
        },
        account: {
            provider: "spotify",
            type: "oauth",
            providerAccountId: "karate_morris",
            access_token:
                "BQDySglQ-Jpx6qlQVhRbeGMdXG6Lt6qiRIRgyxE2TDtF7SM1iiPI1JaggFAtRJBQQ89olkXg2roQN83Eq5_L6LEaQ9HANvh7kaCjSOf0NJNSwhBF8Q_-OVi-z1u683dQ8zRmjJp9Jym-Hy0YLegiJdsIq-kakJY_VrS6gCdsQHQ7zys2rjMzh4eu75tyyxU8g0u15IMAPFg466-ZIeCTD7_o3J3W8tfDBVQWC00MBBkyOvFnwL7vuZO7e99dDTFRaClE",
            token_type: "Bearer",
            expires_at: 1708530072,
            refresh_token:
                "AQCh1vIg2eEypt4AMABynBuPB4Xghjqdfx2QYfKGdaWy0Dlzpo8lPnoor7xG0mjj28vLfcuNk7KKMLGTNLokk1tlNiBXCcQduAvgfbVbJaTMwfcOlfYonE5CYTRu_MlE18k",
            scope: "playlist-read-private playlist-read-collaborative app-remote-control user-modify-playback-state user-library-read playlist-modify-private user-read-playback-state user-read-currently-playing user-read-recently-played user-read-email user-read-playback-position user-top-read",
        },
        profile: {
            display_name: "karate_morris",
            external_urls: [Object],
            href: "https://api.spotify.com/v1/users/karate_morris",
            id: "karate_morris",
            images: [Array],
            type: "user",
            uri: "spotify:user:karate_morris",
            followers: [Object],
            email: "maurice.rio@gmx.de",
        },
        trigger: "signIn",
        iat: 1708526472,
        exp: 1711118472,
        jti: "0c131df0-ad9f-4116-afea-8bad775a7fc2",
    },
};

//First Sign in:

const firstSignIn = {
    name: "karate_morris",
    email: "maurice.rio@gmx.de",
    picture: "https://i.scdn.co/image/ab67757000003b821f98e5b65389ae5851e831ca",
    sub: "karate_morris",
    accessToken:
        "BQCOCF5DFzonM06Pe5nrKqXK4oJpEiA8iqevx7DIvHxYgQ_NEa01Lm-9_H022HLrSLtl9hxBalx4CwcsSOjh-D0yEZJSWRDYMAwOhJV9fEZvLT1hPMpdAYwYKS0-mzBeeMPmGQm3YrTMNfWwGyxb_EElFEHuuVLLM66HkZ7h4tvvqCmHuLhP4ZL63rYy4wP-HuqNe8Xf_izW5GOeKsI5K0WQSHnWGke5IGn1Xl7odfDe2B9NDr57tyFCE_0YePfTvwUr",
    refreshToken:
        "AQCQWLlqg3R1_Z9WILBQKU4eo1r-3RQ9Nkt8IpTm1ouOfn_WAjHAEeUYnmpaQ9BLHaqwac58JK7pFC9KU9D4-r0DMMJQdjYDJbXFNhbAypJLAAUEJi5zUyo1Egn4R0ubpXo",
    username: "karate_morris",
    accessTokenExpires: 1708530890000,
};

const previousTokenDidntExpire = {
    name: "karate_morris",
    email: "maurice.rio@gmx.de",
    picture: "https://i.scdn.co/image/ab67757000003b821f98e5b65389ae5851e831ca",
    sub: "karate_morris",
    accessToken:
        "BQCAvIyI3DzIRTkm2VBNrCsi5YCpx8PuVXA_G0WWpy8aTsKAzkLGGy_53SUb9HkoX6-zfEaPvzHHygna59ZMIvPra1NCDnR58o7pNLRLRCoZuCuwtnuGmgF2hJkjs15J6maMkAo4VsztSzowVNpRJol_Neg9AAkDsosF4U0PDqzTmtyG5v2Mj3gE_QxTjAGNngCOdOtBlEsXejmfO8XbqXob0k2GO5-Hr07Qbhg2JuSyU66G-0PPKit9ZHr08qBMNric-1n-_wTRxsU",
    refreshToken:
        "AQCQWLlqg3R1_Z9WILBQKU4eo1r-3RQ9Nkt8IpTm1ouOfn_WAjHAEeUYnmpaQ9BLHaqwac58JK7pFC9KU9D4-r0DMMJQdjYDJbXFNhbAypJLAAUEJi5zUyo1Egn4R0ubpXo",
    username: "karate_morris",
    accessTokenExpires: 1708539432289,
    iat: 1708536278,
    exp: 1711128278,
    jti: "77a73c69-8f1f-4975-b3d5-f215b1c7b9c0",
};

const refreshedToken = {
    name: "karate_morris",
    email: "maurice.rio@gmx.de",
    picture: "https://i.scdn.co/image/ab67757000003b821f98e5b65389ae5851e831ca",
    sub: "karate_morris",
    accessToken:
        "BQC2fsTs5X1CbZFwpfNLaQ2PgDRKeAmADbBDl3bObtw_osM9xNzz-K5GMZ9F1-F1LqQGPhkj5YqUvtJvPdPi3IV81IFj6SbcmPcDLEO1XhfAOBO11KA3qreNpMSpAkHx622tZBcTYb2ThrCiId3v55O1CORNfG_2N6kffmO2_JG8Pnnugv19GJocX4pODlV8Dw37xxAdwkibJ2J9Oc60ovk9q0BHFALP6-krS4gh7D1D3Akr4DPO2lm3C59TESrFoUmiw4Ww6aPI-ZA",
    refreshToken:
        "AQCQWLlqg3R1_Z9WILBQKU4eo1r-3RQ9Nkt8IpTm1ouOfn_WAjHAEeUYnmpaQ9BLHaqwac58JK7pFC9KU9D4-r0DMMJQdjYDJbXFNhbAypJLAAUEJi5zUyo1Egn4R0ubpXo",
    username: "karate_morris",
    accessTokenExpires: 1708539999761,
    iat: 1708536285,
    exp: 1711128285,
    jti: "43980a02-5e3f-4590-a19c-561f7c5d55b2",
};

//session callback data:

const sessionCallbackData = {
    session: {
        user: {
            name: "karate_morris",
            email: "maurice.rio@gmx.de",
            image: "https://i.scdn.co/image/ab67757000003b821f98e5b65389ae5851e831ca",
        },
        expires: "2024-03-22T14:59:53.231Z",
    },
    token: {
        name: "karate_morris",
        email: "maurice.rio@gmx.de",
        picture:
            "https://i.scdn.co/image/ab67757000003b821f98e5b65389ae5851e831ca",
        sub: "karate_morris",
        accessToken:
            "BQCOCF5DFzonM06Pe5nrKqXK4oJpEiA8iqevx7DIvHxYgQ_NEa01Lm-9_H022HLrSLtl9hxBalx4CwcsSOjh-D0yEZJSWRDYMAwOhJV9fEZvLT1hPMpdAYwYKS0-mzBeeMPmGQm3YrTMNfWwGyxb_EElFEHuuVLLM66HkZ7h4tvvqCmHuLhP4ZL63rYy4wP-HuqNe8Xf_izW5GOeKsI5K0WQSHnWGke5IGn1Xl7odfDe2B9NDr57tyFCE_0YePfTvwUr",
        refreshToken:
            "AQCQWLlqg3R1_Z9WILBQKU4eo1r-3RQ9Nkt8IpTm1ouOfn_WAjHAEeUYnmpaQ9BLHaqwac58JK7pFC9KU9D4-r0DMMJQdjYDJbXFNhbAypJLAAUEJi5zUyo1Egn4R0ubpXo",
        username: "karate_morris",
        accessTokenExpires: 1708530890000,
        iat: 1708527437,
        exp: 1711119437,
        jti: "8a4acf65-2280-4a71-85ef-336138cc14bb",
    },
};

const session_token = {
    name: "karate_morris",
    email: "maurice.rio@gmx.de",
    picture: "https://i.scdn.co/image/ab67757000003b821f98e5b65389ae5851e831ca",
    sub: "karate_morris",
    accessToken:
        "BQC9NUd2-iaJs33uNDWCa-LcLXwR6YAohD6M_QvyHIPDrqwSjDXH8BeOgnQPkSdPIHufboAaRv3hPZGMtA6pgWtWnu2jPBe7viyLmFtXIBq8eRdk9I10JAED4RyySt6pdGWmlOMmi5VME9eqHADjow_b0biM-8Gg9QXI224okiFemUuVg_uaZ3hkk1UGKiLV2d2ck3b-AzeCts613VRPBY1nh6DmZ8uORKgXe3rJbmcJd_xFsBqwGaAYWGU9vqzsAp7R8On2Ox-3-os",
    refreshToken:
        "AQCK2StKom8tfCJhtHgHoiyIbjiUKyKLvrYLpoBuhJFgqwMqPP1lnBSjXlHC0U1t3dqAdv5AvD-8Pdt_d6J6o-IiWXgb4LmqiSUEgom5NSbmWa_DKFcry6RUvy4uxPc3FVg",
    username: "karate_morris",
    accessTokenExpires: 1708597637215,
    iat: 1708548702,
    exp: 1711140702,
    jti: "0a7f47a6-18a8-4b22-9f08-097f79658b64",
};
