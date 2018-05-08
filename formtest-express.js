var express = require('express');
var formidable = require('formidable');
var mc = require('mongodb').MongoClient;
var dbUrl = "mongodb://localhost:27017/FormTestDB";

var app = express();

app.get('/', function (req, res){
    res.sendFile(__dirname + '/form.html');
});

app.post('/getFormData', function (req, res){
	var email = '';
	var fullname = '';
	var data = [];

    var form = new formidable.IncomingForm();

    form.parse(req);

    form.on('fileBegin', function (name, file){
        //file.path = __dirname + '/uploads/' + file.name;
    });

    form.on('file', function (name, file){
    	console.log(file.data);
        console.log('Uploaded ' + file.name);
        data.filename = file.name;
    });

    form.on('field', function(name, field){
    	console.log(name + ' - ' + field);
    	if (name == 'email'){
    		email = field;
    	}
    	if (name == 'fullname'){
    		fullname = field;
    	}
		data.fullname = fullname;
		data.email = email;
		console.log(data);
    		
    });

    form.on('end', function(){
    	storeData(data);
    	res.end();
    });

});

//this will display all db entries
app.get('/viewEntries', function(req, res){
	mc.connect(dbUrl, function(err, db){
		if (err) throw err;
		var dbObject = db.db("FormTestDB");
		dbObject.collection("people").find({}).toArray(function(err, result){
			if (err) throw err;
			console.log(result);
			db.close();
		});
	});
});

function storeData(postData){
	mc.connect(dbUrl, function(err, db){
		if (err) throw err;
		var col = db.db('FormTestDB');
		var dbItem = { fullname: postData.fullname, email: postData.email};
		col.collection('people').insertOne(dbItem,  function(err, res){
			if (err) throw err;
			db.close();
		});
	});
}


app.listen(3000);