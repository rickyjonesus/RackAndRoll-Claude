import SwiftUI

private enum DashboardRoute: Hashable {
    case newMatch
    case liveScoring(String)
    case newChallenge
}

struct DashboardView: View {
    let session: SessionStore
    let apiClient: APIClient
    @State private var viewModel: DashboardViewModel
    @State private var path = NavigationPath()

    init(session: SessionStore, apiClient: APIClient) {
        self.session = session
        self.apiClient = apiClient
        _viewModel = State(initialValue: DashboardViewModel(apiClient: apiClient))
    }

    var body: some View {
        NavigationStack(path: $path) {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    Text("Welcome back.")
                        .font(.largeTitle.bold())

                    if let summary = viewModel.summary {
                        statsGrid(summary)
                    } else if viewModel.isLoading {
                        ProgressView()
                    }

                    if let errorMessage = viewModel.errorMessage {
                        Text(errorMessage).foregroundStyle(.red)
                    }

                    Text("Quick actions")
                        .font(.headline)
                        .foregroundStyle(.secondary)

                    VStack(spacing: 12) {
                        actionTile(title: "Log Match", systemImage: "circle.grid.cross.fill") {
                            path.append(DashboardRoute.newMatch)
                        }
                        actionTile(title: "Challenge Player", systemImage: "bolt.fill") {
                            path.append(DashboardRoute.newChallenge)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Dashboard")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button("Log Out") { session.logout() }
                }
            }
            .navigationDestination(for: DashboardRoute.self) { route in
                switch route {
                case .newMatch:
                    NewMatchView(apiClient: apiClient) { matchId in
                        path.append(DashboardRoute.liveScoring(matchId))
                    }
                case .liveScoring(let matchId):
                    LiveScoringView(matchId: matchId, apiClient: apiClient) {
                        path.removeLast(path.count)
                    }
                case .newChallenge:
                    NewChallengeView(apiClient: apiClient) {
                        path.removeLast(path.count)
                    }
                }
            }
            .task { await viewModel.load() }
            .refreshable { await viewModel.load() }
        }
    }

    private func statsGrid(_ summary: StatsSummary) -> some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            statCard(label: "Wins", value: "\(summary.wins)")
            statCard(label: "Losses", value: "\(summary.losses)")
            statCard(label: "Win %", value: String(format: "%.0f%%", summary.winPct * 100))
            statCard(label: "Streak", value: "\(summary.streak)")
        }
    }

    private func statCard(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label.uppercased())
                .font(.caption.bold())
                .foregroundStyle(.secondary)
            Text(value)
                .font(.title.bold())
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(RoundedRectangle(cornerRadius: 14).fill(.thinMaterial))
    }

    private func actionTile(title: String, systemImage: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack {
                Image(systemName: systemImage)
                    .frame(width: 34, height: 34)
                    .background(Circle().fill(Color.accentColor.opacity(0.15)))
                Text(title).fontWeight(.semibold)
                Spacer()
                Image(systemName: "chevron.right")
                    .foregroundStyle(.secondary)
            }
            .padding()
            .background(RoundedRectangle(cornerRadius: 14).fill(.thinMaterial))
        }
        .buttonStyle(.plain)
        .foregroundStyle(.primary)
    }
}
