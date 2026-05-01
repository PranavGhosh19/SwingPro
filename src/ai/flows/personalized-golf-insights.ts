'use server';
/**
 * @fileOverview An AI agent that analyzes historical golf round data to identify
 *               weakest areas of play and suggest improvements.
 *
 * - personalizedGolfInsights - A function that handles the golf insights process.
 * - PersonalizedGolfInsightsInput - The input type for the personalizedGolfInsights function.
 * - PersonalizedGolfInsightsOutput - The return type for the personalizedGolfInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RoundDataSchema = z.object({
  date: z.string().describe('Date of the round in YYYY-MM-DD format.'),
  courseRating: z.number().describe('Course rating of the golf course.'),
  slopeRating: z.number().describe('Slope rating of the golf course.'),
  par: z.number().describe('Par for the round.'),
  grossScore: z.number().describe('Gross score for the round.'),
  netScore: z.number().optional().describe('Net score for the round, if available.'),
  strokesGainedOffTheTee: z.number().optional().describe('Strokes gained off the tee.'),
  strokesGainedApproach: z.number().optional().describe('Strokes gained on approach shots.'),
  strokesGainedShortGame: z.number().optional().describe('Strokes gained around the green (short game).'),
  strokesGainedPutting: z.number().optional().describe('Strokes gained putting.'),
  puttsPerRound: z.number().optional().describe('Total putts per round.'),
  threePuttPercentage: z.number().optional().describe('Percentage of greens resulting in a three-putt or worse.'),
  onePuttPercentage: z.number().optional().describe('Percentage of greens resulting in a one-putt.'),
  fairwaysHitPercentage: z.number().optional().describe('Percentage of fairways hit off the tee.'),
  averageDrivingDistance: z.number().optional().describe('Average driving distance in yards.'),
  missDirection: z.enum(['left', 'right', 'straight', 'N/A']).optional().describe('Most common miss direction off the tee.'),
  girPercentage: z.number().optional().describe('Greens in Regulation percentage.'),
  upAndDownPercentage: z.number().optional().describe('Up and Down percentage from around the green.'),
  scramblingPercentage: z.number().optional().describe('Scrambling percentage.'),
});

const PersonalizedGolfInsightsInputSchema = z.object({
  currentHandicapIndex: z.number().optional().describe("The user's current World Handicap System index."),
  historicalRounds: z.array(RoundDataSchema).describe('An array of historical golf round data.'),
});
export type PersonalizedGolfInsightsInput = z.infer<typeof PersonalizedGolfInsightsInputSchema>;

const PersonalizedGolfInsightsOutputSchema = z.object({
  weakestAreas: z.array(z.string()).describe("A list of the golfer's 2-3 weakest areas of play, identified from the historical data."),
  suggestions: z.array(z.string()).describe('Specific, actionable suggestions for improvement based on the identified weaknesses.'),
  overallAnalysis: z.string().describe("A comprehensive analysis of the golfer's performance trends."),
});
export type PersonalizedGolfInsightsOutput = z.infer<typeof PersonalizedGolfInsightsOutputSchema>;

export async function personalizedGolfInsights(input: PersonalizedGolfInsightsInput): Promise<PersonalizedGolfInsightsOutput> {
  return personalizedGolfInsightsFlow(input);
}

const personalizedGolfInsightsPrompt = ai.definePrompt({
  name: 'personalizedGolfInsightsPrompt',
  input: { schema: PersonalizedGolfInsightsInputSchema },
  output: { schema: PersonalizedGolfInsightsOutputSchema },
  prompt: `You are an expert golf coach and analyst. Your task is to analyze the provided historical golf round data for a golfer, identify their weakest areas of play, provide specific and actionable suggestions for improvement, and give an overall analysis of their performance trends.

Consider the following data for your analysis:
Current Handicap Index: {{{currentHandicapIndex}}}

Historical Round Data:
{{#each historicalRounds}}
  Round Date: {{{date}}}
  Course Rating: {{{courseRating}}}
  Slope Rating: {{{slopeRating}}}
  Par: {{{par}}}
  Gross Score: {{{grossScore}}}
  {{#if netScore}}Net Score: {{{netScore}}}{{/if}}
  {{#if strokesGainedOffTheTee}}Strokes Gained Off The Tee: {{{strokesGainedOffTheTee}}}{{/if}}
  {{#if strokesGainedApproach}}Strokes Gained Approach: {{{strokesGainedApproach}}}{{/if}}
  {{#if strokesGainedShortGame}}Strokes Gained Short Game: {{{strokesGainedShortGame}}}{{/if}}
  {{#if strokesGainedPutting}}Strokes Gained Putting: {{{strokesGainedPutting}}}{{/if}}
  {{#if puttsPerRound}}Putts Per Round: {{{puttsPerRound}}}{{/if}}
  {{#if threePuttPercentage}}Three Putt Percentage: {{{threePuttPercentage}}}{{/if}}
  {{#if onePuttPercentage}}One Putt Percentage: {{{onePuttPercentage}}}{{/if}}
  {{#if fairwaysHitPercentage}}Fairways Hit Percentage: {{{fairwaysHitPercentage}}}{{/if}}
  {{#if averageDrivingDistance}}Average Driving Distance: {{{averageDrivingDistance}}}{{/if}}
  {{#if missDirection}}Most Common Miss Direction: {{{missDirection}}}{{/if}}
  {{#if girPercentage}}Greens In Regulation Percentage: {{{girPercentage}}}{{/if}}
  {{#if upAndDownPercentage}}Up And Down Percentage: {{{upAndDownPercentage}}}{{/if}}
  {{#if scramblingPercentage}}Scrambling Percentage: {{{scramblingPercentage}}}{{/if}}
  ---
{{/each}}

Based on this data, identify the golfer's 2-3 weakest areas. For each weakest area, provide 1-2 concrete, actionable suggestions for improvement. Also provide an overall analysis summary.

Ensure your response is structured as a JSON object with the following fields:
- weakestAreas: An array of strings, listing the identified weakest areas.
- suggestions: An array of strings, providing specific suggestions for improvement.
- overallAnalysis: A string containing a comprehensive analysis of performance trends.`,
});

const personalizedGolfInsightsFlow = ai.defineFlow(
  {
    name: 'personalizedGolfInsightsFlow',
    inputSchema: PersonalizedGolfInsightsInputSchema,
    outputSchema: PersonalizedGolfInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await personalizedGolfInsightsPrompt(input);
    return output!;
  }
);
