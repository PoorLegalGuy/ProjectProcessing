const express = require('express');
const router = express.Router();

const common = require('../common.js');

// 用户登录
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // console.log(req.body);
        const [rows] = await common.pool.query('SELECT a.*, b.roleName FROM users a LEFT JOIN userRole b ON a.roleid = b.roleID WHERE a.username = ?', [username]);
        // console.log(rows);
        if (rows[0]) {
            // 判断用户是否被禁用
            if (rows[0].is_disabled == 1) {
                common.errorCode(res, 401, '用户被禁用');
                return;
            } else {
                // 判断密码是否一致
                const isMatch = await common.bcrypt.compare(password, rows[0].password);
                if (isMatch) {
                    const payload = { uid:rows[0].ID, username: rows[0].username, uemail: rows[0].email, roleid: rows[0].roleid };
                    const u_token = common.jwt.sign(payload, common.secretkey, { expiresIn: '1h' });
                    res.send({ message: '登录成功', u_token: u_token, login_name: rows[0].pname, login_role: rows[0].roleName });
                    // 日志记录用户登录事件
                    common.addLog(rows[0].ID, `用户登录: ${rows[0].username}`, common.getCurrentTime());
                    console.log(`用户 ${rows[0].username} ${rows[0].roleName} 登录成功`);
                } else {
                    common.errorCode(res, 401, '用户名密码错误');
                }
            }
        } else {
            common.errorCode(res, 401, '用户名密码错误');
        }
    } catch (err) {
        console.error(err);
        common.errorCode(res, 500, 'Server error');
    }
});

// 用户注册，并认证是否有注册权限
router.post('/register', async (req, res) => {
    const u_token = req.headers.authorization;
    if (!u_token) {
        common.errorCode(res, 401, '未登录');
        return;
    } else {
        const decoded = common.verifyToken(u_token, common.secretkey);
        if (decoded === 'expired') {
            common.errorCode(res, 401, '登录已过期，请重新登录');
            return;
        } else if (decoded === 'failed') {
            common.errorCode(res, 401, '登录信息错误，请重新登录');
            return;
        } else {
            // console.log(decoded.roleid);
            // console.log(common.checkRole(decoded.roleid, limit_arr));
            if (!common.checkRole(decoded.roleid, [1001])) {
                common.errorCode(res, 403, '权限不足，请联系管理员');
                return;
            } else {
                // console.log(req.body);
                if (req.body.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)) {
                    try {
                        const hpassword = await common.encryptPassword(req.body.password);
                        let roleid = common.roleToRoleid(req.body.urole);
                        const [rows] = await common.pool.query('INSERT INTO users (username, pname, password, email, roleid, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.body.username, req.body.pname, hpassword, req.body.uemail, roleid, common.getCurrentTime(), common.getCurrentTime()]);
                        if (rows.affectedRows === 1) {
                            res.send({ message: '注册成功' });
                            // 日志记录用户注册事件
                            common.addLog(decoded.uid, `注册新用户: ${req.body.username}`, common.getCurrentTime());
                            console.log(`用户 ${req.body.username} 注册成功`);
                        } else {
                            common.errorCode(res, 500, '注册失败');
                        }
                    } catch (err) {
                        console.error(err);
                        if (err.code === 'ER_DUP_ENTRY') {
                            if (err.message.includes('username')) {
                                common.errorCode(res, 400, '用户名已存在');
                            } else if (err.message.includes('email')) {
                                common.errorCode(res, 400, '邮箱已存在');
                            }
                        } else {
                            common.errorCode(res, 500, 'Server error');
                        }
                    }
                } else {
                    common.errorCode(res, 400, '密码不符合要求，密码应不少于8位且包含数字和大小写字母');
                    return;
                }
            }
        }
    }
});

// 获取用户列表
router.get('/list', async (req, res) => {
    const token = req.headers.authorization;
    // console.log(token);
    if (token) {
        const decoded = common.verifyToken(token, common.secretkey);
        // console.log(decoded);
        if (decoded === 'expired') {
            common.errorCode(res, 401, '登录已过期，请重新登录');
            return;
        } else if (decoded === 'failed') {
            common.errorCode(res, 401, '登录信息错误，请重新登录');
            return;
        } else if (common.checkRole(decoded.roleid, [1001])) {
            try {
                const [results] = await common.pool.query('SELECT a.username, a.pname, b.roleName, a.email, a.is_disabled FROM `users` a LEFT JOIN userRole b ON a.roleid = b.roleID WHERE ID != 1');
                if (results.length === 0) {
                    common.errorCode(res, 401, '用户信息获取失败');
                } else if (results.length > 0) {
                    res.send({ message: '用户信息获取成功', userinfo: results });
                    // common.addLog(decoded.uid, `获取用户列表`, common.getCurrentTime());
                }
            } catch (err) {
                console.error(err);
                common.errorCode(res, 500, 'Server error');
            }
        } else {
            common.errorCode(res, 401, '该用户没有权限');
        }
    } else {
        common.errorCode(res, 401, 'token不存在');
    }
});

// 更新用户信息
router.post('/update', async (req, res) => {
    const token = req.headers.authorization;
    if (token) {
        const decoded = common.verifyToken(token, common.secretkey);
        if (decoded === 'expired') {
            common.errorCode(res, 401, '登录已过期，请重新登录');
            return;
        } else if (decoded === 'failed') {
            common.errorCode(res, 401, '登录信息错误，请重新登录');
            return;
        } else if (common.checkRole(decoded.roleid, [1001])) {
            const sql_str = `UPDATE users SET pname = '${req.body.pname}', email = '${req.body.uemail}', roleid = ${common.roleToRoleid(req.body.urole)}, update_time = '${common.getCurrentTime()}', is_disabled = ${req.body.is_disabled} WHERE username = '${req.body.username}'`;
            await common.pool.query(sql_str).then(result => {
                if (result[0].affectedRows === 1) {
                    res.send({ message: '用户信息更新成功' });
                    // 日志记录用户信息更新事件
                    common.addLog(decoded.uid, `${req.body.username} 用户信息更新`, common.getCurrentTime());
                    console.log(`用户 ${req.body.username} 信息更新成功`);
                }
            }).catch(err => {
                console.error(err);
                if (err.code === 'ER_DUP_ENTRY') {
                    if  (err.message.includes('email')) {
                        common.errorCode(res, 400, '邮箱已存在');
                    }
                } else {
                    common.errorCode(res,500, 'Server error');
                }
            });
        } else {
            common.errorCode(res, 401, '该用户没有权限');
        }
    } else {
        common.errorCode(res, 401, 'token不存在');
    }
});

// 管理员重置用户密码
router.post('/admin_reset_password', async (req, res) => {
    // console.log(req.body);
    const token = req.headers.authorization;
    if (token) {
        const decoded = common.verifyToken(token, common.secretkey);
        if (decoded === 'expired') {
            common.errorCode(res, 401, '登录已过期，请重新登录');
            return;
        } else if (decoded === 'failed') {
            common.errorCode(res, 401, '登录信息错误，请重新登录');
            return;
        } else if (common.checkRole(decoded.roleid, [1001]) && req.body.username !== 'admin') {
            if (req.body.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)) {
                try {
                    const hpassword = await common.encryptPassword(req.body.password);
                    // console.log(req.body.password);
                    // console.log(hpassword);
                    const [results] = await common.pool.query('UPDATE users SET password = ?, update_time = ? WHERE username = ?', [hpassword, common.getCurrentTime(), req.body.username]);
                    if (results.affectedRows === 1) {
                        res.send({ message: '用户密码重置成功' });
                        // 日志记录用户密码重置事件
                        common.addLog(decoded.uid, `${req.body.username} 用户密码重置`, common.getCurrentTime());
                        console.log(`用户 ${req.body.username} 密码重置成功`);
                    } else {
                        common.errorCode(res, 500, '用户密码重置失败');
                    }
                } catch (err) {
                    console.error(err);
                    common.errorCode(res, 500, 'Server error');
                }
            } else {
                common.errorCode(res, 400, '密码不符合要求，密码应不少于8位且包含数字和大小写字母');
            }
        } else {
            common.errorCode(res, 401, '该用户没有权限');
        }
    } else {
        common.errorCode(res, 401, 'token不存在');
    }
});

// 用户重置密码
router.post('/user_reset_password', async (req, res) => {
    const token = req.headers.authorization;
    if (token) {
        const decoded = common.verifyToken(token, common.secretkey);
        if (decoded === 'expired') {
            common.errorCode(res, 401, '登录已过期，请重新登录');
            return;
        } else if (decoded === 'failed') {
            common.errorCode(res, 401, '登录信息错误，请重新登录');
            return;
        } else if (common.checkRole(decoded.roleid, [1001,1002,1003])) {
            // 确认原密码是否正确
            const [rows] = await common.pool.query('SELECT * FROM users WHERE ID = ?', [decoded.uid]);
            if (rows.length > 0) {
                const isMatch = await common.bcrypt.compare(req.body.original_password, rows[0].password);;
                if (isMatch) {
                    if (req.body.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)) {
                        try {
                            const hpassword = await common.encryptPassword(req.body.password);
                            const [results] = await common.pool.query('UPDATE users SET password = ?, update_time = ? WHERE username = ?', [hpassword, common.getCurrentTime(), decoded.username]);
                            if (results.affectedRows === 1) {
                                res.send({ message: '用户密码重置成功' });
                                common.addLog(decoded.uid, `${decoded.username} 用户密码重置`, common.getCurrentTime());
                                console.log(`用户 ${decoded.username} 密码重置成功`);
                            } else {
                                res.send({ message: '用户密码重置失败' });
                                console.log(`用户 ${decoded.username} 密码重置失败`);
                            }
                        } catch (err) {
                            console.error(err);
                            common.errorCode(res, 500, 'Server error');
                        }
                    } else {
                        common.errorCode(res, 400, '密码不符合要求，密码应不少于8位且包含数字和大小写字母');
                    }
                } else {
                    common.errorCode(res,401, '原密码错误，请重新输入');
                }
            } else {
                common.errorCode(res, 400, '用户不存在');
            }
        }
    }
});

// 删除用户
router.post('/delete', async (req, res) => {
    const token = req.headers.authorization;
    if (token) {
        const decoded = common.verifyToken(token, common.secretkey);
        if (decoded === 'expired') {
            common.errorCode(res, 401, '登录已过期，请重新登录');
            return;
        } else if (decoded === 'failed') {
            common.errorCode(res, 401, '登录信息错误，请重新登录');
            return;
        } else if (req.body.username === decoded.username) {
            common.errorCode(res, 401, '不能删除自己的账号');
        } else if (common.checkRole(decoded.roleid, [1001]) && req.body.username !== 'admin') {
            try {
                const [del_results] = await common.pool.query('DELETE FROM users WHERE username = ?', [req.body.username]);
                if (del_results.affectedRows === 1) {
                    res.send({ message: '用户删除成功' });
                    // 日志记录用户删除事件
                    common.addLog(decoded.uid, `删除用户: ${req.body.username}`, common.getCurrentTime());
                    console.log(`用户 ${req.body.username} 删除成功`);
                } else {
                    common.errorCode(res, 500, '用户删除失败');
                }
            } catch (err) {
                console.error(err);
                common.errorCode(res, 500, 'Server error');
            }
        } else {
            common.errorCode(res, 401, '该用户没有权限');
        }
    } else {
        common.errorCode(res, 401, 'token不存在');
    }
});


module.exports = router;