# WebSocket Latency Compensation Protocol

## Synchronization Rules
- Server maintains authoritative master clock.
- Client timestamps incoming submissions with local NTP delta compensation.
- Ties broken using server-side microsecond arrival timestamp.
