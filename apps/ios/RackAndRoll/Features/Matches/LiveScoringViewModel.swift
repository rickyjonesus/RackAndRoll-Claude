/// `GET /matches/:id` doesn't return `racks` (verified against
/// matches.service.ts), so score is tracked client-side here — incremented
/// on each successful rack POST, decremented on undo — exactly like the
/// Angular `LiveScoringComponent`.
@MainActor
@Observable
final class LiveScoringViewModel {
    private(set) var match: Match?
    private(set) var homeScore = 0
    private(set) var awayScore = 0
    private(set) var isLoading = false
    private(set) var isSubmittingRack = false
    private(set) var isFinalized = false
    var errorMessage: String?

    private let matchId: String
    private let apiClient: APIClient
    /// Whether the home player won the most recent rack, for undo. `nil` once undone/unavailable.
    private var lastRackWasHome: Bool?

    init(matchId: String, apiClient: APIClient) {
        self.matchId = matchId
        self.apiClient = apiClient
    }

    var canUndo: Bool { lastRackWasHome != nil && !isFinalized }
    private var nextRackNum: Int { homeScore + awayScore + 1 }

    func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            match = try await apiClient.send(.getMatch(id: matchId))
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func addRack(isHome: Bool) async {
        guard let match, !isSubmittingRack, !isFinalized else { return }
        let winnerId = isHome ? match.homePlayer.id : (match.awayPlayer?.id ?? "__guest__")
        isSubmittingRack = true
        defer { isSubmittingRack = false }
        do {
            let _: Rack = try await apiClient.send(.addRack(matchId: matchId, winnerId: winnerId, rackNum: nextRackNum))
            if isHome { homeScore += 1 } else { awayScore += 1 }
            lastRackWasHome = isHome
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func confirmUndo() async {
        guard let wasHome = lastRackWasHome else { return }
        do {
            let _: Rack = try await apiClient.send(.undoRack(matchId: matchId))
            if wasHome { homeScore = max(0, homeScore - 1) } else { awayScore = max(0, awayScore - 1) }
            lastRackWasHome = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func finalize() async {
        guard !isFinalized else { return }
        do {
            let _: FinalizedMatch = try await apiClient.send(.finalizeMatch(matchId: matchId))
            isFinalized = true
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
