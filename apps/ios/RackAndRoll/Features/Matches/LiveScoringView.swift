import SwiftUI

struct LiveScoringView: View {
    @State private var viewModel: LiveScoringViewModel
    @State private var showUndoConfirm = false
    let onFinalized: () -> Void

    init(matchId: String, apiClient: APIClient, onFinalized: @escaping () -> Void) {
        _viewModel = State(initialValue: LiveScoringViewModel(matchId: matchId, apiClient: apiClient))
        self.onFinalized = onFinalized
    }

    var body: some View {
        VStack(spacing: 28) {
            if let match = viewModel.match {
                HStack(spacing: 32) {
                    scoreColumn(name: match.homePlayer.displayName, score: viewModel.homeScore) {
                        Task { await viewModel.addRack(isHome: true) }
                    }
                    scoreColumn(name: match.opponentDisplayName, score: viewModel.awayScore) {
                        Task { await viewModel.addRack(isHome: false) }
                    }
                }
                .disabled(viewModel.isSubmittingRack || viewModel.isFinalized)

                if let raceToRacks = match.raceToRacks {
                    Text("Race to \(raceToRacks)")
                        .foregroundStyle(.secondary)
                }

                if viewModel.isFinalized {
                    Label("Match finalized", systemImage: "checkmark.seal.fill")
                        .foregroundStyle(.green)
                }

                if let errorMessage = viewModel.errorMessage {
                    Text(errorMessage).foregroundStyle(.red)
                }

                Spacer()

                HStack(spacing: 16) {
                    Button("Undo Last Rack") { showUndoConfirm = true }
                        .disabled(!viewModel.canUndo)

                    Button("Finalize Match") {
                        Task {
                            await viewModel.finalize()
                            if viewModel.isFinalized {
                                onFinalized()
                            }
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(viewModel.isFinalized)
                }
            } else if viewModel.isLoading {
                ProgressView()
            } else if let errorMessage = viewModel.errorMessage {
                Text(errorMessage).foregroundStyle(.red)
            }
        }
        .padding()
        .navigationTitle(viewModel.match?.gameType.displayName ?? "Live Match")
        .navigationBarBackButtonHidden(true)
        .task { await viewModel.load() }
        .confirmationDialog("Undo the last rack?", isPresented: $showUndoConfirm, titleVisibility: .visible) {
            Button("Undo", role: .destructive) {
                Task { await viewModel.confirmUndo() }
            }
            Button("Cancel", role: .cancel) {}
        }
    }

    private func scoreColumn(name: String, score: Int, onTap: @escaping () -> Void) -> some View {
        VStack(spacing: 12) {
            Text(name)
                .font(.headline)
                .lineLimit(1)
            Button(action: onTap) {
                Text("\(score)")
                    .font(.system(size: 52, weight: .bold, design: .rounded))
                    .frame(width: 100, height: 100)
                    .background(Circle().fill(Color.accentColor.opacity(0.15)))
            }
        }
        .frame(maxWidth: .infinity)
    }
}
