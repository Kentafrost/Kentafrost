# Career Data Source

`work-experiences.json` is the single source of truth for career history used by both:
- `doc/Career_JP.md`
- `doc/Career_EN.md`

`learning-technologies.json` is the source for the "learning technologies" table in:
- `_includes/career/technology-totals-jp.md`
- `_includes/career/technology-totals-en.md`

`future-learning-plan.json` is the source for the learning plan tables in:
- `_includes/career/learning-plan-jp.md`
- `_includes/career/learning-plan-en.md`

`language-skills.json` is the source for language skill tables in:
- `_includes/career/language-skills-jp.md`
- `_includes/career/language-skills-en.md`

## How To Add A New Experience
1. Copy `work-experience-template.json`.
2. Append the new object to `work-experiences.json`.
3. Set `isCurrent`:
   - Current role: `isCurrent: true`, `endYm: null`
   - Finished role: `isCurrent: false`, `endYm: "YYYY-MM"`
4. Keep exactly one `isCurrent: true` (latest role only).
5. For each technology, set duration as numbers:

```json
{ "name": "Python", "years": 2, "months": 3 }
```

Optional fields:

```json
{
   "name": "QuickSight",
   "years": 0,
   "months": 6,
   "learning": true,
   "certifications": ["AWS Certified Solutions Architect - Associate"]
}
```

6. Use the same technology name if you want total duration to be merged automatically.
7. Run:

```bash
npm run career:update
```

## How To Manage Learning Technologies
1. Edit `learning-technologies.json`.
2. Add entries with JP/EN display names and duration:

```json
{ "jpName": "Kubernetes", "enName": "Kubernetes", "years": 0, "months": 2 }
```

3. Optional certifications:

```json
{
   "jpName": "AWS",
   "enName": "AWS",
   "years": 0,
   "months": 6,
   "certifications": ["AWS Certified Solutions Architect - Associate"]
}
```

4. Run `npm run career:update` to refresh generated tables.

## How To Manage Future Learning Plan
1. Edit `future-learning-plan.json`.
2. Add plan items with JP/EN fields for priority, domain, technologies, timeline, and purpose.
3. Run `npm run career:update` to regenerate learning plan include files.

## How To Manage Language Skills
1. Edit `language-skills.json`.
2. Add JP/EN values for language name, level, experience, and usage.
3. Run `npm run career:update` to regenerate language skill include files.

## Notes
- The script auto-calculates total experience months from the earliest `startYm` to current month.
- The latest role duration is auto-updated when `isCurrent: true`.
- Technology totals are auto-summed across all experiences and output to JP/EN include files.
- Rating rule in totals table:
   - `learning=true` => `⭐`
   - `total >= 3 years` => `⭐⭐⭐⭐`
   - `total >= 2 years` => `⭐⭐⭐`
   - `total >= 1 year` => `⭐⭐`
   - otherwise => `⭐`
- Certification notes are shown in totals table when `certifications` is set.
- Skill years are not auto-updated by design and should remain manual.
