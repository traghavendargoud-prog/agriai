# Security Specification: AgriSight AI

## 1. Data Invariants
- A `Farm` must always be linked to a valid `User` UID in the `ownerId` field.
- `ndviScore` must be between 0 and 1.
- `role` in User profile can only be 'farmer' or 'trader'.
- Users can only read/write their own profiles and farms.
- Alerts are private to the recipient (`userId`).
- Timestamps (`createdAt`, `updatedAt`, `boundaryUpdatedAt`) must be server-validated.

## 2. The "Dirty Dozen" Payloads (Verified Denied)
1. **Identity Theft (Profile)**: `setDoc` to `users/other-uid` -> **REJECTED** (isOwner match failed).
2. **Identity Theft (Farm)**: `addDoc` to `farms` with `ownerId: 'attacker-uid'` -> **REJECTED** (isValidFarm identity check).
3. **Privilege Escalation**: `updateDoc` to `users/my-uid` with `role: 'admin'` -> **REJECTED** (enum validation).
4. **Invalid Schema (NDVI)**: `updateDoc` to `farms/my-farm` with `ndviScore: 1.5` -> **REJECTED** (range check).
5. **Ghost Field**: `updateDoc` to `farms/id` with `{ extraField: true }` -> **REJECTED** (affectedKeys().hasOnly).
6. **Orphaned Write**: Create a farm with malformed `ownerId`. -> **REJECTED** (size/regex check).
7. **Malformed ID**: `doc(db, 'farms', '.../...')`. -> **REJECTED** (isValidId).
8. **PII Leak**: `getDocs(collection(db, 'users'))`. -> **REJECTED** (no allow list on users).
9. **Spam Alerts**: `addDoc` to `alerts` from client. -> **REJECTED** (no allow create on alerts).
10. **State Shortcut**: `updateDoc` trying to change `createdAt`. -> **REJECTED** (immutability check).
11. **Type Poisoning**: `updateDoc` setting `area` to "string". -> **REJECTED** (type check).
12. **Resource Exhaustion**: `setDoc` with 1MB `name` field. -> **REJECTED** (size check).

## 3. Conflict Report
| Risk | Mitigation | Status |
|---|---|---|
| Identity Spoofing | `isOwner()` + `data.ownerId == auth.uid` | PASS |
| State Shortcutting | `affectedKeys().hasOnly()` actions | PASS |
| Resource Poisoning | `size()` guards on all strings/lists | PASS |
| PII Leak | `get` only on `users` with `isOwner` | PASS |
| Query Scraping | `allow list` evaluates `resource.data` | PASS |

## 4. Final Review
- Rules version 2 used.
- `email_verified` enforced for all writes.
- All actions whitelisted via `hasOnly`.
- Terminal state locking considerations (metadata immutability).
