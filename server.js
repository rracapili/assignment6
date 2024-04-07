/*********************************************************************************
*  WEB700 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Ronald Capili Student ID: 152344222 Date: 20240404
*
*  Online (Cycliic) Link: https://ill-blazer-foal.cyclic.app/
*  GitHub: https://github.com/rracapili/assignment6
********************************************************************************/ 



var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
app.use(express.static('public'));
var path = require("path");
// Require the collegeData module from the modules folder
var Data = require('./modules/collegeData');

const exphbs = require('express-handlebars');


app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    layoutsDir: 'views/layouts',
    partialsDir: 'views/partials',
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options){
            return '<li' + ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
    
}));
app.set('view engine', '.hbs');


// setup a 'route' to listen on the default url path
/*
app.get("/", (req, res) => {
    res.send("Hello World!");
});
*/

// Add the express.urlencoded middleware
app.use(express.urlencoded({ extended: true }));

// Call the initialize function before setting up the routes
Data.initialize().then(() => {
    console.log("Data initialized. Setting up the routes.");

    // Serve static files from the 'views' directory
    app.use(express.static(path.join(__dirname, 'views')));

    //Middleware
    app.use(function(req,res,next){
        let route = req.path.substring(1);
        app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
        next();
    });

    // Serve the home page directly from the views directory (remove the redirect)
    app.get("/", (req, res) => {
        res.render('home', { title: 'Home Page', layout:'main'});
    });

    // Route for GET /about
    app.get("/about", (req, res) => {
        res.render('about', {title: 'About Page', layout: 'main'});
    });

    // GET /students/add
    app.get("/students/add", (req, res) => {
        Data.getCourses().then(courses => {
            console.log("Courses fetched: ", courses); 
            res.render("addStudent", { courses });
        }).catch(err => {
            console.error("Error fetching courses: ", err);
            res.render("addStudent", { courses: [] });
        });
    });


    // POST /students/add
    app.post('/students/add', (req, res) => {
        // Convert checkbox value to boolean
        req.body.ta = req.body.ta ? true : false;
        Data.addStudent(req.body).then(() => {
            res.redirect("/students");
        }).catch(err => {
            console.log(err);
            res.status(500).send("Failed to add student");
        });
    });

    // GET /courses/add
    app.get("/courses/add", (req, res) => {
        console.log("Accessing /courses/add");
        res.render("addCourse");
    });


    // POST /courses/add
    app.post('/courses/add', (req, res) => {
        Data.addCourse(req.body).then(() => {
            res.redirect("/courses");
        }).catch(err => {
            console.log(err);
            res.status(500).send("Unable to add course");
        });
    });

    // POST /course/update
    app.post('/course/update', (req, res) => {
        Data.updateCourse(req.body).then(() => {
            res.redirect("/courses");
        }).catch(err => {
            console.log(err);
            res.status(500).send("Unable to update course");
        });
    });

    // GET /course/update
    app.get("/course/update/:id", (req, res) => {
        // Assuming that you have a 'updateCourse' view to render
        Data.getCourseById(req.params.id).then((courseData) => {
            res.render("updateCourse", { course: courseData });
        }).catch(err => {
            console.log(err);
            res.status(404).send("Course not found");
        });
    });

    // Route for GET /htmlDemo
    app.get("/htmlDemo", (req, res) => {
        res.render('htmlDemo', {title: 'HTML Demo', layout: 'main'});
    });

    // Route for GET /students
    app.get("/students", (req, res) => {
        const courseParam = req.query.course;

        if (courseParam) {
            Data.getStudentsByCourse(parseInt(courseParam))
                .then(students => {
                    res.render("students",{students: students});
                })
                .catch(() => {
                    res.render("students", {message: "no results"});
                });
        } else {
            Data.getAllStudents()
                .then(students => {
                    res.render("students",{students: students});
                })
                .catch(() => {
                    res.render("students", {message: "no results"});
                });
        }
    });

    
    // Route for GET /courses
    app.get("/courses", (req, res) => {
        const courseParam = req.query.course;
        Data.getCourses()
            .then(courses => {
                res.render("courses", {courses: courses});
            })
            .catch(() => {
                res.render("courses", {message: "no results"});
            });
    });

    // Route to handle a single course by id
    app.get("/course/:id", (req, res) => {
        Data.getCourseById(req.params.id).then(data => {
            console.log(data); // Check the data object
            res.render("course", { course: data });
        }).catch(err => {
            console.log(err);
            res.status(404).send("Course not found");
        });
    });

    // GET /course/delete/:id
    app.get("/course/delete/:id", (req, res) => {
        Data.deleteCourseById(req.params.id).then(() => {
            res.redirect("/courses");
        }).catch(err => {
            console.log(err);
            res.status(500).send("Unable to remove course / Course not found");
        });
    });

    // GET /courses/add
    app.get("/courses/add", (req, res) => {
        console.log("Accessing /courses/add");
        res.render("addCourse");
    });
    
    // Route for GET /tas
    app.get("/tas", (req, res) => {
        Data.getTAs()
            .then((tas) => res.json(tas))
            .catch(() => res.json({message: "no results"}));
    });


    // Route for GET /student/num
    app.get("/student/:studentNum", (req, res) => {
        // initialize an empty object to store the values
        let viewData = {};

        // first, get the student by studentNum
        Data.getStudentByNum(req.params.studentNum).then((data) => {
            if (data) {
                viewData.student = data; // store student data in the "viewData" object as "student"
            } else {
                viewData.student = null; // set student to null if none were returned
            }
        }).catch(() => {
            viewData.student = null; // set student to null if there was an error
        }).then(Data.getCourses)
        .then((data) => {
            viewData.courses = data; // store course data in the "viewData" object as "courses"

            // loop through viewData.courses and once we have found the courseId that matches
            // the student's "course" value, add a "selected" property to the matching
            // viewData.courses object
            for (let i = 0; i < viewData.courses.length; i++) {
                if (viewData.courses[i].courseId == viewData.student.courseId) {
                    viewData.courses[i].selected = true;
                }
            }
        }).catch(() => {
            viewData.courses = []; // set courses to empty if there was an error
        }).then(() => {
            if (viewData.student == null) { // if no student - return an error
                res.status(404).send("Student Not Found");
            } else {
                res.render("student", { viewData: viewData }); // render the "student" view
            }
        });
    });

    // POST route to update student
    app.post("/student/update", async (req, res) => {
        try {
            // req.body will contain the form data
            console.log(req.body);  // Log the form data to see what is being passed
            
            // Assuming you have a function to update the student data that returns a promise
            await Data.updateStudent(req.body);
    
            // If successful, redirect to the list of students or a confirmation page
            res.redirect("/students");
        } catch (error) {
            console.error(error);
            // If an error occurs, send a user-friendly message or render an error page
            res.status(500).send("Unable to update student information.");
        }
    });

    // Catch-all route for handling unmatched routes
    app.use((req, res) => {
        res.status(404).send("Page Not Found");
    });

    // setup http server to listen on HTTP_PORT
    app.listen(HTTP_PORT, ()=>{console.log("server listening on http://localhost:" + HTTP_PORT)});

}).catch(err => {
    console.error("Failed to initialize data:", err);
});
