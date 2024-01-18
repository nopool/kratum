const events        = require('events');
const crypto        = require('crypto');
const blake2        = require('blake2');
const blockTemplate = require('./blocktemplate');
const util          = require('./util');

// Unique job per block template
class JobCounter {
  count = 0;

  // Unused publicly
  getCurrent() { return this.count.toString(16); }

  getNext() {
    this.count++;
    if (this.count > 0xffffff) this.count = 0;

    return this.getCurrent();
  }
}

/*
 * TODO: Update to class syntax
 *
 * Emits:
 *
 *     new(blockTemplate) – when block that was previously unknown to job manager is surfaced; used
 *                          to broadcast new job
 * updated(blockTemplate) – when time of known block is reset; used to broadcast superseding job
 * share(data, blockData) – when worker submits share; block data will be populated if share
 *                          contains target hash
 */
const JobManager = () => {
  const _this                     = this;
  const chainCount                = util.getChainCount();
  const jobCounter                = new JobCounter();
  const validJobs                 = [];
  const latestJobs                = [];
  const updateIntervals           = [];
  const initiateUpdates           = (job) => {
                                      const chainId = job.chainId;

                                      // TODO: Move interval to config
                                      updateIntervals[ chainId ] = setInterval((job, chainId) => {
                                        logger.debug(
                                          'Expiring job ' + job.jobId
                                                          + ' for block '
                                                          + job.height
                                                          + ' of chain '
                                                          + chainId
                                        );
                                        _this.updateJob(job);
                                      }.bind(null, job, chainId), 500);
                                    };
  const cancelUpdates             = (job) => {
                                      const interval = updateIntervals[ chainId ];

                                      if (interval) {
                                        const chainId = job.chainId;

                                        delete updateIntervals[ chainId ];
                                        clearInterval(interval);
                                        logger.debug(
                                          'Canceled job updates for block ' + job.height
                                                                            + ' of chain '
                                                                            + chainId
                                        );
                                      };
                                    };
                                    // Private convenience methods
  const printValidJobs            = () => {
                                      let output = 'Valid jobs:';

                                      for (var i = 0; i < chainCount; i++) {
                                        const jobsForChain = validJobs[i];

                                        if (jobsForChain) {
                                          output += '\n';

                                          for (const height in jobsForChain) {
                                            const jobsForBlock = jobsForChain[ height ];

                                            for (const id in jobsForBlock) {
                                              const job = jobsForBlock[ id ];

                                              output += `\t${ i }. ${ job.height } (${ id })`;
                                            }
                                          }
                                        }
                                      }

                                      logger.debug(output);
                                    };
  const printLatestJobs           = () => {
                                      let output = 'Latest jobs:';

                                      for (var i = 0; i < chainCount; i++) {
                                        const job = latestJobs[i];

                                        if (job) {
                                          output += ` ${ i }. ${ job.height } (${ job.jobId })`;
                                        }
                                      }

                                      logger.debug(output);
                                    };
  let   nextChainId               = 0;
  let   heightIncreasedAt         = Date.now();
                                    /*
                                     * Ingests work from multiple nodes, so there will be races;
                                     * only after comparing to previous jobs should work be accepted
                                     * (and jobs accordingly updated)
                                     */
        this.processBlockTemplate = (rpcData, nodeId, onProcessed, isViaWork) => {
                                      const chainId = util.getChainId(rpcData);
                                      const height  = util.getHeight(rpcData);
                                      const job     = this.getJobByChainId(chainId);
                                      const now     = Date.now();

                                      if (!job || height > job.height) {
                                        heightIncreasedAt = now;

                                        this.addJob(
                                          new blockTemplate(
                                            rpcData, chainId, height, jobCounter.getNext(), nodeId
                                          ),
                                          onProcessed,
                                          isViaWork
                                        );
                                      } else { // Skipping duplicate work
                                        logger.debug(
                                          'Declining to add stale job for block ' + height
                                                                                  + ' of chain '
                                                                                  + chainId
                                        );

                                        // TODO: Move interval to config
                                        if (now - heightIncreasedAt > 60 * 1000) {
                                          logger.error(
                                            `Possible fork detected; stuck at block ${ job.height }`
                                          );
                                        }
                                      }
                                    };
                                    // Unused publicly
        this.addJob                 = (job, onAdded, isViaWork) => {
                                        const id      = job.jobId;
                                        const chainId = job.chainId;
                                        const height  = job.height;

                                        if (isViaWork) {
                                          logger.info(
                                            'Syncing chain ' + chainId
                                                             + ' to block '
                                                             + height
                                                             + ' with mining work'
                                          );
                                        }

                                        cancelUpdates(job);
                                        if (!validJobs[ chainId ]) validJobs[ chainId ] = {};

                                        const jobsForChain = validJobs[ chainId ];

                                        if (!jobsForChain[ height ]) jobsForChain[ height ] = {};

                                        jobsForChain[ height ][ id ] = job;
                                        latestJobs[ chainId ]        = job;

                                        initiateUpdates(job);
                                        if (onAdded) onAdded();
                                        if (isViaWork) this.emit('new', job);
                                        logger.debug(
                                          'Queued job ' + id
                                                        + ' for block '
                                                        + height
                                                        + ' of chain '
                                                        + chainId
                                        );
                                        printValidJobs();
                                        printLatestJobs();
                                      };
                                      // Unused publicly
        this.updateJob              = (job) => {
                                        const chainId   = job.chainId;
                                        const height    = job.height;
                                        const latestJob = this.getJobByChainId(chainId);

                                        if (!latestJob || height >= latestJob.height) {
                                          const jobsForBlock = (
                                                                 validJobs[ chainId ] || {}
                                                               )[ height ];

                                          if (jobsForBlock) {
                                            const id                    = jobCounter.getNext();
                                            const newJob                = job.deepCopy(id);
                                                  jobsForBlock[ id ]    = newJob;
                                                  latestJobs[ chainId ] = newJob;

                                            this.emit('updated', newJob);
                                            logger.debug(
                                              'Updated job to ' + id
                                                                + ' for block '
                                                                + height
                                                                + ' of chain '
                                                                + chainId
                                            );
                                            printValidJobs();
                                            printLatestJobs();
                                          } else {
                                            logger.warn(
                                              'Declining to update removed job' + ' for block '
                                                                                + height
                                                                                + ' of chain '
                                                                                + chainId
                                            );
                                            cancelUpdates(job);
                                          }
                                        } else { // Block height should at least match latest
                                          logger.warn(
                                            'Declining to update stale job' + ' for block '
                                                                            + height
                                                                            + ' of chain '
                                                                            + chainId
                                          );
                                          cancelUpdates(job);
                                        }
                                      };
                                      // TODO: Sort by difficulty to make sure assigned job is
                                      // mineable by worker
        this.getNextJob             = () => {
                                        let job = null;

                                        if (this.getJobCount()) {
                                          const modularChainCount = chainCount + nextChainId;

                                          for (var i = nextChainId; i < modularChainCount; i++) {
                                            const candidateJob = this.getJobByChainId(nextChainId);
                                                  nextChainId  = (nextChainId + 1) % chainCount;

                                            if (candidateJob) {
                                              job = candidateJob;

                                              break;
                                            }
                                          }

                                          if (!job) logger.warn('No jobs still available');
                                        } else {
                                          logger.warn('No jobs available');
                                        }

                                        return job;
                                      };
        this.invalidateJobs         = (chainId, height) => {
                                        const jobsForChain = validJobs[ chainId ];

                                        if (jobsForChain) {
                                          const latestHeight   = this.getJobByChainId(chainId)
                                                                     .height;
                                          const invalidHeights = [];
                                          const invalidJobs    = [];

                                          for (const height in jobsForChain) {
                                            if (height < latestHeight) {
                                              for (const id in jobsForChain[ height ]) {
                                                invalidJobs.push(id);
                                              }

                                              delete jobsForChain[ height ];
                                              invalidHeights.push(height);
                                            }
                                          }

                                          if (invalidHeights.length && invalidJobs.length) {
                                            logger.info(
                                              'Invalidated job(s) ' + invalidJobs.join(', ')
                                                                    + ' for block(s) '
                                                                    + invalidHeights.join(', ')
                                                                    + ' of chain '
                                                                    + chainId
                                            );
                                          }
                                        } else {
                                          logger.warn(
                                            `No jobs to invalidate for chain ${ chainId }`
                                          );
                                        }
                                      };
        this.processShare           = (
                                        jobId,
                                        nonce1,
                                        nonce2,
                                        difficulty,
                                        previousDifficulty,
                                        client,
                                        workerName,
                                        port,
                                        ipAddress
                                      ) => {
                                        const job   = this.getJobById(jobId);
                                        const error = (details) => {
                                                        client.metricsBuffer.populate(
                                                          difficulty, 0n, 0n, 0, false, details
                                                        );
                                                        _this.emit('share', {
                                                             job: jobId,
                                                          worker: workerName,
                                                              ip: ipAddress,
                                                           error: details[1]
                                                        });
                                                        logger.error(
                                                          'Share error: ' + JSON.stringify(details)
                                                        );

                                                        return { result: false, error: details };
                                                      };
                                        let   share = { result: true, error: null };

                                        if (job) {
                                          if (job.registerSubmission(nonce2)) {
                                            const chainId = job.chainId;
                                            const height  = job.height;
                                                  nonce2  = util.padHexString(nonce2, 12);

                                            if (client.isF1) {
                                              nonce1 = util.reverseHexString(nonce1);
                                              nonce2 = util.reverseHexString(nonce2);
                                            }

                                            const nonce           = util.reverseHexString(
                                                                      nonce2 + nonce1
                                                                    );
                                            const header          = job.header.substring(0, 556)
                                                                  + nonce;
                                            const hash            = util.padHexString(
                                                                      util.reverseHexString(
                                                                        blake2.createHash(
                                                                          'blake2s'
                                                                        ).update(
                                                                          Buffer.from(header, 'hex')
                                                                        ).digest(
                                                                          'hex'
                                                                        )
                                                                      ), 64
                                                                    );
                                            const target          = BigInt(`0x${ hash }`);
                                            const shareDifficulty = util.toDifficulty(target);
                                            const blockDifficulty = job.difficulty;
                                            const blockReward     = util.getBlockReward(height);
                                            const clientLabel     = client.getLabel();
                                            let   blockData;

                                            logger.debug(
                                              'Received job ' + jobId
                                                              + ' with difficulty '
                                                              + difficulty
                                                              + ' / '
                                                              + shareDifficulty
                                                              + ' / '
                                                              + blockDifficulty
                                                              + ' for block '
                                                              + height
                                                              + ' of chain '
                                                              + chainId
                                                              + ' from worker '
                                                              + clientLabel
                                            );

                                            // Checking previous difficulty for subsequent Vardiff
                                            // adjustment
                                            if (
                                              shareDifficulty >= difficulty
                                                              || previousDifficulty
                                                              && shareDifficulty
                                                              >= previousDifficulty
                                            ) {
                                              job.shareCount += BigInt(difficulty);

                                              // Also checking whether share matches network
                                              // difficulty so is block candidate
                                              if (shareDifficulty >= blockDifficulty) {
                                                blockData = {
                                                   chain: chainId,
                                                  height,
                                                  header,
                                                  reward: blockReward,
                                                    node: job.nodeId
                                                };

                                                logger.info(
                                                  'Submitting block ' + height
                                                                      + ' for chain '
                                                                      + chainId
                                                                      + ' from worker '
                                                                      + clientLabel
                                                );
                                              }

                                              client.metricsBuffer.populate(
                                                difficulty,
                                                shareDifficulty,
                                                blockDifficulty,
                                                blockReward,
                                                true,
                                                null
                                              );
                                              this.emit('share', {
                                                          chain: chainId,
                                                         height,
                                                     difficulty: parseInt(difficulty),
                                                shareDifficulty: parseInt(shareDifficulty),
                                                blockDifficulty: blockDifficulty.toString(),
                                                           hash,
                                                    blockReward,
                                                       duration: Date.now() - job.time,
                                                         shares: job.shareCount,
                                                         worker: workerName,
                                                             ip: ipAddress,
                                                           node: job.nodeId
                                              }, blockData);
                                            } else {
                                              share = error([
                                                        23,
                                                        'Low-difficulty share of ' + shareDifficulty
                                                                                   + ' / '
                                                                                   + difficulty,
                                                        null
                                                      ]);
                                            }
                                          } else {
                                            share = error([
                                                      22,
                                                      'Duplicate share for block ' + height
                                                                                   + ' of chain '
                                                                                   + chainId,
                                                      null
                                                    ]);
                                          }
                                        } else {
                                          share = error([ 21, `Job ${ jobId } not found`, null ]);
                                        }

                                        return share;
                                      };
                                      // Public convenience methods
        this.getJobCount            = () => {
                                        let count = 0;

                                        for (var i = 0; i < chainCount; i++) {
                                          const job = latestJobs[i];

                                          if (job) count++;
                                        }

                                        return count;
                                      };
                                      // Unused publicly
        this.getJobById             = (id) => {
                                        let job = null;

                                        for (var i = 0; i < chainCount; i++) {
                                          const jobsForChain = validJobs[i];

                                          if (jobsForChain) {
                                            for (const height in jobsForChain) {
                                              const candidateJob = jobsForChain[ height ][ id ];

                                              if (candidateJob) {
                                                job = candidateJob;

                                                break;
                                              }
                                            }
                                          }
                                        }

                                        if (!job) logger.warn(`No job ${ id }`);

                                        return job;
                                      };
        this.getJobByChainId        = (chainId) => {
                                        const candidateJob = latestJobs[ chainId ];
                                        let   job          = null;

                                        if (candidateJob) {
                                          job = candidateJob;
                                        } else {
                                          logger.debug(`No job for chain ${ chainId }`);
                                        }

                                        return job;
                                      };
};

JobManager.prototype.__proto__ = events.EventEmitter.prototype;
module.exports                 = JobManager;
