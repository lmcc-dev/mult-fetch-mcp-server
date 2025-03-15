# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-03-15

### Added
- Internationalization (i18n) missing keys detection tool
  - Detects keys used in code but missing in translation files
  - Supports both English and Chinese translations
  - Generates detailed reports with missing keys information

- Internationalization (i18n) unused keys detection tool
  - Identifies unused i18n keys across the codebase
  - Supports dynamic key detection for complex usage patterns
  - Includes preservation mechanism for error-related keys
  - Provides report-only mode for safe analysis

- Error handling improvements
  - Added new ErrorHandler utility for consistent error management
  - Implemented comprehensive error testing

### Fixed
- Placeholder mismatch in English translation for `client.statusCodeDetected`
- Various minor bugs in the Node fetcher implementation

## [1.1.0] - 2025-03-01

### Added
- Initial public release 