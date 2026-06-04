"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterProvider = void 0;
const prompt_1 = require("../prompt");
/** OpenRouter (OpenAI-compatible chat completions). Default model: openrouter/owl-alpha. */
class OpenRouterProvider {
    apiKey;
    model;
    constructor(apiKey, model = "openrouter/owl-alpha") {
        this.apiKey = apiKey;
        this.model = model;
    }
    async ask(prompt) {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ model: this.model, messages: [{ role: "user", content: prompt }] }),
        });
        if (!res.ok) {
            const err = new Error(`OpenRouter error ${res.status}: ${await res.text()}`);
            err.status = res.status;
            throw err;
        }
        const data = (await res.json());
        return data.choices?.[0]?.message?.content ?? "";
    }
    async generateQuestions(topic, difficulty, count, questionType) {
        const text = await this.ask((0, prompt_1.buildQuestionPrompt)(topic, difficulty, count, questionType));
        return (0, prompt_1.parseQuestions)(text);
    }
    async generateHint(question) {
        const text = await this.ask(`Give one helpful hint for this question without revealing the answer. Respond with only the hint.\n\nQuestion: "${question}"`);
        return text.trim();
    }
    async validateAnswer(question, answer) {
        const text = await this.ask(`Is this answer correct? Respond with only "true" or "false".\n\nQuestion: "${question}"\nAnswer: "${answer}"`);
        return /true/i.test(text);
    }
}
exports.OpenRouterProvider = OpenRouterProvider;
//# sourceMappingURL=OpenRouterProvider.js.map