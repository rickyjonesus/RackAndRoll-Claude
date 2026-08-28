import SwiftUI
import SpriteKit

struct PongView: View {
    @State private var viewModel = PongViewModel()

    var body: some View {
        GeometryReader { proxy in
            ZStack {
                Color.black.ignoresSafeArea()

                SpriteView(scene: viewModel.scene(for: proxy.size), options: [.ignoresSiblingOrder])
                    .ignoresSafeArea()
                    .allowsHitTesting(viewModel.phase == .playing)

                scoreHeader
                    .padding(.top, 12)
                    .frame(maxHeight: .infinity, alignment: .top)

                if viewModel.phase == .menu {
                    PongMenuOverlay(difficulty: $viewModel.difficulty, onStart: viewModel.startGame)
                } else if viewModel.phase == .gameOver {
                    PongGameOverOverlay(match: viewModel.match, onPlayAgain: viewModel.playAgain, onMenu: viewModel.returnToMenu)
                }
            }
        }
        .navigationTitle("Pong")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(.black, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .preferredColorScheme(.dark)
    }

    private var scoreHeader: some View {
        HStack(spacing: 48) {
            scoreLabel(title: "CPU", value: viewModel.match.opponentScore)
            scoreLabel(title: "YOU", value: viewModel.match.userScore)
        }
    }

    private func scoreLabel(title: String, value: Int) -> some View {
        VStack(spacing: 2) {
            Text(title)
                .font(.system(.caption, design: .monospaced))
                .foregroundStyle(.white.opacity(0.5))
            Text("\(value)")
                .font(.system(size: 40, weight: .bold, design: .monospaced))
                .foregroundStyle(.white)
        }
    }
}

private struct PongMenuOverlay: View {
    @Binding var difficulty: PongDifficulty
    let onStart: () -> Void

    var body: some View {
        VStack(spacing: 28) {
            VStack(spacing: 6) {
                Text("PONG")
                    .font(.system(size: 48, weight: .heavy, design: .monospaced))
                Text("First to 11 wins")
                    .font(.system(.subheadline, design: .monospaced))
                    .foregroundStyle(.white.opacity(0.6))
            }

            VStack(spacing: 10) {
                Text("DIFFICULTY")
                    .font(.system(.caption, design: .monospaced))
                    .foregroundStyle(.white.opacity(0.6))
                Picker("Difficulty", selection: $difficulty) {
                    ForEach(PongDifficulty.allCases) { level in
                        Text(level.label).tag(level)
                    }
                }
                .pickerStyle(.segmented)
                .frame(maxWidth: 260)
            }

            Button(action: onStart) {
                Text("Start")
                    .font(.system(.title3, design: .monospaced).bold())
                    .frame(maxWidth: 200)
                    .padding(.vertical, 12)
                    .background(Color.white)
                    .foregroundStyle(.black)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }

            Text("Drag anywhere below to move your paddle")
                .font(.system(.caption2, design: .monospaced))
                .foregroundStyle(.white.opacity(0.4))
                .multilineTextAlignment(.center)
                .frame(maxWidth: 220)
        }
        .padding(32)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.black.opacity(0.85).ignoresSafeArea())
    }
}

private struct PongGameOverOverlay: View {
    let match: PongMatch
    let onPlayAgain: () -> Void
    let onMenu: () -> Void

    private var didWin: Bool { match.winner == .user }

    var body: some View {
        VStack(spacing: 24) {
            Text(didWin ? "YOU WIN" : "CPU WINS")
                .font(.system(size: 36, weight: .heavy, design: .monospaced))
                .foregroundStyle(didWin ? .green : .red)

            Text("\(match.userScore) – \(match.opponentScore)")
                .font(.system(.title2, design: .monospaced))
                .foregroundStyle(.white.opacity(0.8))

            VStack(spacing: 12) {
                Button(action: onPlayAgain) {
                    Text("Play Again")
                        .font(.system(.title3, design: .monospaced).bold())
                        .frame(maxWidth: 200)
                        .padding(.vertical, 12)
                        .background(Color.white)
                        .foregroundStyle(.black)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }

                Button(action: onMenu) {
                    Text("Menu")
                        .font(.system(.subheadline, design: .monospaced))
                        .foregroundStyle(.white.opacity(0.6))
                }
            }
        }
        .padding(32)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.black.opacity(0.85).ignoresSafeArea())
    }
}
