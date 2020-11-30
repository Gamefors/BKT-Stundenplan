SELECT 
    EvenWeekLessons.id as Id,
	Subjects.name as Subject,
    Rooms.name as Room
FROM EvenWeekLessons
INNER JOIN Subjects
ON EvenWeekLessons.subject = Subjects.id
INNER JOIN Rooms
ON EvenWeekLessons.room = Rooms.id
order by Id