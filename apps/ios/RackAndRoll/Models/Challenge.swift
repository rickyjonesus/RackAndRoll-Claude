import Foundation

/// `GET /scheduling/upcoming` only returns ACCEPTED challenges with
/// `proposedAt >= now` (verified in `scheduling.service.ts`). There is no
/// endpoint to list PENDING challenges, so accept/decline/cancel aren't
/// wired up in this MVP — see plan notes for the backend gap.
struct Challenge: Codable, Identifiable {
    let id: String
    let challenger: PlayerRef
    let challenged: PlayerRef
    let gameType: GameType
    let proposedAt: Date
    let status: ChallengeStatus
}

struct CreateChallengeRequest: Encodable {
    let challengedId: String
    let gameType: GameType
    let proposedAt: Date
}

/// `POST /scheduling/challenges` returns the bare created row with no
/// `include` (verified via curl) — no `challenger`/`challenged` keys, unlike
/// `GET /scheduling/upcoming`. Only decode what's actually there.
struct CreatedChallenge: Decodable {
    let id: String
}
