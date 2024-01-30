const multihashing   = require('multi-hashing');
const util           = require('./util');
const algoProperties = {
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
                                                hash: (options) => {
                                                        let params = options.params;

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
                                                hash: (options) => {
                                                        if (options.shouldUseNormalHashing) {
                                                          return (data, nTime) => {
                                                            return multihashing.keccak(
                                                              multihashing.keccak(
                                                                Buffer.concat([
                                                                  data,
                                                                  Buffer.from(
                                                                    nTime.toString(16), 'hex'
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
                                                hash: (options) => {
                                                        return (data) => {
                                                          return multihashing.scrypt(
                                                            data, options.n || 1024, options.r || 1
                                                          );
                                                        };
                                                      }
                                        },
                         'scrypt-jane': {
                                          multiplier: Math.pow(2, 16),
                                                hash: (options) => {
                                                        return (data, nTime) => {
                                                          return multihashing.scryptjane(
                                                            data,
                                                            nTime,
                                                            options.chainStartTime || 1367991200,
                                                            options.nMin || 4,
                                                            options.nMax || 30
                                                          );
                                                        };
                                                      }
                                        },
                            'scrypt-n': {
                                          multiplier: Math.pow(2, 16),
                                                hash: (options) => {
                                                        const timetable  = options.timetable
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
                                                            const n = parseInt(
                                                                        Object.keys(timeTable)
                                                                              .sort()
                                                                              .reverse()
                                                                              .filter((nKey) => {
                                                                          return Date.now() / 1000
                                                                               > timeTable[ nKey ];
                                                                        })[0]
                                                                      );

                                                            return Math.log(n) / Math.log(2);
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
                                                hash: (options) => {
                                                        return (data) => {
                                                          return multihashing.scrypt(
                                                            data, options.n || 64, options.r || 1
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

for (var property in algoProperties) {
  if (!algoProperties[ property ].multiplier) algoProperties[ property ].multiplier = 1;
}

module.exports = algoProperties;
