const Promize = require('./src/promize')

const a = new Promize((resolve) => {
  resolve({
    then(resolve) {
      resolve({
        then(resolve) {
          resolve({
            then(r) {
              setTimeout(() => {
                r(1)
              })
            }
          })
          throw 2
        }
      })
    }
  })
})

a.then(console.log).catch(console.log)
