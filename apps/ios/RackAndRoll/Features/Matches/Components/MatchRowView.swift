import SwiftUI

struct MatchRowView: View {
    let match: Match

    private var isWin: Bool {
        match.homeScore > match.awayScore
    }

    var body: some View {
        HStack {
            Circle()
                .fill(match.status == .completed ? (isWin ? Color.green : Color.red) : Color.orange)
                .frame(width: 10, height: 10)

            VStack(alignment: .leading, spacing: 2) {
                Text("vs \(match.opponentDisplayName)")
                    .fontWeight(.semibold)
                Text(match.gameType.displayName)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Text("\(match.homeScore) – \(match.awayScore)")
                .font(.system(.body, design: .rounded).monospacedDigit())
        }
        .padding(.vertical, 4)
    }
}
