# StoryForge Generation Performance Notes

## Baseline bottleneck

The code-path audit shows that story planning, character-bible generation, page outlining, and manuscript writing are dependency-ordered structured stages. The character bible and page outline are generated once and persisted, then reused by the manuscript and illustration prompt builders; no duplicate character-bible generation was found in the current workflow. The dominant wall-clock work is image generation. The browser previously kept the long-running flow alive with a `processNextIllustration` loop, refreshed `books.get` after every batch, and waited only 120 ms between cycles.

The available request log confirms that lightweight workspace reads are generally sub-second (for example, recent `books.get` calls were approximately 175 ms), while the captured live image-generation attempts were rejected by the built-in service with an exhausted-access response rather than producing a valid image duration. Because the provider was unavailable during this verification, no fabricated wall-clock image timing is reported.

## Structural comparison

| Generation behavior | Previous implementation | Optimized implementation |
| --- | --- | --- |
| Independent page images per wave | 2 | Up to 4, configurable from 1–4 |
| Twelve-page illustration waves after the cover | 6 | 3 at the default concurrency |
| Page failure handling | Pause and preserve completed pages | Retry only the failed page up to 3 attempts with exponential backoff; preserve completed pages |
| Job progress refresh | Refetch after every batch plus a 120 ms client wait | Persisted progress metadata plus a 3.5 s refresh cadence and one 500 ms queue-yield delay |
| Reusable story artifacts | Persisted once | Still persisted once and reused; no quality-reducing regeneration |

The wave-count comparison is a deterministic orchestration measurement, not a claim about provider wall-clock speed. Actual completion time remains provider-dependent. The default concurrency is bounded at four and can be lowered with `STORYFORGE_ILLUSTRATION_CONCURRENCY` if a deployment’s provider capacity requires it.

## Progress contract

The job metadata now reports Story, Character Bible, Illustrations completed/total, Book Assembly, and Quality Check. Assembly and quality check remain at zero until their real export operations execute; no percentage is fabricated. Resumed illustration jobs set the same live-refresh state as initial generation, so progress remains visible when an author returns to a persisted job.

## Verification

TypeScript validation passes. The full suite passes with 15 test files and 27 tests, including four-page selection, transient exponential retry, exhausted-service non-retry, truthful stage metadata, ownership protection, single-prompt generation, and PDF composition. Desktop screenshots confirm the existing public design and the existing landscape editor remain visually intact. Live provider timing was not exercised because the built-in image service was unavailable during this session.
