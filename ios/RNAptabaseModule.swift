import Foundation

@objc(RNAptabaseModule)
class RNAptabaseModule: NSObject {
  
  @objc
  func constantsToExport() -> [AnyHashable : Any]! {
    return [
      "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as Any,
      "appBuildNumber": Bundle.main.infoDictionary?["CFBundleVersion"] as Any,
      "isiOSAppOnMac": {
        if #available(iOS 14.0, *) {
          return ProcessInfo.processInfo.isiOSAppOnMac 
        } else {
          return false
        }
      }()
      ]
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
