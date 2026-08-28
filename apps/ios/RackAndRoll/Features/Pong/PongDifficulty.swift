import CoreGraphics

/// Tunes how well the AI (top) paddle tracks the ball.
enum PongDifficulty: String, CaseIterable, Identifiable {
    case easy
    case medium
    case hard

    var id: String { rawValue }

    var label: String {
        switch self {
        case .easy: return "Easy"
        case .medium: return "Medium"
        case .hard: return "Hard"
        }
    }

    /// Max horizontal speed (points/sec) the AI paddle can move.
    var aiMaxSpeed: CGFloat {
        switch self {
        case .easy: return 220
        case .medium: return 320
        case .hard: return 460
        }
    }

    /// How many points off-center the ball can be before the AI reacts. Larger values make the AI
    /// noticeably imperfect (and beatable); smaller values make it track the ball almost perfectly.
    var aiReactionSlack: CGFloat {
        switch self {
        case .easy: return 46
        case .medium: return 22
        case .hard: return 6
        }
    }
}
