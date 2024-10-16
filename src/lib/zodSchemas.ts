import { z } from "zod";

// Seed Schema
const SeedSchema = z.object({
    spotify: z.string(),
    type: z.string(),
    id: z.string(),
    title: z.string(),
    description: z.string(),
    thumbnail: z.union([z.string(), z.number()]),
});

// Preferences Schema
const PreferencesSchema = z.object({
    name: z.string().min(1, "Your Playlist should have a name."),
    frequency: z.enum(["daily", "weekly", "monthly", "never"], {
        errorMap: () => ({
            message:
                "There's something wrong with the frequency. That's strange 😉\n Try changing it to something supported",
        }),
    }),
    amount: z
        .number()
        .int()
        .min(5, "The amount of tracks should be between 5 and 50.")
        .max(50, "The amount of tracks should be between 5 and 50."),
    hue: z.number().optional(),
    on: z.number().optional(),
});

// Rule Schemas
const BooleanRuleSchema = z.object({
    name: z.string(),
    type: z.literal("boolean"),
    value: z.boolean(),
    range: z.array(z.string()),
    description: z.string(),
});

const AxisRuleSchema = z.object({
    name: z.string(),
    type: z.literal("axis"),
    value: z.tuple([z.number(), z.number()]),
    range: z.tuple([z.array(z.string()), z.array(z.string())]),
    description: z.string(),
});

const RangeRuleSchema = z.object({
    name: z.string(),
    type: z.literal("range"),
    value: z.number(),
    range: z.union([z.array(z.number()), z.array(z.string())]),
    description: z.string(),
});

const RuleSchema = z.discriminatedUnion("type", [BooleanRuleSchema, AxisRuleSchema, RangeRuleSchema]);

// Main PlaylistData Schema
const PlaylistDataSchema = z.object({
    playlist_id: z.string().optional(),
    preferences: PreferencesSchema,
    seeds: z
        .array(SeedSchema)
        .min(1, "We'll need at least one Seed for creating the Playlist.")
        .max(5, "We can only handle 5 seeds at a time."),
    rules: z.array(RuleSchema).optional(),
});

// Validation function
export const validatePlaylistData = (data: unknown) => {
    try {
        const validatedData = PlaylistDataSchema.parse(data);
        return {
            success: true as const,
            data: validatedData,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false as const,
                errors: error.errors.map((err) => ({
                    path: err.path.join("."),
                    message: err.message,
                })),
            };
        }
        throw error;
    }
};

// Example API route usage:
/*
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = validatePlaylistData(body);
    
    if (!validation.success) {
      return Response.json(
        { errors: validation.errors },
        { status: 400 }
      );
    }

    const data = validation.data;
    // Process validated data...
    
  } catch (error) {
    return Response.json(
      { error: 'Invalid request data' },
      { status: 400 }
    );
  }
}
*/
