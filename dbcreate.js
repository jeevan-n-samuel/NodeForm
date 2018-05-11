var mongoose = require('mongoose');
db = mongoose.connect('mongodb://localhost:27017/FortCandidates');

var schema = new mongoose.Schema({
	name: String,
	surname: String,
	email: String,
	mobile: String,
	dob: Date,
	position: String,
	qualification: String,
	portfolio: String,
	cvurl: String,
	videourl: String
});

//create database with schema
var candidate = mongoose.model('Candidate', schema);
var johndoe = new candidate({name: 'John', surname: 'Doe', email: 'john@email.com', mobile: '0821214455', dob: new Date(1990, 11, 12), position: 'cadavre', qualification: 'B.A. Test', portfolio: 'www.myportfolio.com', cvurl: 'cv.pdf', videourl: 'video.mp4'}); 
johndoe.save(function(err){
	if (err) throw err;
	console.log('Added candidate');
})
console.log('Database created with schema = '+schema);
db.close();
