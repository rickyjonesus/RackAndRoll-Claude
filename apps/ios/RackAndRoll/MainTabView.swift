import SwiftUI

struct MainTabView: View {
    let session: SessionStore
    let apiClient: APIClient

    var body: some View {
        TabView {
            DashboardView(session: session, apiClient: apiClient)
                .tabItem { Label("Dashboard", systemImage: "house.fill") }

            MatchListView(apiClient: apiClient)
                .tabItem { Label("Matches", systemImage: "circle.grid.cross.fill") }

            ScheduleListView(apiClient: apiClient)
                .tabItem { Label("Schedule", systemImage: "calendar") }
        }
    }
}
