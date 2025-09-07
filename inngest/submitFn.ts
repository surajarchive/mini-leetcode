import { Inngest } from "inngest"
import evaluateCode from "./ai"

const inngest = new Inngest({ id: "code-execution-app" })



export type Submission = {
    problem: string
    description?: string
    code: string
    language: string
}

export const submitFn = inngest.createFunction(
    { id: "Submit-code" },
    { event: "code.submitted" },
    async ({ event, step }) => {
        const originaldata: Submission = event.data


        const evaluationResult = await step.run(
            "evaluate-code",
            async () => {
                return await evaluateCode(originaldata);
            }
        );

        if (!evaluationResult) {
            throw new Error("Evaluation failed: Invalid response from AI evaluator")
        }
        console.log(evaluationResult);
    }
)
