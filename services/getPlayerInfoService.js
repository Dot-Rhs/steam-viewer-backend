const express = require("express");
const axios = require("axios");
let dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 5002;

app.get("/getPlayerInfo/:id", async (req, res) => {
  try {
    const getPlayer = await axios.get(
      `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.API_KEY}&steamids=${req.params.id}`,
    );
    const data = getPlayer.data;
    console.log("hi: ", data);
    res.send(data);
  } catch (err) {
    console.log("errororr: ", err);
    res
      .status(500)
      .send("Error fetching playersss details. Please try again later.");
  }
});

app.get("/getGameInfo/:id/wishlist", async (req, res) => {
  try {
    const response = await axios.get(
      `http://api.steampowered.com//ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${req.params.id}`,
    );

    const data = response.data.response;

    res.send(data);
  } catch (err) {
    console.log("errororr: ", err);
    res.status(500).send({ err: err.message, params: req.params });
  }
});

app.listen(port, () => {
  console.log(`User service running on http://localhost:${port}`);
});
