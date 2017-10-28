/* sets up mysql database for use by web app
 * should only be run once during initial install
 * will prompt user for mysql root creds */
var mysql = require('mysql');
var getLine = require('./getLine');
var user, pass;
const host = 'localhost';
const node_user = 'node_donut', node_pass = 'donut';
const schema = 'donut_app';
// export constants for use elsewhere
exports.db_host = host;
exports.db_user = node_user;
exports.db_pass = node_pass;
exports.db_schema = schema;
// get root creds from user (stdin)
if (require.main === module) { // don't run this if called by requre()
console.log("Enter MySQL root username: ");
getLine(function (line){
    user = line;
    console.log(`Enter MySQL pass for ${user}: `);
    getLine(function (line2){
        pass = line2;
        setup_db();
    });
});
}
//does the setup queries -- needs to wait on creds from user
function setup_db(){
    var conn = mysql.createConnection({
        host : host,
        user : user,
        password : pass,
        multipleStatements: true
    });
    conn.connect();
    // create schema and user, and grant privileges to user
    // then create a table to store stats
    var query = `CREATE SCHEMA ${schema};` +
        `CREATE USER ${node_user}@${host} IDENTIFIED BY '${node_pass}';` +
        `GRANT ALL ON ${schema}.* TO ${node_user}@${host};`;
    query += `CREATE TABLE ${schema}.Request ( ` +
        "`id` int(11) NOT NULL AUTO_INCREMENT," +
        "`Url` varchar(255) NOT NULL," +
        "`ClientIp` varchar(50) NOT NULL," +
        "`RequestTime` varchar(45) NOT NULL," +
        "PRIMARY KEY (`id`)," +
        "KEY `IP` (`ClientIp`)," +
        "KEY `TIME` (`RequestTime`)" +
        ") ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;";
    
    conn.query(query, function(err){
        if (err) console.error(err);
        else console.log("Setup done!");
        process.exit();
    });
}
