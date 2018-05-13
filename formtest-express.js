var express = require('express');
var path = require('path');
var formidable = require('formidable');
var mc = require('mongodb').MongoClient;
var fs = require('fs');
var dbUrl = "mongodb://localhost:27017/FortCandidates";

var app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req,res){
	res.sendFile(__dirname+'/form.html');
});

//for dashboard login
 app.get('/login', function(req, res){
 	res.sendFile(__dirname+'/login.html');
});


app.post('/getFormData', function (req, res){
	var name = '';
	var surname = '';
	var email = '';
	var mobile = '';
	var dob = new Date();
	var position = '';
	var qualification = '';
	var portfolio = '';
	var cvurl = '';
	var videourl = '';
	var data = [];

    var form = new formidable.IncomingForm();

    form.parse(req);

    form.on('fileBegin', function (name, file){
    	var uniqueName = genUniqueName()+'.pdf';
        file.path = __dirname + '/uploads/' + uniqueName;
        cvurl = uniqueName;
    });

    form.on('file', function (name, file){
    	console.log(file.data);
        console.log('Uploaded ' + file.name);
        data.cvurl = file.name;
    });

    form.on('field', function(fname, field){
    	console.log(fname + ' - ' + field);
    	switch(fname){
    		case 'email':
    			email = field;
    			break;

    		case 'name':
    			name = field;
    			break;

    		case 'surname':
    			surname = field;
    			break;

    		case 'mobile':
    			mobile = field;
    			break;

			case 'dob':
    			dob = field;
    			break;

    		case 'position':
    			position = field;
    			break;

    		case 'qualification':
    			qualification = field;
    			break;

    		case 'portfolio':
    			portfolio = field;
    			break;

    		case 'cvurl':
    			cvurl = field;
    			break;

    		case 'videourl':
    			videourl = field;
    			break;
    	}	
    });

    form.on('end', function(){
    	data.name = name;
    	data.surname = surname;
    	data.email = email;
    	data.mobile = mobile;
    	data.dob = dob;
    	data.position = position;
    	data.qualification = qualification;
    	data.portfolio = portfolio;
    	data.cvurl = cvurl;
    	data.videourl = videourl;
    	storeData(data);
    	var thanksString = name + ' ' + surname;
    	console.log(thanksString); 
    	res.render('pages/thanks', {person: thanksString});
    });

});

//this will display all db entries
app.post('/dashboard', function(req, res){
	var valid = true;
	var form = new formidable.IncomingForm();
    form.parse(req);

    form.on('field', function(fname, field){
    	switch (fname){
    		case 'uname':
    			if ( field != 'manager'){
    				valid = false;
    			}
    			break;
    		case 'pwd':
    			if ( field != 'P@ssw0rd!'){
    				valid = false;
    			}	
    	}
    });

    form.on('end', function(){
    	if ( valid ){
    		mc.connect(dbUrl, function(err, db){
				if (err) throw err;
				var col = db.db('FortCandidates');
				col.collection('candidates').find({}).toArray(function(err, result){
					if (err) throw err;
					db.close();
					res.render('pages/dash', {people: result});
				});
			});	
    	} else {
    		res.end('Invalid login credentials');
    	}
    });

});

//this will return a specific resume
app.post('/getCV', function(req, res){
	var form = new formidable.IncomingForm();
	var cvName = '';
	form.parse(req);
	form.on('field', function(name, field){
		console.log(name + ' - ' + field);
		if (name == 'cvId'){
			cvName = field;
			fs.readFile('./uploads/'+cvName, function(err, data){
				if (err) throw err;
				res.contentType('application/pdf');
				res.send(data);
			});
		}
	});
});

//put item in database
function storeData(postData){
	mc.connect(dbUrl, function(err, db){
		if (err) throw err;
		var col = db.db('FortCandidates');
		var dbItem = { 
			name: postData.name,
			surname: postData.surname,
			email: postData.email,
			mobile: postData.mobile,
			dob: postData.dob,
			position: postData.position,
			qualification: postData.qualification,
			portfolio: postData.portfolio,
			cvurl: postData.cvurl,
			videourl: postData.videourl
		};
		col.collection('candidates').insertOne(dbItem,  function(err, res){
			if (err) throw err;
			db.close();
		});
	});
}

function displayAllCandidates(){
	mc.connect(dbUrl, function(err, db){
		if (err) throw err;
		var col = db.db('FortCandidates');
		col.collection('candidates').find({}).toArray(function(err, result){
			if (err) throw err;
			db.close();
			res.render('pages/dash', {people: result});
		});
	});
}

function genUniqueName(){
	return Math.ceil(1000*Math.random()).toString(16)+'-'+Math.ceil(1000*Math.random()).toString(16)+'-'+Math.ceil(1000*Math.random()).toString(16);
}


app.listen(3000);