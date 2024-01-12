const filesystem                  = require('fs');
const path                        = require('path');
const crypto                      = require('crypto');
const config                      = require('config');
const base58                      = require('base58-native');
const maxU256                     = BigInt(
                                      '0x' + 'ffffffffffffffffffffffffffffffff'
                                           + 'ffffffffffffffffffffffffffffffff'
                                    ) + 1n;
const coinConfigPath              = path.join(__dirname, '../coins/kadena.json');
                                    // Unused publicly
      exports.reverseBuffer       = (buffer) => {
                                      const size      = buffer.length;
                                      const newBuffer = Buffer.alloc(size);

                                      for (var i = size - 1; i >= 0; i--) {
                                        newBuffer[size - i - 1] = buffer[i];
                                      }

                                      return newBuffer;
                                    };
      exports.reverseHexString    = (string) => {
                                      const buffer = Buffer.from(string.replace('0x', ''), 'hex');

                                      return exports.reverseBuffer(buffer).toString('hex');
                                    };
                                    // Takes hexadecimal string prefixed with or without “0x”
      exports.padHexString        = (string, length) => {
                                      return string.replace('0x', '').padStart(length, '0');
                                    };
      exports.getChainCount       = () => {
                                      let count;

                                      try {
                                        count = config.get('chainCount');
                                      } catch {
                                        const coinConfig = JSON.parse(
                                                             filesystem.readFileSync(
                                                               coinConfigPath, 'utf8'
                                                             )
                                                           );
                                                           config.util.extendDeep(
                                                             config, coinConfig
                                                           );
                                              count      = config.get('chainCount');
                                      }

                                      return count;
                                    };
                                    // Kadena header encoding is documented at
                                    // https://github.com/kadena-io/chainweb-node/wiki/Block-Header-Binary-Encoding
      exports.getRawChainId       = (rpcData) => { return rpcData.substring(0, 8); };
      exports.getChainId          = (rpcData) => {
                                      const bytes = exports.reverseHexString(
                                                      exports.getRawChainId(rpcData)
                                                    );

                                      return parseInt(Number(`0x${ bytes }`), 10);
                                    };
      exports.getHeight           = (rpcData) => {
                                      const bytes = exports.reverseHexString(
                                                      rpcData.substring(588, 604)
                                                    );

                                      return parseInt(bytes, 16);
                                    };
      exports.getTarget           = (rpcData) => {
                                      const bytes = exports.reverseHexString(
                                                      rpcData.substring(8, 72)
                                                    );

                                      return BigInt(`0x${ bytes }`);
                                    };
                                    // In microseconds
      exports.getTime             = (rpcData) => {
                                      const bytes = exports.reverseHexString(
                                                      rpcData.substring(88, 102)
                                                    );
                                      const time  = parseInt(Number(`0x${ bytes }`), 10);

                                      logger.debug(
                                        `Extracted time ${ time } from bytes ${ bytes }`
                                      );

                                      return time;
                                    };
      exports.getHeader           = (rpcData) => { return rpcData.substring(72); };
                                    // Based on
                                    // https://github.com/kadena-io/chainweb-node/blob/master/rewards/miner_rewards.csv
      exports.getReward           = (height) => {
                                      let reward;

                                      if (height < 87600) {
                                        reward = 23.04523;
                                      } else if (height < 175200) {
                                        reward = 22.97878;
                                      } else if (height < 262800) {
                                        reward = 22.91249;
                                      } else if (height < 350400) {
                                        reward = 22.84644;
                                      } else if (height < 438000) {
                                        reward = 22.78052;
                                      } else if (height < 525600) {
                                        reward = 22.71485;
                                      } else if (height < 613200) {
                                        reward = 22.64932;
                                      } else if (height < 700800) {
                                        reward = 22.58402;
                                      } else if (height < 788400) {
                                        reward = 22.51887;
                                      } else if (height < 876000) {
                                        reward = 22.45395;
                                      } else if (height < 963600) {
                                        reward = 22.38917;
                                      } else if (height < 1051200) {
                                        reward = 22.32462;
                                      } else if (height < 1138800) {
                                        reward = 22.26022;
                                      } else if (height < 1226400) {
                                        reward = 22.19604;
                                      } else if (height < 1314000) {
                                        reward = 22.13201;
                                      } else if (height < 1401600) {
                                        reward = 22.0682;
                                      } else if (height < 1489200) {
                                        reward = 22.00454;
                                      } else if (height < 1576800) {
                                        reward = 21.9411;
                                      } else if (height < 1664400) {
                                        reward = 21.8778;
                                      } else if (height < 1752000) {
                                        reward = 21.81473;
                                      } else if (height < 1839600) {
                                        reward = 21.75179;
                                      } else if (height < 1927200) {
                                        reward = 21.68909;
                                      } else if (height < 2014800) {
                                        reward = 21.62651;
                                      } else if (height < 2102400) {
                                        reward = 21.56417;
                                      } else if (height < 2190000) {
                                        reward = 21.50195;
                                      } else if (height < 2277600) {
                                        reward = 21.43997;
                                      } else if (height < 2365200) {
                                        reward = 21.3781;
                                      } else if (height < 2452800) {
                                        reward = 21.31649;
                                      } else if (height < 2540400) {
                                        reward = 21.25497;
                                      } else if (height < 2628000) {
                                        reward = 21.19372;
                                      } else if (height < 2715600) {
                                        reward = 21.13255;
                                      } else if (height < 2803200) {
                                        reward = 21.07165;
                                      } else if (height < 2890800) {
                                        reward = 21.01083;
                                      } else if (height < 2978400) {
                                        reward = 20.95029;
                                      } else if (height < 3066000) {
                                        reward = 20.88982;
                                      } else if (height < 3153600) {
                                        reward = 20.82962;
                                      } else if (height < 3241200) {
                                        reward = 20.76951;
                                      } else if (height < 3328800) {
                                        reward = 20.70965;
                                      } else if (height < 3416400) {
                                        reward = 20.64988;
                                      } else if (height < 3504000) {
                                        reward = 20.59037;
                                      } else if (height < 3591600) {
                                        reward = 20.53095;
                                      } else if (height < 3679200) {
                                        reward = 20.47178;
                                      } else if (height < 3766800) {
                                        reward = 20.4127;
                                      } else if (height < 3854400) {
                                        reward = 20.35387;
                                      } else if (height < 3942000) {
                                        reward = 20.29513;
                                      } else if (height < 4029600) {
                                        reward = 20.23664;
                                      } else if (height < 4117200) {
                                        reward = 20.17824;
                                      } else if (height < 4204800) {
                                        reward = 20.12008;
                                      } else if (height < 4292400) {
                                        reward = 20.06203;
                                      } else if (height < 4380000) {
                                        reward = 20.00419;
                                      } else {
                                        throw Error(`Out-of-date rewards for block ${ height }`);
                                      }

                                      return reward / exports.getChainCount();
                                    };
      exports.injectTime          = (time, header) => {
                                      const newHeader = header.substring(0, 16)
                                                      + time.toString(16)
                                                      + header.substring(29);

                                      logger.debug(
                                        'Converted header ' + header.substring(0, 30)
                                                            + '… to '
                                                            + newHeader.substring(0, 30)
                                                            + '…'
                                      );

                                      return newHeader;
                                    };
      exports.toSafeString        = (string) => {
                                      return string
                                           ? string.replace(/[^a-zA-Z0-9!@#$%&*()_=+./]/g, '')
                                           : null;
                                    };
      exports.toSafeWorkerName    = (name) => {
                                      let safeName = 'noname';

                                      if (name) {
                                        const components = exports.toSafeString(
                                                             name.replace(/^k:/, '')
                                                           ).split(
                                                             '.'
                                                           );

                                        if (!components[1]) components[1] = safeName;

                                        safeName = components.join('.');
                                      }

                                      return safeName;
                                    };
      exports.toDifficulty        = (target) => { return target ? maxU256 / target : maxU256; };
      exports.toTarget            = (difficulty) => {
                                      return difficulty ? maxU256 / difficulty : maxU256;
                                    };
      exports.toHumanReadable     = (hashCount) => {
                                      const units     = [ 'KH', 'MH', 'GH', 'TH', 'PH' ];
                                      var   index     = -1;
                                            hashCount = Number(hashCount);

                                      do {
                                        hashCount = hashCount / 1000;
                                                    index++;
                                      } while (hashCount > 1000);

                                      return hashCount.toFixed(3) + ' ' + (units[ index ] || '(?)');
                                    };
                                    // Legacy functions
      exports.toSha256            = (buffer) => {
                                      return crypto.createHash('sha256').update(buffer).digest();
                                    };
      exports.toSha256d           = (buffer) => {
                                      return exports.toSha256(exports.toSha256(buffer)).reverse();
                                    };
                                    // Formats PoW wallet address for use in generation
                                    // transaction’s output
      exports.addressToScript     = (address) => {
                                      const decodedAddress = base58.decode(address);
                                      let   message;

                                      if (!decodedAddress) {
                                        message = 'Base58-decoding failure for address ' + address;

                                        logger.error(message);

                                        throw Error(message);
                                      }

                                      if (decodedAddress.length != 25) {
                                        message = `Invalid length for address ${ address }`;

                                        logger.error(message);

                                        throw Error(message);
                                      }

                                      return Buffer.concat([
                                        Buffer.from([ 0x76, 0xa9, 0x14 ]),
                                        decodedAddress.slice(1, -4),
                                        Buffer.from([ 0x88, 0xac ])
                                      ]);
                                    };
      exports.keyToScript         = (key) => {
                                      return Buffer.concat([
                                        Buffer.from([ 0x76, 0xa9, 0x14 ]),
                                        Buffer.from(key, 'hex'),
                                        Buffer.from([ 0x88, 0xac ])
                                      ]);
                                    };
