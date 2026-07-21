import XCTest
@testable import RackAndRoll

final class APIClientTests: XCTestCase {
    private func makeClient(token: String? = "test-token", onUnauthorized: @escaping () -> Void = {}) -> APIClient {
        let config = URLSessionConfiguration.ephemeral
        config.protocolClasses = [MockURLProtocol.self]
        let session = URLSession(configuration: config)
        return APIClient(
            baseURL: URL(string: "http://localhost:3000/api")!,
            session: session,
            tokenProvider: { token },
            onUnauthorized: onUnauthorized
        )
    }

    @MainActor
    func testDecodesStatsSummary() async throws {
        MockURLProtocol.requestHandler = { request in
            XCTAssertEqual(request.url?.absoluteString, "http://localhost:3000/api/stats/summary")
            XCTAssertEqual(request.value(forHTTPHeaderField: "Authorization"), "Bearer test-token")
            let json = #"{"played":10,"wins":6,"losses":4,"winPct":0.6,"streak":2}"#
            let response = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: nil, headerFields: nil)!
            return (response, Data(json.utf8))
        }

        let summary: StatsSummary = try await makeClient().send(.statsSummary)

        XCTAssertEqual(summary.wins, 6)
        XCTAssertEqual(summary.winPct, 0.6, accuracy: 0.0001)
    }

    @MainActor
    func testDecodesMatchWithFractionalSecondsDateAndGuestAwayPlayer() async throws {
        MockURLProtocol.requestHandler = { request in
            let json = """
            {"id":"m1","homePlayer":{"id":"u1","displayName":"Alice","avatarUrl":null},"awayPlayer":null,"guestName":"Sam","gameType":"EIGHT_BALL","raceToRacks":5,"homeScore":5,"awayScore":3,"winnerId":"u1","status":"COMPLETED","playedAt":"2026-07-20T12:34:56.789Z"}
            """
            let response = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: nil, headerFields: nil)!
            return (response, Data(json.utf8))
        }

        let match: Match = try await makeClient().send(.getMatch(id: "m1"))

        XCTAssertEqual(match.id, "m1")
        XCTAssertNil(match.awayPlayer)
        XCTAssertEqual(match.opponentDisplayName, "Sam")
    }

    @MainActor
    func testUnauthorizedTriggersCallbackAndThrows() async throws {
        var calledUnauthorized = false
        MockURLProtocol.requestHandler = { request in
            let response = HTTPURLResponse(url: request.url!, statusCode: 401, httpVersion: nil, headerFields: nil)!
            return (response, Data("{}".utf8))
        }

        let client = makeClient(onUnauthorized: { calledUnauthorized = true })

        do {
            let _: StatsSummary = try await client.send(.statsSummary)
            XCTFail("Expected APIError.unauthorized")
        } catch APIError.unauthorized {
            XCTAssertTrue(calledUnauthorized)
        }
    }

    @MainActor
    func testServerErrorSurfacesValidationMessage() async throws {
        MockURLProtocol.requestHandler = { request in
            let json = #"{"statusCode":400,"message":["password must be longer than or equal to 8 characters"],"error":"Bad Request"}"#
            let response = HTTPURLResponse(url: request.url!, statusCode: 400, httpVersion: nil, headerFields: nil)!
            return (response, Data(json.utf8))
        }

        let client = makeClient(token: nil)

        do {
            let _: TokenResponse = try await client.send(
                .register(RegisterRequest(email: "a@b.com", password: "short", displayName: "A"))
            )
            XCTFail("Expected APIError.server")
        } catch APIError.server(let statusCode, let message) {
            XCTAssertEqual(statusCode, 400)
            XCTAssertEqual(message, "password must be longer than or equal to 8 characters")
        }
    }

    /// `PATCH /matches/:id/finalize` returns the bare Prisma row with no
    /// `homePlayer`/`awayPlayer` keys (confirmed via curl against a live
    /// server) — decoding it as a full `Match` would throw. Regression test
    /// for that mismatch.
    @MainActor
    func testDecodesFinalizedMatchWithoutPlayerObjects() async throws {
        MockURLProtocol.requestHandler = { request in
            let json = """
            {"id":"m1","homePlayerId":"u1","awayPlayerId":"u2","guestName":null,"gameType":"EIGHT_BALL","raceToRacks":5,"homeScore":2,"awayScore":0,"winnerId":"u1","status":"COMPLETED","venueId":null,"playedAt":"2026-07-21T00:24:24.243Z","createdAt":"2026-07-21T00:24:24.243Z","updatedAt":"2026-07-21T00:24:40.242Z","disputedAt":null,"disputedBy":null}
            """
            let response = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: nil, headerFields: nil)!
            return (response, Data(json.utf8))
        }

        let result: FinalizedMatch = try await makeClient().send(.finalizeMatch(matchId: "m1"))

        XCTAssertEqual(result.status, .completed)
    }

    /// `POST /scheduling/challenges` returns the bare created row with no
    /// `challenger`/`challenged` keys (confirmed via curl) — decoding it as
    /// a full `Challenge` would throw. Regression test for that mismatch.
    @MainActor
    func testDecodesCreatedChallengeWithoutPlayerObjects() async throws {
        MockURLProtocol.requestHandler = { request in
            let json = """
            {"id":"c1","challengerId":"u1","challengedId":"u2","gameType":"NINE_BALL","proposedAt":"2026-08-01T18:00:00.000Z","venueId":null,"status":"PENDING","seriesId":null,"createdAt":"2026-07-21T00:25:03.191Z","updatedAt":"2026-07-21T00:25:03.191Z"}
            """
            let response = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: nil, headerFields: nil)!
            return (response, Data(json.utf8))
        }

        let result: CreatedChallenge = try await makeClient().send(.createChallenge(
            CreateChallengeRequest(challengedId: "u2", gameType: .nineBall, proposedAt: Date())
        ))

        XCTAssertEqual(result.id, "c1")
    }
}
