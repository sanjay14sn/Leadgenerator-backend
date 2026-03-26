
import fetch from 'node-fetch';

const test = async () => {
    const url = 'http://localhost:5024/api/ai/generate-site-code';
    const body = {
        lead: {
            name: "Debug Test",
            category: "Testing",
            description: "Testing robust JSON handling.",
            phone: "1234567890",
            user: "64ed7b000000000000000000" // Dummy ObjectId hex string
        },
        instructions: "Simple valid response."
    };

    console.log("Sending...");
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        console.log("Status:", res.status);
        const text = await res.text();
        try {
            const json = JSON.parse(text);
            console.log("Response:", json);
            if (json.lead) console.log("Lead object present: Yes");
            else console.log("Lead object present: No (Expected if no ID provided)");
        } catch (e) {
            console.log("Response (Text):", text.substring(0, 500));
        }
    } catch (e) {
        console.error(e);
    }
};
test();
