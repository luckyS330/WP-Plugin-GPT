function startConversation(message) {
    const input = document.getElementById("user-input");
    if (input) {
        input.value = message;
        document.getElementById("chat-input-form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    }
}

(function waitForChatElements() {
    const form = document.getElementById("chat-input-form");
    const input = document.getElementById("user-input");
    const chatThread = document.getElementById("chat-thread");
    const micBtn = document.getElementById("voice-btn");
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    const uploadBtn = document.createElement("button");
    uploadBtn.type = "button";
    uploadBtn.innerText = "📎";
    uploadBtn.title = "Upload file";
    form.insertBefore(uploadBtn, input);

    uploadBtn.addEventListener("click", () => fileInput.click());

    if (!form || !input || !chatThread || !micBtn) {
        console.log("Waiting for chat UI to load...");
        setTimeout(waitForChatElements, 100);
        return;
    }

    let threadId = null;
    let historyLoaded = false;



    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const message = input.value.trim();
        if (!message) return;
        addMessage("user", message);
        input.value = "";
        form.querySelector('button[type="submit"]').disabled = true;
        await sendToAssistant(message);
        form.querySelector('button[type="submit"]').disabled = false;
    });

    micBtn.addEventListener("click", () => {
        if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
            alert("Voice input is not supported in this browser.");
            return;
        }
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.start();
        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            addMessage('user', transcript);
            await sendToAssistant(transcript);
        };
        recognition.onerror = (err) => {
            console.error("Speech recognition error:", err);
        };
    });

    function addMessage(sender, text) {
        const wrapper = document.createElement("div");
        wrapper.className = `chat-message ${sender}`;
        const bubble = document.createElement("div");
        bubble.className = "chat-bubble";
        bubble.innerHTML = window.markdownit ? window.markdownit().render(text) : text;
        wrapper.appendChild(bubble);
        chatThread.appendChild(wrapper);
        chatThread.scrollTop = chatThread.scrollHeight;
        const threadBottomPadding = document.createElement('div');
        threadBottomPadding.style.height = '140px';
        chatThread.appendChild(threadBottomPadding);
        return wrapper;
    }

    async function loadPreviousMessages() {
        const apiKey = DiviChatbotSettings.apiKey;
        const betaHeader = { "OpenAI-Beta": "assistants=v2" };

        if (!threadId) {
            const threadRes = await fetch("https://api.openai.com/v1/threads", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    ...betaHeader
                }
            });
            const threadData = await threadRes.json();
            threadId = threadData.id;
        }

        const messagesRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                ...betaHeader
            }
        });
        const messagesData = await messagesRes.json();
        messagesData.data.reverse().forEach(m => {
            const role = m.role;
            const text = m.content[0]?.text?.value;
            if (text) addMessage(role, text);
        });
    }

    async function sendToAssistant(userMessage) {
        const file = fileInput.files[0];
        let file_id = null;
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("purpose", "assistants");

            const uploadRes = await fetch("https://api.openai.com/v1/files", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${DiviChatbotSettings.apiKey}`
                },
                body: formData
            });
            const uploadData = await uploadRes.json();
            file_id = uploadData.id;
            fileInput.value = ""; // clear file
        }
        if (!historyLoaded) {
            await loadPreviousMessages();
            historyLoaded = true;
        }
        const apiKey = DiviChatbotSettings.apiKey;
        const assistantId = DiviChatbotSettings.assistantId;
        const betaHeader = { "OpenAI-Beta": "assistants=v2" };

        const typingWrapper = addMessage("assistant", "...");
        const typingBubble = typingWrapper.querySelector(".chat-bubble");

        await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                ...betaHeader
            },
            body: JSON.stringify({ role: "user", content: userMessage })
        });

        const runRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                ...betaHeader
            },
            body: JSON.stringify({
                assistant_id: assistantId,
                ...(file_id ? {
                    tools: [{ type: "file_search" }],
                    additional_instructions: "Use the uploaded file to help answer.",
                    file_ids: [file_id]
                } : {})
            })
        });

        const runData = await runRes.json();
        const runId = runData.id;

        let runStatus = "queued";
        while (runStatus !== "completed" && runStatus !== "failed") {
            const statusRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    ...betaHeader
                }
            });
            const statusData = await statusRes.json();
            runStatus = statusData.status;
            if (runStatus === "completed") break;
            await new Promise(res => setTimeout(res, 1000));
        }

        const messagesRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                ...betaHeader
            }
        });
        const messagesData = await messagesRes.json();
        const lastMessage = messagesData.data.find(m => m.role === 'assistant');
        if (lastMessage) {
            const markdownText = lastMessage.content?.[0]?.text?.value || '(No response)';
            typingBubble.innerHTML = '';
            let md;

            function streamMarkdown() {
                let index = 0;
                const stream = setInterval(() => {
                    if (index < markdownText.length) {
                        const current = markdownText.slice(0, index + 1);
                        typingBubble.innerHTML = md.render(current);
                        chatThread.scrollTop = chatThread.scrollHeight;
                        index++;
                        chatThread.scrollTop = chatThread.scrollHeight;
                    } else {
                        clearInterval(stream);
                    }
                }, 10);
            }

            if (!window.markdownit) {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/markdown-it/dist/markdown-it.min.js';
                script.onload = () => {
                    md = window.markdownit();
                    streamMarkdown();
                };
                document.head.appendChild(script);
            } else {
                md = window.markdownit();
                streamMarkdown();
            }
        } else {
            typingBubble.textContent = "(No response)";
        }
    }
})();
