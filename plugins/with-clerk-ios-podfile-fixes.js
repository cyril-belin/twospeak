const { createRunOncePlugin, withPodfile } = require('@expo/config-plugins');

const MODULAR_HEADER_PODS = ['GoogleUtilities', 'RecaptchaInterop'];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function addGlobalModularHeaders(contents) {
  if (contents.includes('use_modular_headers!')) {
    return contents;
  }

  return contents.replace(
    /^(platform :ios, .*)$/m,
    "$1\nuse_modular_headers!",
  );
}

function addClerkModularHeaderPods(contents) {
  let nextContents = contents;
  const missingPodLines = [];

  for (const podName of MODULAR_HEADER_PODS) {
    const podLine = `  pod '${podName}', :modular_headers => true`;
    const podPattern = new RegExp(
      `^\\s*pod\\s+['"]${escapeRegExp(podName)}['"].*$`,
      'm',
    );

    if (podPattern.test(nextContents)) {
      nextContents = nextContents.replace(podPattern, line => {
        return line.includes(':modular_headers => true') ? line : podLine;
      });
    } else {
      missingPodLines.push(podLine);
    }
  }

  if (missingPodLines.length === 0) {
    return nextContents;
  }

  const modularHeaderBlock = [
    '  # Clerk / Firebase AppCheck requires these Swift static library dependencies to define modules.',
    ...missingPodLines,
    '',
  ].join('\n');

  if (nextContents.includes('  use_expo_modules!\n')) {
    return nextContents.replace(
      '  use_expo_modules!\n',
      `  use_expo_modules!\n\n${modularHeaderBlock}`,
    );
  }

  const targetMatch = nextContents.match(/^target ['"].+['"] do\s*$/m);

  if (!targetMatch) {
    return addGlobalModularHeaders(nextContents);
  }

  const insertIndex = targetMatch.index + targetMatch[0].length;
  return `${nextContents.slice(0, insertIndex)}\n${modularHeaderBlock}${nextContents.slice(insertIndex)}`;
}

function withClerkIosPodfileFixes(config) {
  return withPodfile(config, config => {
    config.modResults.contents = addClerkModularHeaderPods(config.modResults.contents);
    return config;
  });
}

module.exports = createRunOncePlugin(
  withClerkIosPodfileFixes,
  'with-clerk-ios-podfile-fixes',
  '1.0.0',
);

module.exports.addClerkModularHeaderPods = addClerkModularHeaderPods;
