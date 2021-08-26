
const express = require('express');
const ptp = require('pdf-to-printer');
const fs = require('fs');
const path = require('path');
const app = express();
const http = require('http');
const https = require('https'); // or 'https' for https:// URLs
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const QRCode = require('qrcode')

const port = 3000;
const qrcodeTimeout = 60000;
const printInterval = 10000
const kiosk_name = "KEDOKI2"

// app.use(express.static('public'))

function genQr(){
  QRCode.toDataURL(Buffer.from(JSON.stringify({"kiosk_name" : kiosk_name, "create_date" : new Date().getTime()})).toString('base64'), function (err, url) {
    // console.log(url)
    io.emit('qrcode', url);
  })
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  // console.log('a user connected');
  io.emit('kiosk_name', kiosk_name);
  io.emit('status', "Ready");
  QRCode.toDataURL(Buffer.from(JSON.stringify({"kiosk_name" : kiosk_name, "create_date" : new Date().getTime()})).toString('base64'), function (err, url) {
    io.emit('qrcode', url);
  })
});

server.listen(port, () => {
  console.log('listening on *:',port);
});

var qrInterval = setInterval(genQr,qrcodeTimeout)

setInterval(function(){
    
    // console.log("check")
    var request = https.get("https://edoc.opencloudai.com/api/kiosk/print.php?kiosk_name="+kiosk_name, function(response) {
      response.on('data', function (chunk) {
        // console.log(chunk.toString())
        data = JSON.parse(chunk)
        if(data){
          io.emit('status', "Printing");
          
          setTimeout(function(){
            clearInterval(qrInterval)
            genQr()
            io.emit('status', "Ready");
            qrInterval = setInterval(genQr,qrcodeTimeout)
          },60000)

          console.log("https://edoc.opencloudai.com"+data["document_url"]);
          var request_pdf = https.get("https://edoc.opencloudai.com"+data["document_url"], function(response) {
             var file = fs.createWriteStream("tempfile.pdf");
             response.pipe(file);
             ptp
             .getPrinters()
             .then(console.log)
             .catch(console.error);

             ptp.print('tempfile.pdf', {printer: 'FUJI XEROX DocuPrint CP315/318 dw (2)'});
          });
        }
      });
    })
},printInterval)




