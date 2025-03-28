import ExpoModulesCore

public class ExpoAdapterIterableModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoAdapterIterable")

    Function("getApiKey") {
     return Bundle.main.object(forInfoDictionaryKey: "MY_CUSTOM_API_KEY") as? String
    }
  }
}
