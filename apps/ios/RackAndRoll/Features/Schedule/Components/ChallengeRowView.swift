import SwiftUI

struct ChallengeRowView: View {
    let challenge: Challenge

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text("\(challenge.challenger.displayName) vs \(challenge.challenged.displayName)")
                    .fontWeight(.semibold)
                Spacer()
                statusBadge
            }
            HStack(spacing: 6) {
                Text(challenge.gameType.displayName)
                Text("·")
                Text(challenge.proposedAt, style: .date)
                Text(challenge.proposedAt, style: .time)
            }
            .font(.caption)
            .foregroundStyle(.secondary)
        }
        .padding(.vertical, 4)
    }

    private var statusBadge: some View {
        Text(challenge.status.rawValue.capitalized)
            .font(.caption2.bold())
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(Capsule().fill(Color.accentColor.opacity(0.15)))
    }
}
