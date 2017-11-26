const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('mongoose-type-email');
const sass = require('node-sass-middleware');
const ejs = require('ejs');
const path = require('path');
const nodemailer = require('nodemailer');
const passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const expressValidator = require('express-validator');
const cookieParser = require('cookie-parser');
var moment = require('moment');
const bcrypt = require('bcryptjs');
var flash = require('connect-flash');
var sha512 = require('sha512')
var Insta = require('instamojo-nodejs');
var request= require('request');
//Insta.setKeys("dc578372a019eb3218e8c54489248992", "46d18a93e91b48bf1e64257d40ade161");
Insta.setKeys("0012e02fcbbbeb0ee2b6f9be5441753a", "8c6b706ff60b6095ffc3850697440e09");

//Insta.isSandboxMode(true);


//0012e02fcbbbeb0ee2b6f9be5441753a
//8c6b706ff60b6095ffc3850697440e09


var app = express();



app.use(cookieParser());
app.use(session({secret: 'padinkprolakshana', saveUninitialized: true, resave: true}));

app.use(flash());


// Passport init
app.use(passport.initialize());
app.use(passport.session());


// Express Validator
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Global Vars
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    //res.locals.print_msg = req.flash('print_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});


function accessControl(req, res, next) {
    if (req.isAuthenticated() && req.user.userType == 'agent') {
        return next();
    } else {
        req.flash('error_msg', 'You are not logged in!');
        res.redirect('/login');
    }
}

function AdminAccessControl(req, res, next) {
    if (req.isAuthenticated() && req.user.userType == 'admin') {
        return next();
    } else {
        req.flash('error_msg', 'You are not logged in!');
        res.redirect('/accessdenied');
    }
}




// Nodemailer Setup
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    secure: true,
    port: 465,
    auth: {
        user: 'padinkit@gmail.com',
        pass: 'skns2016'

    }
});


//Mongoose

const busSchema = new mongoose.Schema({
    pnr: String,
    source: [String],
    destination: [String],
    dateOfJourney: {type: String},
    timing: String,
    ticket: [{
        seatNumber: Number,
        reserved: Boolean,
        selected: Boolean,
        passengerName: String,
        passengerAge: Number,
        passengerEmail: String,
        passengerContact: Number,
        passengerGender: String,
        passengerBoarding: String,
        passengerDrop: String,
        agentId : String
    }],
    price: Number,
    publish: Boolean,
    arrival: String,
    departue: String,
    busType: String,
    boardingPoint: {location: {type: [String]}, timing: {type: [String]}},
    dropPoint: {location: {type: [String]}, timing: {type: [String]}},
    startPoint: String,
    endPoint: String,
    blocked: {type: Boolean, default: false},
    paymentStatus: Boolean,
    bookingTime: String,
    refundStatus: {type: Boolean, default: false},
    refundDate: String,
    paymentId: String,
    paymentRequestId: String
});

const adminSchema = new mongoose.Schema({
    username: String,
    password: String,
    userType: String
});

const agentSchema = new mongoose.Schema({
    username: String,
    password: String,
    userType: String,
    name: String,
    mobile: Number,
    address: String

});



const adminModel = mongoose.model('adminModel', adminSchema);
const agentModel = mongoose.model('agentModel', agentSchema);


const busModel = mongoose.model('busModel', busSchema);

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://lakshana:lakshana@ds149603.mlab.com:49603/lakshanatest');
//mongoose.connect('mongodb://localhost/myproject');
mongoose.connection.on('error', function (err) {
    console.error(err);
    console.log('%s MongoDB connection error. Please make sure MongoDB is running.');
    process.exit();

});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.get('/', function (req, res) {
    //for(i=1;i<=36;i++){
    //    var seatData = new busModel({
    //        source : ['elumalai','m.kallupatti','mangalrevu vilakku','peraiyur bus stand','t.kallupatti','madurai mattuthavani'],
    //        destination : ['perungalathur','tambaram','ashok pillar','vadapalani','koyambedu'],
    //        dateOfJourney: '2017-11-26',
    //        timing : '8 PM TO 6 AM',
    //        ticket :[{
    //            seatNumber: i,
    //            reserved: false,
    //            selected: false
    //        }],
    //        price : 550,
    //        publish : true,
    //        arrival: 'koyambedu',
    //        departue: 'Elumalai',
    //        busType: '2 + 2 Seater Non A.C',
    //        boardingPoint: {location:['Elumalai','M.Kallupatti','Mangalrevu Vilakku','Periyar Bus Stand','T.Kallupatti','Madurai Mattuthavani'],
    //                        timing:['18:45','19:10','19:30','19:50','20:10','21:00']},
    //        dropPoint: {location:['Perungalathur','Tambaram','Ashok Pillar','Vadapalani','Koyambedu'],
    //            timing:['05:00','05:20','05:40','05:50','06:00']},
    //        startPoint: 'Elumalai',
    //        endPoint: 'Koyambedu'
    //
    //
    //    })
    //
    //    seatData.save().then(function (doc) {
    //        console.log(doc);
    //        console.log('busModel');
    //    }, function (e) {
    //        console.log(e)
    //    });
    //}
    //for(i=1;i<=36;i++){
    //        var seatData = new busModel({
    //            source : ['koyambedu','nerkundram','ashok pillar','alandur court','pallavaram','chrompet','tambaram','perungalathur','vandalur','chengalpattu'],
    //            destination : ['madurai mattuthavani','t.kallupatti','peraiyur bus stand','mangalrevu vilakku','m.kallupatti','elumalai'],
    //            dateOfJourney: '2017-11-26',
    //            timing : '8 PM TO 6 AM',
    //            ticket :[{
    //                seatNumber: i,
    //                reserved: false,
    //                selected: false
    //            }],
    //            price : 550,
    //            publish : true,
    //            arrival: 'koyambedu',
    //            departue: 'Elumalai',
    //            busType: '2 + 2 Seater Non A.C',
    //            boardingPoint: {location:['Koyambedu','Nerkundram','Ashok Pillar','Alandur Court',
    //                                    'Pallavaram','Chrompet','Tambaram','Perungalathur','Vandalur','Chengalpattu'],
    //                            timing:['20:30','20:40','21:00','21:10','21:20','21:30','21:40','21:50','22:10','22:40']},
    //            dropPoint: {location:['Madurai Mattuthavani','T.Kallupatti','Peraiyur Bus Stand',
    //                                'Mangalrevu Vilakku','M.Kallupatti','Elumalai'],
    //                timing:['05:00','06:00','06:20','06:40','07:00','07:15']},
    //            startPoint: 'Elumalai',
    //            endPoint: 'Koyambedu'
    //
    //
    //        })
    //
    //        seatData.save().then(function (doc) {
    //            console.log(doc);
    //            console.log('busModel');
    //        }, function (e) {
    //            console.log(e)
    //        });
    //    }

    res.render('home', {
        title: 'Home'
    });
});
app.get('/bookfailed', function (req, res) {
    res.render('bookfailed', {
        title: 'failed'
    });
});


app.get('/adminprivate', function (req, res) {
    res.render('adminprivate', {
        title: 'admin login'
    });
});


passport.use('admin',new LocalStrategy(
    function (username, password, done) {
        adminModel.findOne({username: username}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {message: 'Incorrect username.'});
            }
            bcrypt.compare(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: "Invalid Password"});
                }
            });
        });
    }
));


passport.use('agent',new LocalStrategy(
    function (username, password, done) {
        agentModel.findOne({username: username}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {message: 'Incorrect username.'});
            }
            bcrypt.compare(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: "Invalid Password"});
                }
            });
        });
    }
));

passport.serializeUser(function (user, done) {
    var key = {
        id: user.id,
        type: user.userType
    }
    done(null, key);
});

passport.deserializeUser(function (key, done) {
    var Model = key.type === 'admin' ? adminModel : agentModel;

    Model.findById({_id: key.id}, function (err, user) {
        done(err, user);
    });
});


app.post('/adminprivate', passport.authenticate('admin', {
        successRedirect: '/admindashboard',
        failureRedirect: '/adminprivate',
        failureFlash: true
    }),
    function (req, res) {
        res.redirect('/admindashboard');
    });
app.get('/adminlogout', function (req, res) {
    req.logout();

    req.flash('success_msg', 'You are logged out!');
    res.redirect('/adminprivate');
});

app.get('/admindashboard',AdminAccessControl, function (req, res) {
    res.render('admindashboard/admindashboard', {
        title: 'admin dashboard'
    });
});

app.get('/signup',AdminAccessControl, function (req, res) {
    console.log(req.user.userType);
    res.render('register', {
        title: 'Register'
    });
});

app.get('/login', function (req, res) {
    res.render('login', {
        title: 'Login'
    });
});
app.get('/accessdenied', function (req, res) {
    res.render('403', {
        title: 'Access Denied'
    });
});


app.get('/about', function (req, res) {
    res.render('about', {
        title: 'About'
    });
});

app.get('/book', function (req, res) {
    res.render('book', {
        title: 'book'
    })
});

app.get('/contact', function (req, res) {


    res.render('contact', {
        title: 'Contact'
    });


});

app.get('/adminprint', function (req, res) {
    res.render('adminprint', {
        title: "print all"
    });
});

app.get('/printticket', function (req, res) {
    res.render('printticket', {
        title: "print passenger ticket",pnr:req.query.pnr,print_msg:""
    });
});

app.get('/cancelticket', function (req, res) {
    res.render('cancelticket', {
        title: "cancel passenger ticket"
    });
});

app.get('/blocksuccess', function (req, res) {
    res.render('blocksuccess');
});

app.get('/admindashboard/printjourney',AdminAccessControl, function (req, res) {
    res.render('admindashboard/printjourney');
});

app.get('/admindashboard/faremodify',AdminAccessControl, function (req, res) {
    res.render('admindashboard/faremodify');
});

app.get('/admindashboard/addbus',AdminAccessControl, function (req, res) {
    res.render('admindashboard/addbus');
});

app.get('/admindashboard/removebus',AdminAccessControl, function (req, res) {
    res.render('admindashboard/removebus');
});

app.get('/admindashboard/seatlayout',AdminAccessControl, function (req, res) {
    res.render('admindashboard/seatlayout');
});

app.get('/agentdashboard',accessControl, function (req, res) {
    var userid = req.user.id;
    var seats = 0;
    var todayDate = new Date();
    var formattedtodayDate = todayDate.getFullYear() + '-' + (todayDate.getMonth() + 1) + '-' + todayDate.getDate();

    busModel.find({$and: [{"dateOfJourney": formattedtodayDate}, {"ticket.agentId": userid}]}, function (err, docs) {
        console.log(docs.length);
        seats = docs.length;
        console.log(seats);
        res.render('agentDashboard/agentdashboard',{seats:seats});

    });


});

app.get('/agentdashboard/agentseatblock',accessControl, function (req, res) {

        res.render('agentDashboard/agentseatblock');
});

app.get('/agentdashboard/blockedseatsinfo',accessControl, function (req, res) {

    res.render('agentDashboard/blockedseatsinfo');



});

app.post('/blockedseatsinfo', function (req, res) {

    var userid = req.body.userid;
    var journeyDate = new Date(req.body.date);
    var formattedJourneyDate = journeyDate.getFullYear() + '-' + (journeyDate.getMonth() + 1) + '-' + journeyDate.getDate();

    busModel.find({$and: [{"dateOfJourney": formattedJourneyDate}, {"ticket.agentId": userid},{"source":req.body.from.toLowerCase()},{"destination":req.body.to.toLowerCase()}]}, function (err, docs) {


        res.send({docs:docs});

    });


});






app.get('/adminregister',function(req,res){
    res.render('adminregister');
});


app.post('/adminregister',function(req,res){
   var username = req.body.uname;
    var password = req.body.upass;

    var errors = req.validationErrors();
    if(errors){
        console.log(errors);
    }else{
        console.log('inside bcrypt')
        bcrypt.genSalt(10,function(err,salt){
           bcrypt.hash(password,salt,function(err,hash){
              password=hash;
               console.log(password);
               var adminInsert = new adminModel({
                  username:username,
                   password:password,
                   userType: 'admin'
               });

               adminInsert.save().then(function(doc){
                   console.log('admin added')
               },function(e){
                   console.log('admin registration error');
               });

               res.redirect('/adminprivate');
           });
        });
    }
});



app.post('/agentregister',function(req,res){
    var name = req.body.name;
    var password = req.body.password;
    var username = req.body.email;
    var mobile = req.body.mobile;
    var address = req.body.address;


    var errors = req.validationErrors();
    if(errors){
        console.log(errors);
    }else{
        console.log('inside bcrypt')
        bcrypt.genSalt(10,function(err,salt){
            bcrypt.hash(password,salt,function(err,hash){
                password=hash;
                console.log(password);
                var agentInsert = new agentModel({
                    username:username,
                    password:password,
                    userType: 'agent',
                    name:name,
                    mobile:mobile,
                    address:address
                });

                agentInsert.save().then(function(doc){
                    console.log('agent added')
                },function(e){
                    console.log('agent registration error');
                });

                res.redirect('/adminprivate');
            });
        });
    }
});




app.post('/agentlogin', passport.authenticate('agent', {
        successRedirect: '/agentdashboard',
        failureRedirect: '/login',
        failureFlash: true
    }),
    function (req, res) {
        res.redirect('/contact');
    });


app.get('/agentlogout', function (req, res) {
    req.logout();

    req.flash('success_msg', 'You are logged out!');
    res.redirect('/login');
});

app.post('/showseat', function (req, res) {
    //console.log(typeof(req.body.date));

    busModel.find({$and: [{"dateOfJourney": req.body.date}, {"source": req.body.source.toString().toLowerCase()}, {"destination": req.body.destination.toString().toLowerCase()}]}, function (err, docs) {
        //console.log();

        res.json(docs.sort(function (a, b) {
            return a.ticket.seatNumber - b.ticket.seatNumber
        }));
    });

});


app.post('/success', function (req, res) {

    var seatLength = req.body.seatNo;
    var ageList = req.body.age;
    var nameList = req.body.name;
    var genderList = req.body.gender;
    var emailData = req.body.email;
    var dataG = req.body.dateOfJourney;
    var displayDate = req.body.displayDate;
    var boardingPoint = req.body.boardingPoint;
    var departureTiming = req.body.departureTiming;
    var dropPoint = req.body.dropPoint;
    var dropTiming = req.body.dropTiming;
    var pnr = req.body.pnr;
    var emailArray = [];
    var bookedAlready = false;
    var bookedSeats = [];
    var count = null;
    var counter = null;
    var j = 0;
    var pnrIndex = 0;
    var pnrNumber = null;
    var d = new Date();

    for (var i = 0; i < req.body.seatNo.length; i++) {

        var pname = req.body.name[i];
        //console.log(pname);
        var page = req.body.age[i];
        //console.log(page);
        var pgender = req.body.gender[i];
        busModel.findOne({$and: [{"ticket.seatNumber": req.body.seatNo[i]}, {"dateOfJourney": dataG}, {"ticket.reserved": false}, {"source": boardingPoint.toLowerCase()}]}, function (err, doc) {
            j = j + 1
            if (doc) {
                console.log(pnr);

                doc.pnr = pnr;
                doc.ticket[0].reserved = true;
                doc.ticket[0].passengerName = req.body.name[j - 1];
                doc.ticket[0].passengerAge = req.body.age[j - 1];
                doc.ticket[0].passengerEmail = req.body.email;
                doc.ticket[0].passengerContact = req.body.contact;
                doc.ticket[0].passengerGender = req.body.gender[j - 1];
                doc.ticket[0].passengerBoarding = boardingPoint;
                doc.ticket[0].passengerDrop = dropPoint;
                doc.paymentStatus = false;
                doc.bookingTime = d;




                doc.save(function (err) {
                    if (err) {
                        console.log('error1');
                        //count = count+1;


                    }
                    else {
                        count = count + 1;
                        console.log("no error");
                        bookedSeats.push(doc.ticket[0].seatNumber);

                        if (bookedSeats.length == seatLength.length && count == req.body.seatNo.length) {
                            emailArray.push(i);
                            //ejs.renderFile(__dirname + "/views/test.ejs", {
                            //    pnr: pnrNumber,
                            //    boardingPoint: boardingPoint,
                            //    departureTiming: departureTiming,
                            //    dropPoint: dropPoint,
                            //    dropTiming: dropTiming,
                            //    dateJourney: displayDate,
                            //    seat: seatLength,
                            //    name: nameList,
                            //    gender: genderList,
                            //    age: ageList
                            //}, function (err, data) {
                            //    if (err) {
                            //        console.log(err);
                            //    }
                            //    else {
                            //
                            //        let HelperOptions = {
                            //            from: 'eticket@lakshanatravels.com',
                            //            to: emailData,
                            //            subject: 'Lakshana - Booking Confirmation.',
                            //            html: data
                            //        };
                            //        transporter.sendMail(HelperOptions, function (error, info) {
                            //            if (error) {
                            //                console.log(error);
                            //            }
                            //            //console.log('mail sent');
                            //            console.log(info);
                            //        });
                            //
                            //    }
                            //
                            //});
                            res.send({pnr: pnrNumber, send: "hi"});


                        }

                        if (bookedSeats.length != req.body.seatNo.length && count == req.body.seatNo.length) {
                            for (i = 0; i < bookedSeats.length; i++) {
                                console.log(bookedSeats);
                                busModel.findOne({$and: [{"ticket.seatNumber": bookedSeats[i]}, {"dateOfJourney": dataG}, {"ticket.reserved": true}, {"source": boardingPoint.toLowerCase()}]}, function (err, docs) {
                                    console.log(docs);
                                    if (docs) {
                                        docs.pnrNumber = null;
                                        docs.ticket[0].reserved = false;
                                        docs.ticket[0].passengerName = null;
                                        docs.ticket[0].passengerAge = null;
                                        docs.ticket[0].passengerEmail = null;
                                        docs.ticket[0].passengerContact = null;


                                        docs.save(function (err) {
                                            if (err) {
                                                counter = counter + 1;
                                                res.send("bookError");
                                                console.log(err);

                                            }
                                            else {
                                                counter = counter + 1;
                                                if (counter == bookedSeats.length) {
                                                    res.send({send: "bookError"});
                                                }
                                            }
                                        })

                                    }
                                    else {
                                        res.send("bookError");
                                    }

                                });
                            }
                        }


                    }
                })

            }
            else {
                console.log('error2');
                count = count + 1;
                res.send("bookError");



            }


        });

    }


    //res.render('success');
    //res.render('bookfailed');

});


app.post('/search', function (req, res) {
    var journeyDate = new Date(req.body.date);
    var formattedJourneyDate = journeyDate.getFullYear() + '-' + (journeyDate.getMonth() + 1) + '-' + journeyDate.getDate();
    var source = req.body.from.toLowerCase();
    var destination = req.body.to.toLowerCase();

    busModel.find({$and: [{"source": source}, {"destination": destination}, {"dateOfJourney": formattedJourneyDate}, {"ticket.reserved": true},{'paymentStatus': true}]}, function (err, docs) {
        res.render('adminprint', {
            response: docs
        });




    });


});


app.get('/printticket', function (req, res) {

    console.log('hello');
});


app.post('/setprice', function (req, res) {
    var journeyDate = new Date(req.body.changeFareDate);
    var formattedJourneyDate = journeyDate.getFullYear() + '-' + (journeyDate.getMonth() + 1) + '-' + journeyDate.getDate();
    var source = req.body.source.toLowerCase();
    var destination = req.body.destination.toLowerCase();
    var newPrice = req.body.newFare;
    //var newArray = ['20:30','20:40','21:00','21:10','21:20','21:30','21:40','21:50','22:10','22:40'];


    busModel.update(
        {$and: [{"source": source}, {"destination": destination}, {"dateOfJourney": formattedJourneyDate}]}, //query, you can also query for email
        {$set: {"price": newPrice}},
        {"multi": true}, function (err, data) {
            res.send("success");
        }
    );


    //busModel.update(
    //    {$and: [{"source": source}, {"destination": destination}, {"dateOfJourney": formattedJourneyDate}]}, //query, you can also query for email
    //    {$set: {"boardingPoint.timing": newArray}},
    //    {"multi": true},function(err,data){
    //        res.send("success");
    //    }
    //);


    //busModel.find({$and: [{"source": source}, {"destination": destination}, {"dateOfJourney": formattedJourneyDate}]}, function(err,docs){
    //
    //    if(docs){
    //        docs.price = newPrice;
    //
    //        docs.save(function(err){
    //            if(err){
    //                console.log("error occured while price change");
    //            }else{
    //                console.log("price changed successfully");
    //            }
    //
    //        })
    //
    //
    //    }else{
    //        console.log('error');
    //    }
    //
    //});


});

app.post('/addbus', function (req, res) {
    var addSource = req.body.addSource;
    var addDestination = req.body.addDestination;
    var addDate = new Date(req.body.addDate);
    var formattedAddDate = addDate.getFullYear() + '-' + (addDate.getMonth() + 1) + '-' + addDate.getDate();

    var addPrice = req.body.addPrice;


    busModel.findOne({$and: [{"departue": addSource}, {"arrival": addDestination}, {"dateOfJourney": formattedAddDate}]}, function (err, doc) {
        if (!doc) {
            if (addSource == "Elumalai" && addDestination == "koyambedu") {
                var counter = 0;
                for (i = 1; i <= 36; i++) {
                    var seatData = new busModel({
                        source: ['elumalai', 'm.kallupatti', 'mangalrevu vilakku', 'peraiyur bus stand', 't.kallupatti', 'madurai mattuthavani'],
                        destination: ['perungalathur', 'tambaram', 'ashok pillar', 'vadapalani', 'koyambedu'],
                        dateOfJourney: formattedAddDate,
                        timing: '8 PM TO 6 AM',
                        ticket: [{
                            seatNumber: i,
                            reserved: false,
                            selected: false
                        }],
                        price: addPrice,
                        publish: true,
                        arrival: addDestination,
                        departue: addSource,
                        busType: '2 + 2 Seater Non A.C',
                        boardingPoint: {
                            location: ['Elumalai', 'M.Kallupatti', 'Mangalrevu Vilakku', 'Periyar Bus Stand', 'T.Kallupatti', 'Madurai Mattuthavani'],
                            timing: ['18:45', '19:10', '19:30', '19:50', '20:10', '21:00']
                        },
                        dropPoint: {
                            location: ['Perungalathur', 'Tambaram', 'Ashok Pillar', 'Vadapalani', 'Koyambedu'],
                            timing: ['05:00', '05:20', '05:40', '05:50', '06:00']
                        },
                        startPoint: 'Elumalai',
                        endPoint: 'Koyambedu'


                    });

                    seatData.save().then(function (doc) {

                        counter = counter + 1
                        if (counter == 36) {
                            res.send({status: "success"});

                        }
                    }, function (e) {
                        console.log(e)
                    });
                }


            }
            if (addSource == "koyambedu" && addDestination == "Elumalai") {
                var counter = 0;
                for (i = 1; i <= 36; i++) {
                    var seatData = new busModel({
                        source: ['koyambedu', 'nerkundram', 'ashok pillar', 'alandur court', 'pallavaram', 'chrompet', 'tambaram', 'perungalathur', 'vandalur', 'chengalpattu'],
                        destination: ['madurai mattuthavani', 't.kallupatti', 'peraiyur bus stand', 'mangalrevu vilakku', 'm.kallupatti', 'elumalai'],
                        dateOfJourney: formattedAddDate,
                        timing: '8 PM TO 6 AM',
                        ticket: [{
                            seatNumber: i,
                            reserved: false,
                            selected: false
                        }],
                        price: addPrice,
                        publish: true,
                        arrival: addDestination,
                        departue: addSource,
                        busType: '2 + 2 Seater Non A.C',
                        boardingPoint: {
                            location: ['Koyambedu', 'Nerkundram', 'Ashok Pillar', 'Alandur Court',
                                'Pallavaram', 'Chrompet', 'Tambaram', 'Perungalathur', 'Vandalur', 'Chengalpattu'],
                            timing: ['20:30', '20:40', '21:00', '21:10', '21:20', '21:30', '21:40', '21:50', '22:10', '22:40']
                        },
                        dropPoint: {
                            location: ['Madurai Mattuthavani', 'T.Kallupatti', 'Peraiyur Bus Stand',
                                'Mangalrevu Vilakku', 'M.Kallupatti', 'Elumalai'],
                            timing: ['05:00', '06:00', '06:20', '06:40', '07:00', '07:15']
                        },
                        startPoint: 'Elumalai',
                        endPoint: 'Koyambedu'


                    })

                    seatData.save().then(function (doc) {

                        counter = counter + 1
                        if (counter == 36) {
                            res.send({status: "success"});

                        }
                    }, function (e) {
                        console.log(e)
                    });
                }

            }
        } else {
            res.send({status: "error"});
        }

    });


});


app.get('/admindashboard/seatblock',accessControl, function (req, res) {
    res.render('seatblock', {
        title: "Admin Seat Block"
    });
});

app.post('/blocksearch', function (req, res) {
    var addDate = new Date(req.body.date);
    var formattedAddDate = addDate.getFullYear() + '-' + (addDate.getMonth() + 1) + '-' + addDate.getDate();
    console.log(formattedAddDate);
    console.log(req.body.from.toString());
    console.log(req.body.to.toString());
    busModel.find({$and: [{"dateOfJourney": formattedAddDate}, {"source": req.body.from.toString().toLowerCase()}, {"destination": req.body.to.toString().toLowerCase()}]}, function (err, docs) {
        //console.log();
        if(docs){
            res.json(docs.sort(function (a, b) {
                return a.ticket.seatNumber - b.ticket.seatNumber
            }));
        }else{
            res.send({status:'error'});
        }

    });
});





app.get('/admindashboard/seatunblock', accessControl,function (req, res) {
    res.render('seatunblock', {
        title: "Admin Seat Unblock"
    });
});


app.post('/unblocksearch', function (req, res) {
    var addDate = new Date(req.body.date);
    var formattedAddDate = addDate.getFullYear() + '-' + (addDate.getMonth() + 1) + '-' + addDate.getDate();
    busModel.find({$and: [{"dateOfJourney": formattedAddDate}, {"source": req.body.from.toString().toLowerCase()}, {"destination": req.body.to.toString().toLowerCase()}]}, function (err, docs) {
        //console.log();
        if(docs){
            res.json(docs.sort(function (a, b) {
                return a.ticket.seatNumber - b.ticket.seatNumber
            }));
        }else{
            res.send({status:'error'});
        }

    });
});




app.post('/confirmblock', function (req, res) {
    var blockedSeats = req.body.blockedSeats;
    var addDate = new Date(req.body.date);
    var formattedAddDate = addDate.getFullYear() + '-' + (addDate.getMonth() + 1) + '-' + addDate.getDate();
    var j = 0;

    for (i = 0; i < blockedSeats.length; i++) {
        busModel.findOne({$and: [{"ticket.seatNumber": blockedSeats[i]}, {"dateOfJourney": formattedAddDate}, {"ticket.reserved": false}, {"source": req.body.from.toString().toLowerCase()}]}, function (err, doc) {
            if (doc) {

                doc.ticket[0].reserved = true;
                doc.blocked = true;

                doc.save(function (err) {
                    if (err) {
                        //console.log('ticket was already booked');
                    }
                    else {
                        j = j + 1;

                        if(j == blockedSeats.length){
                            res.send({status:'success'});
                        }


                    }

                });
            }

        });


    }


});

app.post('/confirmunblock', function (req, res) {
    var blockedSeats = req.body.blockedSeats;
    var addDate = new Date(req.body.date);
    var formattedAddDate = addDate.getFullYear() + '-' + (addDate.getMonth() + 1) + '-' + addDate.getDate();
    var j = 0;

    for (i = 0; i < blockedSeats.length; i++) {
        busModel.findOne({$and: [{"ticket.seatNumber": blockedSeats[i]}, {"dateOfJourney": formattedAddDate}, {"ticket.reserved": true}, {"source": req.body.from.toString().toLowerCase()}]}, function (err, doc) {
            if (doc) {

                doc.ticket[0].reserved = false;
                doc.blocked = false;

                doc.save(function (err) {
                    if (err) {
                        //console.log('ticket was already booked');
                    }
                    else {
                        j = j + 1;

                        if(j == blockedSeats.length){
                            res.send({status:'success'});
                        }


                    }

                });
            }

        });


    }


});


app.post('/agentblock', function (req, res) {
    var name = req.body.name;
    var username = req.body.username;
    var mobile = req.body.mobile;
    var userid = req.body.id;
    console.log(userid);


    var blockedSeats = req.body.blockedSeats;
    var addDate = new Date(req.body.date);
    var formattedAddDate = addDate.getFullYear() + '-' + (addDate.getMonth() + 1) + '-' + addDate.getDate();
    var j = 0;

    for (i = 0; i < blockedSeats.length; i++) {
        busModel.findOne({$and: [{"ticket.seatNumber": blockedSeats[i]}, {"dateOfJourney": formattedAddDate}, {"ticket.reserved": false}, {"source": req.body.from.toString().toLowerCase()}]}, function (err, doc) {
            if (doc) {

                doc.ticket[0].reserved = true;
                doc.ticket[0].passengerName = 'Blocked by '+ name+'('+userid +')';
                doc.ticket[0].passengerEmail = username;
                doc.ticket[0].passengerContact = mobile;
                doc.ticket[0].agentId = userid;
                doc.blocked = true;

                doc.save(function (err) {
                    if (err) {
                        //console.log('ticket was already booked');
                    }
                    else {
                        j = j + 1;

                        if(j == blockedSeats.length){
                            res.send({status:'success'});
                        }


                    }

                });
            }

        });


    }


});


app.post('/removebus', function(req,res){

    var removeSource = req.body.removeSource;
    var removeDestination = req.body.removeDestination;
    var removeDate = new Date(req.body.removeDate);
    var formattedAddDate = removeDate.getFullYear() + '-' + (removeDate.getMonth() + 1) + '-' + removeDate.getDate();




    busModel.remove({$and: [{"departue": removeSource}, {"arrival": removeDestination}, {"dateOfJourney": formattedAddDate}]}, function(err,removed) {
        if(removed){
            res.send({status: "success"});
        }else{
            res.send({status: "error"});
        }


    });


});



app.post('/getpaymentdetails', function(req,res){

    var firstName = req.body.name;
    var email = req.body.email;
    var  mobile = req.body.mobile;
    var totalCost = req.body.totalCost;
    var quantity = req.body.quantity;
    var cost = req.body.cost;
    var source = req.body.sourceFrom;
    var destination = req.body.destinationTo;
    var dateOfJourney = req.body.dateOfJourney;
    var totalSeats = JSON.parse(req.body.totalSeats);
    var pnr = req.body.pnr;
    console.log('pnr number' + pnr);
    //console.log('total seats' + JSON.parse(totalSeats).length);
    //totalSeats = totalSeats.join('-');
    //console.log(typeOf(totalSeats));
    //var d = new Date();
    //var ran = Math.floor(Math.random() * (9999 - 999)) + 999; //The maximum is exclusive and the minimum is inclusive;
    //var pnrNumber = source.substring(0, 1) + destination.substring(0, 1) + dateOfJourney.substring(5, 6)  + ran.toString() + d.getDate() + d.getMonth() + d.getSeconds();

    var data = new Insta.PaymentData();

    data.purpose = pnr;            // REQUIRED
    data.amount = totalCost;                  // REQUIRED
    data.buyer_name              = firstName;
    data.email                   = email;
    data.phone                   = mobile;
    data.send_sms                = false;
    data.send_email              = false;
    data.setRedirectUrl("http://localhost:4500/paymentstatus");


    Insta.createPayment(data, function(error, response) {
        if (error) {
            // some error
        } else {
            reqBody = JSON.parse(response);
            console.log(response)
            var longurl = reqBody.payment_request.longurl;

            // Payment redirection link at response.payment_request.longurl
            console.log(response);
            res.send({longurl:longurl});

        }
    });



});


app.get('/paymentstatus', function (req, res) {

    var pnr = '';
    var status = '';
    var email = '';
    var pay_id = req.query.payment_id;
    var req_id = req.query.payment_request_id;
    var email = '';




    if(req.query.payment_id){
        Insta.getPaymentRequestStatus(req_id, function(error, response) {
            if (error) {
                // Some error
            } else {
                pnr = response.payment_request.purpose;
                Insta.getPaymentDetails(req_id,pay_id, function(error, rest) {
                    if (error) {
                        // Some error
                    } else {
                        console.log(rest);
                        var status = rest.payment_request.status;
                        console.log(status);
                        if(status!='Pending'){
                            status = "Done";
                            busModel.find({"pnr": pnr}, function (err, docs) {
                                var unformattedDate = new Date(docs[0].dateOfJourney);
                                var displayDate = moment(unformattedDate).format("D-MMM-YYYY");
                                var source = docs[0].ticket[0].passengerBoarding;
                                var destination =docs[0].ticket[0].passengerDrop;
                                var nameList = [];
                                var seatList = [];
                                var ageList = [];
                                var genderList = [];
                                var bookLength = docs.length;
                                var boardingPoints = docs[0].boardingPoint.location;
                                var dropPoints = docs[0].dropPoint.location ;
                                var sortedBoarding=boardingPoints.map(function(x){ return x.toUpperCase() });
                                var sortedDrop = dropPoints.map(function(x){ return x.toUpperCase() });


                                var pickTime = docs[0].boardingPoint.timing[sortedBoarding.indexOf(source.toUpperCase())];
                                var dropTime = docs[0].dropPoint.timing[sortedDrop.indexOf(destination.toUpperCase())];
                                email = docs[0].ticket[0].passengerEmail;

                                docs.forEach(function(currentValue, index, arr){
                                    seatList.push(docs[index].ticket[0].seatNumber);
                                    nameList.push(docs[index].ticket[0].passengerName);
                                    ageList.push(docs[index].ticket[0].passengerAge);
                                    genderList.push(docs[index].ticket[0].passengerGender);
                                    if(arr[index].ticket[0].reserved == true){
                                        arr[index].paymentStatus = true;
                                        arr[index].paymentRequestId = pay_id;
                                        arr[index].paymentId = req_id;
                                    }else{
                                        console.log('payment timeout !!')
                                    }
                                    docs[index].save(function (err) {
                                        if (err) {
                                            //console.log('ticket was already booked');
                                        }
                                        else {
                                            if(index == bookLength-1){
                                                ejs.renderFile(__dirname + "/views/test.ejs", {
                                                    pnr: pnr,
                                                    boardingPoint: source,
                                                    departureTiming:pickTime ,
                                                    dropPoint: destination,
                                                    dropTiming: dropTime,
                                                    dateJourney: displayDate,
                                                    seat: seatList,
                                                    name: nameList,
                                                    gender: genderList,
                                                    age: ageList
                                                },function(err, data){
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                    else {

                                                        let HelperOptions = {
                                                            from: 'eticket@lakshanatravels.com',
                                                            to: email,
                                                            subject: 'Lakshana - Booking Confirmation.',
                                                            html: data
                                                        };
                                                        transporter.sendMail(HelperOptions, function (error, info) {
                                                            if (error) {
                                                                console.log(error);
                                                            }
                                                            //console.log('mail sent');
                                                            console.log(info);
                                                        });

                                                    }
                                                });
                                            }

                                        }
                                    });

                                });

                                res.render('paymentstatus', {
                                    title: 'paymentstatus',status:status,pnr:pnr,email:email
                                });


                            });
                        }else{
                            status = "Failed";
                            res.render('paymentstatus', {
                                title: 'paymentstatus',status:status,pnr:pnr,email:email
                            });
                        }


                        console.log(email);

                    }
                });
            }
        });


    } else{
        res.redirect('/');

    }



});



app.post('/printticket',function(req,res){

    var pnr = req.body.pnr;
    var email = req.body.email;


    busModel.find({$and: [{"pnr": pnr}, {"ticket.passengerEmail": email}]}, function (err, docs) {
        console.log(docs.length);
        if(docs.length == 0){
            res.render("printticket", { pnr: pnr,print_msg:"Information you provided are invalid!"});
        }else{
            var unformattedDate = new Date(docs[0].dateOfJourney);
            var displayDate = moment(unformattedDate).format("D-MMM-YYYY");
            var source = docs[0].ticket[0].passengerBoarding;
            var sourceUp = source.charAt(0).toUpperCase() + source.slice(1);
            var departureindex = docs[0].boardingPoint.location.indexOf(sourceUp);
            var departure = docs[0].boardingPoint.timing[departureindex];
            var destination =docs[0].ticket[0].passengerDrop;
            var destUp = destination.charAt(0).toUpperCase() + destination.slice(1);
            var arrivalindex = docs[0].dropPoint.location.indexOf(destUp);
            var arrival = docs[0].dropPoint.timing[arrivalindex];
            var totalPrice = docs[0].price * docs.length;
            res.render("printjourney",{pnr:pnr,doj:displayDate,sourceFrom: source,destinationTo:destination,details:docs,departure:departure,arrival:arrival,totalPrice:totalPrice});
        }




    });


});


app.post('/cancelsearch', function(req,res){
    var pnr = req.body.pnr;
    var email = req.body.email;

    busModel.find({$and: [{"pnr": pnr}, {"ticket.passengerEmail": email},{"paymentStatus":true}]}, function (err, docs) {
        if(docs.length == 0){
            res.send(false);
        }else{
            if(new Date(docs[0].dateOfJourney).getDate()> new Date().getDate()){
                res.send('before');
            }
            if(new Date(docs[0].dateOfJourney).getDate()== new Date().getDate()){
                res.send('same day');
            }
        }






    });

});


app.post('/cancelticket', function(req,res){
    var pnr = req.body.pnr;
    var email = req.body.email;

    busModel.find({$and: [{"pnr": pnr}, {"ticket.passengerEmail": email}]}, function (err, docs) {
        var payid = "";
        var totalFare = null;
        if(new Date(docs[0].dateOfJourney).getDate()> new Date().getDate()){

        }

        docs.forEach(function(currentValue, index, arr){
            arr[index].pnr = "";
            arr[index].ticket[0].reserved = false;
            arr[index].refundStatus = true;
            arr[index].refundDate = new Date();
            payid = arr[0].paymentRequestId;
            totalFare += (arr[index].price * 0.6);

            arr[index].save(function (err) {
                if(err){

                }else{

                    //var refund = new Insta.RefundRequest();
                    //refund.payment_id = payid;     // This is the payment_id, NOT payment_request_id
                    //refund.type       = 'TAN';     // Available : ['RFD', 'TNR', 'QFL', 'QNR', 'EWN', 'TAN', 'PTH']
                    //refund.body       = 'Customer cancelled the journey';     // Reason for refund
                    //Insta.createRefund(refund, function(error, response) {
                    //    console.log(error);
                    //    console.log(response);
                    //    res.send(true);
                    //});
                    if(index == docs.length-1 && new Date(docs[0].dateOfJourney).getDate()> new Date().getDate()){
                        console.log(payid);
                        console.log(totalFare);
                        var headers = { 'X-Api-Key': 'dc578372a019eb3218e8c54489248992', 'X-Auth-Token': '46d18a93e91b48bf1e64257d40ade161'}
                        payload = {
                            payment_id: payid,
                            type: "QFL",
                            refund_amount:totalFare,
                            body: "Customer isn't satisfied with the quality"
                        }

                        request.post('https://test.instamojo.com/api/1.1/refunds/', {form: payload,  headers: headers}, function(error, response, body){
                            if(!error && response.statusCode == 201){
                                res.send(true);
                            }else{

                            }
                        })

                    } else{
                        res.send(true);
                    }


                }

            });

        });





    });

});


app.post('/agentbooked', function (req, res) {

    busModel.find({"ticket[0].agentId":req.body.agentId}, function(err,docs) {
        console.log('hello' + docs.length);
        res.send({seats: docs.length});

    });

});



app.get('*', function (req, res) {
    res.redirect('/');
});





function updateSeats (){

    busModel.find({"paymentStatus": false}, function (err, docs) {
        docs.forEach(function(currentValue, index, arr){
            var today = new Date().getTime();
            var actual = new Date(arr[index].bookingTime).getTime() + 10*60000;

            if(today>actual){
                arr[index].ticket[0].reserved = false;
                arr[index].paymentStatus = null;
                arr[index].save(function (err) {
                    if(err){

                    }else{
                        //  if successfully updated
                    }

                });
            }

        });

        console.log(docs.length);
    });
}


setInterval(updateSeats,5000);
app.listen(process.env.PORT || 4500);