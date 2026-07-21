import Foundation

/// Single chokepoint for every network call: attaches the bearer token,
/// encodes/decodes JSON with a Prisma-compatible date format, and reacts to
/// 401s by tearing down the session. Mirrors what `auth.interceptor.ts` +
/// `api.service.ts` do together on the web app.
@MainActor
final class APIClient {
    private let baseURL: URL
    private let session: URLSession
    private let tokenProvider: () -> String?
    private let onUnauthorized: () -> Void
    private let encoder: JSONEncoder
    private let decoder: JSONDecoder

    init(
        baseURL: URL,
        session: URLSession = .shared,
        tokenProvider: @escaping () -> String?,
        onUnauthorized: @escaping () -> Void
    ) {
        self.baseURL = baseURL
        self.session = session
        self.tokenProvider = tokenProvider
        self.onUnauthorized = onUnauthorized

        let withFractionalSeconds = ISO8601DateFormatter()
        withFractionalSeconds.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let withoutFractionalSeconds = ISO8601DateFormatter()
        withoutFractionalSeconds.formatOptions = [.withInternetDateTime]

        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .custom { date, enc in
            var container = enc.singleValueContainer()
            try container.encode(withFractionalSeconds.string(from: date))
        }
        self.encoder = encoder

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { dec in
            let container = try dec.singleValueContainer()
            let raw = try container.decode(String.self)
            if let date = withFractionalSeconds.date(from: raw) ?? withoutFractionalSeconds.date(from: raw) {
                return date
            }
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Unrecognized date format: \(raw)")
        }
        self.decoder = decoder
    }

    @discardableResult
    func send<Response: Decodable>(_ endpoint: APIEndpoint) async throws -> Response {
        let request = try buildRequest(for: endpoint)

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch let urlError as URLError {
            throw APIError.network(urlError)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        guard (200..<300).contains(httpResponse.statusCode) else {
            if httpResponse.statusCode == 401 {
                onUnauthorized()
                throw APIError.unauthorized
            }
            let message = (try? decoder.decode(ServerErrorBody.self, from: data))?.message?.firstMessage
            throw APIError.server(statusCode: httpResponse.statusCode, message: message)
        }

        do {
            return try decoder.decode(Response.self, from: data)
        } catch let decodingError as DecodingError {
            throw APIError.decoding(decodingError)
        }
    }

    private func buildRequest(for endpoint: APIEndpoint) throws -> URLRequest {
        var components = URLComponents(
            url: baseURL.appendingPathComponent(endpoint.path),
            resolvingAgainstBaseURL: false
        )
        if !endpoint.queryItems.isEmpty {
            components?.queryItems = endpoint.queryItems
        }
        guard let url = components?.url else {
            throw APIError.invalidResponse
        }

        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if let token = tokenProvider() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = endpoint.body {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try encoder.encode(body)
        }

        return request
    }
}

/// Shape of a NestJS validation/HTTP error body: `message` is a single
/// string for most thrown exceptions, or an array of strings for
/// class-validator failures.
private struct ServerErrorBody: Decodable {
    let message: MessageField?

    enum MessageField: Decodable {
        case single(String)
        case multiple([String])

        init(from decoder: Decoder) throws {
            let container = try decoder.singleValueContainer()
            if let single = try? container.decode(String.self) {
                self = .single(single)
            } else {
                self = .multiple(try container.decode([String].self))
            }
        }

        var firstMessage: String? {
            switch self {
            case .single(let value): return value
            case .multiple(let values): return values.first
            }
        }
    }
}
