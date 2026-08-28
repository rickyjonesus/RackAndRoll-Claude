import XCTest
@testable import RackAndRoll

final class PongMatchTests: XCTestCase {
    func testScoreIncrementsCorrectPlayer() {
        var match = PongMatch(winningScore: 11)
        match.score(for: .user)
        match.score(for: .user)
        match.score(for: .opponent)

        XCTAssertEqual(match.userScore, 2)
        XCTAssertEqual(match.opponentScore, 1)
        XCTAssertFalse(match.isGameOver)
        XCTAssertNil(match.winner)
    }

    func testUserWinsAtWinningScore() {
        var match = PongMatch(winningScore: 3)
        match.score(for: .user)
        match.score(for: .user)
        match.score(for: .user)

        XCTAssertTrue(match.isGameOver)
        XCTAssertEqual(match.winner, .user)
    }

    func testOpponentWinsAtWinningScore() {
        var match = PongMatch(winningScore: 3)
        match.score(for: .opponent)
        match.score(for: .opponent)
        match.score(for: .opponent)

        XCTAssertTrue(match.isGameOver)
        XCTAssertEqual(match.winner, .opponent)
    }

    func testScoringAfterGameOverIsIgnored() {
        var match = PongMatch(winningScore: 1)
        match.score(for: .user)
        XCTAssertTrue(match.isGameOver)

        match.score(for: .opponent)

        XCTAssertEqual(match.userScore, 1)
        XCTAssertEqual(match.opponentScore, 0)
        XCTAssertEqual(match.winner, .user)
    }
}
