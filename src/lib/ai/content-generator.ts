import { AIProvider, StyleDNA } from "@/types";

function buildGenerationPrompt(topic: string, styleDNA: StyleDNA): string {
  return `You are an AI that writes in a specific person's writing style. Your goal is to create content that perfectly mimics their unique voice, tone, and stylistic choices.

## STYLE PROFILE

### Tone
- Formality: ${styleDNA.tone.formality}/10 (${styleDNA.tone.formality <= 3 ? "casual" : styleDNA.tone.formality >= 7 ? "formal" : "moderately formal"})
- Emotional undertones: ${styleDNA.tone.emotionalTone?.join(", ") || "neutral"}
- Audience awareness: ${styleDNA.tone.audienceAwareness || "general"}

### Structure
- Sentence length: ${styleDNA.structure.avgSentenceLength || "varied"} words on average
- Paragraph length: ${styleDNA.structure.avgParagraphLength || "varied"} sentences on average
- Transition style: ${styleDNA.structure.transitionStyle || "smooth"}
- Organization: ${styleDNA.structure.organizationPattern || "logical flow"}

### Vocabulary
- Complexity: ${styleDNA.vocabulary.complexity || "moderate"}
- Technical level: ${styleDNA.vocabulary.technicalLevel || "balanced"}
- Common phrases: ${styleDNA.vocabulary.commonPhrases?.slice(0, 5).join(", ") || "none specific"}
- Word preferences: ${styleDNA.vocabulary.wordPreferences?.slice(0, 5).join(", ") || "standard"}

### Unique Style Elements
- Punctuation style: ${styleDNA.quirks.punctuationStyle || "standard"}
- Signature phrases: ${styleDNA.quirks.signaturePhrases?.slice(0, 3).join(", ") || "none"}
- Unique elements: ${styleDNA.quirks.uniqueElements?.slice(0, 3).join(", ") || "none"}

## INSTRUCTIONS

Write about the following topic, matching the style profile above:
**${topic}**

Guidelines:
1. Match the formality level and emotional tone
2. Use similar sentence structures and lengths
3. Employ the same vocabulary complexity and preferences
4. Include similar transitions between ideas
5. Adopt any unique stylistic elements
6. Do not explicitly mention that you are mimicking a style
7. Write naturally as if you were the original author

Write your response now:`;
}

export async function generateContent(
  topic: string,
  styleDNA: StyleDNA,
  provider: AIProvider,
  apiKey: string
): Promise<string> {
  const prompt = buildGenerationPrompt(topic, styleDNA);

  if (provider === "openai") {
    return generateWithOpenAI(prompt, apiKey);
  } else {
    return generateWithClaude(prompt, apiKey);
  }
}

async function generateWithOpenAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "OpenAI API error");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateWithClaude(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Claude API error");
  }

  const data = await response.json();
  return data.content[0].text;
}

// Streaming generation
export async function* streamGenerateContent(
  topic: string,
  styleDNA: StyleDNA,
  provider: AIProvider,
  apiKey: string
): AsyncGenerator<string> {
  const prompt = buildGenerationPrompt(topic, styleDNA);

  if (provider === "openai") {
    yield* streamWithOpenAI(prompt, apiKey);
  } else {
    yield* streamWithClaude(prompt, apiKey);
  }
}

async function* streamWithOpenAI(
  prompt: string,
  apiKey: string
): AsyncGenerator<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "OpenAI API error");
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

    for (const line of lines) {
      const data = line.slice(6);
      if (data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // Skip invalid JSON
      }
    }
  }
}

async function* streamWithClaude(
  prompt: string,
  apiKey: string
): AsyncGenerator<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Claude API error");
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

    for (const line of lines) {
      try {
        const data = JSON.parse(line.slice(6));
        if (data.type === "content_block_delta" && data.delta?.text) {
          yield data.delta.text;
        }
      } catch {
        // Skip invalid JSON
      }
    }
  }
}
