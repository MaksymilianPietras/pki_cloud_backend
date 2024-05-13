const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();
 
const pool = new Pool({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT,
            ssl: {
                rejectUnauthorized: false,
            }
        });

const getUsers = (request, response) => { 
    console.log('Pobieram dane ...'); 
    pool.query('SELECT * FROM users', (error, res) => { 
        if (error) { 
            throw error
        } 
        console.log('Dostałem ...'); 
        for (let row of res.rows) { 
            console.log(JSON.stringify(row)); 
        } 
    }) 
} 

module.exports = { getUsers };
