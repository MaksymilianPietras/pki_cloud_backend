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

const getUsers = async () => {
    console.log('Pobieram dane ...');
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM users', (error, res) => {
            if (error) {
                return reject(error);
            }
            console.log('Dostałem ...');
            resolve(res.rows);
        });
    });
};

const addUser = async (req, res) => {
    const users = await getUsers()
    console.log(req)
};

module.exports = { getUsers, addUser };
