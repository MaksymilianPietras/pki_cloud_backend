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

const addUser = async (userLogin) => {
    const thisUser = await findUser(userLogin)


    if (thisUser !== null){
        pool.query(`UPDATE users SET lastvisit = $1, counter = $2 WHERE name = $3`, 
        [new Date().toISOString(), thisUser.counter + 1, userLogin], (error, res) => {
            if (error) {
                console.error('Error updating user:', error);
            } else {
            console.log('User updated added successfully.');
            }
        });
    } else {
        pool.query('INSERT INTO users (name, joined, lastvisit, counter) VALUES ($1, $2, $3, $4)',
        [userLogin, new Date().toISOString(), new Date().toISOString(), 1], (error, res) => {
            if (error) {
                console.error('Error inserting new user:', error);
            } else {
                console.log('New user added successfully.');
            }
        });
    }
    
};

const findUser = async (username) => {
    try {
        const queryResult = await pool.query('SELECT * FROM users WHERE name = $1', [username]);
        return queryResult.rows[0] || null;
    } catch (error) {
        console.error('Error finding user:', error);
        return null;
    }
}

module.exports = { getUsers, addUser, findUser };
