
Then redeploy and open `https://zygn-audit.getnos.io/api/health`.
`"ok": true` means Desk accepted the key. `"ok": false` prints exactly why.
The container logs also print `[boot] Desk key check: OK` or `FAILED` on every start.

## Failure messages the visitor can see

| Message | Meaning |
| --- | --- |
| Network error. Please check your connection and try again. | Request never reached the server (offline, DNS, blocked, 30s timeout) |
| We could not save your details right now. Please try again in a moment. | Server answered with an error. Reason is in browser console (`detail`) and in `/api/health` |
| Enter your full name / Invalid email / Enter valid phone number | Validation |

## Secrets

Never hardcode the Desk key in any file that ships to the browser.
`DESK_API_KEY` lives only in the server environment (host env vars in Docker,
or a gitignored `.env` in local dev) and is used server-side by `server/`.
