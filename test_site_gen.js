
import fetch from 'node-fetch';

const test = async () => {
    const url = 'http://localhost:5018/api/ai/generate-site-code';
    const body = {
        lead: {
            name: "Debug Test",
            category: "Testing",
            description: "Testing robust JSON handling."
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
            console.log("Response Keys:", Object.keys(json));
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
