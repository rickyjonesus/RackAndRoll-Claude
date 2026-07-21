enum GameType: String, Codable, CaseIterable, Identifiable {
    case eightBall = "EIGHT_BALL"
    case nineBall = "NINE_BALL"
    case tenBall = "TEN_BALL"
    case straight = "STRAIGHT"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .eightBall: return "8-Ball"
        case .nineBall: return "9-Ball"
        case .tenBall: return "10-Ball"
        case .straight: return "Straight Pool"
        }
    }
}
