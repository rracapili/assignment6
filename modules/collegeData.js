const Sequelize = require('sequelize');
const dbConfig = require('./db_config');

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

//'postgres://postgres:postgres@localhost:5432/week11'
var sequelize = new Sequelize(dbConfig.PGDATABASE, dbConfig.PGUSER, dbConfig.PGPASSWORD, {
    host: dbConfig.PGHOST,
    dialect: dbConfig.DIALECTS,
    port: dbConfig.PGPORT,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: {
        raw: true
    }
});


// Define Student model
const Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING
    // Note: The 'course' column will be added automatically when defining the relationship
});

// Define Course model
const Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

// Define the relationship
Course.hasMany(Student, { foreignKey: 'courseId' });
Student.belongsTo(Course, { foreignKey: 'courseId' });

module.exports.deleteStudentByNum = function(studentNum) {
    return Student.destroy({
        where: { studentNum: studentNum }
    }).then(() => {
        return;
    }).catch((error) => {
        return Promise.reject("unable to delete student");
    });
};

module.exports.deleteCourseById = function (id) {
    // Delete the course by its id
    return Course.destroy({
        where: { courseId: id }
    }).then(() => {
        // Resolves if the delete operation was successful
        return;
    }).catch((error) => {
        // Rejects the promise if the delete operation failed
        return Promise.reject("unable to delete course");
    });
};

module.exports.updateCourse = function (courseData) {
    // Replace any empty strings with null
    Object.keys(courseData).forEach(key => courseData[key] = courseData[key] === "" ? null : courseData[key]);

    // Update the course with the provided data
    return Course.update(courseData, {
        where: { courseId: courseData.courseId }
    }).then(() => {
        // Resolves without data
        return;
    }).catch((error) => {
        // Rejects the promise with an error message
        return Promise.reject("unable to update course");
    });
};


module.exports.addCourse = function (courseData) {
    // Replace any empty strings with null
    Object.keys(courseData).forEach(key => courseData[key] = courseData[key] === "" ? null : courseData[key]);
    
    // Create a new course with the provided data
    return Course.create(courseData).then((course) => {
        // Resolves with the new course data
        return course;
    }).catch((error) => {
        // Rejects the promise with an error message
        return Promise.reject("unable to create course");
    });
};

module.exports.updateStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        // Ensure the TA property is a boolean
        studentData.TA = (studentData.TA) ? true : false;
        
        // Replace blank values with null
        for (let prop in studentData) {
            if (studentData[prop] === "") {
                studentData[prop] = null;
            }
        }
        
        // Update the student
        Student.update(studentData, { where: { studentNum: studentData.studentNum } })
            .then(() => resolve("Operation was a success"))
            .catch((error) => reject("Unable to update student"));
    });
};

module.exports.addStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        // Ensure the TA property is a boolean
        studentData.TA = (studentData.TA) ? true : false;
        
        // Replace blank values with null
        for (let prop in studentData) {
            if (studentData[prop] === "") {
                studentData[prop] = null;
            }
        }
        
        // Create the student
        Student.create(studentData)
            .then(() => resolve("Operation was a success"))
            .catch((error) => reject("Unable to create student"));
    });
};

module.exports.getCourseById = function (id) {
    return Course.findByPk(id).then(function (course) {
        if(course) {
            return course;
        } else {
            return Promise.reject("no results returned");
        }
    }).catch(function (error) {
        return Promise.reject("no results returned");
    });
};

module.exports.getCourses = function () {
    return Course.findAll().then(function (courses) {
        if(courses.length > 0) {
            return courses;
        } else {
            return Promise.reject("no results returned");
        }
    }).catch(function (error) {
        return Promise.reject("no results returned");
    });
};

module.exports.getStudentByNum = function (num) {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: { studentNum: num }
        }).then((data) => {
            if (data.length > 0) {
                resolve(data[0]); // resolve with the first student object
            } else {
                reject("No results returned"); // reject if no student is found
            }
        }).catch((error) => {
            reject("No results returned"); // reject if there's an error during the query
        });
    });
};

module.exports.getStudentsByCourse = function (course) {
    return Student.findAll({
        where: { courseId: course }
    }).then(function (students) {
        // The promise is resolved and we have the students data for the course
        return students;
    }).catch(function (error) {
        // There was an error fetching students by course
        throw error;
    });
};

module.exports.getAllStudents = function () {
    return Student.findAll().then(function (students) {
        // The promise is resolved and we have the students data
        return students;
    }).catch(function (error) {
        // There was an error fetching all students
        throw error;
    });
};