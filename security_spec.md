# SASHER Security Specification & Rules Verification

## 1. Data Invariants
1. **User Identity Invariant**: A user document at `/users/{userId}` can only be created or modified by an authenticated user whose `request.auth.uid == userId` and whose `request.auth.token.email_verified == true`.
2. **Wishlist Scoping Invariant**: A wishlist item under `/users/{userId}/wishlist/{productId}` must have `incoming().userId == request.auth.uid && request.auth.uid == userId`.
3. **Order Ownership Invariant**: An order document under `/users/{userId}/orders/{orderId}` must have `incoming().userId == request.auth.uid && request.auth.uid == userId`.
4. **Session State Invariant**: A session document under `/users/{userId}/session/{docId}` must have `incoming().userId == request.auth.uid && request.auth.uid == userId`.
5. **No Cross-User Access**: No authenticated user can read or write documents belonging to any other user's path.
6. **Default Deny Invariant**: Any path not explicitly matched must be rejected with `allow read, write: if false`.

---

## 2. The Dirty Dozen Payloads (Designed to Fail)
1. **Unauthenticated Profile Write**: Writing to `/users/alice123` with no `request.auth`.
2. **Identity Spoofing in Profile**: Authenticated as `bob456`, attempting to write to `/users/alice123`.
3. **Unverified Email Profile Write**: Authenticated user with `email_verified == false` attempting to create profile.
4. **Oversized Field Attack**: Profile payload with `displayName` exceeding 128 characters or 1MB string payload.
5. **Missing Required Field**: Profile payload omitting `email` or `displayName`.
6. **Cross-User Wishlist Insertion**: Authenticated as `bob456`, writing into `/users/alice123/wishlist/prod-01`.
7. **Wishlist Owner ID Tampering**: In `/users/alice123/wishlist/prod-01`, sending payload where `userId: "mallory789"`.
8. **Negative Price Poisoning**: Creating a WishlistItem with negative price `price: -45.00`.
9. **Invalid Document ID Path Variable**: Writing to `/users/alice!@#$%^&*()/wishlist/item1` (violating `^[a-zA-Z0-9_\-]+$`).
10. **Order Cross-User Modification**: Attempting to alter another user's order record under `/users/otherUser/orders/ord-99`.
11. **Negative Order Total**: Creating an order with `totalAmount: -100` or negative `itemCount`.
12. **Blanket Query Scraping**: Attempting an unrestricted collectionGroup query across all users' private collections.

---

## 3. Test Runner Reference
All 12 payloads must result in `PERMISSION_DENIED` across all security evaluation gates.
