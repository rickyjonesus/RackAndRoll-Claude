@MainActor
@Observable
final class DashboardViewModel {
    private(set) var summary: StatsSummary?
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
            summary = try await apiClient.send(.statsSummary)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
