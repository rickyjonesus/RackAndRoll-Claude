import Foundation

enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case patch = "PATCH"
    case delete = "DELETE"
}

/// Describes a single call against the RackAndRoll API. `path` is relative to
/// the configured base URL (which already includes the `/api` prefix).
struct APIEndpoint {
    let path: String
    let method: HTTPMethod
    let queryItems: [URLQueryItem]
    let body: (any Encodable)?

    private init(path: String, method: HTTPMethod, queryItems: [URLQueryItem] = [], body: (any Encodable)? = nil) {
        self.path = path
        self.method = method
        self.queryItems = queryItems
        self.body = body
    }

    // MARK: Auth (no auth header required)

    static func register(_ body: RegisterRequest) -> APIEndpoint {
        APIEndpoint(path: "auth/register", method: .post, body: body)
    }

    static func login(_ body: LoginRequest) -> APIEndpoint {
        APIEndpoint(path: "auth/login", method: .post, body: body)
    }

    // MARK: Stats

    static let statsSummary = APIEndpoint(path: "stats/summary", method: .get)

    // MARK: Users

    static func searchUsers(query: String) -> APIEndpoint {
        APIEndpoint(path: "users/search", method: .get, queryItems: [URLQueryItem(name: "q", value: query)])
    }

    // MARK: Matches

    static let matchHistory = APIEndpoint(path: "matches/history", method: .get)

    static func createMatch(_ body: CreateMatchRequest) -> APIEndpoint {
        APIEndpoint(path: "matches", method: .post, body: body)
    }

    static func getMatch(id: String) -> APIEndpoint {
        APIEndpoint(path: "matches/\(id)", method: .get)
    }

    static func addRack(matchId: String, winnerId: String, rackNum: Int) -> APIEndpoint {
        APIEndpoint(path: "matches/\(matchId)/racks", method: .post, body: AddRackRequest(winnerId: winnerId, rackNum: rackNum))
    }

    static func undoRack(matchId: String) -> APIEndpoint {
        APIEndpoint(path: "matches/\(matchId)/racks/undo", method: .patch)
    }

    static func finalizeMatch(matchId: String) -> APIEndpoint {
        APIEndpoint(path: "matches/\(matchId)/finalize", method: .patch)
    }

    // MARK: Scheduling

    static let upcomingChallenges = APIEndpoint(path: "scheduling/upcoming", method: .get)

    static func createChallenge(_ body: CreateChallengeRequest) -> APIEndpoint {
        APIEndpoint(path: "scheduling/challenges", method: .post, body: body)
    }
}
