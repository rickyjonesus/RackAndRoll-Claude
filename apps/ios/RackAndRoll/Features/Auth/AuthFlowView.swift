import SwiftUI

struct AuthFlowView: View {
    let session: SessionStore
    let apiClient: APIClient

    var body: some View {
        NavigationStack {
            LoginView(apiClient: apiClient, session: session)
        }
    }
}
