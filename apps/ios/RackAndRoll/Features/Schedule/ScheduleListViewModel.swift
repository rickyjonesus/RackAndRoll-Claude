@MainActor
@Observable
final class ScheduleListViewModel {
    private(set) var challenges: [Challenge] = []
    private(set) var isLoading = false
    var errorMessage: String?

    private let apiClient: APIClient

    init(apiClient: APIClient) {
        self.apiClient = apiClient
    }

    func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            challenges = try await apiClient.send(.upcomingChallenges)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
