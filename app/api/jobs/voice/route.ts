import { handleApiError, ok } from "@/lib/api";
import { parseVoiceTranscript } from "@/lib/claude";
import { voiceParseSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const { transcript, language } = voiceParseSchema.parse(await request.json());
    const parsed = await parseVoiceTranscript(transcript, language);
    const now = new Date().toISOString();
    return ok({
      ...parsed,
      captureMethod: "voice",
      startedAt: now,
      completedAt: now,
      weatherCondition: "clear",
      nightJob: false,
      tolls: 0,
      parking: 0,
      notes: transcript,
      evidenceAssetIds: []
    });
  } catch (error) {
    return handleApiError(error);
  }
}
