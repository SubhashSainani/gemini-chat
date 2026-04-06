import axios from "axios";

let BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
if (BASE_URL && !BASE_URL.startsWith("http")) {
    BASE_URL = "https://" + BASE_URL;
}
const API_URL = `${BASE_URL}/api/qna/ask`;

export const streamChatResponse = async (question, file, token, sessionId, onUpdate) => {
    try {
        const formData = new FormData();
        formData.append("question", question);
        if (file) formData.append("file", file);
        if (sessionId) formData.append("sessionId", sessionId);

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`API Error ${response.status}: ${errBody}`);
        }
        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            let boundary = buffer.indexOf('\n\n');
            while (boundary !== -1) {
                const eventStr = buffer.substring(0, boundary);
                buffer = buffer.substring(boundary + 2);

                const lines = eventStr.split('\n');
                let eventText = [];
                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        eventText.push(line.substring(6));
                    } else if (line.startsWith("data:")) {
                        eventText.push(line.substring(5));
                    }
                }
                if (eventText.length > 0) {
                    onUpdate(eventText.join('\n'));
                }
                boundary = buffer.indexOf('\n\n');
            }
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}
export const fetchSessions = async (token) => {
    const res = await fetch(`${BASE_URL}/api/qna/sessions`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error("API Error 401");
        throw new Error("Failed to fetch sessions");
    }
    return await res.json();
}

export const fetchSessionMessages = async (sessionId, token) => {
    const res = await fetch(`${BASE_URL}/api/qna/sessions/${sessionId}/messages`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error("API Error 401");
        throw new Error("Failed to fetch messages");
    }
    return await res.json();
}