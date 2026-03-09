# Explanation

## What was the bug?

The bug was in `HttpClient.request()` when `api=true` and `oauth2Token` was a plain object instead of an `OAuth2Token` instance. The code only refreshed the token when it was missing or when it was an expired `OAuth2Token` instance. Because of that, an expired plain object token was ignored, no refresh happened, and the `Authorization` header was not set correctly.

## Why did it happen?

It happened because the logic relied on `instanceof OAuth2Token`. A plain object like `{ accessToken: "stale", expiresAt: 0 }` is truthy, but it is not an instance of `OAuth2Token`. So the original condition skipped both refresh and header generation for that case.

## Why does your fix solve it?

The fix adds handling for the plain object token case. If the token is not an `OAuth2Token` instance but still contains token data, it is converted into an `OAuth2Token` and checked for expiration. If it is expired, `refreshOAuth2()` is called. This keeps the change small and ensures both real instances and plain object tokens follow the same expiration behavior.

## One realistic case / edge case your tests still do not cover

The tests do not cover the case where `oauth2Token` is a malformed plain object, for example missing `accessToken` or `expiresAt`, or containing values of the wrong type. In a real system, this could happen if token data is restored from storage in an invalid format.