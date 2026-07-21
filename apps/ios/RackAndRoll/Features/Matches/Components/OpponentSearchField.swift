import SwiftUI

/// Debounced opponent search, shared by NewMatchView and NewChallengeView —
/// mirrors `new-match.component.ts`'s search UX.
struct OpponentSearchField: View {
    @Binding var query: String
    let results: [UserSummary]
    let onSelect: (UserSummary) -> Void

    var body: some View {
        TextField("Search players", text: $query)
            .textInputAutocapitalization(.never)
            .autocorrectionDisabled()

        ForEach(results) { user in
            Button {
                onSelect(user)
            } label: {
                HStack {
                    Text(user.displayName)
                        .foregroundStyle(.primary)
                    Spacer()
                    Text(String(format: "%.0f", user.rating))
                        .foregroundStyle(.secondary)
                }
            }
        }
    }
}
