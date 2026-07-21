import SwiftUI

/// Switches between the auth flow and the main app based on session state —
/// the structural equivalent of the web app's `authGuard` route guard.
struct RootView: View {
    let session: SessionStore
    let apiClient: APIClient

    var body: some View {
        if session.isAuthenticated {
            MainTabView(session: session, apiClient: apiClient)
        } else {
            AuthFlowView(session: session, apiClient: apiClient)
        }
    }
}
