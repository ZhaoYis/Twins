import { AIProvider, StyleDNA } from "@/types";

const STYLE_ANALYSIS_PROMPT = `Analyze the following writing samples and extract a comprehensive style profile.

Your task is to identify the unique "Style DNA" of this writer. Analyze the following aspects:

1. **TONE ANALYSIS**
   - Formality level (0-10 scale, where 0 is very casual and 10 is highly formal)
   - Emotional undertones (e.g., optimistic, neutral, critical, empathetic)
   - Audience awareness (e.g., expert, general, technical, casual)

2. **STRUCTURE PATTERNS**
   - Average sentence length (short/medium/long)
   - Average paragraph length (number of sentences)
   - Transition style (e.g., smooth, abrupt, academic, conversational)
   - Organization pattern (e.g., chronological, logical, narrative-driven)

3. **VOCABULARY PREFERENCES**
   - Complexity level (simple, moderate, complex)
   - Technical level (non-technical, semi-technical, highly technical)
   - Common phrases and expressions used
   - Word preferences and recurring vocabulary

4. **WRITING QUIRKS**
   - Punctuation style (e.g., minimalist, enthusiastic with exclamation marks, formal)
   - Signature phrases or expressions
   - Unique stylistic elements

Output your analysis as a JSON object with this exact structure:
{
  "tone": {
    "formality": <number 0-10>,
    "emotionalTone": ["<array of strings>"],
    "audienceAwareness": "<string>"
  },
  "structure": {
    "avgSentenceLength": <number>,
    "avgParagraphLength": <number>,
    "transitionStyle": "<string>",
    "organizationPattern": "<string>"
  },
  "vocabulary": {
    "complexity": "<string>",
    "technicalLevel": "<string>",
    "commonPhrases": ["<array of strings>"],
    "wordPreferences": ["<array of strings>"]
  },
  "quirks": {
    "punctuationStyle": "<string>",
    "signaturePhrases": ["<array of strings>"],
    "uniqueElements": ["<array of strings>"]
  }
}

WRITING SAMPLES:
---
{content}
---

Provide only the JSON output, no additional text.`;

export async function analyzeStyle(
  content: string,
  provider: AIProvider,
  apiKey: string
): Promise<StyleDNA> {
  const prompt = STYLE_ANALYSIS_PROMPT.replace("{content}", content);

  if (provider === "openai") {
    return analyzeWithOpenAI(prompt, apiKey);
  } else {
    return analyzeWithClaude(prompt, apiKey);
  }
}

async function analyzeWithOpenAI(prompt: string, apiKey: string): Promise<StyleDNA> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "OpenAI API error");
  }

  const data = await response.json();
  const analysis = JSON.parse(data.choices[0].message.content);

  return {
    tone: analysis.tone,
    structure: analysis.structure,
    vocabulary: analysis.vocabulary,
    quirks: analysis.quirks,
    rawAnalysis: JSON.stringify(analysis, null, 2),
  };
}

async function analyzeWithClaude(prompt: string, apiKey: string): Promise<StyleDNA> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
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
  const content = data.content[0].text;

  // Extract JSON from the response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse style analysis response");
  }

  const analysis = JSON.parse(jsonMatch[0]);

  return {
    tone: analysis.tone,
    structure: analysis.structure,
    vocabulary: analysis.vocabulary,
    quirks: analysis.quirks,
    rawAnalysis: JSON.stringify(analysis, null, 2),
  };
}
