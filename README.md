# mpc-risk-gated-dao

Πρωτότυπο σύστημα επενδυτικής διακυβέρνησης DAO, στο οποίο ένας off-chain υπολογισμός πολυμερούς ασφαλούς υπολογισμού (MPC) πάνω σε ιδιωτικά δεδομένα ρίσκου των χρηστών ελέγχει τη δημιουργία on-chain proposals σε ένα Aragon OSX plugin.

## Αρχιτεκτονική

1. **MPC (mpc/)**: τρία μέρη δίνουν ιδιωτικά δεδομένα (ρίσκο, κεφάλαιο, credit score) σε ένα πρωτόκολλο [MP-SPDZ](https://github.com/data61/MP-SPDZ), το οποίο υπολογίζει έναν System Health Index. Αποκαλύπτονται μόνο ο συγκεντρωτικός δείκτης και το bit έγκρισης, ποτέ τα επιμέρους δεδομένα.
2. **Oracle bridge (dao-app/scripts/mpc-bridge/)**: διαβάζει το output του MP-SPDZ και υποβάλλει on-chain το τελικό risk score και ένα hash των δεδομένων μέσω της submitRiskData.
3. **Aragon plugin (smart-contracts/)**: το CustomPlugin (cloneable Aragon OSX plugin) αποθηκεύει τα πιο πρόσφατα δεδομένα ρίσκου και επιτρέπει τη createInvestmentProposal μόνο αν τα δεδομένα υπάρχουν, είναι πρόσφατα (maxRiskDataAge) και κάτω από το maxAllowedRiskScore. Το proposal προωθείται στο TokenVoting plugin του DAO.
4. *Ψηφοφορία και εκτέλεση*: το TokenVoting διαχειρίζεται την ψηφοφορία. Όταν το canExecute γίνει true, η executeInvestment (permissionless εκ σχεδιασμού) εκτελεί το action του DAO.
5. **Web app (dao-app/)**: εφαρμογή Next.js με σύνδεση μέσω MetaMask (nonce challenge, επαλήθευση υπογραφής server-side). Τα sessions αποθηκεύονται ως SHA-256 hashes σε PostgreSQL μέσω Prisma, με httpOnly cookie.
6. *Deployment*: τα contracts στοχεύουν αποκλειστικά το Sepolia testnet.

## Γνωστοί περιορισμοί

- *Πρωτότυπο σε testnet, χωρίς audit.* Δεν προορίζεται για πραγματικά κεφάλαια.
- *Semi-honest μοντέλο MPC.* Το πρωτόκολλο υποθέτει ότι τα μέρη το ακολουθούν ειλικρινά. Κακόβουλη συμπεριφορά (χειραγώγηση εισόδων, aborts) δεν αντιμετωπίζεται.
- *Ένα έμπιστο oracle.* Το oracle bridge είναι το σημείο εμπιστοσύνης μεταξύ MPC και blockchain: δεν είναι αποκεντρωμένο και μοιράζεται το περιβάλλον του (συμπεριλαμβανομένου του PRIVATE_KEY) με το web app.
- *Συγχωνευμένοι ρόλοι oracle/proposer.* Το oracle κατέχει και το ORACLE_PERMISSION_ID και το CREATE_PROPOSAL_PERMISSION_ID στο plugin.
- *Αυτοδηλούμενα inputs.* Το credit score το εισάγει ο ίδιος ο χρήστης· δεν υπάρχει πιστοποίηση από τράπεζα ή τρίτο μέρος.
- *Χωρίς Prisma migrations.* Έχει γίνει commit μόνο το schema.prisma`· η βάση στήνεται με prisma db push`.
- *Το MP-SPDZ δεν περιλαμβάνεται.*`· δες το mpc/README.md`.

## Setup Tested with Node v20.20.0 and npm 10.8.2. Each component installs separately. ### smart-contracts/ (Hardhat) 
cd smart-contracts npm ci cp .env.example .env # then edit .env npx hardhat compile 
hardhat.config.ts requires SEPOLIA_RPC_URL and PRIVATE_KEY to be set. To compile only, throwaway values are enough (the key must have a valid format, so generate a random one): 
SEPOLIA_RPC_URL=http://localhost:8545 PRIVATE_KEY=0x$(openssl rand -hex 32) npx hardhat compile 
For deployment, use a dedicated testnet wallet with no real funds. ### dao-app/ (Next.js + Prisma) 
cd dao-app npm ci cp .env.example .env # then edit .env npx prisma generate npx prisma db push npm run dev 
Requires a running PostgreSQL database (create it first and point DATABASE_URL to it). The database schema is managed with prisma db push; there are no migrations.

## Κώδικας τρίτων

Το IMajorityVoting.sol έχει γίνει vendored από το [token-voting-plugin](https://github.com/aragon/token-voting-plugin) της Aragon, επειδή το npm package δεν περιλαμβάνει Solidity sources. Η μόνη τροποποίηση είναι η inline δήλωση του enum VoteOption. Παραμένει υπό την αρχική του άδεια (δες το SPDX header του αρχείου) και όχι υπό την MIT άδεια του repository.

## Repo Structure
mpc-risk-gated-dao/
├── .gitignore
├── .gitleaks.toml
├── LICENSE
├── README.md
├── SECURITY_NOTES.md
│
├── smart-contracts/
│   ├── .env.example
│   ├── hardhat.config.ts
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── contracts/
│   │   ├── CustomPlugin.sol
│   │   ├── CustomPluginSetup.sol
│   │   ├── interfaces/
│   │   │   └── aragon/
│   │   │       └── IMajorityVoting.sol
│   │   └── vendor/
│   │       └── ImportPSP.sol
│   └── scripts/
│       ├── applyInstallation.ts
│       ├── checkPermissions.ts
│       ├── deployPluginRepo.ts
│       ├── grantViaProposal.ts
│       ├── readInstallEvents.ts
│       ├── testSubmitRiskData.ts
│       └── verifyPlugin.ts
│
├── mpc/
│   ├── Custom_MPC_protocol.mpc
│   └── README.md
│
└── dao-app/
    ├── .env.example
    ├── .eslintrc.json
    ├── middleware.ts
    ├── next.config.js
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.js
    ├── prisma.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── prisma/
    │   └── schema.prisma
    ├── scripts/
    │   ├── checkIndexes.ts
    │   ├── seedTestUsers.ts
    │   └── mpc-bridge/
    │       ├── child.ts
    │       └── orchestrator.ts
    └── app/
        ├── favicon.ico
        ├── globals.css
        ├── layout.tsx
        ├── page.tsx
        ├── Dashboard/
        │   └── page.tsx
        ├── Proposals/
        │   └── page.tsx
        ├── login/
        │   └── page.tsx
        ├── profile/
        │   └── page.tsx
        ├── signup/
        │   └── page.tsx
        ├── proposal/
        │   ├── create/
        │   │   └── page.tsx
        │   └── voteProposal/
        │       └── page.tsx
        ├── api/
        │   ├── auth/
        │   │   └── nonce/
        │   │       └── route.ts
        │   ├── login/
        │   │   └── route.ts
        │   ├── profile/
        │   │   └── route.ts
        │   ├── proposal/
        │   │   └── route.ts
        │   └── signup/
        │       └── route.ts
        └── lib/
            ├── aragon-client.ts
            ├── auth.ts
            ├── db.ts
            ├── sessions.ts
            └── contracts/
                └── customPluginAbi.ts

## Άδεια

MIT, δες το [LICENSE](./LICENSE). Ισχύει για τον πρωτότυπο κώδικα του repository, εξαιρουμένου του αρχείου τρίτων που αναφέρεται παραπάνω.

See [SECURITY_NOTES.md](./SECURITY_NOTES.md) for a detailed
breakdown of security design decisions and known issues.
