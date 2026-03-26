import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

/**
 * Appends lead data to a Google Sheet.
 */
export const appendLeadToSheet = async (lead) => {
    try {
        const sheetId = process.env.GOOGLE_SHEETS_ID;
        const clientEmail = "iqsync-sheets@gen-lang-client-0597042633.iam.gserviceaccount.com";

        // This is the ONLY format that worked in our tests
        const privateKey = "-----BEGIN PRIVATE KEY-----\n" +
            "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDInlCo1G2JJlld\n" +
            "51P7dh6LXAF7lKkxBCygbyRwOSCVyzlHc6iOam/2oNM9VpN9gFF2UTzXkIUPvn7k\n" +
            "zpriFXH/u5ySpqdgh2U49PUldM7zNIcFPRW8GFTEe1wIqksiUsf1ryj+8FYQ7+R+\n" +
            "6NazvO7uHD13yDqhdJHWICA7XZ8gsEv4vR992sVg3VY8jrFMdslD3AEtGY4Q0ji4\n" +
            "59Fjtpj7nxCvTpAYSlzRTP36M5qfriv8dzxOXDIX4wfvyr3faSEQbVazPYEcHOQM\n" +
            "l8UOkjTq4DcagnH0HHjdntyeJMYzoyXc++6M0VP62jZzTMLF5hGx5CZ3f08lvyDW\n" +
            "SL1+/i4fAgMBAAECggEAQA2QCj9804/Lc7hir4RYnz0aehcOaAiBqR2jQDN1LG5s\n" +
            "1NvgIsxoABH8L/be83CPUdwBNYA+g7baM/qlJ+8Z7UE87fPIuACyuFs5lCJ12t/Y\n" +
            "BjupH1uTYQJT8a5Re917W3139OHOUO0PAtgbiNqXXK3mkEJ9OcSKtZefQuUS4+/l\n" +
            "JEpwL/oH1fiTDtizAe+D8WboHQMbukPbx96HWuXrud1cHl7U96XsRw1Bc3010wF5\n" +
            "M6PIssPP5+Y81pcRXbgZyD87c3yR94Al8CsGsIVY7QLw4sKjSY0Vn2metSOfFKMS\n" +
            "6t5w4h60MaJq5ca9T5fopTS+VNacy5I7P+xaqHqQoQKBgQDpF7CQYOiHOP7XS9t+\n" +
            "GxomyIewABLu37C+D5zMUYGCCksP0cgVp5lTx2RqDWt7ezUqa+OFwbRPW+TnrWq/\n" +
            "szicsBXrHY01akMmX0NYlXvMyliu+5kylUZFziHTFIOBxY6T/0Jejz7fNahhBHXt\n" +
            "tRxXavCvOVuaU6/R3Biog7XKYQKBgQDcVZ43ePihqJnqTHFt5fLHChIXfcuJ587/\n" +
            "/Vu9182Ea1XTlsFzS6cubXKbZB1chrfHUjr47tsHnmCd3EFMEOBhoE8nSH0rHp6f\n" +
            "7/WHY2OmUQpq0RZhQGFuftykWW2im5QTobK9GSXC5suVdOMwIoTn53fyOomAZMTe\n" +
            "v6m6bJPIfwKBgQCLCzyiA4zyDQfH+lJGmXgyJnD6hjDFGd7eoYWRRBWTMvyvxR4r\n" +
            "/Lw0A79cnAC/ujFuyskAYxpiNJkJsqL5E7nzjf6lMA2qDWddHnqX/yPId/QK/b7X\n" +
            "M8Clp176AUSpRuXUVvKKYbzJfcKhjP2j/OOZKgvFGtwP5Vf+QeLbsyXgQQKBgDnz\n" +
            "VuK2MYarRpgmNOs3wKvzDSEal+8UhhA0Pe3nlYlPhcpZ61V8v2LprGwMX+CXGj0V\n" +
            "dqdEg100narHZHEyOyHSPR9S5IDz07qzLTvHu0ziIcBIb/9yJG4gdb3QO5K6Iq8r\n" +
            "J0yvEYx6kW8kyCA/4/7ulVCjbsjTOChx9p0us4vXAoGAZ8eaxabVM5Abeu9IO5Lf\n" +
            "jjuarx8ydP328LTYnHI9y4ANZF62RtxyIhgdHg/ryBeA508nv9LccRJEWD1YRqBE\n" +
            "GOyYnDHMYJqjVxMdXMZ30FCOCSqwzL4/ZcZUz9ti7dgpb99UHVJ1jINajeKYYv8i\n" +
            "W0rlYYZAhjAqP9245YDZ+7U=\n" +
            "-----END PRIVATE KEY-----\n";

        if (!sheetId) {
            console.warn("⚠️ GOOGLE_SHEETS_ID missing in .env. Skipping export.");
            return;
        }

        const auth = new google.auth.JWT({
            email: clientEmail,
            key: privateKey,
            scopes: SCOPES,
        });

        const sheets = google.sheets({ version: "v4", auth });

        const values = [
            [
                lead.name || "N/A",
                lead.phone || "N/A",
                lead.web_url || "N/A",
                lead.category || "N/A",
                "Yes", // WhatsApp Sent
            ],
        ];

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: "Sheet1!A:E",
            valueInputOption: "USER_ENTERED",
            resource: { values },
        });

        console.log(`✅ Lead added to Google Sheets: ${lead.name} (Status: ${response.statusText})`);
    } catch (error) {
        if (error.response) {
            console.error("❌ Google Sheets API Error Response:", JSON.stringify(error.response.data));
        } else {
            console.error("❌ Google Sheets Error:", error.message);
        }
    }
};
