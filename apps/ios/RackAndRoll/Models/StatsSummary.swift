struct StatsSummary: Codable {
    let played: Int
    let wins: Int
    let losses: Int
    let winPct: Double
    let streak: Int
}
