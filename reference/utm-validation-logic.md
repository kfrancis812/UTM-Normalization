# UTM Validation Logic

## Decision Tree

1. **Check for null/empty UTMs**

   - If both `utm_source` AND `utm_medium` are empty → Flag as `MISSING_UTMS`
   - Return `channel: Unknown`, `subchannel: Unknown`

2. **Normalize inputs**

   - Convert to lowercase
   - Trim whitespace
   - Replace common typos (e.g., `facbook` → `facebook`)

3. **Match against approved source/medium pairs**

   - Use lookup table (see `channel-mapping-rules.csv`)
   - If match found → Return mapped `channel` + `subchannel`
   - If NO match → Return `Unknown` + flag `NON_STANDARD_UTM`

4. **Extract campaign type from `utm_campaign`**

   - Contains "brand" → `Brand`
   - Contains "nonbrand" or "non-brand" → `Non-Brand`
   - Contains "retargeting" or "remarketing" → `Retargeting`
   - Else → `Other`

5. **Return clean fields + validation flag**

## Edge Cases

| Input                                  | Output                            | Reason                  |
| -------------------------------------- | --------------------------------- | ----------------------- |
| `utm_source=Facebook` (capitalized)    | `Social Paid` or `Social Organic` | Normalized to lowercase |
| `utm_source=fb`                        | Maps to `Facebook`                | Alias handled           |
| `utm_source=twitter`, `utm_medium=cpc` | `Unknown` + `NON_STANDARD_UTM`    | Not in approved list    |
| `utm_source=` (empty)                  | `Unknown` + `MISSING_UTMS`        | Missing required param  |
| `utm_campaign=q4_brand_promo`          | `campaign_type: Brand`            | Keyword extraction      |

## Approval Workflow

When `validation_flag` is set:

1. Log to Google Sheet / Slack channel
2. Marketing Ops reviews weekly
3. If legitimate → Add to `channel-mapping-rules.csv`
4. If typo/error → Flag to campaign owner for correction
