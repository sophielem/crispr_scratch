var http = require('http')
var fs = require('fs')
const logger = require('./logger').logger
const setLogLevel = require('./logger').setLogLevel
const setLogFile = require('./logger').setLogFile

// Chargement du fichier index.html affiché au client
var server = http.createServer(function (req, res) {
  fs.readFile('./index.html', 'utf-8', function (error, content) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(content)
  })
})

server.listen(8080)

// Chargement de socket.io
var io = require('socket.io').listen(server)

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
  console.log('Un client est connecté !')
})

io.sockets.on('connection', function (socket) {
  socket.on('taxid', function (data) {
    logger.info(`socket: taxid\n`)
    logger.info(`Taxon: ` + data.taxid)
    logger.info(`GCF: ` + data.gcf)
    socket.emit('resultsTaxid', { 'data': ['Yes', '{"new" : " Check done : New taxon "}'] })
  })
})

// io.sockets.on('connection', function (socket) {
//   socket.on('taxid', function (data) {
//     logger.info(`socket: taxid\n`)
//     logger.info(`Taxon: ` + data.taxid)
//     logger.info(`GCF: ` + data.gcf)
//     let jobOpt = {
//       'exportVar': {
//         'TAXID': data.taxid,
//         'GCF': data.gcf
//       },
//       'modules': ['crispr-tools'],
//       'jobProfile': 'crispr-dev',
//       'script': `${param.coreScriptsFolder}/crispr_check_taxid.sh`
//     }
//     logger.info(`Trying to push ${utils.format(jobOpt)}`)
//     let job = jobManager.push(jobOpt)
//     job.on('completed', (stdout, stderr) => {
//       let _buffer = ''
//       stdout.on('data', (d) => { _buffer += d.toString() })
//         .on('end', () => {
//           let buffer
//           try {
//             buffer = JSON.parse(_buffer)
//           } catch (e) {
//             socket.emit('resultstaxid', { 'data': ['An error occured', 'Please contact sys admin'] })
//             return
//           }
//           // JSON Parsing successfull
//           let ans = { 'data': undefined }
//           // Taxon non présent dans NCBI
//           if (buffer.hasOwnProperty('Program terminated')) {
//             logger.info(`JOB completed -- program terminated\n${utils.format(buffer.emptySearch)}`)
//             ans.data = ['No', 'Search yielded no results.', buffer.emptySearch]
//           // Taxon déjà présent dans notre base
//           } else if (buffer.hasOwnProperty('Be careful')) {
//             let res = buffer.out
//             logger.info(`JOB completed -- be careful\n${utils.format(buffer.becareful)}`)
//             ans.data = ['Yes', 'Search yielded results.', buffer.becareful]
//           // Nouveau taxon
//           } else {
//             let res = buffer.out
//             logger.info(`JOB completed -- new taxon ID\n${utils.format(buffer.new)}`)
//             ans.data = ['Yes', 'Search yielded results.', buffer.new]
//           }
//           socket.emit('resultsTaxid', ans)
//         })
//     })
//   })
// })
