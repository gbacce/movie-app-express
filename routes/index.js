

	var express = require('express');
	var request = require('request');
	var config = require('../config/config')
	
// Instantiate a router

	var router = express.Router();

// Define global variables

	const apiKey = 'fec8b5ab27b292a68294261bb21b04a5';
	const apiBaseUrl = 'http://api.themoviedb.org/3';
	const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';

// Define the home page route

router.get('/', function(req, res, next) {
	const nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key='+ config.apiKey;

	request.get(nowPlayingUrl,(error,response,movieData)=>{
		var movieData = JSON.parse(movieData);
		res.render('movies', {
			movieData: movieData.results,
			imageBaseUrl: imageBaseUrl,
			titleHeader: "Welcome!"
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


module.exports = router;
