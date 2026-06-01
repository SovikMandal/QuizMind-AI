import { questionInputSchema } from "./quiz.schemas";

export const addQuestionSchema = questionInputSchema;
export const updateQuestionSchema = questionInputSchema.partial();
