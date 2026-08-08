# Codex Operating Rules

Complete requested work with the lowest practical token/compute usage while preserving correctness.

Before model-heavy work:
1. Use deterministic code/template.
2. Reuse repository/database data.
3. Reuse cache/prior computed results.
4. Read only relevant files/symbols.
5. Pass compact task-specific context.
6. Use the smallest capable model.
7. Escalate only for sensitive, high-risk, ambiguous, or failed tasks.

Avoid repeated repository scans, giant file reads, full conversation history, duplicated context, long progress narration, and model-as-judge loops when tests/code can validate.

Security: never print, log, commit, or expose API keys, passwords, JWTs, private keys, Stripe secrets, SendGrid/Twilio credentials, or other tokens. Keep secrets in server-side environment/secret stores.

Engineering:
- inspect current branch/status first;
- preserve unrelated changes;
- make targeted edits;
- run the smallest relevant tests/checks;
- fix failures before expanding scope;
- do not make production-impacting changes without explicit authorization;
- final report should be concise: changed, verified, blocker.

Project-specific: this is a JRNP STR backend using Node/Express with Stripe, SendGrid, Twilio, and iCal. Protect booking/payment/guest data, preserve API compatibility, and prefer deterministic logic over AI for transactional workflows.
