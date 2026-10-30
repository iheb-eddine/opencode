import type { LLMRequest } from "../../schema/index.js"

const SIGNED_REASONING_MODEL =
  /(?:^|[./:-])(?:(?:claude|sonnet|opus|haiku|duo-chat-fable|gemini|muse|grok)(?:$|[-._/:@0-9])|gpt-(?!oss\b)|o[134](?:$|[-._/:@]))/i
const OPAQUE_BEDROCK_PROFILE_ARN = /^arn:aws(?:-cn|-us-gov)?:bedrock:[^:]*:[^:]*:application-inference-profile\//i

// Closed reasoning families sign or encrypt their thinking blocks, and opaque
// Bedrock application inference profiles commonly front Claude; open-weight
// Messages and Converse implementations replay unsigned reasoning text.
export const requireThinkingSignature = (model: LLMRequest["model"]) => {
  if (model.compatibility?.requireSignature !== undefined) return model.compatibility.requireSignature
  if ((model.route.endpoint.baseURL ?? "").toLowerCase().includes("api.anthropic.com")) return true
  if (OPAQUE_BEDROCK_PROFILE_ARN.test(model.id)) return true
  return SIGNED_REASONING_MODEL.test(model.id)
}

// Google documents this sentinel for replaying Gemini 3+ function calls after their original signature was lost.
export const SKIP_THOUGHT_SIGNATURE_VALIDATOR = "skip_thought_signature_validator"

export const requiresThoughtSignatureFallback = (modelID: string) => {
  if (!/(^|\/)gemini-/i.test(modelID)) return false
  if (/(^|\/)gemini-(?:1|2)(?:[.-]|$)/i.test(modelID)) return false
  if (/(^|\/)gemini-pro(?:-vision)?$/i.test(modelID)) return false
  return !/(^|\/)gemini-robotics-er-1\.5(?:[.-]|$)/i.test(modelID)
}
