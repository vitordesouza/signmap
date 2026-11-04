import { Temporal } from "@js-temporal/polyfill";
import { ApiError } from "./errors";
export function resolveBirthTime(
  date: string,
  time: string,
  timezone: string,
  choice: "reject" | "earlier" | "later" = "reject",
) {
  let local: Temporal.PlainDateTime;
  try {
    local = Temporal.PlainDateTime.from(`${date}T${time}`, { overflow: "reject" });
  } catch {
    throw new ApiError("Enter a valid birth date and local time.");
  }
  if (local.year < 1800 || local.year > 2399)
    throw new ApiError("This build supports birth dates from 1800 through 2399.");
  let earlier: Temporal.ZonedDateTime, later: Temporal.ZonedDateTime;
  try {
    earlier = local.toZonedDateTime(timezone, { disambiguation: "earlier" });
    later = local.toZonedDateTime(timezone, { disambiguation: "later" });
  } catch {
    throw new ApiError("The selected location has an unsupported timezone.");
  }
  if (!earlier.toPlainDateTime().equals(local) || !later.toPlainDateTime().equals(local))
    throw new ApiError(
      "This local time did not occur because the clocks moved forward. Check the time on your birth record.",
      422,
      "NONEXISTENT_TIME",
    );
  if (earlier.epochNanoseconds !== later.epochNanoseconds && choice === "reject")
    throw new ApiError(
      "The clocks moved back at this time. Which occurrence matches your birth record?",
      422,
      "AMBIGUOUS_TIME",
      [
        { choice: "earlier", utc: earlier.toInstant().toString(), offset: earlier.offset },
        { choice: "later", utc: later.toInstant().toString(), offset: later.offset },
      ],
    );
  const zoned = choice === "later" ? later : earlier;
  return {
    utc: zoned.toInstant().toString(),
    offset: zoned.offset,
    dateTime: zoned.withTimeZone("UTC"),
  };
}
