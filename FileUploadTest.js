var formidable = require('formidable');
var http = require('http'),
    util = require('util'),
    fs = require('fs'),
    url = require('url');

http.createServer(function (req, res) {
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
    	storeAndMoveFile(req, res);
    }
}).listen(8080);

function storeAndMoveFile(req, res){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		console.log(files);
		res.write('File uploaded!');
		res.end();
	});
}