var http = require('http'),
    util = require('util'),
    fs = require('fs'),
    url = require('url');
var qs = require('querystring');
var mc = require('mongodb').MongoClient;
var dbUrl = "mongodb://localhost:27017/mydb";


var server = http.createServer(function (req,res){
                            
    var url_parts = url.parse(req.url,true);
    console.log(url_parts);
	//checks the url is just http://localhost:8080
    if(url_parts.pathname == '/'){
    	fs.readFile('./form.html',function(error,data){ 
    		res.end(data);    
    	});
    }

    //check for form submit URL
    else if (url_parts.pathname == '/getFormData'){
    	console.log('Form data received');
    	getFormData(req, res, url_parts);
    }
 
});

server.listen(8080);
console.log('Server listenning at localhost:8080'); 

function getFormData(req, res, url_parts){
	var body = '';
	if(req.method === 'POST'){
		console.log('Request found with POST method');     
		req.on('data', function (data) {
			body += data;
			console.log('got data:'+data);
		});
	}
	req.on('end', function () {
		var POST = qs.parse(body);
		storeData(POST);
		res.end("Sent data are name:"+POST.fullname+" email:"+POST.email);
	});
}

function storeData(postData){
	//store file 
	file = postData.resume;
	saveFile(file);
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

function saveFile(file){
	fs.writeFile('test.pdf', file, 'binary', function(err){
		if (err) return console.log(err);
	});
	console.log('File saved');
}