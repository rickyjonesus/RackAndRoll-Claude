import Foundation

/// Root of session state. Mirrors `AuthService`'s `state` signal +
/// `isAuthenticated` computed on the web app, backed by Keychain instead of
/// localStorage. `RootView` observes `isAuthenticated` to gate the whole app.
@MainActor
@Observable
final class SessionStore {
    private(set) var token: String?
    private let keychain = KeychainStore()

    var isAuthenticated: Bool { token != nil }

    init() {
        token = keychain.readToken()
    }

    func setSession(token: String) {
        keychain.saveToken(token)
        self.token = token
    }

    func logout() {
        keychain.deleteToken()
        token = nil
    }
}
