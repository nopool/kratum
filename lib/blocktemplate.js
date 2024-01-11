const util = require('./util');

// Maintains single mining job
class BlockTemplate {
  chainId;
  rawChainId;
  height;
  target;
  difficulty;
  time;
  header;
  jobId;
  nodeId;
  submissions;
  shareCount;

  constructor(rpcData, chainId, height, jobId, nodeId) {
    this.chainId     = chainId;
    this.rawChainId  = util.getRawChainId(rpcData); // For BlackMiner F1
    this.height      = height;
    this.target      = util.getTarget(rpcData);
    this.difficulty  = util.toDifficulty(this.target);
    this.time        = util.getTime(rpcData) / 1000;
    this.header      = util.getHeader(rpcData);
    this.jobId       = jobId;
    this.nodeId      = nodeId;
    this.submissions = {};
    this.shareCount  = 0n;
  }

  getJobParams() { return [ this.jobId, this.header, true ]; }

  registerSubmission(nonce) {
    if (!this.submissions[ nonce ]) {
      this.submissions[ nonce ] = true;

      logger.debug(`Registered share for block ${ this.height } of chain ${ this.chainId }`);

      return true;
    } else {
      logger.debug(
        `Received duplicate share for block ${ this.height } of chain ${ this.chainId }`
      );

      return false;
    }
  }

  deepCopy(jobId) {
    const copy             = { ...this };
          copy.time        = Date.now();
          copy.header      = util.injectTime(copy.time * 1000, copy.header);
          copy.jobId       = jobId;
          copy.submissions = {};
          copy.shareCount  = 0n;

    return copy;
  }
}

module.exports = BlockTemplate;
