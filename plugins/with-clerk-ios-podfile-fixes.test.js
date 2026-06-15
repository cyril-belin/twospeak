const assert = require('node:assert/strict');
const test = require('node:test');

const { addClerkModularHeaderPods } = require('./with-clerk-ios-podfile-fixes');

const podfile = `platform :ios, podfile_properties['ios.deploymentTarget'] || '16.4'

prepare_react_native_project!

target 'twospeak' do
  use_expo_modules!

  config = use_native_modules!(config_command)

  post_install do |installer|
    # Clerk: Resolve SPM packages synchronously during pod install
    react_native_post_install(
      installer,
      config[:reactNativePath],
    )
  end
end
`;

test('adds Clerk AppCheck modular header pods inside the app target', () => {
  const result = addClerkModularHeaderPods(podfile);

  assert.match(result, /  pod 'GoogleUtilities', :modular_headers => true/);
  assert.match(result, /  pod 'RecaptchaInterop', :modular_headers => true/);
  assert.ok(result.indexOf("target 'twospeak' do") < result.indexOf("pod 'GoogleUtilities'"));
  assert.ok(result.indexOf("pod 'RecaptchaInterop'") < result.indexOf('post_install do |installer|'));
  assert.match(result, /# Clerk: Resolve SPM packages synchronously during pod install/);
});

test('does not add duplicate modular header pods', () => {
  const once = addClerkModularHeaderPods(podfile);
  const twice = addClerkModularHeaderPods(once);

  assert.equal(twice, once);
  assert.equal((twice.match(/pod 'GoogleUtilities'/g) || []).length, 1);
  assert.equal((twice.match(/pod 'RecaptchaInterop'/g) || []).length, 1);
});
