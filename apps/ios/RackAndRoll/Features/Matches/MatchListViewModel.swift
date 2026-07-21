@MainActor
@Observable
final class MatchListViewModel {
    private(set) var matches: [Match] = []
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
            matches = try await apiClient.send(.matchHistory)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
