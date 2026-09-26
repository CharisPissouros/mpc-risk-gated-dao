## Requirements

Tested on Ubuntu 24.04.4 LTS.

\`\`\`bash
sudo apt install -y \
  git build-essential automake libtool clang cmake \
  python3 python3-pip \
  libssl-dev libboost-all-dev libgmp-dev libsodium-dev \
  libntl-dev libmpfr-dev
\`\`\`

> **Note:** this list has not been verified on a clean/minimal
> Ubuntu install — it reflects the packages present on the
> development machine, cross-checked against MP-SPDZ's own README.
> If you hit a missing dependency, check the official
> [MP-SPDZ installation instructions](https://github.com/data61/MP-SPDZ).
