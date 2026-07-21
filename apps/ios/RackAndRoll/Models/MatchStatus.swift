enum MatchStatus: String, Codable {
    case scheduled = "SCHEDULED"
    case inProgress = "IN_PROGRESS"
    case completed = "COMPLETED"
    case disputed = "DISPUTED"
    case cancelled = "CANCELLED"
}
