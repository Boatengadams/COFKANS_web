# Firestore Access Model

Staff authorization is based on Firebase Auth custom claims, not Firestore profile documents. A staff token must include `staff: true`, `role`, and, for branch-scoped roles, `branchSlug`. Manager and developer roles are global administrative roles.

Customers can read active/public product documents and can only access their own `users`, `carts`, `orders`, `sessions`, and `payments` records. They cannot write `inventory`, read or write `staffAccounts`, or read orders owned by another user.

Staff can read and update operational documents only when their role permits it. Branch-scoped staff are constrained to documents whose `branchSlug` matches their custom claim. Only managers and developers can write `staffAccounts` or `staffProvisioningRequests`.

Payment state is server-authoritative. Client-created orders must start with `paymentStatus` of `pending` or `processing` and `paidAt == null`. Client updates cannot change `paymentStatus`, `paid`, `paidAt`, transaction identifiers, provider fields, or verification fields. The `payments` collection denies all client writes, so payment records and paid status changes must be written by Cloud Functions/Admin SDK.

`auditLogs` is append-only for clients: authorized staff can create rows for their own UID, managers/developers can read them, and updates/deletes are denied.
