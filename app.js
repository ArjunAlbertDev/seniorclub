//Global variables
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var readline = require('readline-sync');
var omdb = require('omdb-client');
const session = require("express-session");
const bodyParser = require("body-parser");
//Models
const Movie = require('./models/movie');
//Controllers
//const mediaController = require('./controllers/mediaController');


//OMDB API STUFF

/*   OMDB EXAMPLE .get


omdb.get(params, function(err, data) {
		save_movie_from_data(data);
	});

*/
function get_posterURL(title){
	var params = create_omdb_params(title);
	omdb.get(params, function(err, data) {
		return data.Poster;
	});
}
function create_omdb_params(title){
	//declare and return functions 
	var params = {
    	apiKey: 'f7cb9dc5',
    	title: title
	}
	return params;
}

function display_data(){
	//Does general find and prints out title of each existing element
	Movie.find({},function(err, res){
		for (var e in res){
			//Print title of movie object in database
			console.log(res[e].title);
		}
	});
}

function save_movie_from_data(data){
	//Create new movie object and display in console
	console.log("Saving movie data...");
	var new_movie = new Movie( {
    	movieid: data.imdbID,
  		title: data.Title,
  		year: data.Year,
  		posterurl: data.Poster
  } )
	//Save new movie object and display in console
	new_movie.save(function(err,result){
		console.log(new_movie.title + " data saved!");
	});
	
}


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const formsRouter = require('./routes/forms');

var app = express();

const mongoose = require( 'mongoose' );
// here is where we connect to the database!
mongoose.connect( 'mongodb://localhost:27017/seniorcenter' );
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we are connected!")
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
//middleware to process the req object and make it more useful!
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'zzbbyanana' }));
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/forms', formsRouter);

app.get('/media',(req,res)=> {
	res.render('media');
})

app.get('/findMovie',(req,res)=> {
	res.render('media');
})

app.post('/findMovie',(req,res)=> {
	var params = create_omdb_params(req.body.movieTitle);
	omdb.get(params, function(err, data) {
		data = data || 
		   {Poster: "https://images.costco-static.com/ImageDelivery/imageService?profileId=12026540&imageId=9555-847__1&recipeName=350"}
		res.render('media', {posterurl: data.Poster, title: 'Your Media'});
	});
})

/*
app.get('/media', mediaController.getAllNotes );
app.post('/searchMedia', mediaController.saveNote);
app.post('/searchMedia', mediaController.deleteNote);
*/
app.use('/', function(req, res, next) {
  console.log("in / controller")
  res.render('index', { title: 'SeniorClub' });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(bodyParser.json());


console.log("before hook...");
app.use('/hook', function(req, res){
  console.log(JSON.stringify(req.body, null, 2));
  process_request(req, res);
});

function process_request(req,res){
  console.log(body.queryResult.parameters);
  var output_string = "there was an error";
  if(body.queryResult.intent.displayName === "search"){
    output_string = "MOVIES";
  }else{
    output_string = "test error!";
  }
  return res.json({
    "fufillmentMessages":[],
    "fufillmentText": output_string,
    "payload":{},
    "outputContexts":[],
    "source":"Test Source",
    "followupEventInput":{}
  })
}


module.exports = app;
