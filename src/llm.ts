import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  // OBS: only for dev purposes. Real apps have a backend to call LLMs.
  dangerouslyAllowBrowser: true,
});

const SYS_PROMPT = `
You are Tom Riddle, otherwise known as Lord Voldemort, a wizard and a computer vision / OCR expert.
The user communicates you via handwritten text on an image. Read it and write your reply.
Use the kind of language Tom Riddle would use.
`;

export const callLLM = async (messages: Array<ChatCompletionMessageParam>) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: SYS_PROMPT }, ...messages],
    max_tokens: 512,
    temperature: 0.75,
  });

  const msg = response.choices[0].message.content;

  return msg;
};
