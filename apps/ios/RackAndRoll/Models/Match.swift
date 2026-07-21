import Foundation

/// Covers both `GET /matches/history` list items and the `GET /matches/:id`
/// detail response — verified in `matches.service.ts` to be the same shape
/// (`homePlayer`/`awayPlayer` selected as {id, displayName, avatarUrl},
/// `venue` included). Note `GET /matches/:id` does NOT include `racks`, so
/// live scoring tracks score client-side rather than re-fetching this.
struct Match: Codable, Identifiable {
    let id: String
    let homePlayer: PlayerRef
    let awayPlayer: PlayerRef?
    let guestName: String?
    let gameType: GameType
    let raceToRacks: Int?
    let homeScore: Int
    let awayScore: Int
    let winnerId: String?
    let status: MatchStatus
    let playedAt: Date

    var opponentDisplayName: String {
        awayPlayer?.displayName ?? guestName ?? "Guest"
    }
}

struct CreateMatchRequest: Encodable {
    let opponentId: String?
    let guestName: String?
    let gameType: GameType
    let raceToRacks: Int?
}

/// `PATCH /matches/:id/finalize` returns the bare updated Prisma row with no
/// `include` (verified via curl) — no `homePlayer`/`awayPlayer` keys, unlike
/// every other match endpoint. Decode only what that response actually has;
/// the live-scoring screen keeps displaying the `Match` from its initial
/// `load()` rather than replacing it with this.
struct FinalizedMatch: Decodable {
    let status: MatchStatus
}

struct Rack: Codable, Identifiable {
    let id: String
    let matchId: String
    let rackNum: Int
    let winnerId: String
}

struct AddRackRequest: Encodable {
    let winnerId: String
    let rackNum: Int
}
