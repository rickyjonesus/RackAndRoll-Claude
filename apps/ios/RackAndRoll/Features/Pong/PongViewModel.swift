import Foundation
import CoreGraphics

enum PongPhase {
    case menu
    case playing
    case gameOver
}

@MainActor
@Observable
final class PongViewModel: PongSceneDelegate {
    private(set) var match = PongMatch()
    private(set) var phase: PongPhase = .menu
    var difficulty: PongDifficulty = .medium

    /// Not observed: it's a render cache, not view state, and mutating it from `scene(for:)` — called
    /// during the view's body evaluation — would otherwise trip SwiftUI's during-render mutation check.
    @ObservationIgnored
    private var pongScene: PongScene?

    /// Lazily creates (and reuses) the scene sized to the view's current bounds. The app is portrait-locked,
    /// so this only really runs once, but re-creating on a genuine size change keeps the playfield correct.
    func scene(for size: CGSize) -> PongScene {
        if let existing = pongScene, existing.size == size {
            return existing
        }
        let scene = PongScene(size: size)
        scene.pongDelegate = self
        scene.difficulty = difficulty
        pongScene = scene
        return scene
    }

    func startGame() {
        match = PongMatch()
        phase = .playing
        pongScene?.difficulty = difficulty
        pongScene?.startNewGame()
    }

    func playAgain() {
        startGame()
    }

    func returnToMenu() {
        phase = .menu
    }

    // MARK: PongSceneDelegate

    func pongScene(_ scene: PongScene, didScore scorer: PongMatch.Player) -> Bool {
        match.score(for: scorer)
        if match.isGameOver {
            phase = .gameOver
            return false
        }
        return true
    }
}
