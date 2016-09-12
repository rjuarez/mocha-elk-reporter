var Base = require("mocha").reporters.Base;
var postTestData = require('./src/elastic-search');

exports = module.exports = ELKReporter;

/**
 * Initialize a new `ELK` reporter.
 *
 * @api public
 * @param {Runner} runner
 */
function ELKReporter(runner) {
  Base.call(this, runner);

  var self = this;
  var tests = [];
  var pending = [];
  var failures = [];
  var passes = [];
  var passesCount = 0;
  var failuresCount = 0;
  var pendingCount = 0;

  runner.on('test end', function(test) {
    tests.push(test);
  });

  runner.on('pass', function(test) {
    passesCount++;
    passes.push(test);
  });

  runner.on('fail', function(test) {
    failuresCount++;
    failures.push(test);
  });

  runner.on('pending', function(test) {
    pendingCount++;
    pending.push(test);
  });

  runner.on('end', function() {
    var obj = {
      stats: self.stats,
      tests: tests.map(clean),
      pending: pending.map(clean),
      failures: failures.map(clean),
      passes: passes.map(clean)
    };
    var exit = process.exit;
    process.exit = function () { };
    console.log('\n' + passesCount + ' passed','\n' + failuresCount + ' failed','\n' + pendingCount + ' pending','\n');
    runner.testResults = obj;
    postTestData(obj,function(){
      exit.call(process, failuresCount);
    });
  });
}

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @api private
 * @param {Object} test
 * @return {Object}
 */
function clean(test) {
  return {
    title: test.title,
    fullTitle: test.fullTitle(),
    duration: test.duration,
    err: errorJSON(test.err || {})
  };
}

/**
 * Transform `error` into a JSON object.
 *
 * @api private
 * @param {Error} err
 * @return {Object}
 */
function errorJSON(err) {
  var res = {};
  Object.getOwnPropertyNames(err).forEach(function(key) {
    res[key] = err[key];
  }, err);
  return res;
}