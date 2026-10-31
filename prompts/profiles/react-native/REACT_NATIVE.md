# React Native Engineering Profile

## 1. Native Mobile Architecture
- Use `FlatList` or `SectionList` with `keyExtractor`, `getItemLayout`, and appropriate `windowSize` for long scrollable feeds. Never map long arrays inside a generic `ScrollView`.
- Handle safe area insets on iOS and notch/gesture bars on Android using `react-native-safe-area-context`.
- Handle offline state, flaky mobile networks, and background app state transitions (`AppState`).

## 2. Platform Parity & Performance
- Maintain platform-specific overrides (`.ios.tsx`, `.android.tsx`) only when necessary; maintain unified core components otherwise.
- Avoid bridge bottlenecks: offload heavy gesture and layout animations to native threads using React Native Reanimated.
- Store sensitive tokens (JWTs, biometrics) in native secure storage (`expo-secure-store` or `react-native-keychain`), never plain `AsyncStorage`.

