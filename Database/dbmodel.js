function dbmodel() {

    this.version = '0.0.1';
    var db = null;
    var mysql = require('mysql');
    var config = {
        host : '127.0.0.1',
        user : 'root',
        password : '',
        database : 'unitydb',
    }

    this.connect = function (callback){
        var localTime = new Date();
		console.log(localTime.toLocaleTimeString());
		 db = mysql.createConnection(process.env.DATABASE_URL ||config);
       
        db.connect(function (err) {
            
            if (err) {
                console.error('error connecting myslq :' + err);
                return;
            }
            
            console.log('Connected at database ' + config.database);

            callback(err);
        });

    };
    
    this.addUser = function (email, pass,points, callback) {

        db.query("INSERT INTO users ( `email`, `pass`,`points`) VALUES (?,?,?)",[email,pass,points], function (err, data) {
            if (err) { console.error(err); }
            
            callback(err, data);
        });

    };

    this.GetAllUser = function (callback) {

        var sql = 'select * from users';

        db.query(sql, function (err, data) {
            if (err) { console.error(err); }

            callback(err, data);
        });
    };


    this.searchUser = function (user, callback) {
        db.query('SELECT email FROM users WHERE email like ?','%' + user + '%', function(err, data) {

            if (err) { console.error(err); }
           
            callback(err, data);
        });

    };

    this.loadUser = function (email, callback) {

        db.query('SELECT * FROM users WHERE email = ?',[email], function (err, rows) {

            if(err){ console.error(err);}
            callback(err, rows);
        });

    };

	
	
  /*function to check if there is already a user with the same email in the database*/
	this.verifyUser = function(email,_pass,callback)
    {
	    var sql = "SELECT * FROM users WHERE email =" + mysql.escape(email)+"AND pass ="+mysql.escape(_pass);
		db.query(sql, function (err, rows) {

            if(err){ console.error(err);}
			
			if (rows[0]) {
			   callback(true);
			}
			else
			{
			  callback(false);
			}
			
        });
		
    };
	
	
	
	this.UpdateUser  = function (id,_email, _pass, callback) {
	  
	  var dataUpdate = {

            email : _email,
			pass: _pass
        }
		 db.query("UPDATE users set ? WHERE id = ? ",[dataUpdate,id], function (err, data) {
            
            if (err) { console.error(err); 
			 callback(false);
			}
            
			 callback(true);
           
        });
		
	};
	
	
	this.DeleteUser  = function (id, callback) {
	  
	  
		 db.query("DELETE FROM users WHERE id = ?",[id], function (err, data) {
            
            if (err) { console.error(err); 
			 callback(false);
			}
            
			 callback(true);
           
        });
		
	};
	
	
	this.GetBestUsers = function (callback) {

        db.query('SELECT * FROM users ORDER BY points DESC  LIMIT 10', function (err, rows) {

            if(err){ console.error(err);}

            callback(err, rows);
        });

    };

}//END_DBMODEL
module.exports = new dbmodel;

