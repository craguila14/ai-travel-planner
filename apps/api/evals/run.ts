import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '../.env') })

import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { ConsensusService } from '../src/modules/ai/consensus.service'
import { ItineraryOutputSchema } from '../src/modules/ai/schemas/itinerary-output.schema'
import { parseStructuredOutput } from '../src/modules/ai/llm/structured-output'
import { budgetConstraintEval } from './cases/budget-constraint.eval'
import { mustAvoidEval } from './cases/must-avoid.eval'
import { dayCountEval } from './cases/day-count.eval'
import { schemaValidationEval } from './cases/schema-validation.eval'
import { activitiesPerDayEval } from './cases/activities-per-day.eval'
import { EvalCase, EvalReport } from './lib/runner'

const PROMPT_VERSION = 'generate-itinerary.v1'
const MODEL = 'claude-sonnet-4-5'

const ALL_CASES: EvalCase[] = [
  budgetConstraintEval,
  mustAvoidEval,
  dayCountEval,
  schemaValidationEval,
  activitiesPerDayEval,
]

async function generateItinerary(fixtureName: string): Promise<{ itinerary: any; consensus: any; fixture: any }> {
  const fixturePath = path.join(__dirname, `fixtures/${fixtureName}.json`)
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))

  const consensusService = new ConsensusService()
  const consensus = consensusService.aggregate(
    fixture.proposals.map((p: any, i: number) => ({
      ...p,
      id: `eval-proposal-${i}`,
      tripId: 'eval-trip',
      participantId: `eval-participant-${i}`,
      submittedAt: new Date(),
    })),
  )

  const templatePath = path.join(
    __dirname,
    '../src/modules/ai/prompts/generate-itinerary.v1.md',
  )
  let prompt = fs.readFileSync(templatePath, 'utf-8')

  const totalDays = Math.ceil(
    (new Date(fixture.trip.endDate).getTime() -
      new Date(fixture.trip.startDate).getTime()) /
      (1000 * 60 * 60 * 24),
  )

  const replacements: Record<string, string> = {
    '{{destination}}': fixture.trip.destination,
    '{{startDate}}': fixture.trip.startDate,
    '{{endDate}}': fixture.trip.endDate,
    '{{totalDays}}': String(totalDays),
    '{{currency}}': fixture.trip.currency,
    '{{participantCount}}': String(fixture.proposals.length),
    '{{budgetMin}}': String(consensus.budgetMin),
    '{{budgetMax}}': String(consensus.budgetMax),
    '{{styles}}': consensus.styles.join(', '),
    '{{pace}}': consensus.pace,
    '{{schedule}}': consensus.schedule,
    '{{mustVisit}}': consensus.mustVisit,
    '{{mustAvoid}}': consensus.mustAvoid,
    '{{availablePlaces}}': 'No specific places provided, use well-known locations.',
    '{{previousFeedback}}': 'No previous feedback. This is the first generation.',
  }

  for (const [key, value] of Object.entries(replacements)) {
    prompt = prompt.replaceAll(key, value)
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const rawText = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')

  const result = parseStructuredOutput(rawText, ItineraryOutputSchema)

  if (!result.success) {
    throw new Error(`LLM output validation failed: ${result.error}`)
  }

  return { itinerary: result.data, consensus, fixture }
}

async function runEvals() {
  console.log('\n🧪 Running Travel Planner Evals')
  console.log(`📋 Prompt version: ${PROMPT_VERSION}`)
  console.log(`📦 Cases: ${ALL_CASES.length}\n`)

  const report: EvalReport = {
    promptVersion: PROMPT_VERSION,
    totalCases: ALL_CASES.length,
    passed: 0,
    failed: 0,
    results: [],
  }

  const fixtureCache = new Map<string, any>()

  for (const evalCase of ALL_CASES) {
    process.stdout.write(`  Running ${evalCase.name} (${evalCase.fixture})... `)

    try {
      if (!fixtureCache.has(evalCase.fixture)) {
        fixtureCache.set(evalCase.fixture, await generateItinerary(evalCase.fixture))
      }

      const data = fixtureCache.get(evalCase.fixture)
      const result = evalCase.run(data)

      if (result.passed) {
        report.passed++
        console.log(`✅ ${result.message}`)
      } else {
        report.failed++
        console.log(`❌ ${result.message}`)
        if (result.details) {
          console.log(`     → ${result.details}`)
        }
      }

      report.results.push({
        caseName: evalCase.name,
        fixture: evalCase.fixture,
        ...result,
      })
    } catch (error: any) {
      report.failed++
      console.log(`💥 Error: ${error.message}`)
      report.results.push({
        caseName: evalCase.name,
        fixture: evalCase.fixture,
        passed: false,
        message: `Error: ${error.message}`,
      })
    }
  }

  console.log('\n' + '─'.repeat(50))
  console.log(`📊 Results: ${report.passed}/${report.totalCases} passed`)
  console.log(
    `✅ Passed: ${report.passed}  ❌ Failed: ${report.failed}`,
  )
  console.log(
    `🎯 Success rate: ${Math.round((report.passed / report.totalCases) * 100)}%`,
  )
  console.log('─'.repeat(50) + '\n')

  const reportPath = path.join(__dirname, 'last-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`📄 Full report saved to evals/last-report.json\n`)

  process.exit(report.failed > 0 ? 1 : 0)
}

runEvals().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})