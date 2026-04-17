// Source: Plan 03-06 Task 2 Rule 3 fix — Zod v4 / RHF resolver v3 compatibility.
//
// @hookform/resolvers@3.10.0 ships a Zod adapter that checks `Array.isArray(err.errors)`
// to identify a ZodError instance. Zod v4 renamed `ZodError.errors` to `ZodError.issues`
// (PR #3760) — the v3 resolver fails the check, re-throws the ZodError as an unhandled
// promise rejection, and `form.trigger(fields)` silently returns `undefined` so the
// wizard Next button is a no-op.
//
// Upgrading to @hookform/resolvers@5 would require migrating useForm generics (v5
// changed input/output type inference). Out of scope for this plan. This shim is the
// minimal surgical fix: add an `errors` getter that aliases `issues` on any ZodError
// that escapes the Zod parser, then delegate to the v3 adapter.
import { zodResolver as upstreamZodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import type { ZodType } from "zod";

// biome-ignore lint/suspicious/noExplicitAny: RHF Resolver is heavily generic
type AnyResolver = Resolver<any, any, any>;

/**
 * Drop-in replacement for `@hookform/resolvers/zod` `zodResolver` that patches
 * Zod v4 ZodError objects before the v3 adapter sees them. Once the project
 * migrates to `@hookform/resolvers@5`, delete this file and switch callers back
 * to the direct upstream import.
 */
// biome-ignore lint/suspicious/noExplicitAny: generic wrapper
export function zodResolver<TSchema extends ZodType<any, any, any>>(
  schema: TSchema,
  // biome-ignore lint/suspicious/noExplicitAny: passthrough options
  ...rest: any[]
): AnyResolver {
  const patchedSchema = {
    ...schema,
    async parseAsync(input: unknown, params?: unknown) {
      try {
        return await schema.parseAsync(input, params as never);
      } catch (err) {
        throw patchZodError(err);
      }
    },
    parse(input: unknown, params?: unknown) {
      try {
        return schema.parse(input, params as never);
      } catch (err) {
        throw patchZodError(err);
      }
    },
  } as unknown as TSchema;

  return upstreamZodResolver(patchedSchema, ...rest) as AnyResolver;
}

function patchZodError(err: unknown): unknown {
  if (
    err &&
    typeof err === "object" &&
    "issues" in err &&
    Array.isArray((err as { issues: unknown }).issues) &&
    !Array.isArray((err as { errors?: unknown }).errors)
  ) {
    Object.defineProperty(err, "errors", {
      value: (err as { issues: unknown[] }).issues,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
  return err;
}
