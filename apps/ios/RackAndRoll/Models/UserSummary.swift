/// Returned by `GET /users/search` (opponent picker). Verified select in
/// `users.service.ts`: {id, displayName, avatarUrl, rating}.
struct UserSummary: Codable, Identifiable, Hashable {
    let id: String
    let displayName: String
    let avatarUrl: String?
    let rating: Double
}

/// Player info embedded on Match/Challenge responses. Verified selects in
/// `matches.service.ts` / `scheduling.service.ts` only project
/// {id, displayName, avatarUrl} — no `rating` — so this is intentionally a
/// narrower type than UserSummary rather than reusing it.
struct PlayerRef: Codable, Identifiable, Hashable {
    let id: String
    let displayName: String
    let avatarUrl: String?
}
