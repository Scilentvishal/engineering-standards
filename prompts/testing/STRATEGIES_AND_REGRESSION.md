# Testing Strategies & Regression Prevention

## 1. Regression Testing Rules
- Every reported bug must be accompanied by a reproducing test case that fails before the fix and passes after the fix.
- Tag and organize regression tests to run continuously in CI pipelines before any pull request merge.

## 2. Boundary Value & Edge-Case Testing
- Always test zero, empty string, null, undefined, negative numbers, maximum integers, and oversized unicode inputs.
- Test error paths and unexpected network timeouts, ensuring the system degrades gracefully with user-friendly diagnostics.

