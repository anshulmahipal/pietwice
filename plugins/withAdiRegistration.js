const fs = require("fs");
const path = require("path");
const { withDangerousMod } = require("@expo/config-plugins");

/**
 * Copies `native-android/adi-registration.properties` into the generated Android project at
 * `android/app/src/main/assets/adi-registration.properties` so EAS prebuild includes it.
 */
function withAdiRegistration(config) {
  return withDangerousMod(config, [
    "android",
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const androidRoot = cfg.modRequest.platformProjectRoot;
      const src = path.join(projectRoot, "native-android", "adi-registration.properties");
      const destDir = path.join(androidRoot, "app", "src", "main", "assets");
      const dest = path.join(destDir, "adi-registration.properties");

      if (!fs.existsSync(src)) {
        throw new Error(
          `withAdiRegistration: missing source file at ${src}. Add your Play Console snippet there.`,
        );
      }

      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(src, dest);
      return cfg;
    },
  ]);
}

module.exports = withAdiRegistration;
