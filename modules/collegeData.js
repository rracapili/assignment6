const fs = require("fs");

class Data{
    constructor(students, courses){
        this.students = students;
        this.courses = courses;
    }
}

let dataCollection = null;

module.exports.initialize = function () {
    return new Promise( (resolve, reject) => {
        fs.readFile('./data/courses.json','utf8', (err, courseData) => {
            if (err) {
                reject("unable to load courses"); return;
            }

            fs.readFile('./data/students.json','utf8', (err, studentData) => {
                if (err) {
                    reject("unable to load students"); return;
                }

                dataCollection = new Data(JSON.parse(studentData), JSON.parse(courseData));
                resolve();
            });
        });
    });
}

module.exports.getCourseById = function(id) {
    return new Promise(function (resolve, reject) {
        var course = null;

        for (let i = 0; i < dataCollection.courses.length; i++) {
            if (dataCollection.courses[i].courseId == id) {
                course = dataCollection.courses[i];
            }
        }

        if (!course) {
            reject("query returned 0 results");
            return;
        }

        resolve(course);
    });
};

module.exports.getAllStudents = function(){
    return new Promise((resolve,reject)=>{
        if (dataCollection.students.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(dataCollection.students);
    })
}

module.exports.getTAs = function () {
    return new Promise(function (resolve, reject) {
        var filteredStudents = [];

        for (let i = 0; i < dataCollection.students.length; i++) {
            if (dataCollection.students[i].TA == true) {
                filteredStudents.push(dataCollection.students[i]);
            }
        }

        if (filteredStudents.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(filteredStudents);
    });
};

module.exports.getCourses = function(){
   return new Promise((resolve,reject)=>{
    if (dataCollection.courses.length == 0) {
        reject("query returned 0 results"); return;
    }

    resolve(dataCollection.courses);
   });
};

module.exports.getStudentByNum = function (num) {
    return new Promise(function (resolve, reject) {
        var foundStudent = null;

        for (let i = 0; i < dataCollection.students.length; i++) {
            if (dataCollection.students[i].studentNum == num) {
                foundStudent = dataCollection.students[i];
            }
        }

        if (!foundStudent) {
            reject("query returned 0 results"); return;
        }

        resolve(foundStudent);
    });
};

module.exports.getStudentsByCourse = function (course) {
    return new Promise(function (resolve, reject) {
        var filteredStudents = [];

        for (let i = 0; i < dataCollection.students.length; i++) {
            if (dataCollection.students[i].course == course) {
                filteredStudents.push(dataCollection.students[i]);
            }
        }

        if (filteredStudents.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(filteredStudents);
    });
};

module.exports.updateStudent = function(studentData) {
    return new Promise(function (resolve, reject) {
        let updated = false;

        for (let i = 0; i < dataCollection.students.length; i++) {
            if (dataCollection.students[i].studentNum == studentData.studentNum) {
                // Handle the "TA" checkbox data
                studentData.TA = studentData.TA ? true : false;

                // Overwrite the student with the new data
                dataCollection.students[i] = studentData;
                updated = true;
                break;
            }
        }

        if (updated) {
            resolve();
        } else {
            reject("unable to find student");
        }
    });
};

// Function to add a new student
module.exports.addStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        // Set TA to false if it's undefined, otherwise set it to true
        studentData.TA = studentData.TA === undefined ? false : true;
        
        // Set studentNum property of studentData
        studentData.studentNum = dataCollection.students.length + 1;
        
        // Push updated studentData object onto dataCollection.students array
        dataCollection.students.push(studentData);
        
        // Check if there was an error while adding the student (optional)
        // For example, if dataCollection.students is not defined or not an array
        if (!Array.isArray(dataCollection.students)) {
          reject("Error: Unable to add student. Data collection is not valid.");
        } else {
          // Write updated data to students.json file
          fs.writeFile('./data/students.json', JSON.stringify(dataCollection.students), (err) => {
            if (err) {
              reject("Error: Unable to save updated students data.");
            } else {
              // Resolve the promise if no error occurred
              resolve();
            }
          });
        }
      });
    }
  