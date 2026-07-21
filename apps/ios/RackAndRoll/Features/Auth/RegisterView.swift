import SwiftUI

struct RegisterView: View {
    @State private var viewModel: RegisterViewModel

    init(apiClient: APIClient, session: SessionStore) {
        _viewModel = State(initialValue: RegisterViewModel(apiClient: apiClient, session: session))
    }

    var body: some View {
        Form {
            Section {
                TextField("Display Name", text: $viewModel.displayName)
                    .textContentType(.nickname)
                TextField("Email", text: $viewModel.email)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                SecureField("Password (min 8 characters)", text: $viewModel.password)
                    .textContentType(.newPassword)
            }

            if let errorMessage = viewModel.errorMessage {
                Section {
                    Text(errorMessage)
                        .foregroundStyle(.red)
                }
            }

            Section {
                Button {
                    Task { await viewModel.register() }
                } label: {
                    if viewModel.isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity)
                    } else {
                        Text("Create Account")
                            .frame(maxWidth: .infinity)
                    }
                }
                .disabled(!viewModel.canSubmit)
            }
        }
        .navigationTitle("Register")
    }
}
