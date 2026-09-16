# AURA Car Care

Russian-language car wash booking site and operational CRM, built with React, Vinext and Cloudflare D1. Managed hosting is Sites; source is kept in its private Git repository. GitHub mirroring requires the owner's connected GitHub account.

## Product

- Public-facing service catalogue and online booking, two bays, 09:00–21:00 Europe/Moscow, 30-minute slot increments; services reserve their entire duration.
- Authenticated customer account; status polling every five seconds while visible.
- Booking → intake → wash → quality check → ready → delivered. Intake records mileage, condition and accepting employee.
- Server-derived prices. Additional charges require customer approval; paid marking and delivery are separate audited actions.
- Print-ready work order (not a fiscal receipt), cancellation before intake and moderated reviews tied to delivered orders.
- Owner, manager, employee and customer roles. Owner manages staff access, managers manage settings, pricing and reviews.
- Address, map coordinates and verified-provider social URLs are configurable from the management panel. No invented reviews, addresses or contact links.

## Configuration

`AURA_OWNER_EMAIL` is a hosted secret configured to the verified Site owner's email. There is no default password or first-visitor-admin bootstrap. It is never checked into source. Login uses the platform-managed ChatGPT identity; customers require a ChatGPT account in this release. Platform Site access and in-app roles are separate.

The default Site audience is owner-private for review. Public customer access requires the owner's audience change. Before accepting real customers, fill exact contact details, map coordinates, service prices and operator legal details in `/manage`, review the policy for the operator's jurisdiction, and configure the desired domain and DNS. Domain purchase, SMS login, card acquiring, fiscal cash-register integration and live camera streaming are not configured. Online tracking means actual staff-updated statuses, not live video.

## Development

Preserve the selected package manager and lockfile. The Sites skill provides install/build/publish scripts. Standard project scripts remain available. For changes to `db/schema.ts`, generate and inspect Drizzle migrations. Applied migrations are immutable. The local test harness uses an ephemeral SQLite database and never touches customer data.

## Security boundaries

- Dispatch authenticates identities; the Worker is intended to run only behind Sites dispatch. A raw standalone deployment must reject/verify forwarded identity headers before use.
- Every API write checks identity, authorization, input validation, content type and same-origin request headers. Customer records are filtered by stable user ID.
- Parameterized SQL, atomic D1 batches and unique bay/time reservations prevent injection and double-booking. Status changes use optimistic concurrency and an append-only event trail.
- No secrets in source; personal data responses are not cacheable. React escapes text. Social URLs accept only the expected HTTPS provider hosts.
- CSP, HSTS, MIME sniffing prevention, referrer and permission policies are configured. Current framework hydration requires inline scripts/styles; CSP is not a substitute for authorization or an independent audit.
- Five active bookings per user limit ordinary abuse; this does not replace production rate limiting or bot protection. Paid status is a staff attestation of on-site payment, not a verified payment gateway transaction.
- Before real launch, the operator must establish retention, backups/restoration, support and privacy-request handling. This initial implementation is not a claim of regulatory certification or a penetration test.

## Verification

Run `node scripts/test-security.mjs` to exercise the real route handlers and role checks against SQLite, and `node node_modules/typescript/bin/tsc --noEmit` for static checks. Tests cover booking duration conflicts, ownership, malicious inputs, sequential statuses, customer price approvals, payment/issuance and review restrictions.
