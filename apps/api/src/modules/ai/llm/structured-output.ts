import { z } from 'zod'

interface ParseResult<T> {
  success: true
  data: T
}

interface ParseError {
  success: false
  error: string
}

type ParseOutcome<T> = ParseResult<T> | ParseError

export function parseStructuredOutput<T>(
  raw: string,
  schema: z.ZodSchema<T>,
): ParseOutcome<T> {
  let json: unknown

  const cleaned = raw
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  try {
    json = JSON.parse(cleaned)
  } catch {
    return {
      success: false,
      error: `Response is not valid JSON: ${cleaned.slice(0, 200)}`,
    }
  }

  const result = schema.safeParse(json)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errorMessages = result.error.issues
    .map((e) => `${e.path.join('.')}: ${e.message}`)
    .join(', ')

  return {
    success: false,
    error: `Schema validation failed: ${errorMessages}`,
  }
}

export function buildRetryPrompt(originalPrompt: string, error: string): string {
  return `${originalPrompt}

---
IMPORTANT: Your previous response failed validation with this error:
${error}

Please fix the issues and respond again with valid JSON that matches the required schema exactly. Do not include any text outside the JSON object.`
}