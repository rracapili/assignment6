/*********************************************************************************
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Ronald Capili Student ID: 152344222 Date: 20240325
*
*  Online (Cycliic) Link: https://red-calm-badger.cyclic.app/
*  GitHub: https://github.com/rracapili/assignment5
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

    // GET route to send the addStudent.hbs file
    app.get('/students/add', (req, res) => {
        res.render('addStudent', {title: 'Add Student', layout: 'main'});
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
        const courseId = parseInt(req.params.id);
        Data.getCourseById(courseId)
            .then(course => {
                res.render("course", {course: course});
            })
            .catch(() => {
                res.render("course", {message: "no results"});
            });
    });
    
    // Route for GET /tas
    app.get("/tas", (req, res) => {
        Data.getTAs()
            .then((tas) => res.json(tas))
            .catch(() => res.json({message: "no results"}));
    });


    // Route for GET /student/num
    app.get("/student/:num", (req, res) => {
        const studentNum = parseInt(req.params.num);
        Data.getStudentByNum(studentNum)
            .then(student => {
                res.render("student", {student: student});
            })
            .catch(() => {
                res.render("student", {message: "no results"});
            });
    });

    // POST route to update student
    app.post("/student/update", (req, res) => {
        Data.updateStudent(req.body)
            .then(() => {
                res.redirect("/students");
            })
            .catch(() => {
                res.redirect("/students");
            });
    });

    app.post('/students/add', async (req, res) => {
        try {
          // Call addStudent function from collegeData.js module
          await Data.addStudent(req.body);
          // Redirect to the '/students' route upon successful addition
          res.redirect('/students');
        } catch (error) {
          // Handle errors appropriately
          console.error(error);
          // You may want to send an error response or render an error page here
          res.status(500).send('An error occurred while adding the student.');
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
