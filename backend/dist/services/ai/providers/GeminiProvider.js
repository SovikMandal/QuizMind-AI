"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const generative_ai_1 = require("@google/generative-ai");
const prompt_1 = require("../prompt");
class GeminiProvider {
    client;
    model;
    constructor(apiKey, model = "gemini-1.5-pro") {
        this.client = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = model;
    }
    async ask(prompt) {
        const model = this.client.getGenerativeModel({ model: this.model });
        const result = await model.generateContent(prompt);
        return result.response.text();
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
exports.GeminiProvider = GeminiProvider;
//# sourceMappingURL=GeminiProvider.js.map