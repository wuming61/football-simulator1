# Football Simulator v1.1 architecture

## Runtime and delivery

The v1.1 build is a dependency-free H5/PWA application. `index.html` loads the local UI, the Dongqiudi snapshot, and the simulation engine. Browser `localStorage` stores indexed career slots and MOD packs. `service-worker.js` caches the local runtime, trophies, and all 198 club badges for offline use after the first HTTP visit.

## Data boundaries

- Core simulation: ten first/second divisions in England, Spain, Germany, Italy, and France. Club and player source fields come from the 2026-07-31 Dongqiudi snapshot. Ratings and finances are game estimates.
- Major-league world: the five top divisions plus the user's current league maintain fixtures, live standings, form, recent results, league totals, and a scorer table. Results use strength-adjusted goal models and real player names from the local snapshot.
- Background simulation: compact club reputation and average-ability records for additional leagues. Results use strength-adjusted Poisson goal models and retain standings, recent results, and a generated scorer table.
- Generated records: marked `background-generated`, `generated-v0`, or `game-estimate-v0`. They are never presented as source data.
- Community data: JSON Schema v1 packs are validated, stored locally, and merged into the background-league catalog.
- Club identity: all 198 Dongqiudi clubs have local badge files keyed by source team ID. Dashboard fixtures, schedule rows, league tables, recent results, match headers, and match squad panels share one renderer with a text fallback for unlicensed or generated opponents.

## Career setup

- Real and custom careers use a linked `league -> club -> person` browser. Changing a league narrows the club list; changing a club narrows the available player or coach list and refreshes the badge-backed selection preview.
- Player careers expose all ten imported first/second divisions, 198 clubs, and 5,529 players. Real-coach careers expose only clubs that have an imported coach profile, while custom coaches can choose any imported club.
- The selectors collapse to a single column on narrow screens and retain the same filtering behavior without horizontal overflow.

## Career state

```json
{
  "version": 27,
  "role": "coach | player",
  "date": "2026-08-01",
  "season": 2026,
  "clubId": "dqd-...",
  "squad": [],
  "schedule": [],
  "competitionProgress": {},
  "majorLeagueWorld": {},
  "majorLeagueId": "ENG1",
  "backgroundWorld": {},
  "activeMatch": null,
  "matchReports": [],
  "transferHistory": [],
  "notifications": [],
  "squadSort": {"key": "position", "direction": "asc"},
  "media": [],
  "honors": [],
  "history": []
}
```

## Event flow

1. Advancing to a fixture restores fitness and injuries, then simulates every due major-league and background-league round up to the fixture date. Other major leagues advance automatically; the user's club is held out of independent simulation.
2. Match start locks a lineup. Each AI coach receives a deterministic decision profile derived from coach identity and attributes: formation preference, risk, rotation, substitution activity, youth trust, and budget discipline. The same profile is reused by lineup, tactical, substitution, and transfer systems so behavior remains coherent. Formation selection combines positional structure, ability, fitness, recent form, schedule density, youth policy, and coach preference. Every lineup must contain a goalkeeper and the bench retains a backup when available.
3. Real-time one-minute ticks update both teams' possession, shots, shots on target, xG, corners, fouls, goals, cards, mistakes, fitness, and per-player live ratings. Attributes determine action selection and success throughout the match. At full time, ratings are recalibrated from a 6.00 baseline with position-specific weights for finishing, creation, passing volume and accuracy, ball progression, duels, defending, goalkeeping, clean sheets, missed chances, possession losses, errors, and cards. Competition names do not add an artificial rating bonus.
4. Player careers are simulated from the controlled player's position, detailed attributes, fitness, morale, team role, and the match situation. There are no player-choice interruptions during live play; individual contributions feed directly into shots, chance creation, defensive actions, and ratings.
5. Both starting lineups and benches are retained. AI substitutions are event-driven rather than quota-driven: score state, minute, estimated match energy, rating, cards, mistakes, positional fit, replacement quality, and coach style determine whether and how to change. Losing teams prioritize attacking profiles, leading teams protect defensive structure, and recent substitutes are protected from being immediately removed except for genuine emergencies. Substitutions update current lineups, pitch shirt numbers, ratings, reasons, and the event log immediately. Coaches control their own changes; player careers use AI decisions for both teams.
6. In player careers, AI coaches review the tactical state at controlled intervals and can press, counter, push for a winner, or protect a lead. Repeated identical adjustments are suppressed. A red card directly removes the player from the active lineup without consuming a substitution.
7. The clock offers 1x, 2x, and 4x speeds. Half-time and full-time pause play. Coaches choose a half-time and post-match team talk; player careers receive an AI-coach talk. Talk effects are applied to morale, fitness, and second-half tactical modifiers. Directly viewing the result skips the talk flow and opens the post-match analysis immediately.
8. Match finish writes events and minutes to every participant, records the MVP, updates injuries and growth, saves a persistent report with xG, possession, heatmap zone summaries, ratings, substitution labels/reasons, and medical outcomes, then advances the game and simulated league worlds to the following day.
9. A completed user league match is written into the major-league world as the authoritative result, after which the remaining matches in that round are simulated exactly once. The league center reads this save state directly, so standings and the player's fixture list stay consistent.
10. The five top leagues use country-specific international breaks, winter pauses, cup weekends, midweek rounds, and May finish dates. First-season European places are awarded by league-relative club strength (top four in England, Spain, Germany, and Italy; top three in France), followed by two Europa League places and one Conference League place. Later seasons use the prior league finish plus holder qualification, with Champions League and Europa League holders entering the Champions League and the Conference League holder entering the Europa League. The Champions League and Europa League use four strength pots, eight distinct opponents, and four home fixtures. The Conference League uses six pots, six opponents, and three home fixtures. All three use a 36-team table, top-eight direct qualification, places 9–24 in the playoff, no cross-competition relegation, two-leg knockout ties, and a neutral single-match final.
11. Eligible player careers receive national-team call-ups based on nationality, age, ability, and national-team depth. Both national teams use independent 23-player squads with three goalkeepers, eight defenders, seven midfielders, and five attackers; real same-nationality players are selected by ability before generated depth is used, and no player's natural position is rewritten to satisfy a quota. International fixtures occupy real windows. The calendar covers the Nations League, World Cup and qualifying, European Championship, Copa America, Africa Cup of Nations, Asian Cup, and other confederation cups, including 48-team World Cup round-of-32 and best-third-place qualification paths where applicable.
12. Cup opponents and later rounds are created only after the previous stage has resolved, using competition-specific calendar windows.
13. Transfer negotiations persist as a two-stage state machine: club fee terms (base fee, installments, add-ons, sell-on) then player contract terms (wage, signing bonus, appearance bonus, release clause, role, years). Club and agent patience gate each round and can close negotiations.
14. Coaches can list players for sale and start recommended-target negotiations. Player careers can submit formal transfer requests that are stored in the board inbox and request log.
15. Home notifications are structured, readable inbox items. Save-version migration preserves old string notices, clearly labels unavailable legacy details, repairs the v5 goalkeeper-appearance omission with a neutral 6.00 historical baseline, reconstructs league progress from already-played fixtures, and protects played results while resolving future club/international calendar collisions.
16. AI squad planning uses 27 players as its preferred working group, 29 as the normal soft ceiling, and 32 as the high-urgency ceiling. Seller-driven transfer reviews rank fringe players by depth-chart position, minutes, relative ability, age, potential, contract role, contract expiry, and listed status. Controlled players, core players, role leaders, high-potential youngsters, recent signings, and minimum positional depth remain protected. Coach careers receive advisory-only recommendations for the user's club; player careers allow the AI coach to complete non-controlled teammate sales.
17. Completed transfers are also written to a cross-season `transferHistory` ledger. Before a player changes clubs, the engine closes an exact career segment for the selling club with appearances, goals, assists, average rating, ability movement, and the transfer date. The receiving club starts a separate current-season segment. Player profiles resolve the latest club and contract from this persistent ledger and merge all prior career segments; legacy transfers without saved individual statistics remain identified as unavailable rather than being represented as zero appearances.
18. Player-career lineup selection does not reserve a starting place for the controlled player. Every candidate is ranked by ability, fitness, form, morale, promised squad role, tactical fit, coach preferences, opponent and competition importance, consecutive starts, prior-match minutes, and recovery time. The controlled player can start, wait on the bench and enter through the normal AI substitution system, or be left out to recover. Per-player workload fields persist between matches and reset at the new season.

## Next architecture step

For a production multiplayer or cloud-save release, split `app.js` into domain modules, move licensed data and deterministic simulation seeds behind an API, add IndexedDB for larger saves, and add automated property tests for scheduling and competition rules.
