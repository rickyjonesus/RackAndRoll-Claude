import Foundation

@MainActor
@Observable
final class RegisterViewModel {
    var email = ""
    var password = ""
    var displayName = ""
    private(set) var isLoading = false
    var errorMessage: String?

    private let apiClient: APIClient
    private let session: SessionStore

    init(apiClient: APIClient, session: SessionStore) {
        self.apiClient = apiClient
        self.session = session
    }

    /// Mirrors the server's `@MinLength(8)` on RegisterDto.
    var canSubmit: Bool {
        !email.isEmpty && password.count >= 8 && !displayName.isEmpty && !isLoading
    }

    func register() async {
        errorMessage = nil
        isLoading = true
        defer { isLoading = false }
        do {
            let response: TokenResponse = try await apiClient.send(
                .register(RegisterRequest(email: email, password: password, displayName: displayName))
            )
            session.setSession(token: response.accessToken)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
