/*
*@autor: Sebastiao Lucio (http://www.rio3dstudios.com)
*@description:  java script file that works as master server of the Unity Basic Web Request Pro

*@data: 27/09/19
*/

// Dependencies
var express  = require('express');//import express NodeJS framework module
var app      = express();// create an object of the express module
var http     = require('http').Server(app);// create a http web server using the http library
var formidable = require('formidable');// util para receber Content-Type - multipart/form-data
var fs = require('fs');

//reference the file dbmodel.js contained in the paste Database in the variable dbmodel
var dbmodel = require('./Database/dbmodel');

//open a connection with the database through the file:	./Database/dbmodel			
dbmodel.connect(function (err_connect) {

 console.log('---- connected to mysql server ------')
});


app.use(express.static(__dirname+'/public'));

app.use('/images', express.static(__dirname + '/images'));

app.get('/', function(req, res) {

  res.send('Hello World')//Sending Messages back to unity. (take a look in unity: httpRequestClient.On ("ANSWER", OnReceiveServerAnswer)
})

// receives a POST request from the GetAllUsers () function of the Unity GetUsersManager.cs class
app.post('/getusers', function(req, res) {


    //load from database, all users of the game
	dbmodel.GetAllUser(function (err, _rows) {
            
        if (err) { console.error(err); }
        var answer = "";
		
		for(j in _rows)
		{			  
		 // JSON pack
		 var json_pack = {
			id:_rows[j].id,
		    email:_rows[j].email,
			pass:_rows[j].pass
			
			};
          
		  answer = answer+JSON.stringify(json_pack).toString()+'*';//set the * character as a separator for each json record that will be sent to unity
		 
		};//END_FOR
	
   	   res.end(answer);//Sending Messages back to unity. (take a look in unity: httpRequestClient.On ("ANSWER", OnReceiveServerAnswer)
		
    });//END_dbmodel.GetAllUser
  
  
})//END_APP.GET

//receives a GET request from the GetLeaderBoard () function of the Unity GetBestUsersManager.cs class
app.get('/getbestsers', function(req, res) {


    //load top 10 players by database 
	dbmodel.GetBestUsers(function (err, _rows) {
            
        if (err) { console.error(err); }
        var answer = "";
		var i = 0;
		for(j in _rows)
		{
          i = i+1;	
		 // JSON pack
		 var json_pack = {
			id:_rows[j].id,
		    email:_rows[j].email,
			points:_rows[j].points,
			ranking: i
			
			};
          
		  answer = answer+JSON.stringify(json_pack).toString()+'*';//set the * character as a separator for each json record that will be sent to unity
		 
		};//END_FOR
	
   	   res.end(answer);//Sending Messages back to unity. (take a look in unity: httpRequestClient.On ("ANSWER", OnReceiveServerAnswer)
		
    });//END_dbmodel.GetAllUser
  
  
})//END_APP.GET

//receives a POST request from the SendSignUp () function of the Unity SignUpManager.cs class
app.post('/SignUp', function(req, res){

   
   var form = new formidable.IncomingForm();
   
   var result = "";
   
   var json_pack;
   
   // parse a multipart/form-data
   //The fields variable stores the parameters sent via POST through unity.
   form.parse(req, function(err, fields, files) {
  
    //Search the database for a user, using the email field.
    dbmodel.searchUser(fields.email, function (err, rows) {
        
		//if there is already a user with the same email, we do not add in the bank
        if (rows.length > 0) {
		
         
			result = "that usrname is taken go back and choose another one";
			
			console.log("result:"+result);
			
            res.end(result);//Sending Messages back to unity. (take a look in unity: httpRequestClient.On ("ANSWER", OnReceiveServerAnswer)
        }
		else
		{
		   //adiciona no banco de dados um novo usuário
		   dbmodel.addUser(fields.email, fields.pass,fields.points, function (err, json_pack) {
             
			 if (err) {

			 console.error(err); 
			 
			 res.end(err);//Sending Messages back to unity. (take a look in unity: httpRequestClient.On ("ANSWER", OnReceiveServerAnswer)
			 
			 }
           
		     else 
		    {
				   
              result = "successfully registered user! ";
			  console.log("result:"+result);
              res.end(result);//Sending Messages back to unity. (take a look in unity: httpRequestClient.On ("ANSWER", OnReceiveServerAnswer))
					
            }
          });//END_DBMODEL.ADDUSER
			
        }//END_ELSE
		
		

    });//END_DBMODEL.SEARCHUSER
	  

    });//END_FORM.PARSE
	

})//END_app.post('/SignUp')

//receives a POST request from the SendSignIn () function of the Unity LoginManager.cs class
app.post('/login', function(req, res){

  
   var form = new formidable.IncomingForm();
   
   var result = false;
   
    // parse a multipart/form-data
   // The fields variable stores the parameters sent via POST through unity.
   form.parse(req, function(err, fields, files) {
  
    //check user's email and password match
    dbmodel.verifyUser(fields.email, fields.pass, function (result) {
                
	   //check database search result
       if (result == true) {
	   
	       console.log("user logged");
	       res.end("true");//Sending Messages back to unity. (take a look in unity: httpRequestClient.On ("ANSWER", OnReceiveServerAnswer))
	
	   }
	   else
	   {
	      console.log("wrong login or pass!");
	      res.end("false");//Sending Messages back to unity. (take a look in unity:httpRequestClient.On ("ANSWER", OnReceiveServerAnswer))
	   }
	   
	});//END_DBMODEL.VERIFYUSER

    });//END_FORM.PARSE
	
  
})//END_app.post('/login')


//receives a POST request from the SendEditUser () function of the Unity EditUserManager.cs class
app.post('/edituser', function(req, res){

   
   var form = new formidable.IncomingForm();
   
   var result = false;
   
    // parse a multipart/form-data
   // The fields variable stores the parameters sent via POST through unity.
   form.parse(req, function(err, fields, files) {
  
   
    // update user data in database
    dbmodel.UpdateUser(fields.id,fields.email, fields.pass, function (result) {
                
	   //verifica resultado da busca no banco de dados
       if (result == true) {
	   
	       console.log(" updated!");
	       res.end(" updated!");//Sending Messages back to unity. (take a look in unity:httpRequestClient.On ("ANSWER", OnReceiveServerAnswer))
	
	   }
	   else
	   {
	      console.log("error");
	      res.end("Error");//Sending Messages back to unity. (take a look in unity:httpRequestClient.On ("ANSWER", OnReceiveServerAnswer))
	   }
	   
	});//END_DBMODEL.VERIFYUSER

    });//END_FORM.PARSE
	
  
})//END_app.post('/edituser')


//receives a POST request from the SendDeleteUser () function of Unity's DeleteUserManager.cs class
app.post('/deleteuser', function(req, res){

   
   var form = new formidable.IncomingForm();
   
   var result = false;
   
    // parse a multipart/form-data
   // The fields variable stores the parameters sent via POST through unity.
   form.parse(req, function(err, fields, files) {
  
    //delete a database user
    dbmodel.DeleteUser(fields.id, function (result) {
                
	  
       if (result == true) {
	   
	       console.log("user deleted successfully!");
	       res.end("user deleted successfully!");//Sending Messages back to unity. (take a look in unity:httpRequestClient.On ("ANSWER", OnReceiveServerAnswer))
	
	   }
	   else
	   {
	      console.log("error");
	      res.end("Error");//Sending Messages back to unity. (take a look in unity:httpRequestClient.On ("ANSWER", OnReceiveServerAnswer))
	   }
	   
	});//END_DBMODEL.VERIFYUSER

    });//END_FORM.PARSE
	
  
})//END_app.post('/edituser')


//receives a POST request from the SendEditUser () function of the Unity EditUserManager.cs class
app.post('/uploadImg', function(req, res){

   
   var form = new formidable.IncomingForm();
   
   var result = false;
   
    // parse a multipart/form-data
   // The fields variable stores the parameters sent via POST through unity.
   form.parse(req, function(err, fields, files) {
  
    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
    var bitmap = new Buffer(fields.myImageData, 'base64');
	
    // write buffer to file
    fs.writeFileSync( 'uploadImg.jpg', bitmap);
    console.log('******** File created from base64 encoded string ********');
    res.end('******** File created from base64 encoded string ********');
   
   });
   
   
   
   })//END_app.post('/uploadImg')

   

//receives a POST request from the SendEditUser () function of the Unity EditUserManager.cs class
app.post('/uploadFile', function(req, res){

   
  
   var form = new formidable.IncomingForm();
 
    // parse a multipart/form-data
   // The fields variable stores the parameters sent via POST through unity.
   form.parse(req, function(err, fields, files) {
  
    //console.log(files);
    res.end('upload complete!');
   
   });
 
   
   
   
   })//END_app.post('/uploadImg')



//make the server listen on port 3000
http.listen(process.env.PORT ||3000, function(){
	console.log('listening on *:3000');
});
 
console.log("------- server is running -------");