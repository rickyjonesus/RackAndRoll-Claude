enum ChallengeStatus: String, Codable {
    case pending = "PENDING"
    case accepted = "ACCEPTED"
    case declined = "DECLINED"
    case cancelled = "CANCELLED"
    case completed = "COMPLETED"
}
