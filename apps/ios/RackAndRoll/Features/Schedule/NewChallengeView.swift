import SwiftUI

struct NewChallengeView: View {
    @State private var viewModel: NewChallengeViewModel
    let onCreated: () -> Void

    init(apiClient: APIClient, onCreated: @escaping () -> Void) {
        _viewModel = State(initialValue: NewChallengeViewModel(apiClient: apiClient))
        self.onCreated = onCreated
    }

    var body: some View {
        Form {
            Section("Opponent") {
                OpponentSearchField(
                    query: $viewModel.searchQuery,
                    results: viewModel.searchResults,
                    onSelect: viewModel.selectOpponent
                )
                if let opponent = viewModel.selectedOpponent {
                    Label(opponent.displayName, systemImage: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                }
            }

            Section("Match") {
                Picker("Game Type", selection: $viewModel.gameType) {
                    ForEach(GameType.allCases) { type in
                        Text(type.displayName).tag(type)
                    }
                }
                DatePicker("Proposed Time", selection: $viewModel.proposedAt)
            }

            if let errorMessage = viewModel.errorMessage {
                Section {
                    Text(errorMessage).foregroundStyle(.red)
                }
            }

            Section {
                Button {
                    Task {
                        if await viewModel.submit() {
                            onCreated()
                        }
                    }
                } label: {
                    if viewModel.isSubmitting {
                        ProgressView().frame(maxWidth: .infinity)
                    } else {
                        Text("Send Challenge").frame(maxWidth: .infinity)
                    }
                }
                .disabled(!viewModel.canSubmit)
            }
        }
        .navigationTitle("New Challenge")
    }
}
