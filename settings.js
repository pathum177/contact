const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });
function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {

SESSION_ID: process.env.SESSION_ID === undefined ? 'KSMD~2oQ0GJQI#FsUeb8W2XqDNmPLBGHEl72Nbp1jibY5ea-ssNJPSJrI' : process.env.SESSION_ID,
PREFIX: process.env.PREFIX || '.' ,
MODE: process.env.MODE === undefined ?"groups" : process.env.MODE,
AUTO_READ_STATUS: process.env.AUTO_READ_STATUS === undefined ?"true" : process.env.AUTO_READ_STATUS
};
