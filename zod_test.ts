
import { z } from "zod";

const schema = z.object({
  pageUrl: z.string().url().optional(),
});

const result = schema.safeParse({ pageUrl: "/" });
console.log("Result for '/':", result.success);
if (!result.success) console.log(result.error);

const result2 = schema.safeParse({ pageUrl: "http://localhost:3000/" });
console.log("Result for 'http://...':", result2.success);

const result3 = schema.safeParse({});
console.log("Result for empty:", result3.success);
