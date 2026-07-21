import SwiftUI

struct LoginView: View {
    let apiClient: APIClient
    let session: SessionStore
    @State private var viewModel: LoginViewModel

    init(apiClient: APIClient, session: SessionStore) {
        self.apiClient = apiClient
        self.session = session
        _viewModel = State(initialValue: LoginViewModel(apiClient: apiClient, session: session))
    }

    var body: some View {
        Form {
            Section {
                TextField("Email", text: $viewModel.email)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                SecureField("Password", text: $viewModel.password)
                    .textContentType(.password)
            }

            if let errorMessage = viewModel.errorMessage {
                Section {
                    Text(errorMessage)
                        .foregroundStyle(.red)
                }
            }

            Section {
                Button {
                    Task { await viewModel.login() }
                } label: {
                    if viewModel.isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity)
                    } else {
                        Text("Log In")
                            .frame(maxWidth: .infinity)
                    }
                }
                .disabled(!viewModel.canSubmit)
            }

            Section {
                NavigationLink("Need an account? Register") {
                    RegisterView(apiClient: apiClient, session: session)
                }
            }
        }
        .navigationTitle("Log In")
    }
}
