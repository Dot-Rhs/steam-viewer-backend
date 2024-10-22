let express = require("express");
// import * as dotenv from "dotenv";
let dotenv = require("dotenv");
let axios = require("axios");
let app = express();

dotenv.config();

app.set("port", 5000);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});

app.get("/getPlayer/:id", async function (req, res) {
  try {
    const response = await axios.get(
      `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.API_KEY}&steamids=${req.params.id}`,
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
    // console.log("john: ", req.params.id, req.query.count);
    const data = response.data;
    res.send(data);
  } catch (err) {
    console.log("errororr: ", err);
  }
});

app.get("/getFriends/:id", async function (req, res) {
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

app.get("/:name", (req, res) => {
  console.log(req.params.name);
  res.send(req.params.name);
});

app.listen(app.get("port"), function () {
  console.log(
    "Express started on http://localhost:" +
      app.get("port") +
      "; press Ctrl-C to terminate.",
  );
});
