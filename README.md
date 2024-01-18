# Kratum

**Kratum** is a [Stratum pool server](https://braiins.com/stratum-v1/docs) that supports the
[Kadena blockchain](https://github.com/kadena-io), based on the
[popular NOMP (Node Open Mining Portal)](https://github.com/zone117x/node-open-mining-portal).

## Background

Kadena features a unique parallel-chain architecture that’s capable of massive throughput but is
incompatible with the standard Stratum mining protocol. The Kratum server extends NOMP, which uses
[Node Stratum Pool](https://github.com/zone117x/node-stratum-pool) in turn, as the basis for making
the required changes.

## Development

Kratum is developed using Node.js 12.x (due to Ubuntu LTS availability) and requires a
[working Kadena Chainweb node](https://github.com/nopool/chainweb-node), the configuration of which
is described in that repository. To import the other dependencies and run the server on Ubuntu 22.04
LTS, follow the steps below.

_TODO_

## Testing

[NoncerPro](https://github.com/NoncerPro/Kadena/releases/tag/2.2.0) seems to be the only non-ASIC
Kadena miner that’s publicly available and still functional. That miner can be used to test Kratum
with the [provided batch template](testing/noncerpro.bat).

## License

Copyright 2022– Massive Computing, Inc.

This program is free software, excluding the brand features identified in the
[Exceptions](#exceptions) below: you can redistribute it and/or modify it under the terms of the GNU
General Public License as published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
[GNU General Public License](https://www.gnu.org/licenses/gpl-3.0.html) for more details.

## Exceptions

The Kratum, NoPool, and Massive logos, trademarks, domain names, and other brand features used in
this program cannot be reused without permission and no license is granted thereto.
