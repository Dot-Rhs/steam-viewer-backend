let express = require("express");
// import * as dotenv from "dotenv";
let dotenv = require("dotenv");
let axios = require("axios");
let app = express();
let handleStats = require("./helpers/handleStats.js");

dotenv.config();

app.set("port", process.env.PORT ?? 5000);

const headers = {
  "Content-Security-Policy":
    "default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Origin-Agent-Cluster": "?1",
  "Referrer-Policy": "no-referrer",
  "Strict-Transport-Security": "max-age=15552000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-DNS-Prefetch-Control": "off",
  "X-Download-Options": "noopen",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Permitted-Cross-Domain-Policies": "none",
  "X-XSS-Protection": "0",
};

const gameInfoService = `http://gameinfoservice:5001/getGameInfo`;
const playerInfoService = `http://playerinfoservice:5002/getPlayerInfo`;
// const gameInfoService = `${process.env.GAMES_API_BASE_DOMAIN}/getGameInfo`;
// const playerInfoService = `${process.env.PLAYERS_API_BASE_DOMAIN}/getPlayerInfo`;

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  res.set(headers);
  next();
});

app.use((req, res, next) => {
  console.log(
    "incoming request: " + req.method + " " + req.url,
    gameInfoService,
    playerInfoService,
  );
  next();
});

app.get("/player/:id", async function (req, res) {
  try {
    const [playerDetails, friendsList, ownedGames, recentlyPlayed] =
      await Promise.allSettled([
        axios.get(`${playerInfoService}/${req.params.id}`),
        axios.get(`${playerInfoService}/${req.params.id}/friends`),
        axios.get(`${playerInfoService}/${req.params.id}/ownedGames`),
        axios.get(`${playerInfoService}/${req.params.id}/recentlyPlayed`),
      ]);

    const data = {
      ...playerDetails.value.data,
      ...friendsList.value.data,
      ownedGames: ownedGames.value.data,
      recentlyPlayed: recentlyPlayed.value.data,
    };

    res.send(data);
  } catch (err) {
    console.log("errororr: ", err);
    res
      .status(500)
      .send("Error fetching player details. Please try again later.");
  }
});

app.get("/getPlayer/friends/:id", async function (req, res) {
  try {
    const response = await axios.get(
      `http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${process.env.API_KEY}&steamid=${req.params.id}&relationship=friend`,
    );
    const data = response.data;
    res.send(data);
  } catch (err) {
    console.log("errororr: ", err);
  }
});

app.get("/getNews/:id", async function (req, res) {
  try {
    const response = await axios.get(
      `http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${req.params.id}&count=${req.query.count}&format=json`,
    );

    const data = response.data;
    res.send(data);
  } catch (err) {
    console.log("errororr: ", err);
  }
});

app.get("/aggregateGameInfo/:id", async (req, res) => {
  try {
    const [gameInfo, currentPlayers] = await Promise.allSettled([
      axios.get(`${gameInfoService}/${req.params.id}`),
      axios.get(`${gameInfoService}/${req.params.id}/players`),
    ]);

    let result = {};

    if ("value" in gameInfo && "value" in currentPlayers) {
      result = {
        ...gameInfo.value.data,
        data: {
          ...gameInfo.value.data.data,
          currentPlayers: currentPlayers.value.data?.player_count || null,
        },
      };
    }

    res.send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/getUserGameStats/:id/:appid", async (req, res) => {
  let result = {
    achievements: [],
    stats: [],
  };

  try {
    const [gameInfo, playerStats] = await Promise.allSettled([
      axios.get(`${gameInfoService}/${req.params.appid}/gameStats`),
      axios.get(
        `${playerInfoService}/${req.params.id}/gameStats/${req.params.appid}`,
      ),
    ]);

    if ("value" in playerStats && "value" in gameInfo) {
      const [aggregatedAchievements, aggregatedStats] = handleStats(
        gameInfo,
        playerStats,
      );

      result = {
        achievements: aggregatedAchievements,
        stats: aggregatedStats,
      };
      res.send(result);
    }
  } catch (error) {
    res.status(404).send(result);
  }
});

app.listen(app.get("port"), function () {
  console.log(
    `Express started on ${process.env.SERVER_API_BASE_DOMAIN}` +
      // app.get("port") +
      "; press Ctrl-C to terminate.",
  );
});
