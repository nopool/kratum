const os               = require('os');
const cluster          = require('cluster');
const posix            = require('posix');
const config           = require('config');
const pino             = require('pino');
const prettifier       = require('pino-pretty');
const chalk            = require('chalk');
const createClient     = require('@supabase/supabase-js');
const algoProperties   = require('./lib/algoproperties');
const poolWorker       = require('./lib/poolworker');
const cliListener      = require('./lib/clilistener');
const supabase         = config.get('supabase');
const logging          = config.get('logging');
const coinConfigs      = parseCoinConfigs();
const poolWorkers      = {};
const parseCoinConfigs = () => {
                           const coins     = config.get('coins');
                           const coinArray = Array.from(Object.keys(coins));
                           const count     = coins.length;

                           for (var leftIndex = 0; leftIndex < count; leftIndex++) {
                             const name      = coinArray[ leftIndex ];
                             const leftCoin  = coins[ name ];
                             const algo      = leftCoin.algo;
                             const leftPorts = Object.keys(leftCoin.ports);

                             // Making sure no coin uses any of same ports as another
                             for (
                               var rightIndex = leftIndex + 1; rightIndex < count; rightIndex++
                             ) {
                               const rightCoin     = coins[
                                                       coinArray[ rightIndex ]
                                                     ];
                               const rightPorts    = Object.keys(rightConfig.ports);
                               const duplicatePort = leftPorts.find((port) => {
                                                       rightPorts.hasOwnProperty(port);
                                                     });

                               if (duplicatePort) {
                                 logger.error(
                                   'Coin ' + leftCoin.name
                                           + ' has same configured port, '
                                           + duplicatePort
                                           + ', as '
                                           + rightCoin.name
                                 );

                                 process.exit(1);
                               }
                             }

                             if (!(algo in algoProperties)) {
                               delete coins[ name ];
                               logger.error(`Algorithm ${ algo } isn’t supported`);
                             }
                           }

                           return coins;
                         };
const spawnPoolWorkers = () => {
                           const coins = Object.keys(coinConfigs);

                           if (coins.length) {
                             const forkCount = (() => {
                                                 const clustering = config.get('clustering');
                                                 let   count      = 1;

                                                 if (clustering && clustering.isEnabled) {
                                                   const forkCount = clustering.forkCount;

                                                   if (forkCount) {
                                                     if (!isNaN(forkCount)) {
                                                       count = forkCount;
                                                     } else if (forkCount == 'auto') {
                                                       count = os.cpus().length;
                                                     }
                                                   }
                                                 }

                                                 return count;
                                               })();
                             var   index     = 0;

                             coins.forEach((coin) => {
                               const daemons = coinConfigs[ coin ].daemons;

                               if (!Array.isArray(daemons) || !daemons.length) {
                                 delete coinConfigs[ coin ];
                                 logger.error(
                                   'Coin ' + coin
                                           + ' has no daemons configured,'
                                           + ' so corresponding pool worker can’t be started'
                                 );
                               }
                             });

                             // TODO: Move interval to config
                             const spawnInterval = setInterval(() => {
                               spawnPoolWorker(index);
                               index++;

                               if (index == forkCount) {
                                 clearInterval(spawnInterval);
                                 logger.info(
                                   'Started ' + coins.length
                                              + ' pool worker(s) in '
                                              + forkCount
                                              + ' thread(s)'
                                 );
                               }
                             }, 250);
                           } else {
                             logger.error(
                               'No pool workers started' + ' because no coin configs exist'
                                                         + ' or are enabled'
                             );
                           }
                         };
const spawnPoolWorker  = (forkId) => {
                           const pid                  = process.pid;
                           const worker               = cluster.fork({
                                                          workerType: 'pool',
                                                              forkId: forkId,
                                                                 pid: pid,
                                                               coins: JSON.stringify(coinConfigs)
                                                        });
                                worker.type           = 'pool';
                                worker.forkId         = forkId;
                                poolWorkers[ forkId ] = worker;

                           worker.on('message', (message) => {
                             switch (message.type) {
                               case 'ipBan':
                                 const clusterWorkers = cluster.workers;

                                 Object.keys(clusterWorkers).forEach((id) => {
                                   const clusterWorker = clusterWorkers[ id ];

                                   if (clusterWorker.type == 'pool') {
                                     clusterWorker.send({ type: 'ipBan', ip: message.ip });
                                   }
                                 });

                                 break;

                               case 'minerCount':
                                 minerCount += message.count;
                                               workerCount++;

                                 break;

                               case 'axm:transport:ipc':
                               case 'axm:option:configuration':
                               case 'axm:option:setPID':
                               case 'axm:monitor':
                               case 'axm:action':
                               case 'axm:reply':
                               case 'application:dependencies':
                                 // Ignoring PM2 probes
                                 break;

                               default:
                                 if (
                                   Object.keys(message).length == 1 && !('node_version' in message)
                                 ) {
                                   logger.warn(
                                     `Unrecognized message: ${ JSON.stringify(message) }`
                                   );
                                 }

                                 break;
                             }
                           }).on('exit', () => {
                             logger.error(
                               `Pool worker in thread ${ forkId } died; starting replacement`
                             );
                             // TODO: Move interval to config
                             setTimeout(() => { spawnPoolWorker(forkId); }, 2000);
                           });
                           logger.info(
                             `Started pool worker from thread ${ forkId } and process ${ pid }`
                           );
                         };
const startCliListener = () => {
                           new cliListener(config.get('cli').port).on(
                             'command', (command, params, options, reply) => {
                               const coin    = params[0];
                               const workers = cluster.workers;

                               switch (command) {
                                 case 'blocknotify':
                                   Object.keys(workers).forEach((id) => {
                                     workers[ id ].send({
                                       type: 'blocknotify', coin, hash: params[1]
                                     });
                                   });
                                   reply(`Notified pool workers for coin ${ coin }`);

                                   break;

                                 case 'reloadpool':
                                   Object.keys(workers).forEach((id) => {
                                     workers[ id ].send({ type: 'reloadpool', coin });
                                   });
                                   reply(`Reloaded pool worker for coin ${ coin }`);

                                   break;

                                 default:
                                   reply(`Unrecognized command, ${ command }`);

                                   break;
                               }
                             }
                           ).on(
                             'log', (message) => {
                               logger.info(message);
                             }
                           ).start();
                         };
let   minerCount       = 0;
let   workerCount      = 0;
      JSON.minify      = JSON.minify || require('node-json-minify');
      global.logger    = pino({
                                 level: logging.level,
                                redact: {
                                           paths: [ 'pid', 'hostname' ],
                                          remove: true
                                        },
                             timestamp: pino.stdTimeFunctions.isoTime,
                           prettyPrint: {
                                          levelFirst: true
                                        },
                            prettifier: prettifier,
                              colorize: logging.shouldColorize && chalk.supportsColor
                         });

if (process.argv.length != 2) {
  console.error('Usage: node init.js');

  process.exit(1);
}

try {
  global.supabase = createClient(supabase.url, supabase.key);
} catch (error) {
  logger.error(`Error connecting to Supabase: ${ JSON.stringify(error) }`);

  process.exit(1);
}

// Trying to give process ability to handle 100K concurrent connections
try {
  posix.setrlimit('nofile', { soft: 100000, hard: 100000 });
} catch (error) {
  if (cluster.isPrimary) logger.warn('Pool must be run as root to increase resource limits');
} finally {
  // Finding which user sudoed through environment variable
  const uid = parseInt(process.env.SUDO_UID);

  // Setting process’s UID to that user’s
  if (uid) {
    process.setuid(uid);
    logger.info(
      'Process limit raised to 100K concurrent connections;' + ' now running as non-root user '
                                                             + process.getuid()
    );
  }
}

// Broadcasting from primary process to pool workers
if (cluster.isPrimary) {
  spawnPoolWorkers();
  startCliListener();
  // TODO: Move interval to config
  setInterval(() => {
    if (poolWorkers) {
      minerCount  = 0;
      workerCount = 0;

      for (var forkId in poolWorkers) poolWorkers[ forkId ].send({ type: 'minerCount' });
      logger.info(`Running ${ Object.keys(poolWorkers).length } pool workers(s)`);
    }
  }, 15000);
  setInterval(() => {
    if (poolWorkers) {
      for (var forkId in poolWorkers) poolWorkers[ forkId ].send({ type: 'metricsSample' });
    }
  }, config.get('pool').metricsSampleInterval * 1000);
} else { // Listening for primary from worker
  if (process.env.workerType == 'pool') { // In forked worker
    new poolWorker(logger);
  }
}
