"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicProvider = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const prompt_1 = require("../prompt");
class AnthropicProvider {
    client;
    model;
    constructor(apiKey, model = "claude-3-5-sonnet-20241022") {
        this.client = new sdk_1.default({ apiKey });
        this.model = model;
    }
    async ask(prompt, maxTokens = 2000) {
        const message = await this.client.messages.create({
            model: this.model,
            max_tokens: maxTokens,
            messages: [{ role: "user", content: prompt }],
        });
        const block = message.content[0];
        if (!block || block.type !== "text") {
            throw new Error("Unexpected response type from Claude");
        }
        return block.text;
    }
    async generateQuestions(topic, difficulty, count, questionType) {
        const text = await this.ask((0, prompt_1.buildQuestionPrompt)(topic, difficulty, count, questionType));
        return (0, prompt_1.parseQuestions)(text);
    }
    async generateHint(question) {
        const text = await this.ask(`Give one helpful hint for this question without revealing the answer. Respond with only the hint.\n\nQuestion: "${question}"`, 300);
        return text.trim();
    }
    async validateAnswer(question, answer) {
        const text = await this.ask(`Is this answer correct? Respond with only "true" or "false".\n\nQuestion: "${question}"\nAnswer: "${answer}"`, 100);
        return /true/i.test(text);
    }
}
exports.AnthropicProvider = AnthropicProvider;
//# sourceMappingURL=AnthropicProvider.js.map