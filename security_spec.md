# Security Specification: DSMD High School Portal

This document outlines the security requirements and invariants for the Firebase Firestore configuration.

## 1. Data Invariants
- **Admissions Applications**: Prospective students can submit applications freely. Once submitted, status defaults to `Pending`. No client may update an application status to `Approved` or `ReviewRequired` on their own. No user can list all admissions applications to avoid PII exposure.
- **Student Exam Results**: Exam results are read-only for public queries. The collection cannot be listed on the client side, and write operations are strictly blocked to maintain data integrity.

## 2. The "Dirty Dozen" Threat Payloads
The following payloads constitute active threat vectors trying to break identity, integrity, and safety:

### Case 1: Admissions Identity Spoofing & Escalation
- **Input**: `{ studentName: "Malicious User", status: "Approved" }`
- **Result**: `PERMISSION_DENIED` - The system must reject status self-promotion on creation or modification.

### Case 2: Ghost Field Poisoning
- **Input**: `{ studentName: "John", trackingId: "T1", status: "Pending", ghostField: "Malicious Injection" }`
- **Result**: `PERMISSION_DENIED` - Exact fields check rejects shadow variables.

### Case 3: PII Leak via Blanket Collections Listing
- **Input**: `query(collection(db, "admissions"))`
- **Result**: `PERMISSION_DENIED` - Direct list of admissions is strictly blocked.

### Case 4: Denial of Wallet via Extreme Field Bounds
- **Input**: `{ studentName: "A".repeat(100000), ... }`
- **Result**: `PERMISSION_DENIED` - Size limitations enforce strict memory containment.

## 3. Test Invariants
Our firestore security model mathematically guarantees zero-leakage, verified through strict structural matching of fields, size limits, and access parameters.
