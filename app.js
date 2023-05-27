const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "./cricketMatchDetails.db");
let db = null;

const installDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server is Running At port 3001");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

installDBAndServer();

// API 1. GET players details

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT 
        player_id AS playerId,
        player_name AS playerName
    FROM 
        player_details
    `;
  const dbResponse = await db.all(getPlayersQuery);
  response.send(dbResponse);
});

// API 2. GET a player
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `
        SELECT 
            player_id AS playerId,
            player_name AS playerName
        FROM 
            player_details
        WHERE 
            player_id = ${playerId}
        `;
  const dbResponse = await db.get(getPlayersQuery);
  response.send(dbResponse);
});

//API 3. PUT a player Details

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const putPlayerQuery = `
    UPDATE 
        player_details
    SET 
        player_name = '${playerName}'
    WHERE 
        player_id = ${playerId}
    `;

  await db.run(putPlayerQuery);
  response.send("Player Details Updated");
});

// API 4. GET a Match Details

app.get("/matches/:matchId", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
        SELECT 
            match_id AS matchId,
            match,
            year
        FROM 
            match_details
        WHERE 
            match_id = ${matchId}
        `;
  const dbResponse = await db.get(getMatchQuery);
  response.send(dbResponse);
});

// API 5.
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
     SELECT 
        match_id AS matchId,
        match,
        year
    FROM 
        player_match_score NATURAL JOIN match_details 
    WHERE 
        player_id = ${playerId}
    `;
  const dbResponse = await db.all(getPlayerMatchesQuery);
  response.send(dbResponse);
});

// API 6. GET player details of a match
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayersQuery = `
         SELECT 
            player_id AS playerId,
            player_name AS playerName
        FROM 
            player_match_score NATURAL JOIN player_details 
        WHERE 
            match_id = ${matchId}
        `;
  const dbResponse = await db.all(getPlayersQuery);
  response.send(dbResponse);
});

// API 7. GET tha statistics of score, fours ,sixes base on  playerID

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getQuery = `
    SELECT 
        player_id AS playerId, 
        player_name AS playerName, 
        SUM(score) AS totalScore,
        SUM(fours) AS totalFours,
        SUM(sixes) AS totalSixes 
    FROM 
        player_match_score NATURAL JOIN player_details 
    WHERE 
        player_id = ${playerId}
    `;

  const dbResponse = await db.get(getQuery);
  response.send(dbResponse);
});

module.exports = app;
