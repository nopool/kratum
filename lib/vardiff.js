const events = require('events');

/*
 * Ported from
 * https://github.com/ahmedbodi/stratum-mining/blob/master/mining/basic_share_limiter.py; described
 * at https://help.braiins.com/en/support/solutions/articles/77000433929
 */
class RingBuffer {
  #maxSize;
  #data;
  #cursor;
  #isFull;

  constructor(maxSize) {
    this.#maxSize = maxSize;

    this.clear();
  }

  clear() {
    this.#data   = [];
    this.#cursor = 0;
    this.#isFull = false;
  }

  append(element) {
    if (this.#isFull) {
      this.#data[ this.#cursor ] = element;
      this.#cursor               = (this.#cursor + 1) % this.#maxSize;
    } else {
      this.#data.push(element);
      this.#cursor++;

      if (this.#data.length == this.#maxSize) {
        this.#cursor = 0;
        this.#isFull = true;
      }
    }
  }

  calculateMean() {
    const sum = data.reduce((accumulator, element) => { return accumulator + element; });

    return sum / (this.#isFull ? this.#maxSize : this.#cursor);
  }
}

// TODO: Update to class syntax
function Vardiff(port, options) {
  const _this         = this;
  const minDifficulty = options.minDifficulty;
  const maxDifficulty = options.maxDifficulty;
  const targetTime    = options.targetTime * 1000;
  const retargetTime  = options.retargetTime * 1000;
  const timeVariance  = targetTime * options.variancePercentage / 100;
  const minTime       = targetTime - timeVariance;
  const maxTime       = targetTime + timeVariance;
  const bufferSize    = retargetTime / targetTime * 4;
        this.manage   = (client) => {
                          const timeBuffer   = new RingBuffer(bufferSize);
                          let   retargetedAt = Date.now();
                          let   submittedAt;

                          client.on('submission', () => {
                            const now = Date.now();

                            if (submittedAt) {
                              timeBuffer.append(now - submittedAt);

                              submittedAt = now;

                              if (now - retargetedAt >= retargetTime) {
                                const meanTime      = timeBuffer.calculateMean();
                                const difficulty    = client.difficulty;
                                let   newDifficulty = Math.round(difficulty * targetTime / meanTime);
                                      retargetedAt  = now;

                                if (newDifficulty < minDifficulty) {
                                  newDifficulty = minDifficulty;
                                } else if (newDifficulty > maxDifficulty) {
                                  newDifficulty = maxDifficulty;
                                }

                                timeBuffer.clear();

                                if (newDifficulty != difficulty) {
                                  _this.emit('difficultyRetarget', client, newDifficulty);
                                }
                              }
                            } else {
                              submittedAt = now;
                            }
                          }).on('submissionTimeout', () => {
                            const difficulty    = client.difficulty;
                            let   newDifficulty = Math.round(difficulty / 10);
                                  retargetedAt  = Date.now();
                                  submittedAt   = null;

                            if (newDifficulty < minDifficulty) newDifficulty = minDifficulty;
                            timeBuffer.clear();

                            if (newDifficulty != difficulty) {
                              _this.emit('difficultyRetarget', client, newDifficulty);
                            }
                          });

                          if (client.socket.localPort != port) {
                            logger.warn(
                              `Managing client on non-Vardiff port, ${ client.socket.localPort }`
                            );
                          }
                        };
}

Vardiff.prototype.__proto__ = events.EventEmitter.prototype;
module.exports              = Vardiff;
