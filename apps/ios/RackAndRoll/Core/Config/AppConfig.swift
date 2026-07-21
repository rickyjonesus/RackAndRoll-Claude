import Foundation

enum AppConfig {
    /// Populated per-configuration via Debug.xcconfig / Release.xcconfig →
    /// Info.plist, mirroring the web app's environment.ts / environment.prod.ts split.
    static var apiBaseURL: URL {
        guard
            let raw = Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String,
            let url = URL(string: raw)
        else {
            fatalError("API_BASE_URL is missing or invalid in Info.plist")
        }
        return url
    }
}
