# o*l*y security

## Installation

```bash
$ npm install oly-core oly-http oly-api oly-security
```

## Configuration

| ENV | Provider | Default | Description |
|-----|----------|---------|-------------|
| **OLY_SECURITY_SECRET** | JwtAuthService | tz7b]K]o2h)796ag=ihB.POz3Q0G0> | The jwt secret.  |
| **OLY_SECURITY_TOKEN_EXPIRATION** | JwtAuthService | 60 * 60 * 3 | The token expiration time.  |
| **OLY_SECURITY_SALT_ROUND** | CryptoService | 8 | The bcrypt salt round.  |
| **OLY_SECURITY_ALGO** | CryptoService | "aes-256-ctr" | The default algo used by encrypt.  |
