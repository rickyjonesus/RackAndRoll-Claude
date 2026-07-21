import Foundation

@MainActor
@Observable
final class NewChallengeViewModel {
    var searchQuery = "" {
        didSet { scheduleSearch() }
    }
    private(set) var searchResults: [UserSummary] = []
    var selectedOpponent: UserSummary?
    var gameType: GameType = .eightBall
    var proposedAt = Date().addingTimeInterval(3600)
    private(set) var isSubmitting = false
    var errorMessage: String?

    private let apiClient: APIClient
    private var searchTask: Task<Void, Never>?

    init(apiClient: APIClient) {
        self.apiClient = apiClient
    }

    var canSubmit: Bool { selectedOpponent != nil && !isSubmitting }

    func selectOpponent(_ user: UserSummary) {
        selectedOpponent = user
        searchQuery = user.displayName
        searchResults = []
    }

    private func scheduleSearch() {
        searchTask?.cancel()
        selectedOpponent = nil
        guard !searchQuery.isEmpty else {
            searchResults = []
            return
        }
        searchTask = Task {
            try? await Task.sleep(for: .milliseconds(300))
            guard !Task.isCancelled else { return }
            do {
                searchResults = try await apiClient.send(.searchUsers(query: searchQuery))
            } catch {
                // Silent — a failed opponent search shouldn't block the form.
            }
        }
    }

    func submit() async -> Bool {
        guard let opponent = selectedOpponent else { return false }
        errorMessage = nil
        isSubmitting = true
        defer { isSubmitting = false }
        do {
            let _: CreatedChallenge = try await apiClient.send(.createChallenge(CreateChallengeRequest(
                challengedId: opponent.id,
                gameType: gameType,
                proposedAt: proposedAt
            )))
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }
}
