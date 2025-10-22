import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

async function getAccessToken() {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const tokenUrl = `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`;
  const response = await fetch(tokenUrl, { method: "POST" });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to get Twitch access token:", errorText);
    throw new Error("Failed to authenticate with Twitch.");
  }
  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 3600) * 1000;
  return accessToken;
}

app.post("/api/igdb", async (req, res) => {
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    return res
      .status(500)
      .json({ error: "Twitch credentials are not configured." });
  }

  try {
    const token = await getAccessToken();
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required." });
    }

    const igdbResponse = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: query,
    });

    if (!igdbResponse.ok) {
      const errorText = await igdbResponse.text();
      console.error("IGDB API Error:", errorText);
      throw new Error(`IGDB API responded with status ${igdbResponse.status}`);
    }

    const data = await igdbResponse.json();
    res.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    res.status(500).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`Express server listening at http://localhost:${port}`);
});
