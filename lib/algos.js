const multihashing = require('multi-hashing');
const util         = require('./util');
const algos        = {
                               blake: {
                                        multiplier: Math.pow(2, 8),
                                              hash: () => {
                                                      return () => {
                                                        return multihashing.blake.apply(
                                                          this, arguments
                                                        );
                                                      };
                                                    }
                                      },
                             blake2s: {
                                        multiplier: Math.pow(2, 8),
                                              hash: () => {
                                                return () => {
                                                  return multihashing.blake2s.apply(
                                                    this, arguments
                                                  );
                                                };
                                              }
                                      },
                                 c11: {
                                        hash: () => {
                                                return () => {
                                                  return multihashing.c11.apply(this, arguments);
                                                };
                                              }
                                      },
                           eaglesong: {
                                        hash: () => {
                                                return () => {
                                                  return multihashing.eaglesong.apply(
                                                    this, arguments
                                                  );
                                                };
                                              }
                                      },
                            equihash: {
                                              diff: parseInt(
                                                      '0x' + '0007ffffffffffffffffffffffffffff'
                                                           + 'ffffffffffffffffffffffffffffffff'
                                                    ),
                                        multiplier: 1,
                                              hash: (coinOptions) => {
                                                      let params = coinOptions.params;

                                                      if (!params) {
                                                        params = {
                                                                                 n: 150,
                                                                                 k: 5,
                                                                   personalization: 'ZcashPoW'
                                                                 };
                                                      }

                                                      return () => {
                                                        return ev.verify.apply(this, [
                                                          arguments[0],
                                                          arguments[1],
                                                          params.personalization || 'ZcashPoW',
                                                          params.n || 200,
                                                          params.k || 9
                                                        ]);
                                                      };
                                                    }
                                      },
                               fugue: {
                                        multiplier: Math.pow(2, 8),
                                              hash: () => {
                                                      return () => {
                                                        return multihashing.fugue.apply(
                                                          this, arguments
                                                        );
                                                      };
                                                    }
                                      },
                             groestl: {
                                        multiplier: Math.pow(2, 8),
                                              hash: () => {
                                                return () => {
                                                  return multihashing.groestl.apply(
                                                    this, arguments
                                                  );
                                                };
                                              }
                                      },
                              hefty1: {
                                        hash: () => {
                                          return () => {
                                            return multihashing.hefty1.apply(this, arguments);
                                          };
                                        }
                                      },
                              keccak: {
                                        multiplier: Math.pow(2, 8),
                                              hash: (coinConfig) => {
                                                      if (coinConfig.normalHashing) {
                                                        return (data, nTimeInt) => {
                                                          return multihashing.keccak(
                                                            multihashing.keccak(
                                                              Buffer.concat([
                                                                data,
                                                                Buffer.from(
                                                                  nTimeInt.toString(16), 'hex'
                                                                )
                                                              ])
                                                            )
                                                          );
                                                        };
                                                      } else {
                                                        return () => {
                                                          return multihashing.keccak.apply(
                                                            this, arguments
                                                          );
                                                        };
                                                      }
                                                    }
                                      },
                           neoscrypt: {
                                        multiplier: Math.pow(2, 5),
                                              hash: () => {
                                                return () => {
                                                  return multihashing.neoscrypt.apply(
                                                    this, arguments
                                                  );
                                                };
                                              }
                                      },
                               nist5: {
                                        hash: () => {
                                          return () => {
                                            return multihashing.nist5.apply(this, arguments);
                                          };
                                        }
                                      },
                               quark: {
                                        hash: () => {
                                          return () => {
                                            return multihashing.quark.apply(this, arguments);
                                          };
                                        }
                                      },
                               qubit: {
                                        hash: () => {
                                          return () => {
                                            return multihashing.qubit.apply(this, arguments);
                                          };
                                        }
                                      },
                              scrypt: {
                                        /*
                                         * Uncomment to use truncated “diff”:
                                         *
                                         * diff: '0000ffff000000000000000000000000'
                                         *     + '00000000000000000000000000000000',
                                         */
                                        multiplier: Math.pow(2, 16),
                                              hash: (coinConfig) => {
                                                      const nValue = coinConfig.nValue || 1024;
                                                      const rValue = coinConfig.rValue || 1;

                                                      return (data) => {
                                                        return multihashing.scrypt(
                                                          data, nValue, rValue
                                                        );
                                                      };
                                                    }
                                      },
                       'scrypt-jane': {
                                        multiplier: Math.pow(2, 16),
                                              hash: (coinConfig) => {
                                                      const nTimestamp  = coinConfig.chainStartTime
                                                                       || 1367991200;
                                                      const nMin        = coinConfig.nMin || 4;
                                                      const nMax        = coinConfig.nMax || 30;

                                                      return (data, nTime) => {
                                                        return multihashing.scryptjane(
                                                          data, nTime, nTimestamp, nMin, nMax
                                                        );
                                                      };
                                                    }
                                      },
                          'scrypt-n': {
                                        multiplier: Math.pow(2, 16),
                                              hash: (coinConfig) => {
                                                      const timetable  = coinConfig.timetable
                                                                      || {
                                                                             2048: 1389306217,
                                                                             4096: 1456415081,
                                                                             8192: 1506746729,
                                                                            16384: 1557078377,
                                                                            32768: 1657741673,
                                                                            65536: 1859068265,
                                                                           131072: 2060394857,
                                                                           262144: 1722307603,
                                                                           524288: 1769642992
                                                                         };

                                                      return (data) => {
                                                        return multihashing.scryptn(data, (() => {
                                                          const n    = Object.keys(timeTable)
                                                                             .sort()
                                                                             .reverse()
                                                                             .filter((nKey) => {
                                                                         return Date.now() / 1000
                                                                              > timeTable[ nKey ];
                                                                       })[0];
                                                          const nInt = parseInt(n);

                                                          return Math.log(nInt) / Math.log(2);
                                                        })());
                                                      };
                                                    }
                                      },
                         'scrypt-og': {
                                        /*
                                         * Aiden settings; uncomment to use truncated “diff”:
                                         *
                                         * diff: '0000ffff000000000000000000000000'
                                         *     + '00000000000000000000000000000000',
                                         */
                                        multiplier: Math.pow(2, 16),
                                              hash: (coinConfig) => {
                                                      const nValue = coinConfig.nValue || 64;
                                                      const rValue = coinConfig.rValue || 1;

                                                      return (data) => {
                                                        return multihashing.scrypt(
                                                          data, nValue, rValue
                                                        );
                                                      };
                                                    }
                                      },
                                sha1: {
                                        hash: () => {
                                                return () => {
                                                  return multihashing.sha1.apply(this, arguments);
                                                };
                                              }
                                      },
                              sha256: {
                                        /*
                                         * Uncomment to use truncated “diff”:
                                         *
                                         * diff: '00000000ffff00000000000000000000'
                                         *     + '00000000000000000000000000000000',
                                         */
                                        hash: () => {
                                                return () => {
                                                  return util.toSha256d.apply(this, arguments);
                                                };
                                              }
                                      },
                            shavite3: {
                                        hash: () => {
                                          return () => {
                                            return multihashing.shavite3.apply(this, arguments);
                                          };
                                        }
                                      },
                               skein: {
                                        hash: () => {
                                          return () => {
                                            return multihashing.skein.apply(this, arguments);
                                          };
                                        }
                                      },
                                 x11: {
                                        hash: () => {
                                          return () => {
                                            return multihashing.x11.apply(this, arguments);
                                          };
                                        }
                                      },
                                 x13: {
                                        hash: () => {
                                          return () => {
                                            return multihashing.x13.apply(this, arguments);
                                          };
                                        }
                                      },
                                 x15: {
                                        hash: () => {
                                          return () => {
                                            return multihashing.x15.apply(this, arguments);
                                          };
                                        }
                                      },
                                x16r: {
                                        multiplier: 256,
                                              hash: () => {
                                                      return () => {
                                                        return multihashing.x16r.apply(
                                                          this, arguments
                                                        );
                                                      };
                                                    }
                                      },
                                x22i: {
                                        hash: () => {
                                          return () => {
                                            return multihashing.x22i.apply(this, arguments);
                                          };
                                        }
                                      }
};

for (const algo in algos) {
  if (!algos[ algo ].multiplier) algos[ algo ].multiplier = 1;
}

module.exports = algos;
