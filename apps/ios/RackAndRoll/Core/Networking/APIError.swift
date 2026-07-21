import Foundation

enum APIError: Error, LocalizedError {
    case network(URLError)
    case decoding(DecodingError)
    case server(statusCode: Int, message: String?)
    case unauthorized
    case invalidResponse

    var errorDescription: String? {
        switch self {
        case .network(let error):
            return error.localizedDescription
        case .decoding:
            return "The server response couldn't be read."
        case .server(_, let message):
            return message ?? "Something went wrong. Please try again."
        case .unauthorized:
            return "Your session has expired. Please log in again."
        case .invalidResponse:
            return "The server returned an unexpected response."
        }
    }
}
