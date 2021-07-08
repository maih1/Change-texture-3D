const express = require('express')
const app = express()
const path = require("path");
const pwd = process.cwd()

const port = 3000

const id = ["chair", "shoes"]

app.use('/data', express.static(pwd + '/data'));
app.use(express.static(path.join(__dirname, 'src')));

// app.use(express.static(path.join(__dirname, 'style')));
app.use('/style', express.static(pwd + '/style'));


for (let i of id) {
  // app.use('/' , express.static(pwd + '/data'))
  app.get(['/' + ':id'], (req, res) => {

    res.sendFile(pwd + "/src/js/templates/index.html")
  })
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/main.html");
})

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + "/src/home/index.html");
// })

app.listen(port, () => {
  console.log(__dirname)
  console.log(pwd)
  console.log(`Example app listening at http://localhost:${port}`)
})