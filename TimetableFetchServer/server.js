const mysql = require('mysql');
const http = require('http')
const port = 3000
const host = '5.189.129.153'

var mysqlConfig = {
    host: "gmcr-network.de",
    user: "bktStd",
    password: "bktStd",
    database: "bktStd"
}

let mysqlConnection = mysql.createConnection(mysqlConfig);

function getData(response) {
    let data = []
    mysqlConnection.query("SELECT EvenWeekLessons.id as Id, Subjects.name as Subject, Rooms.name as Room FROM EvenWeekLessons INNER JOIN Subjects ON EvenWeekLessons.subject = Subjects.id INNER JOIN Rooms ON EvenWeekLessons.room = Rooms.id order by Id", function (err, result, fields) {
        if (err) console.log("[ERROR/MYSQL/QUERY] " + err)
        temp = []
        result.forEach(element => {
            temp.push({ id: element.Id, subject: element.Subject, room: element.Room })
        });
        data.push(temp)
        mysqlConnection.query("SELECT OddWeekLessons.id as Id, Subjects.name as Subject, Rooms.name as Room FROM OddWeekLessons INNER JOIN Subjects ON OddWeekLessons.subject = Subjects.id INNER JOIN Rooms ON OddWeekLessons.room = Rooms.id order by Id", function (err, result, fields) {
            if (err) console.log("[ERROR/MYSQL/QUERY] " + err)
            temp = []
            result.forEach(element => {
                temp.push({ id: element.Id, subject: element.Subject, room: element.Room })
            });
            data.push(temp)
            response.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
            response.end(JSON.stringify(data))
        });
    });
}
// For todays date;
Date.prototype.today = function () { 
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

// For the time now
Date.prototype.timeNow = function () {
     return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

const server = http.createServer(function (request, response) {
    var newDate = new Date();
    console.log("time: " + newDate.today() + " @ " + newDate.timeNow());
    console.log("got request:")
    console.log("method: " + request.method)
    if (request.method == 'POST') {
        let body = ''
        request.on('data', function (data) {
            body += data
        })
        request.on('end', function () {
            if (body.includes("data")) {
                getData(response)
            }
        })
    } else {
        response.writeHead(200, { 'Access-Control-Allow-Origin': '*', "Access-Control-Allow-Headers": "*" })
        response.end()
    }
})

server.listen(port, host)
console.log(`Server started on port: ${port}`)
console.log('listening for requests...')
