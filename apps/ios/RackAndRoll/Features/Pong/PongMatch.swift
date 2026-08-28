import Foundation

/// Pure scoring/rules model for a Pong match.
///
/// Kept free of SpriteKit/UIKit so the rules (win condition, score tracking) are trivial to unit test
/// without spinning up a scene or a run loop.
struct PongMatch: Equatable {
    enum Player: Equatable {
        case user
        case opponent
    }

    let winningScore: Int
    private(set) var userScore = 0
    private(set) var opponentScore = 0
    private(set) var winner: Player?

    init(winningScore: Int = 11) {
        self.winningScore = winningScore
    }

    var isGameOver: Bool { winner != nil }

    /// Records a point for `player`. No-ops once the match already has a winner.
    mutating func score(for player: Player) {
        guard winner == nil else { return }
        switch player {
        case .user:
            userScore += 1
        case .opponent:
            opponentScore += 1
        }
        if userScore >= winningScore {
            winner = .user
        } else if opponentScore >= winningScore {
            winner = .opponent
        }
    }
}
