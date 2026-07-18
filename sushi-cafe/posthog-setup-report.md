<wizard-report>
# PostHog post-wizard report

The wizard has completed a PostHog integration for the Sushi Cafe website. PostHog is now initialized client-side via `instrumentation-client.js` (the correct Next.js 15.3+ approach), with a reverse proxy configured in `next.config.mjs` to route analytics through `/ingest` — avoiding ad-blockers. Five business-critical events are captured across two components, covering the full customer journey from browsing platters to making contact.

| Event name | Description | File |
|---|---|---|
| `platter_added_to_cart` | User adds a party platter to the cart, including the platter name, selected size variant, and price. | `components/PartyPlatters.jsx` |
| `platter_size_selected` | User selects a size variant (Small, Medium, Large) on a platter that has size options. | `components/PartyPlatters.jsx` |
| `call_to_order_clicked` | User clicks the 'Call to Order' button in the Visit section to initiate a phone call. | `components/Visit.jsx` |
| `get_directions_clicked` | User clicks the 'Get Directions' button to open the cafe's location in Google Maps. | `components/Visit.jsx` |
| `phone_number_clicked` | User clicks on the inline phone number link in the Visit section's contact info block. | `components/Visit.jsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/517994/dashboard/1868230)
- [Platters added to cart over time (wizard)](https://us.posthog.com/project/517994/insights/KPGHfdXw)
- [Top platters by cart adds (wizard)](https://us.posthog.com/project/517994/insights/iQMC9itE)
- [Cart-to-call conversion funnel (wizard)](https://us.posthog.com/project/517994/insights/GR55cvFP)
- [Visit section engagement (wizard)](https://us.posthog.com/project/517994/insights/2kKsQmZp)
- [Platter size preference (wizard)](https://us.posthog.com/project/517994/insights/qAmaIk47)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
