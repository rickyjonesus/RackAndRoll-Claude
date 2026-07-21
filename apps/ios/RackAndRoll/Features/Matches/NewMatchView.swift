import SwiftUI

struct NewMatchView: View {
    @State private var viewModel: NewMatchViewModel
    let onCreated: (String) -> Void

    init(apiClient: APIClient, onCreated: @escaping (String) -> Void) {
        _viewModel = State(initialValue: NewMatchViewModel(apiClient: apiClient))
        self.onCreated = onCreated
    }

    var body: some View {
        Form {
            Section("Opponent") {
                Toggle("Guest opponent", isOn: $viewModel.isGuest)
                if viewModel.isGuest {
                    TextField("Guest name", text: $viewModel.guestName)
                } else {
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
            }

            Section("Game") {
                Picker("Game Type", selection: $viewModel.gameType) {
                    ForEach(GameType.allCases) { type in
                        Text(type.displayName).tag(type)
                    }
                }
                Stepper("Race to \(viewModel.raceToRacks)", value: $viewModel.raceToRacks, in: 1...15)
            }

            if let errorMessage = viewModel.errorMessage {
                Section {
                    Text(errorMessage).foregroundStyle(.red)
                }
            }

            Section {
                Button {
                    Task {
                        if let matchId = await viewModel.submit() {
                            onCreated(matchId)
                        }
                    }
                } label: {
                    if viewModel.isSubmitting {
                        ProgressView().frame(maxWidth: .infinity)
                    } else {
                        Text("Start Match").frame(maxWidth: .infinity)
                    }
                }
                .disabled(!viewModel.canSubmit)
            }
        }
        .navigationTitle("New Match")
    }
}
