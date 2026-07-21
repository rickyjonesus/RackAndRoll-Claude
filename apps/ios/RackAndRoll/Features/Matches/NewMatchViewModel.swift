import Foundation

@MainActor
@Observable
final class NewMatchViewModel {
    var searchQuery = "" {
        didSet { scheduleSearch() }
    }
    private(set) var searchResults: [UserSummary] = []
    var selectedOpponent: UserSummary?
    var isGuest = false {
        didSet { searchResults = [] }
    }
    var guestName = ""
    var gameType: GameType = .eightBall
    var raceToRacks = 5
    private(set) var isSubmitting = false
    var errorMessage: String?

    private let apiClient: APIClient
    private var searchTask: Task<Void, Never>?

    init(apiClient: APIClient) {
        self.apiClient = apiClient
    }

    var canSubmit: Bool {
        !isSubmitting && (isGuest ? !guestName.isEmpty : selectedOpponent != nil)
    }

    func selectOpponent(_ user: UserSummary) {
        selectedOpponent = user
        searchQuery = user.displayName
        searchResults = []
    }

    private func scheduleSearch() {
        searchTask?.cancel()
        selectedOpponent = nil
        guard !isGuest, !searchQuery.isEmpty else {
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

    /// Returns the created match's id on success.
    func submit() async -> String? {
        errorMessage = nil
        isSubmitting = true
        defer { isSubmitting = false }
        do {
            let match: Match = try await apiClient.send(.createMatch(CreateMatchRequest(
                opponentId: isGuest ? nil : selectedOpponent?.id,
                guestName: isGuest ? guestName : nil,
                gameType: gameType,
                raceToRacks: raceToRacks
            )))
            return match.id
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }
}
