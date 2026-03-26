import { google } from "googleapis";
import readline from "readline";
import dotenv from "dotenv";

dotenv.config();

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
    console.error("❌ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing in .env");
    process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "http://localhost:3000" // This doesn't matter much for local token generation
);

const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
});

console.log("🚀 Authorize this app by visiting this url:");
console.log(authUrl);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question("👉 Enter the code from that page here: ", (code) => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
        if (err) return console.error("❌ Error retrieving access token", err);
        console.log("\n✅ Success! Add this to your .env file:\n");
        console.log(`GOOGLE_REFRESH_TOKEN=${token.refresh_token}`);
    });
});
