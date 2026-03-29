# Explanation

## What was the bug?

`HttpClient.request()` only treated `oauth2Token` as usable if it was an `OAuth2Token` instance. A token restored from JSON is a plain object, so the client neither refreshed it correctly nor attached its `Authorization` header.

## Why did it happen?

The logic relied on `instanceof OAuth2Token`. That works for class instances, but not for plain objects with the same `accessToken` and `expiresAt` fields.

## Why does your fix actually solve it?

The fix normalizes any token-shaped plain object into an `OAuth2Token` before checking expiration or building the header. That makes both deserialized valid tokens and deserialized expired tokens follow the same code path as real instances.

## What’s one realistic case / edge case your tests still don’t cover?

The tests do not cover malformed token objects, for example `{ accessToken: "", expiresAt: "tomorrow" }`, where the client should probably reject the token and refresh.
