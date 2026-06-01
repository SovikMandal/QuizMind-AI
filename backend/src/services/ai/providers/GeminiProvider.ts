import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider, GeneratedQuestion, QuestionFormat, AIDifficulty } from "../AIProvider";
import { buildQuestionPrompt, parseQuestions } from "../prompt";

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model = "gemini-1.5-pro") {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  private async ask(prompt: string): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.model });
    const result = await model.generateContent(prompt);
    return result.response.text();
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
      `Give one helpful hint for this question without revealing the answer. Respond with only the hint.\n\nQuestion: "${question}"`
    );
    return text.trim();
  }

  async validateAnswer(question: string, answer: string): Promise<boolean> {
    const text = await this.ask(
      `Is this answer correct? Respond with only "true" or "false".\n\nQuestion: "${question}"\nAnswer: "${answer}"`
    );
    return /true/i.test(text);
  }
}
