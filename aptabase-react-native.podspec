require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = "aptabase-react-native"
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']

  s.authors      = package['author']
  s.homepage     = package['homepage']
  s.platform     = :ios, "15.1"

  s.source       = { :git => "https://github.com/aptabase/aptabase-react-native.git", :tag => s.version.to_s }
  s.source_files  = "ios/**/*.{h,m,swift}"

  s.dependency 'React-Core'
end