import { createAgent, gemini } from "@inngest/agent-kit";

/**
 * Type definitions for clarity and reuse
 */
export type Submission = {
  submissionId: string;
  userId: string;
  problem: string;
  code: string;
  language: string;
  testCases: {
    input: string;
    expected: string;
  }[];
};

export type EvaluationResult = {
  results: {
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
  }[];
  score: number;
  feedback: string;
};

/**
 * Code Evaluation Agent
 */
const evaluateCode = async (
  submission: Submission
): Promise<EvaluationResult | null> => {
  const codeEvaluator = createAgent({
    model: gemini({
      model: "gemini-1.5-flash",
      apiKey: process.env.GEMINI_API_KEY,
    }),
    name: "Code Evaluation Agent",
    system: `You are a strict code evaluator.

You will receive:
- A problem description
- A piece of code
- A set of test cases

Your task:
1. Mentally execute the code against the test cases.
2. For each test case, return:
   - input
   - expected
   - actual
   - passed (true/false)
3. If the code fails, include the error in "actual" and mark as failed.
4. Compute an integer score between 1 and 10 (10 = perfect, 1 = total failure).
5. Add a short feedback string.

IMPORTANT:
- Respond with only valid raw JSON.
- No markdown, code fences, comments, or extra text.
- The response must be a single JSON object with this format:

{
  "results": [
    {
      "input": "test case input",
      "expected": "expected output",
      "actual": "actual output",
      "passed": true
    }
  ],
  "score": 7,
  "feedback": "Your code works for some cases but fails on edge inputs."
}
`,
  });

  const response = await codeEvaluator.run(`
Evaluate the following submission strictly as JSON.

Problem:
${submission.problem}

Code:
${submission.code}

Test Cases:
${JSON.stringify(submission.testCases, null, 2)}
`);

  
  // @ts-ignore
  const raw = response.output[0]?.content ?? "";

  // Strip fences, backticks, and trim
  const cleaned = raw
    .replace(/```json/i, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned) as EvaluationResult;
  } catch (e: any) {
    console.error("Failed to parse JSON:", e.message, "\nCleaned:\n", cleaned);
    return null;
  }
};

export default evaluateCode;
