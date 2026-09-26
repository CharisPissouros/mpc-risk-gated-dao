# Security Notes — Draft για README "Known Limitations / Design Decisions"

---

### `app/lib/sessions.ts`
- **`createSession()`**: χωρίς try/catch — σκόπιμο, ώστε exception να σταματά την εκτέλεση πριν σταλεί cookie χωρίς αντίστοιχη DB εγγραφή.
- **`deleteSession()`**: `deleteMany()` αντί `delete()` — δεν πετάει error σε διπλό logout attempt.

### `app/lib/auth.ts`
- **`getCurrentUser()`**: session check με `expires: { gt: new Date() }` — απαραίτητο γιατί ληγμένες sessions δεν διαγράφονται αυτόματα από τη βάση.

### `app/api/auth/nonce/route.ts`
- Δεν υπάρχει scheduled cleanup για used/expired nonces — μόνο lazy cleanup (στο επόμενο request ίδιου wallet).
- TOCTOU race στο `deleteMany → create` (πιθανά 2 ενεργά nonces ταυτόχρονα) — αξιολογήθηκε ακίνδυνο, δεν βοηθά επιτιθέμενο χωρίς private key.
- Δεν υπάρχει rate limiting — πιθανό DoS vector (DB load), όχι credential risk.

### `CustomPlugin.sol`
- **`createInvestmentProposal()`** (γρ. 128-199): CEI pattern αντί ReentrancyGuard — state changes πριν την external call.
- **`CustomPluginSetup.sol`**: oracle & proposer permission merge στο ίδιο address — no separation of duties.
- **`executeInvestment()`** (γρ. 201-212): permissionless by design — η εξουσιοδότηση γίνεται ήδη μέσω DAO voting.
- **`initialize()`** (γρ. 79): DAO binding check (`tokenforvoting.dao() == _dao`) — αποτρέπει mismatched TokenVoting instance.

### 'middleware.ts '
checks only for cookies existence   

### 'oracle'
Oracle shares environment με το web app (PRIVATE_KEY) — deliberate prototype assumption.

### `Custom_MPC_protocol.mpc`
- `Health_threshold = 10` hardcoded compile-time constant — όχι configurable on-chain.
- Manual bridge MP-SPDZ stdout → on-chain oracle — καμία κρυπτογραφική απόδειξη ότι το submitted score προήλθε πράγματι από το MPC· ασφάλεια εξαρτάται πλήρως από trust στο oracle address
---
