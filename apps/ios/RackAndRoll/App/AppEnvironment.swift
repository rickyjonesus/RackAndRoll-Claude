import Foundation

/// Composition root: builds the session store and API client once, and
/// injects them into the SwiftUI environment from RackAndRollApp.
@MainActor
final class AppEnvironment {
    let session: SessionStore
    let apiClient: APIClient

    init() {
        let session = SessionStore()
        self.session = session
        self.apiClient = APIClient(
            baseURL: AppConfig.apiBaseURL,
            tokenProvider: { session.token },
            onUnauthorized: { session.logout() }
        )
    }
}
