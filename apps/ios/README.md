# RackAndRoll iOS (MVP)

Native SwiftUI client covering Auth, Dashboard, Matches, and Schedule, backed by the existing NestJS API in `apps/api`. See `/Users/rickyjonesus/.claude/plans/gentle-bouncing-wilkes.md` for the full design/scope rationale.

## Prerequisites

- Xcode (full app, not just Command Line Tools): `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`
- [XcodeGen](https://github.com/yonaskolb/XcodeGen) (`brew install xcodegen`) — the `.xcodeproj` is generated, not checked in.

## Generate the Xcode project

```bash
cd apps/ios
xcodegen generate
open RackAndRoll.xcodeproj
```

Re-run `xcodegen generate` any time `project.yml` changes.

## Run against the local API

```bash
# from the repo root
docker compose --profile local up   # local Postgres
pnpm dev:api                        # NestJS on :3000, prefix /api
```

The Debug build points at `http://localhost:3000/api` (`Core/Config/Environments/Debug.xcconfig`) and the iOS Simulator reaches the Mac's own `localhost` directly — no extra networking config needed. A physical device would need the Mac's LAN IP instead.

## Configuration

- `Core/Config/Environments/Debug.xcconfig` / `Release.xcconfig` set `API_BASE_URL`, threaded into `Info.plist` and read by `Core/Config/AppConfig.swift` — mirrors the web app's `environment.ts` / `environment.prod.ts` split.
- **`Release.xcconfig` has a placeholder API URL** — fill in the real deployed API URL before shipping a release build.

## Known MVP limitations (see plan for details)

- Email/password auth only — no Sign in with Apple/Google yet (backend's OAuth flow is web-redirect-only).
- Schedule shows upcoming **accepted** challenges only; there's no backend endpoint to list pending challenges, so accept/decline/cancel aren't wired up.
- Leagues, Profile, and detailed Stats screens are out of scope for this MVP.

## Tests

`RackAndRollTests` mocks `URLSession` via `MockURLProtocol` and runs fully offline — no need for `pnpm dev:api` to be running.

```bash
xcodebuild test -project RackAndRoll.xcodeproj -scheme RackAndRoll \
  -destination 'platform=iOS Simulator,name=iPhone 15'
```
