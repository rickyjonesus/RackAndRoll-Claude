import Foundation

@MainActor
@Observable
final class LoginViewModel {
    var email = ""
    var password = ""
    private(set) var isLoading = false
    var errorMessage: String?

    private let apiClient: APIClient
    private let session: SessionStore

    init(apiClient: APIClient, session: SessionStore) {
        self.apiClient = apiClient
        self.session = session
    }

    var canSubmit: Bool { !email.isEmpty && !password.isEmpty && !isLoading }

    func login() async {
        errorMessage = nil
        isLoading = true
        defer { isLoading = false }
        do {
            let response: TokenResponse = try await apiClient.send(.login(LoginRequest(email: email, password: password)))
            session.setSession(token: response.accessToken)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
