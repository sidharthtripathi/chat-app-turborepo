import { z } from "zod";

export const messageSchema = z.object({
    to : z.string().min(1),
    message : z.string().min(1),
    type : z.enum(["personal","group"]),
    timestamp : z.number().positive().int()
})