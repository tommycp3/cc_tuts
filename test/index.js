/// NB: The try-o-rama config patterns are still not quite stabilized.
/// See the try-o-rama README [https://github.com/holochain/try-o-rama]
/// for a potentially more accurate example

const path = require('path')
const tape = require('tape')

const { Orchestrator, Config, tapeExecutor, singleConductor, combine  } = require('@holochain/try-o-rama')

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.error('got unhandledRejection:', error);
});

const dnaPath = path.join(__dirname, "../dist/cc_tuts.dna.json")

const orchestrator = new Orchestrator({
  middleware: combine(
    // squash all instances from all conductors down into a single conductor,
    // for in-memory testing purposes.
    // Remove this middleware for other "real" network types which can actually
    // send messages across conductors
    singleConductor,

    // use the tape harness to run the tests, injects the tape API into each scenario
    // as the second argument
    tapeExecutor(tape)
  ),

  globalConfig: {
    logger: false,
    network: {
      type: 'sim2h',
      sim2h_url: 'wss://sim2h.holochain.org:9000',
    },
  },
})

const config = {
  instances: {
    
    cc_tuts: Config.dna(dnaPath, 'cc_tuts'),
  }
};

// orchestrator.registerScenario("description of example test", async (s, t) => {

//   const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig})

//   // Make a call to a Zome function
//   // indicating the function, and passing it an input
//   const addr = await alice.call("myInstanceName", "my_zome", "create_my_entry", {"entry" : {"content":"sample content"}})

//   // Wait for all network activity to
//   await s.consistency()

//   const result = await alice.call("myInstanceName", "my_zome", "get_my_entry", {"address": addr.Ok})

//   // check for equality of the actual and expected results
//   t.deepEqual(result, { Ok: { App: [ 'my_entry', '{"content":"sample content"}' ] } })
// })


orchestrator.registerScenario('Test hello holo', async (s, t) => {
  const {alice, bob} = await s.players({alice: config, bob: config}, true);

  const result = await alice.call('cc_tuts', 'hello', 'hello_holo', {});
  


t.ok(result.Ok);
t.deepEqual(result, { Ok: 'Hello Holo' })
})
  

orchestrator.run()
