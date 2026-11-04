import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchLocationsOptions } from "../generated/@tanstack/react-query.gen";
import { useWorkspace, type PlaceOption } from "../lib/workspace";
export function BirthForm({
  onGenerate,
  pending,
  error,
  choices,
  onChoice,
  onEdit,
}: {
  onGenerate: () => void;
  onEdit: () => void;
  pending: boolean;
  error: string;
  choices?: { choice: "earlier" | "later"; utc: string; offset: string }[];
  onChoice: (choice: "earlier" | "later") => void;
}) {
  const { draft, setDraft } = useWorkspace();
  const [text, setText] = useState(
      draft.place ? [draft.place.name, draft.place.country].join(", ") : "",
    ),
    [debounced, setDebounced] = useState(""),
    [open, setOpen] = useState(false),
    [active, setActive] = useState(-1),
    [focused, setFocused] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(text.trim()), 300);
    return () => clearTimeout(timer);
  }, [text]);
  const query = useQuery({
    ...searchLocationsOptions({ query: { q: debounced } }),
    enabled: !draft.place && debounced.length >= 2 && debounced === text.trim(),
    staleTime: 24 * 60 * 60 * 1000,
  });
  const results = !draft.place && debounced === text.trim() ? (query.data?.results ?? []) : [];
  const choose = (place: PlaceOption) => {
    onEdit();
    setDraft({ ...draft, place });
    setText(
      [place.name, place.region, place.country]
        .filter((v, i, a) => v && a.indexOf(v) === i)
        .join(", "),
    );
    setOpen(false);
    setActive(-1);
  };
  const help = draft.place
    ? "✓ Location selected · Timezone handled automatically"
    : text.trim().length < 2
      ? "Type at least 2 characters. Add a country to narrow your search."
      : query.isError
        ? "City search is unavailable. Edit your search to try again."
        : query.isFetching || debounced !== text.trim()
          ? "Searching cities…"
          : results.length
            ? "Choose a result. Use ↑ ↓ and Enter."
            : "No matches. Try another spelling or a nearby town.";
  return (
    <aside>
      <div className="section-label">
        <span>01 / BIRTH DETAILS</span>
        <span>↙</span>
      </div>
      <h2>Every chart starts somewhere.</h2>
      <p className="muted">Enter the place and local time on your birth record.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onGenerate();
        }}
      >
        <label>
          Full name
          <input
            name="name"
            autoComplete="name"
            required
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </label>
        <div className="place-field">
          <label htmlFor="location">City of birth</label>
          <input
            id="location"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open && focused && results.length > 0}
            aria-controls="location-results"
            aria-activedescendant={open && active >= 0 ? `city-option-${active}` : undefined}
            aria-describedby="location-help"
            autoComplete="off"
            placeholder="Search any city or town…"
            required
            maxLength={120}
            value={text}
            onChange={(e) => {
              onEdit();
              setText(e.target.value);
              setDraft({ ...draft, place: null });
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => {
              setFocused(true);
              setOpen(true);
            }}
            onBlur={() => {
              setFocused(false);
              setOpen(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                return;
              }
              if (!results.length) return;
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                setOpen(true);
                const next =
                  active < 0
                    ? e.key === "ArrowDown"
                      ? 0
                      : results.length - 1
                    : (active + (e.key === "ArrowDown" ? 1 : -1) + results.length) % results.length;
                setActive(next);
                document
                  .getElementById(`city-option-${next}`)
                  ?.scrollIntoView({ block: "nearest" });
              }
              if (e.key === "Enter" && open) {
                e.preventDefault();
                if (active >= 0) choose(results[active]);
              }
            }}
          />
          <div
            id="location-results"
            role="listbox"
            aria-label="Matching birth locations"
            hidden={!open || !focused || !results.length}
          >
            {results.map((p, i) => (
              <div
                key={p.id}
                id={`city-option-${i}`}
                role="option"
                tabIndex={-1}
                aria-selected={active === i}
                onKeyDown={(e) => {
                  if (e.key === "Enter") choose(p);
                }}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => choose(p)}
              >
                <strong>{p.name}</strong>
                <small>{[p.region, p.country].filter(Boolean).join(", ")}</small>
              </div>
            ))}
          </div>
          <p id="location-help" className="field-help" role="status">
            {help}
          </p>
          <small className="attribution">
            City search by{" "}
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
              Open-Meteo
            </a>{" "}
            / GeoNames
          </small>
          {query.isError && !draft.place && (
            <button
              type="button"
              className="retry"
              onClick={() => {
                document.getElementById("location")?.focus();
                setOpen(true);
                void query.refetch();
              }}
            >
              Retry city search
            </button>
          )}
        </div>
        <div className="row">
          <label>
            Date of birth
            <input
              name="date"
              type="date"
              min="1800-01-01"
              max="2399-12-31"
              required
              value={draft.date}
              onChange={(e) => {
                onEdit();
                setDraft({ ...draft, date: e.target.value });
              }}
            />
          </label>
          <label>
            Time of birth
            <input
              name="time"
              type="time"
              required
              value={draft.time}
              onChange={(e) => {
                onEdit();
                setDraft({ ...draft, time: e.target.value });
              }}
            />
          </label>
        </div>
        <p className="hint">◷ Use the recorded local time. We resolve the historical offset.</p>
        <label>
          Output language
          <select
            value={draft.language}
            onChange={(e) => setDraft({ ...draft, language: e.target.value })}
          >
            <option>English</option>
            <option>Português (placement notes)</option>
          </select>
        </label>
        <details className="optional">
          <summary>Optional profile details</summary>
          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            />
          </label>
          <label>
            Gender / sex
            <select
              value={draft.gender}
              onChange={(e) => setDraft({ ...draft, gender: e.target.value })}
            >
              {["Prefer not to say", "Female", "Male", "Non-binary"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
          <p className="muted">These fields stay in memory and are not used in calculations.</p>
        </details>
        <button className="generate" type="submit" disabled={pending}>
          {pending ? "Calculating your chart…" : "Generate natal chart"} <span>↗</span>
        </button>
        <p className="form-error" role="alert">
          {error}
        </p>
        {choices && (
          <div className="time-choices">
            <p>Choose the occurrence from your birth record:</p>
            {choices.map((c) => (
              <button
                disabled={pending}
                key={c.choice}
                type="button"
                onClick={() => onChoice(c.choice)}
              >
                {c.choice === "earlier" ? "First" : "Second"} occurrence · UTC{c.offset}
                <small>{c.utc}</small>
              </button>
            ))}
          </div>
        )}
        <p className="privacy">
          Charts are processed transiently on our server. Requested readings share derived facts
          with an AI provider. City searches are shared with Open-Meteo. Settings are saved in this
          browser.
        </p>
      </form>
    </aside>
  );
}
