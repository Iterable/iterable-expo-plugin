import ExpoModulesCore

public class ExpoAdapterIterableModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoAdapterIterable")

    /**
     * Get the Iterable API key from the Info.plist file.
     * @return The Iterable API key.
     */
    Function("getApiKey") {
     return Bundle.main.object(forInfoDictionaryKey: "ITERABLE_API_KEY") as? String
    }
  }
}