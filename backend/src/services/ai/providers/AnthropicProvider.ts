import Anthropic from "@anthropic-ai/sdk";
import { AIProvider, GeneratedQuestion, QuestionFormat, AIDifficulty } from "../AIProvider";
import { buildQuestionPrompt, parseQuestions } from "../prompt";

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model = "claude-3-5-sonnet-20241022") {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  private async ask(prompt: string, maxTokens = 2000): Promise<string> {
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

  async generateQuestions(
    topic: string,
    difficulty: AIDifficulty,
    count: number,
    questionType: QuestionFormat
  ): Promise<GeneratedQuestion[]> {
    const text = await this.ask(buildQuestionPrompt(topic, difficulty, count, questionType));
    return parseQuestions(text);
  }

  async generateHint(question: string): Promise<string> {
    const text = await this.ask(
      `Give one helpful hint for this question without revealing the answer. Respond with only the hint.\n\nQuestion: "${question}"`,
      300
    );
    return text.trim();
  }

  async validateAnswer(question: string, answer: string): Promise<boolean> {
    const text = await this.ask(
      `Is this answer correct? Respond with only "true" or "false".\n\nQuestion: "${question}"\nAnswer: "${answer}"`,
      100
    );
    return /true/i.test(text);
  }
}
