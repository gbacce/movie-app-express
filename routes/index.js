// Set required modules

	var express = require('express');
	var request = require('request');
	var config = require('../config/config')
	var bcrypt = require('bcrypt-nodejs');
	
// Instantiate a router

	var router = express.Router();

// Define global variables

	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: config.sql.host,
		user: config.sql.user,
		password: config.sql.password,
		database: config.sql.database

	})

	connection.connect()

	const apiKey = 'fec8b5ab27b292a68294261bb21b04a5';
	const apiBaseUrl = 'http://api.themoviedb.org/3';
	const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';

// Define the home page route

router.get('/', function(req, res, next) {
	const nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key='+ config.apiKey;

	request.get(nowPlayingUrl,(error,response,movieData)=>{
		var movieData = JSON.parse(movieData);
		console.log("============")
		console.log(req.session)
		
		res.render('movies', {
			movieData: movieData.results,
			imageBaseUrl: imageBaseUrl,
			titleHeader: "Welcome!",
			sessionInfo: req.session

		});
	});
});


router.get('/search', (req, res, next)=>{
	res.send("<h1>Get Search Page<h1>")
})


router.post('/search', (req, res, next)=>{
	// req.body stores posted data. It is available because of the body-parser module.
	var termUserSearchedFor = req.body.searchString;
	var searchUrl = apiBaseUrl + '/search/movie?query=' + termUserSearchedFor + '&api_key=' + config.apiKey;
	request.get(searchUrl,(error,response,movieData)=>{
		var movieData = JSON.parse(movieData);
		res.render('movies', {
			movieData: movieData.results,
			imageBaseUrl: imageBaseUrl,
			titleHeader: "Search results for " + termUserSearchedFor + "."
		});
	});
});


router.get('/movie/:id',(req, res, next)=>{
	var thisMovieId = req.params.id;
	var thisMovieUrl = apiBaseUrl + '/movie/' + thisMovieId + '?api_key=' + config.apiKey;
	// res.send(req.params.id);
	request.get(thisMovieUrl, (error, response, movieData)=>{
		var movieData = JSON.parse(movieData);
		res.render('movie-info', {
			movieData: movieData,
			imageBaseUrl: imageBaseUrl,
			titleHeader: "Search results for " + thisMovieId + "."
		});
	});
});


router.get('/register', (req, res)=>{
	// res.send("THis is teh register page.")
	var message = req.query.msg;
	if(message == "badEmail"){
		message = "This email is already registered";
	}
	res.render('register',{message: message});
});


router.post('/registerProcess', (req,res)=>{
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	var hash = bcrypt.hashSync(password);

	var selectQuery = "SELECT * FROM users WHERE email = ?";
	connection.query(selectQuery,[email],(error, results)=>{
		if(results.length == 0 ){
			// User is not in the db. Insert them
			var insertQuery = "INSERT INTO users (name,email,hash) VALUES (?,?,?)";
			connection.query(insertQuery, [name,email,hash], (error,results)=>{
				req.session.name = name;
				req.session.email = email;
				req.session.loggedin = true;
				res.redirect('/?msg=registered')
			});	
		}else{
			// User is in the db. Send them back to register with a message
			res.redirect('/register?msg=badEmail');
		}

	});
});
	


router.get('/login', (req, res)=>{
	// res.send("This is the login page.");
	res.render('login',{});
	
});


router.post('/processLogin', (req,res)=>{
	res.json(req.body);
	var email = req.body.email;
	var password = req.body.password;
	// var selectQuery = "SELECT * FROM users WHERE email = ? and password = ?";
	var selectQuery = "SELECT * FROM users WHERE email = ?";
	connection.query(selectQuery,[email], (error, results) => {
		if(results.length == 1) {
			var match = bcrypt.compareSync(password, results[0].password);
			if (match) {
				req.session.loggedin = true;
				req.session.name = results.name;
				req.session.email = results.email;
				res.redirect('/?msg=loggedin');
			} else {
			res.redirect('/login?msg=badLogin');
			} 
		}
	});
});


module.exports = router;
