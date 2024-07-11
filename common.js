const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

// ES6获取当前时间function
const getCurrentTime = () => {
    const now = new Date(),
    year = now.getFullYear(),
    month = String(now.getMonth() + 1).padStart(2, '0'),
    day = String(now.getDate()).padStart(2, '0'),
    hours = String(now.getHours()).padStart(2, '0'),
    minutes = String(now.getMinutes()).padStart(2, '0'),
    seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 加密function
const encryptPassword = async (password) => {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    try {
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        console.log(error);
    }
}

// 验证用户u_token，输出roleid的function
const secretkey = process.env.SECRET_KEY;
const verifyToken = (token, secretkey) => {
    const decoded = jwt.verify(token, secretkey, (err, decoded) => {
        if (err) {
            console.log(err);
            if (err.name === 'TokenExpiredError') {
                return 'expired';
            } else {
                return 'failed';
            }
        } else {
            return decoded;
        };
    });
    return decoded;
}

// 根据roelid判断角色权限function
const checkRole = (roleid, limit_arr) => {
    if (limit_arr.includes(roleid)) {
        return true;
    } else {
        return false;
    }
}

// roleid转换function
const roleToRoleid = (role) => {
    switch (role) {
        case 'admin':
            return 1001;
        case 'project_manager':
            return 1002;
        case 'project_member':
            return 1003;
        default:
            return 'error role';
    }
}

// 日志记录function
const addLog = async (userID, details, event_time) => {
    try {
        const sql = `INSERT INTO sys_log (userID, details, event_time) VALUES (?, ?, ?)`;
        const values = [userID, details, event_time];
        await pool.query(sql, values);
    } catch (error) {
        console.log(error);
    }
    return;
}

// 错误代码返回function
const errorCode = (res, errorCode, message) => {
    res.status(errorCode).send({ message: message });
}


// 数据库连接配置
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

module.exports = {
    jwt,
    bcrypt,
    getCurrentTime,
    encryptPassword,
    verifyToken,
    checkRole,
    roleToRoleid,
    addLog,
    errorCode,
    pool,
    secretkey
}