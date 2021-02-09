const express = require('express')
var mysql = require('mysql');
const app = express()
const port = 3000

var db = mysql.createConnection({
    host: "gmcr-network.de",
    user: "bktStd",
    password: "bktStd",
    database: "bktStd"
  });
  
  db.connect(function(err) {
    if (err) throw err;
    console.log("Successfully connected to database.");
  });

app.get('/lessonData', (request, response) => {
    console.log(`${request.ip} requested lessonData.`);
    db.query("SELECT EvenWeekLessons.id as Id, Subjects.name as Subject, Rooms.name as Room FROM EvenWeekLessons INNER JOIN Subjects ON EvenWeekLessons.subject = Subjects.id INNER JOIN Rooms ON EvenWeekLessons.room = Rooms.id order by Id", function (err, queriedEvenWeekLessons, fields) {
        if (err) throw err;
        db.query("SELECT OddWeekLessons.id as Id, Subjects.name as Subject, Rooms.name as Room FROM OddWeekLessons INNER JOIN Subjects ON OddWeekLessons.subject = Subjects.id INNER JOIN Rooms ON OddWeekLessons.room = Rooms.id order by Id", function (err, queriedOddWeekLessons, fields) {
            if (err) throw err;
            var lessonsData = {
                "EvenWeek": {
                    "Monday": [],
                    "Tuesday": [],
                    "Wednesday": [],
                    "Thursday": [],
                    "Friday": []
                },
                "OddWeek": {
                    "Monday": [],
                    "Tuesday": [],
                    "Wednesday": [],
                    "Thursday": [],
                    "Friday": []
                },
            }
            queriedEvenWeekLessons.forEach(lesson => {
                if(lesson.Id <= 10){
                    lessonsData.EvenWeek.Monday.push(lesson)
                }
                if(lesson.Id > 10 && lesson.Id <= 20){
                    lessonsData.EvenWeek.Tuesday.push(lesson)
                }
                if(lesson.Id > 20 && lesson.Id <= 30){
                    lessonsData.EvenWeek.Wednesday.push(lesson)
                }
                if(lesson.Id > 30 && lesson.Id <= 40){
                    lessonsData.EvenWeek.Thursday.push(lesson)
                }
                if(lesson.Id > 40 && lesson.Id <= 50){
                    lessonsData.EvenWeek.Friday.push(lesson)
                }
            })
            queriedOddWeekLessons.forEach(lesson =>{
                if(lesson.Id <= 10){
                    lessonsData.OddWeek.Monday.push(lesson)
                }
                if(lesson.Id > 10 && lesson.Id <= 20){
                    lessonsData.OddWeek.Tuesday.push(lesson)
                }
                if(lesson.Id > 20 && lesson.Id <= 30){
                    lessonsData.OddWeek.Wednesday.push(lesson)
                }
                if(lesson.Id > 30 && lesson.Id <= 40){
                    lessonsData.OddWeek.Thursday.push(lesson)
                }
                if(lesson.Id > 40 && lesson.Id <= 50){
                    lessonsData.OddWeek.Friday.push(lesson)
                }
            })
            response.setHeader("Access-Control-Allow-Origin", "*")
            response.json(lessonsData)
        })
    })
})

app.listen(port, () => {
  console.log(`TimetableFetchServer started on port: ${port}`)
})