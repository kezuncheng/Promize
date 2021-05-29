const promisesAplusTests = require("promises-aplus-tests");
const adapter = require('./src/entry')
const fs = require('fs')

promisesAplusTests(adapter,{ reporter: "spec" } , function (err) {
    if (err) {
      fs.writeFile('./result.txt', JSON.stringify(err.failures), function(e) {
        if (e) {
          console.log(e)
        }
      })
      return
    }
});