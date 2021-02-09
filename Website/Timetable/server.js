const express = require('express')
const app = express()
const port = 80

var path = require('path');

app.get('/', (request, response) => {
    console.log(`${request.ip} requested Timetable.`);
    app.use(express.static(__dirname + '/public'));
    response.sendFile(path.join(__dirname + '/index.html'));
})

app.listen(port, () => {
  console.log(`Timetable started on port: ${port}`)
})