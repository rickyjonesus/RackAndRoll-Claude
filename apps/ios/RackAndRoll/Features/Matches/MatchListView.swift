import SwiftUI

private enum MatchRoute: Hashable {
    case newMatch
    case liveScoring(String)
}

struct MatchListView: View {
    let apiClient: APIClient
    @State private var viewModel: MatchListViewModel
    @State private var path = NavigationPath()

    init(apiClient: APIClient) {
        self.apiClient = apiClient
        _viewModel = State(initialValue: MatchListViewModel(apiClient: apiClient))
    }

    var body: some View {
        NavigationStack(path: $path) {
            Group {
                if viewModel.matches.isEmpty && !viewModel.isLoading {
                    ContentUnavailableView(
                        "No Matches Yet",
                        systemImage: "circle.grid.cross",
                        description: Text("Log a match to start building your history.")
                    )
                } else {
                    List(viewModel.matches) { match in
                        MatchRowView(match: match)
                    }
                }
            }
            .navigationTitle("Matches")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        path.append(MatchRoute.newMatch)
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .navigationDestination(for: MatchRoute.self) { route in
                switch route {
                case .newMatch:
                    NewMatchView(apiClient: apiClient) { matchId in
                        path.append(MatchRoute.liveScoring(matchId))
                    }
                case .liveScoring(let matchId):
                    LiveScoringView(matchId: matchId, apiClient: apiClient) {
                        path.removeLast(path.count)
                        Task { await viewModel.load() }
                    }
                }
            }
            .task { await viewModel.load() }
            .refreshable { await viewModel.load() }
        }
    }
}
