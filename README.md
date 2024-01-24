# Kratum

**Kratum** is a [Stratum pool server](https://braiins.com/stratum-v1/docs) that supports the
[Kadena blockchain](https://github.com/kadena-io), based on the
[popular NOMP (Node Open Mining Portal)](https://github.com/zone117x/node-open-mining-portal).

## Background

Kadena’s unique parallel-chain architecture makes massive throughput possible but requires
[extensions to the standard Stratum mining protocol](https://gist.github.com/mightybyte/f1567c2bec0380539c638225fb8c1cf4).
[Massive](https://github.com/joinmassive) has used NOMP, which uses
[Node Stratum Pool](https://github.com/zone117x/node-stratum-pool) in turn, as the foundation to add
these extensions to.

## Design

The structure of the source NOMP and Node Stratum Pool projects has been mostly preserved (except
for updates to their syntax and style) so bugfixes can be downstreamed from them, but this decision
bears some maintenance cost too. In particular, the projects’ event-driven control flow can read
like spaghetti code.

A notable structural departure is the migration of NOMP’s MySQL database to the
[Supabase platform](https://github.com/supabase) for compatibility with
[Massive’s interface](https://nopool.com/). [MPOS compatibility](https://github.com/MPOS/php-mpos)
has been dropped in the process and
[Supabase self-hosting](https://supabase.com/docs/guides/self-hosting) opted against, so future
contributors may want to implement either feature or both.

## Caveats

The Kratum server was effectively submitting Kadena blocks through April 2023. However, lack of
access to competitive mining hardware (such as Bitmain’s Antminer KA3) has likely since allowed
breaking changes to be introduced. Open-sourcing this software is intended to let developers with
adequate hardware help reproduce and resolve any newer issues.

## Deployment and development

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
