import datetime
import json
import mysql.connector
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.chrome.options import Options


class bktSTD:

    def dbLookup(self, type, text):
        returnVal = 999
        if(type == "subject"):
            for subject in self.subjects:
                if(subject[1] == text):
                    returnVal = subject[0]
        else:
            for room in self.rooms:
                if(room[1] == text):
                    returnVal = room[0]
        if(returnVal == 999):
            self.missingRoomOrSubject = True
            if(type == "room"):
                if(text != self.lastRoom):
                    self.missingRooms.append((text,0))
                    self.lastRoom = text
            elif(type == "subject"):
                if(text != self.lastSubject):
                    self.missingSubjects.append((text,0))
                    self.lastSubject = text
            else:
                print("ERROR uknown type in dblookup neither room or subject")
        return returnVal

    def uploadDataToDB(self):
        self.db = mysql.connector.connect(
            host="gmcr-network.de",
            user="bktStd",
            password="bktStd",
            database="bktStd"
        )

        self.cursor = self.db.cursor()

        truncateEven = "TRUNCATE EvenWeekLessons"
        truncateOdd = "TRUNCATE OddWeekLessons"
        self.cursor.execute(truncateEven)
        self.cursor.execute(truncateOdd)

        self.cursor.execute("SELECT * FROM Rooms")
        self.rooms = self.cursor.fetchall()
        self.cursor.execute("SELECT * FROM Subjects")
        self.subjects = self.cursor.fetchall()

        sqlEven = "INSERT INTO EvenWeekLessons (subject, room) VALUES (%s, %s)"
        sqlOdd = "INSERT INTO OddWeekLessons (subject, room) VALUES (%s, %s)"
        sqlMissingSubjects = "INSERT INTO Subjects (name, ph) VALUES (%s, %s)"
        sqlMissingRooms = "INSERT INTO Rooms (name, ph) VALUES (%s, %s)"

        valEven = []
        valOdd = [] 

        for day in self.lessons[0]:
            for lesson in day:
                valEven.append(
                    (
                        self.dbLookup("subject", lesson["Name"]),
                        self.dbLookup("room", lesson["Room"])
                    )
                )

        for day in self.lessons[1]:
            for lesson in day:
                valOdd.append(
                    (
                        self.dbLookup("subject", lesson["Name"]),
                        self.dbLookup("room", lesson["Room"])
                    )
                )

        if(len(self.missingSubjects) > 0):
            self.cursor.executemany(sqlMissingSubjects, self.missingSubjects)
            self.db.commit()
            print("Upload: " + str(self.cursor.rowcount) + " record(s) uploaded for missingSubjects.")

        if(len(self.missingRooms) > 0):
            self.cursor.executemany(sqlMissingRooms, self.missingRooms)
            self.db.commit()
            print("Upload: " + str(self.cursor.rowcount) + " record(s) uploaded for missingRooms.")


        self.cursor.executemany(sqlEven, valEven)
        self.db.commit()
        print("Upload: " + str(self.cursor.rowcount) +
              " record(s) uploaded for evenWeek.")

        self.cursor.executemany(sqlOdd, valOdd)
        self.db.commit()
        print("Upload: " + str(self.cursor.rowcount) +
              " record(s) uploaded for oddWeek.")
        
        

    def parseLesson(self, type, data, day):
        if(type == "single"):
            lessonSubject = data.get_attribute(
                "innerHTML").split("<br>")[0].strip("\n")
            lessonRoom = data.get_attribute(
                "innerHTML").split("<br>")[1]
            self.lessons[self.calendarWeek][day].append(
                {"Name": lessonSubject, "Room": lessonRoom})
            print("Parsed Lesson(Subject: " +
                  lessonSubject + " Room: " + lessonRoom + ")")
        elif(type == "multi"):
            lesson1Subject = data[0].get_attribute(
                "innerHTML").split("<br>")[0].strip("\n")
            lesson2Subject = data[1].get_attribute(
                "innerHTML").split("<br>")[0].strip("\n")
            lesson1Room = data[0].get_attribute(
                "innerHTML").split("<br>")[1]
            lesson2Room = data[1].get_attribute(
                "innerHTML").split("<br>")[1]
            self.lessons[self.calendarWeek][day].append(
                {"Name": lesson1Subject + " oder " + lesson2Subject, "Room": lesson1Room + " oder " + lesson2Room})
            print("Parsed Lesson(Subject: " +
                  lesson1Subject + " oder " + lesson2Subject + " Room: " + lesson1Room + " oder " + lesson2Room + ")")
        elif(type == "MeldungW" or type == "MeldungB"):
            warning1 = ""
            warning2 = ""

            lesson1 = ""
            lesson2 = ""
            if isinstance(data, WebElement):
                lessonSubjectData = data.get_attribute(
                    "innerHTML").split("<br>")

                room = lessonSubjectData[1]
                subject = lessonSubjectData[0].split("</p>")[
                    0].split(">")[1] + " " + lessonSubjectData[0].split("</p>")[1]

                self.lessons[self.calendarWeek][day].append(
                    {"Name": subject, "Room": room})
                print("Parsed Lesson(Subject: " +
                      subject + " Room: " + room + ")")

            else:

                lesson1SubjectData = data[0].get_attribute(
                    "innerHTML").split("<br>")[0].strip("\n")
                lesson2SubjectData = data[1].get_attribute(
                    "innerHTML").split("<br>")[0].strip("\n")

                lesson1 = lesson1SubjectData
                lesson2 = lesson2SubjectData

                if("MeldungW" in lesson1SubjectData):
                    lesson1SubjectData = lesson1SubjectData.replace(
                        "</p>", ";").replace('<p class="MeldungW">', ";").split(";")
                    warning1 = lesson1SubjectData[1]
                    lesson1 = lesson1SubjectData[2]
                if("MeldungW" in lesson2SubjectData):
                    lesson2SubjectData = lesson2SubjectData.replace(
                        "</p>", ";").replace('<p class="MeldungW">', ";").split(";")
                    warning2 = lesson2SubjectData[1]
                    lesson2 = lesson2SubjectData[2]

                if("MeldungB" in lesson1SubjectData):
                    lesson1SubjectData = lesson1SubjectData.replace(
                        "</p>", ";").replace('<p class="MeldungB">', ";").split(";")
                    warning1 = lesson1SubjectData[1]
                    lesson1 = lesson1SubjectData[2]
                if("MeldungB" in lesson2SubjectData):
                    lesson2SubjectData = lesson2SubjectData.replace(
                        "</p>", ";").replace('<p class="MeldungB">', ";").split(";")
                    warning2 = lesson2SubjectData[1]
                    lesson2 = lesson2SubjectData[2]


                lesson1Room = data[0].get_attribute(
                    "innerHTML").split("<br>")[1]
                lesson2Room = data[1].get_attribute(
                    "innerHTML").split("<br>")[1]

                if(warning1 != ""):
                    lesson1 = warning1 + "(" + lesson1 + ")"
                if(warning2 != ""):
                    lesson2 = warning2 + "(" + lesson2 + ")"

                self.lessons[self.calendarWeek][day].append(
                    {"Name": lesson1 + " oder " + lesson2, "Room": lesson1Room + " oder " + lesson2Room})
                print("Parsed Lesson(Subject: " +
                      lesson1 + " oder " + lesson2 + " Room: " + lesson1Room + " oder " + lesson2Room + ")")

    def parseTimetable(self):
        for day in range(0, 5):
            for lessonCount in range(0, 14):
                lesson = self.driver.find_element_by_xpath(
                    "/html/body/table[2]/tbody/tr["+str(3+lessonCount)+"]/td["+str(1+day)+"]")
                lessonClassName = lesson.get_attribute("class")
                if "BGPause" not in lessonClassName:
                    if "Clip" in lessonClassName:
                        lessonData = self.driver.find_element_by_xpath(
                            "/html/body/table[2]/tbody/tr["+str(3 + lessonCount)+"]/td["+str(1+day)+"]")
                        if("MeldungW" in lessonData.get_attribute("innerHTML") or "MeldungB" in lessonData.get_attribute("innerHTML")):
                            self.parseLesson("MeldungW", lessonData, day)
                        else:
                            self.parseLesson("single", lessonData, day)
                    else:
                        try:
                            lessonData1 = self.driver.find_element_by_xpath(
                                "/html/body/table[2]/tbody/tr["+str(3 + lessonCount)+"]/td["+str(1+day)+"]/table/tbody/tr/td[1]/table/tbody/tr/td")
                            lessonData2 = self.driver.find_element_by_xpath(
                                "/html/body/table[2]/tbody/tr["+str(3 + lessonCount)+"]/td["+str(1+day)+"]/table/tbody/tr/td[2]/table/tbody/tr/td")
                            if("MeldungW" in lessonData1.get_attribute("innerHTML")):
                                self.parseLesson(
                                    "MeldungW", (lessonData1, lessonData2), day)
                            elif("MeldungB" in lessonData1.get_attribute("innerHTML")):
                                self.parseLesson(
                                    "MeldungB", (lessonData1, lessonData2), day)
                            else:
                                self.parseLesson(
                                    "multi", (lessonData1, lessonData2), day)
                        except NoSuchElementException:
                            self.lessons[self.calendarWeek][day].append(
                                {"Name": "Frei", "Room": "Kein Raum"})
                            print("Parsed Lesson(Subject: " +
                                  "Frei" + " Room: " + "Kein Raum" + ")")

    def saveDataToFile(self, fileName):
        file = open(fileName + ".json", "w+")
        file.write(self.lessonsData)
        file.close()

    def login(self):
        self.driver.get("https://stdplan.bkt-luedenscheid.de/")
        loginUsername = self.driver.find_element_by_name("username")
        loginPassword = self.driver.find_element_by_name("password")
        loginUsername.send_keys("jan.grosse_juettermann.gost91")
        # region pw
        loginPassword.send_keys("8t7uzer49")
        # endregion
        loginPassword.send_keys(Keys.RETURN)

    def getCalendarWeek(self):
        mondayDate = self.driver.find_element_by_xpath(
            "/html/body/table[2]/tbody/tr[1]/th[3]").get_attribute("innerHTML").split(";")[2].split(".")

        calendarWeek = datetime.date(datetime.date.today().year, int(
            mondayDate[1]), int(mondayDate[0])).isocalendar()[1]
        if(calendarWeek % 2 == 0):
            return 0
        else:
            return 1

    def __init__(self):
        self.lastRoom = ""
        self.lastSubject = ""
        self.missingSubjects = []
        self.missingRooms = []
        self.missingRoomOrSubject = False

        chrome_options = Options()  
        chrome_options.add_argument("--headless")
        
        #on desktop
        self.driver = webdriver.Chrome(options=chrome_options) # for testing

        #on server
        #chrome_options.add_argument('--no-sandbox')
        #chrome_options.add_argument('--disable-dev-shm-usage')
        #self.driver = webdriver.Chrome('/usr/bin/chromedriver', chrome_options=chrome_options)
            
        self.login()

        self.calendarWeek = self.getCalendarWeek()
        self.lessons = [[[], [], [], [], []], [[], [], [], [], []]]
        print("Parsing first week...")
        self.parseTimetable()
        print("Finished parsing first week.")

        self.driver.find_element_by_name("btnWoche").click()
        self.calendarWeek = 1 - self.calendarWeek
        print("Parsing second week...")
        self.parseTimetable()
        print("Finished parsing second week.")

        self.driver.close()

        self.lessonsData = json.dumps(
            {
                "EvenWeek": {
                    "Monday": self.lessons[0][0],
                    "Tuesday": self.lessons[0][1],
                    "Wednesday": self.lessons[0][2],
                    "Thursday": self.lessons[0][3],
                    "Friday": self.lessons[0][4],
                },
                "OddWeek": {
                    "Monday": self.lessons[1][0],
                    "Tuesday": self.lessons[1][1],
                    "Wednesday": self.lessons[1][2],
                    "Thursday": self.lessons[1][3],
                    "Friday": self.lessons[1][4],
                }
            },
        indent=4)

        print("Saving data to File and Database...")

        self.saveDataToFile("data")
        self.uploadDataToDB()
        print("Finished saving data to File and Database.")


bktSTD()
