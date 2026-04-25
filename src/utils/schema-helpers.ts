import { z } from 'zod';

/**
 * Wraps a Zod schema to accept either a parsed object or a JSON string.
 * MCP SDK clients (like Claude Code) sometimes serialize JSON objects as strings.
 */
export function jsonOrObject<T extends z.ZodTypeAny>(schema: T): z.ZodType<z.infer<T>> {
  return z.preprocess((val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
    return val;
  }, schema) as z.ZodType<z.infer<T>>;
}

/**
 * A flexible object schema that accepts either a JSON string or an object.
 * Use for properties, parent, icon, etc. where the structure is variable.
 */
export const FlexibleObjectSchema = jsonOrObject(z.record(z.string(), z.any()));

/**
 * A flexible array schema that accepts either a JSON string or an array.
 */
export function flexibleArray<T extends z.ZodTypeAny>(itemSchema: T) {
  return jsonOrObject(z.array(itemSchema));
}
