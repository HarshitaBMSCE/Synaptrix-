import { z } from "zod";

export const platformSchema = z.enum(["Swiggy", "Zomato", "Blinkit", "Uber", "Ola", "Rapido"]);
export const jobTypeSchema = z.enum(["delivery", "ride", "courier", "service"]);

const money = z.coerce.number().min(0).max(100000);
const distance = z.coerce.number().min(0).max(1000);
const minutes = z.coerce.number().min(0).max(1440);

export const visibleFareSchema = z.object({
  baseFareVisible: z.boolean().default(false),
  distanceFareVisible: z.boolean().default(false),
  waitingFareVisible: z.boolean().default(false),
  incentiveVisible: z.boolean().default(false),
  deductionReasonVisible: z.boolean().default(false),
  taxVisible: z.boolean().default(false)
});

export const jobInputSchema = z.object({
  platform: platformSchema,
  jobType: jobTypeSchema,
  captureMethod: z.enum(["manual", "screenshot", "voice"]).default("manual"),
  grossPayout: money,
  baseFare: money.default(0),
  incentives: money.default(0),
  tips: money.default(0),
  deductions: money.default(0),
  unexplainedDeductions: money.default(0),
  platformDistanceKm: distance,
  routeDistanceKm: distance,
  pickupDistanceKm: distance.default(0),
  activeMinutes: minutes,
  waitingMinutes: minutes.default(0),
  startedAt: z.string().datetime().or(z.string().min(1)),
  completedAt: z.string().datetime().or(z.string().min(1)),
  originArea: z.string().min(2).max(80),
  destinationArea: z.string().min(2).max(80),
  tolls: money.default(0),
  parking: money.default(0),
  weatherCondition: z.enum(["clear", "rain", "heavy-rain"]).default("clear"),
  nightJob: z.boolean().default(false),
  notes: z.string().max(800).default(""),
  evidenceAssetIds: z.array(z.string()).default([]),
  visibleComponents: visibleFareSchema.default({
    baseFareVisible: true,
    distanceFareVisible: true,
    waitingFareVisible: true,
    incentiveVisible: true,
    deductionReasonVisible: false,
    taxVisible: false
  }),
  extractionConfidence: z.coerce.number().min(0).max(100).default(85)
});

export const uploadPresignSchema = z.object({
  fileName: z.string().min(1).max(160),
  mimeType: z.string().regex(/^image\/|application\/pdf|text\//),
  size: z.coerce.number().min(1).max(8 * 1024 * 1024),
  checksum: z.string().optional()
});

export const voiceParseSchema = z.object({
  transcript: z.string().min(5).max(2000)
});

export const routeRequestSchema = z.object({
  origin: z.string().min(2).max(120),
  destination: z.string().min(2).max(120),
  departureTime: z.string().min(1)
});

export const complaintDraftSchema = z.object({
  jobIds: z.array(z.string()).min(1),
  type: z.enum(["underpayment", "unexplained-deduction", "delayed-payout", "unsafe-condition", "deactivation", "missing-grievance"]),
  tone: z.enum(["concise", "formal", "escalation"])
});

export const assistantRequestSchema = z.object({
  message: z.string().min(1).max(1200),
  jobId: z.string().optional()
});

export const communityContributionSchema = z.object({
  platform: platformSchema,
  cityZone: z.string().min(2).max(80),
  jobType: jobTypeSchema,
  distanceBucket: z.string().min(1),
  durationBucket: z.string().min(1),
  timeBand: z.string().min(1),
  payout: money,
  deductionAmount: money.default(0),
  occurredAt: z.string().min(1)
});

export type JobInput = z.infer<typeof jobInputSchema>;
