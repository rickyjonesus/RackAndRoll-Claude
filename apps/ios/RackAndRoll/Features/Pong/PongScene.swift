import SpriteKit
import UIKit

protocol PongSceneDelegate: AnyObject {
    /// Called when the ball passes a paddle. Return `true` to keep playing — the scene will pause
    /// briefly and auto-serve again — or `false` if the match is over, in which case the scene freezes.
    func pongScene(_ scene: PongScene, didScore scorer: PongMatch.Player) -> Bool
}

/// Self-contained Pong playfield: two paddles that slide horizontally (top = AI, bottom = the player's
/// finger) and a ball that bounces between them. Portrait-oriented, like the tab bar it lives in — the
/// classic left/right Atari layout is rotated 90° so it fits a single iPhone held upright.
///
/// Physics are done by hand (no `SKPhysicsBody`) for precise control over bounce angles and ball speed;
/// everything is drawn with plain `SKShapeNode`s, so the feature needs no bundled art or audio assets.
final class PongScene: SKScene {
    weak var pongDelegate: PongSceneDelegate?
    var difficulty: PongDifficulty = .medium

    private enum Phase {
        case idle
        case serving
        case playing
        case gameOver
    }

    private let ball = SKShapeNode(circleOfRadius: 8)
    private let topPaddle = SKShapeNode(rectOf: CGSize(width: 74, height: 14), cornerRadius: 4)
    private let bottomPaddle = SKShapeNode(rectOf: CGSize(width: 74, height: 14), cornerRadius: 4)
    private let centerLine = SKNode()

    private var phase: Phase = .idle
    private var ballVelocity = CGVector.zero
    private var currentSpeed: CGFloat = 0
    private var serveGoesUp = true
    private var lastUpdateTime: TimeInterval?
    private var paddleMargin: CGFloat = 60

    private let ballRadius: CGFloat = 8
    private let paddleSize = CGSize(width: 74, height: 14)
    private let baseSpeed: CGFloat = 260
    private let maxSpeed: CGFloat = 620
    private let speedMultiplierPerHit: CGFloat = 1.06
    private let maxBounceAngle: CGFloat = .pi / 3.1 // ~58°, keeps returns from going near-flat

    private let impactGenerator = UIImpactFeedbackGenerator(style: .light)
    private let scoreGenerator = UINotificationFeedbackGenerator()

    override init(size: CGSize) {
        super.init(size: size)
        anchorPoint = CGPoint(x: 0.5, y: 0.5)
        scaleMode = .resizeFill
        backgroundColor = .black
        isUserInteractionEnabled = true
        buildScene()
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func didChangeSize(_ oldSize: CGSize) {
        super.didChangeSize(oldSize)
        layoutForCurrentSize()
    }

    private func buildScene() {
        ball.fillColor = .white
        ball.strokeColor = .clear
        ball.zPosition = 2
        addChild(ball)

        for paddle in [topPaddle, bottomPaddle] {
            paddle.fillColor = .white
            paddle.strokeColor = .clear
            paddle.zPosition = 2
            addChild(paddle)
        }

        centerLine.zPosition = 1
        addChild(centerLine)

        layoutForCurrentSize()
    }

    private func layoutForCurrentSize() {
        paddleMargin = max(48, size.height * 0.08)
        topPaddle.position = CGPoint(x: topPaddle.position.x, y: size.height / 2 - paddleMargin)
        bottomPaddle.position = CGPoint(x: bottomPaddle.position.x, y: -size.height / 2 + paddleMargin)
        rebuildCenterLine()
        if phase == .idle {
            ball.position = .zero
        }
    }

    private func rebuildCenterLine() {
        centerLine.removeAllChildren()
        guard size.height > 0 else { return }
        let dashHeight: CGFloat = 12
        let gap: CGFloat = 10
        var y = -size.height / 2
        while y < size.height / 2 {
            let dash = SKShapeNode(rectOf: CGSize(width: 3, height: dashHeight))
            dash.fillColor = UIColor.white.withAlphaComponent(0.35)
            dash.strokeColor = .clear
            dash.position = CGPoint(x: 0, y: y + dashHeight / 2)
            centerLine.addChild(dash)
            y += dashHeight + gap
        }
    }

    // MARK: - Public controls

    /// Resets paddles/ball/score-adjacent state and serves after a short pause.
    func startNewGame() {
        removeAllActions()
        currentSpeed = baseSpeed
        ball.position = .zero
        ballVelocity = .zero
        topPaddle.position.x = 0
        bottomPaddle.position.x = 0
        phase = .serving
        serveGoesUp = Bool.random()
        run(.sequence([.wait(forDuration: 0.6), .run { [weak self] in self?.beginServe() }]))
    }

    // MARK: - Touch handling (bottom paddle follows the player's finger, x-axis only)

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        handleTouches(touches)
    }

    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        handleTouches(touches)
    }

    private func handleTouches(_ touches: Set<UITouch>) {
        guard let touch = touches.first else { return }
        let location = touch.location(in: self)
        move(paddle: bottomPaddle, towardX: location.x)
    }

    private func move(paddle: SKShapeNode, towardX x: CGFloat) {
        let halfWidth = paddleSize.width / 2
        let minX = -size.width / 2 + halfWidth
        let maxX = size.width / 2 - halfWidth
        paddle.position.x = min(max(x, minX), maxX)
    }

    // MARK: - Game loop

    override func update(_ currentTime: TimeInterval) {
        defer { lastUpdateTime = currentTime }
        guard phase == .playing else { return }
        let dt = CGFloat(min(currentTime - (lastUpdateTime ?? currentTime), 1.0 / 30.0))
        guard dt > 0 else { return }

        updateAI(dt: dt)
        advanceBall(dt: dt)
    }

    private func updateAI(dt: CGFloat) {
        let slack = difficulty.aiReactionSlack
        let dx = ball.position.x - topPaddle.position.x
        guard abs(dx) > slack else { return }
        let step = min(abs(dx), difficulty.aiMaxSpeed * dt)
        topPaddle.position.x += dx > 0 ? step : -step
        let halfWidth = paddleSize.width / 2
        let minX = -size.width / 2 + halfWidth
        let maxX = size.width / 2 - halfWidth
        topPaddle.position.x = min(max(topPaddle.position.x, minX), maxX)
    }

    private func advanceBall(dt: CGFloat) {
        var newPosition = CGPoint(x: ball.position.x + ballVelocity.dx * dt,
                                   y: ball.position.y + ballVelocity.dy * dt)

        let halfWidth = size.width / 2
        if newPosition.x - ballRadius < -halfWidth {
            newPosition.x = -halfWidth + ballRadius
            ballVelocity.dx = abs(ballVelocity.dx)
            impactGenerator.impactOccurred()
        } else if newPosition.x + ballRadius > halfWidth {
            newPosition.x = halfWidth - ballRadius
            ballVelocity.dx = -abs(ballVelocity.dx)
            impactGenerator.impactOccurred()
        }

        let halfHeight = size.height / 2
        let paddleHalfWidth = paddleSize.width / 2
        let paddleHalfThickness = paddleSize.height / 2

        if ballVelocity.dy > 0 {
            let paddleFront = topPaddle.position.y - paddleHalfThickness
            if newPosition.y + ballRadius >= paddleFront {
                let offset = newPosition.x - topPaddle.position.x
                if abs(offset) <= paddleHalfWidth + ballRadius {
                    newPosition.y = paddleFront - ballRadius
                    reflect(offset: offset, paddleHalfWidth: paddleHalfWidth, goingUp: false)
                } else if newPosition.y + ballRadius >= halfHeight {
                    ball.position = CGPoint(x: newPosition.x, y: halfHeight - ballRadius)
                    registerMiss(scorer: .user)
                    return
                }
            }
        } else if ballVelocity.dy < 0 {
            let paddleFront = bottomPaddle.position.y + paddleHalfThickness
            if newPosition.y - ballRadius <= paddleFront {
                let offset = newPosition.x - bottomPaddle.position.x
                if abs(offset) <= paddleHalfWidth + ballRadius {
                    newPosition.y = paddleFront + ballRadius
                    reflect(offset: offset, paddleHalfWidth: paddleHalfWidth, goingUp: true)
                } else if newPosition.y - ballRadius <= -halfHeight {
                    ball.position = CGPoint(x: newPosition.x, y: -halfHeight + ballRadius)
                    registerMiss(scorer: .opponent)
                    return
                }
            }
        }

        ball.position = newPosition
    }

    /// Reflects the ball off a paddle. `offset` is the hit point relative to the paddle's center, which
    /// steers the return angle — a hit near the paddle's edge comes back sharper, just like the original.
    private func reflect(offset: CGFloat, paddleHalfWidth: CGFloat, goingUp: Bool) {
        let normalized = max(-1, min(1, offset / paddleHalfWidth))
        currentSpeed = min(currentSpeed * speedMultiplierPerHit, maxSpeed)
        let angle = normalized * maxBounceAngle
        let dy = (goingUp ? 1 : -1) * currentSpeed * cos(angle)
        let dx = currentSpeed * sin(angle)
        ballVelocity = CGVector(dx: dx, dy: dy)
        impactGenerator.impactOccurred(intensity: 0.8)
    }

    private func registerMiss(scorer: PongMatch.Player) {
        scoreGenerator.notificationOccurred(scorer == .user ? .success : .warning)
        ballVelocity = .zero
        let shouldContinue = pongDelegate?.pongScene(self, didScore: scorer) ?? true
        guard shouldContinue else {
            phase = .gameOver
            return
        }
        phase = .serving
        serveGoesUp = (scorer == .opponent)
        run(.sequence([.wait(forDuration: 0.9), .run { [weak self] in self?.beginServe() }]))
    }

    private func beginServe() {
        guard phase == .serving else { return }
        ball.position = .zero
        currentSpeed = baseSpeed
        let angle = CGFloat.random(in: -0.35...0.35)
        let dy = (serveGoesUp ? 1 : -1) * currentSpeed * cos(angle)
        let dx = currentSpeed * sin(angle)
        ballVelocity = CGVector(dx: dx, dy: dy)
        phase = .playing
    }
}
