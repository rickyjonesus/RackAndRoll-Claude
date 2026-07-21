import SwiftUI

@main
struct RackAndRollApp: App {
    @State private var environment = AppEnvironment()

    var body: some Scene {
        WindowGroup {
            RootView(session: environment.session, apiClient: environment.apiClient)
        }
    }
}
