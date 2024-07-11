const bcrypt = require('bcrypt');
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

const args = process.argv.slice(2);
const set_pwd = async (args) => {
    if (args.length > 0) {
        const inputString = args[0];
        const hashpwd = await encryptPassword(inputString)
        console.log(`hashpwd: ${hashpwd}`);
    } else {
        console.log("没有接收到任何参数，请输入一个字符串作为参数。");
    }
}

set_pwd(args);

// 使用例子：node set_pwd.js 123456