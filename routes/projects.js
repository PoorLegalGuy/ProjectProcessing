const express = require('express');
const router = express.Router();

const common = require('../common.js');

// 获取项目列表
router.get('/list', async (req, res) => {
    const token = req.headers.authorization;
    // console.log(token)
    if (token) {
        const decoded = common.verifyToken(token, common.secretkey);
        // console.log(decoded);
        if (decoded === 'expired') {
            common.errorCode(res, 401, '登录已过期，请重新登录');
            return;
        } else if (decoded === 'failed') {
            common.errorCode(res, 401, '登录信息错误，请重新登录');
            return;
        } else if (common.checkRole(decoded.roleid, [1001,1002,1003])) {
            let queryString = '';
            if (decoded.roleid === 1001) {
                queryString = 'SELECT a.*, b.pname FROM projects a LEFT JOIN users b ON a.manager_id=b.ID ORDER BY start_date DESC';
            } else if (decoded.roleid === 1002) {
                queryString = `SELECT a.*, b.pname FROM projects a LEFT JOIN users b ON a.manager_id=b.ID WHERE a.manager_id=${decoded.uid} ORDER BY start_date DESC`;
            } else if (common.checkRole(decoded.roleid, [1003])) {
                queryString = `SELECT a.*, b.pname FROM projects a LEFT JOIN users b ON a.manager_id=b.ID WHERE project_id IN (SELECT DISTINCT project_id FROM tasks WHERE assigned_to = ${decoded.uid}) ORDER BY start_date DESC`;
            }
            await common.pool.query(queryString).then(result => {
                if (result[0].length > 0) {
                    res.send({ message: '查询成功', data: result[0] })
                    // common.addLog(decoded.uid, `查询项目列表`, common.getCurrentTime());
                } else {
                    const p_data = [];
                    p_data[0] = { project_id: '', project_name: '', start_date: '', end_date: '', description: '',status: '', manager_id: '', pname: ''};
                    res.send({ message: '查询成功，无数据', data: p_data })
                }
            }).catch(error => {
                console.error(error);
                common.errorCode(res, 500, 'Server error');
            })
        } else {
            common.errorCode(res, 401, '该用户没有权限');
        }
    } else {
        common.errorCode(res, 401, 'token不存在');
    }
})

// 新增项目
router.post('/add', async (req, res) => {
    const token = req.headers.authorization;
    if (token) {
        const decoded = common.verifyToken(token, common.secretkey);
        if (decoded === 'expired') {
            common.errorCode(res, 401, '登录已过期，请重新登录');
            return;
        } else if (decoded === 'failed') {
            common.errorCode(res, 401, '登录信息错误，请重新登录');
            return;
        } else if (common.checkRole(decoded.roleid, [1002])) {
            const sql_str = `INSERT INTO projects (project_name, start_date, end_date, description, status, manager_id) VALUES ('${req.body.project_name}', '${req.body.start_date}', '${req.body.end_date}', '${req.body.description}', '${req.body.status}', '${decoded.uid}')`;
            await common.pool.query(sql_str).then(result => {
                if (result.affectedRows > 0) {
                    res.send({ message: '项目添加成功' })
                    common.addLog(decoded.uid, `新增项目：${req.body.project_name}`, common.getCurrentTime());
                } else {
                    res.send({ message: '项目添加失败' })
                }
            }).catch(error => {
                console.error(error);
                common.errorCode(res, 500, 'Server error');
            })
        } else {
            common.errorCode(res, 401, '该用户没有权限');
        }
    } else {
        common.errorCode(res, 401, 'token不存在');
    }
})

// 获取项目详情
router.post('/editForm', async (req, res) => {
    const token = req.headers.authorization;
    if (token) {
        const decoded = common.verifyToken(token, common.secretkey);
        if (decoded === 'expired') {
            common.errorCode(res, 401, '登录已过期，请重新登录');
            return;
        } else if (decoded === 'failed') {
            common.errorCode(res, 401, '登录信息错误，请重新登录');
            return;
        } else if (common.checkRole(decoded.roleid, [1002])) {
            const sql_str = `SELECT a.*, b.pname FROM projects a LEFT JOIN users b ON a.manager_id=b.ID WHERE a.project_id = ${req.body.project_id}`;
            await common.pool.query(sql_str).then(result => {
                if (result[0].length > 0) {
                    res.send({ message: '查询成功', data: result[0][0] })
                    common.addLog(decoded.uid, `查询项目详情：${result[0][0].project_name}`, common.getCurrentTime());
                } else {
                    res.send({ message: '查询失败' })
                }
            }).catch(error => {
                console.error(error);
                common.errorCode(res, 500, 'Server error');
            })
        } else {
            common.errorCode(res, 401, '该用户没有权限');
        }
    } else {
        common.errorCode(res, 401, 'token不存在');
    }
})

// 更新项目详情
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
        } else if (common.checkRole(decoded.roleid, [1002])) {
            const sql_str = `UPDATE projects SET project_name='${req.body.project_name}', start_date='${req.body.start_date}', end_date='${req.body.end_date}', description='${req.body.description}', status='${req.body.status}' WHERE project_id=${req.body.project_id}`;
            await common.pool.query(sql_str).then(result => {
                if (result.affectedRows > 0) {
                    res.send({ message: '项目更新成功' })
                    common.addLog(decoded.uid, `更新项目：${req.body.project_name}`, common.getCurrentTime());
                } else {
                    res.send({ message: '项目更新失败' })
               }
            }).catch(error => {
                console.error(error);
                common.errorCode(res, 500, 'Server error');
            })
        }
    } else {
        common.errorCode(res, 401, 'token不存在');
    }
})

// 删除项目
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
        } else if (common.checkRole(decoded.roleid, [1002])) {
            const sql_str = `DELETE FROM projects WHERE project_id=${req.body.project_id}`;
            await common.pool.query(sql_str).then(result => {
                if (result.affectedRows > 0) {
                    res.send({ message: '项目删除成功' })
                    common.addLog(decoded.uid, `删除项目：${req.body.project_name}`,common.getCurrentTime());
                } else {
                    res.send({ message: '项目不存在' })
               }
            }).catch(error => {
                console.error(error);
                common.errorCode(res, 500, 'Server error');
            })
        }
    } else {
        common.errorCode(res, 401, 'token不存在');
    }
})

router.post('/details', async (req, res) => {
    const token = req.headers.authorization;
    if (token) {
        const decoded = common.verifyToken(token, common.secretkey);
        if (decoded === 'expired') {
            common.errorCode(res, 401, '登录已过期，请重新登录');
            return;
        } else if (decoded === 'failed') {
            common.errorCode(res, 401, '登录信息错误，请重新登录');
            return;
        } else if (common.checkRole(decoded.roleid, [1002,1003])) {
            let arr = [];
            const sql_str1 = `SELECT task_id, task_name, start_date, end_date, com_percent FROM tasks WHERE project_id=${req.body.project_id}`;
            await common.pool.query(sql_str1).then(async(result) => {
                if (result[0].length > 0) {
                    arr = result[0];
                    for (let i = 0; i < arr.length; i++) {
                        const sql_str2 = `SELECT pre_task_id FROM pre_task WHERE task_id=${arr[i].task_id}`;
                        await common.pool.query(sql_str2).then(pre_tid => {
                            if (pre_tid[0].length > 0) {
                                let pre_tid_arr = [];
                                for (let j = 0; j < pre_tid[0].length; j++) {
                                    pre_tid_arr.push(pre_tid[0][j].pre_task_id);
                                }
                                let pre_tid_str = pre_tid_arr.join(',');
                                arr[i].pre_task = pre_tid_str;
                            } else {
                                arr[i].pre_task = null;
                            }
                        });
                    }
                    console.log(arr);
                    res.send({ code: 200, data: arr })
                } else {
                    common.errorCode(res, 404, '该项目未添加任务');
                }
            }).catch(error => {
                console.error(error);
                common.errorCode(res, 500, 'Server error');
            })
        } else {
            common.errorCode(res, 401, '该用户没有权限');
        }
    } else {
        common.errorCode(res, 401, 'token不存在');
    }
})

router.post('/get_task_com', async (req, res) => {
    const token = req.headers.authorization;
    if (token) {
        const decoded = common.verifyToken(token, common.secretkey);
        if (decoded === 'expired') {
            common.errorCode(res, 401, '登录已过期，请重新登录');
            return;
        } else if (decoded === 'failed') {
            common.errorCode(res, 401, '登录信息错误，请重新登录');
            return;
        } else if (common.checkRole(decoded.roleid, [1002,1003])) {
            const sql_str = `SELECT d.project_name, a.task_id, a.task_name, a.start_date, a.end_date, a.status, b.task_id AS task_id_com, b.description, c.pname FROM tasks a LEFT JOIN task_completion b ON a.task_id=b.task_id LEFT JOIN users c ON a.assigned_to=c.ID LEFT JOIN projects d ON a.project_id=d.project_id where a.project_id=${req.body.project_id} ORDER BY a.task_id DESC`;
            await common.pool.query(sql_str).then(result => {
                if (result[0].length > 0) {
                    res.send({ code: 200, data: result[0] })
                } else {
                    common.errorCode(res, 404, '该项目未添加任务');
                }
            }).catch(error => {
                console.error(error);
                common.errorCode(res, 500, 'Server error');
            })
        } else {
            common.errorCode(res, 401, '该用户没有权限');
        }
    } else {
        common.errorCode(res, 401, 'token不存在');
    }
})


module.exports = router;