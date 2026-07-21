import SwiftUI

private enum ScheduleRoute: Hashable {
    case newChallenge
}

struct ScheduleListView: View {
    let apiClient: APIClient
    @State private var viewModel: ScheduleListViewModel
    @State private var path = NavigationPath()

    init(apiClient: APIClient) {
        self.apiClient = apiClient
        _viewModel = State(initialValue: ScheduleListViewModel(apiClient: apiClient))
    }

    var body: some View {
        NavigationStack(path: $path) {
            Group {
                if viewModel.challenges.isEmpty && !viewModel.isLoading {
                    ContentUnavailableView(
                        "No Upcoming Challenges",
                        systemImage: "calendar",
                        description: Text("Challenge a player to see it here once they accept.")
                    )
                } else {
                    List(viewModel.challenges) { challenge in
                        ChallengeRowView(challenge: challenge)
                    }
                }
            }
            .navigationTitle("Schedule")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        path.append(ScheduleRoute.newChallenge)
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .navigationDestination(for: ScheduleRoute.self) { _ in
                NewChallengeView(apiClient: apiClient) {
                    path.removeLast(path.count)
                    Task { await viewModel.load() }
                }
            }
            .task { await viewModel.load() }
            .refreshable { await viewModel.load() }
        }
    }
}
