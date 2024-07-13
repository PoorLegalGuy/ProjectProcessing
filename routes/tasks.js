const express = require('express');
const router = express.Router();

const common = require('../common.js');

router.get('/project_list', async (req, res) => {
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
            let sql_str = '';
            switch (decoded.roleid) {
                case 1001:
                    // 查询所有项目列表
                    sql_str = `SELECT a.*, b.pname FROM projects a LEFT JOIN users b ON a.manager_id=b.ID ORDER BY a.start_date DESC`;
                    break;
                case 1002:
                    // 查询仅属于自己的项目列表
                    sql_str = `SELECT a.*, b.pname FROM projects a LEFT JOIN users b ON a.manager_id=b.ID WHERE a.manager_id = ${decoded.uid} ORDER BY a.start_date DESC`;
                    break;
                case 1003:
                    // 查询被指派任务的项目列表
                    const [result] = await common.pool.query(`SELECT * FROM tasks WHERE assigned_to = ${decoded.uid}`);
                    let project_id_list = [];
                    result.forEach(item => {
                        if (!project_id_list.includes(item.project_id)) {
                            project_id_list.push(item.project_id);
                        }
                    });
                    // console.log(project_id_list);
                    sql_str = `SELECT a.*, b.pname FROM projects a LEFT JOIN users b ON a.manager_id=b.ID WHERE a.project_id IN (${project_id_list.length === 0 ? null : project_id_list.join(',')}) ORDER BY a.start_date DESC`;
                    break;
            }
            await common.pool.query(sql_str).then(result => {
                console.log(result[0]);
                let msg = '';
                if (result[0].length === 0) {
                    let statusCode = '';
                    if (decoded.roleid === 1001 || decoded.roleid === 1002) {
                        statusCode = 201;
                        msg = '没有找到项目';
                    } else if (decoded.roleid === 1003) {
                        statusCode = 202;
                        msg = '尚未分配任务给该用户';
                    }
                    res.send({ code: statusCode, urole: decoded.roleid, message: msg, result: [] });
                    return;
                } else {
                    res.send({ code: 200, urole: decoded.roleid, message: msg, result: result[0] });
                    return;
                }
            }).catch(err => {
                console.error(err);
            });
        } else {
            common.errorCode(res, 401, '该用户没有权限');
            return;
        }
    } else {
        common.errorCode(res, 401, 'token不存在');
    }
});

router.post('/task_list', async (req, res) => {
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
            const sql_str = `SELECT a.*, b.pname, c.project_name FROM tasks a LEFT JOIN users b ON a.assigned_to=b.ID LEFT JOIN projects c ON a.project_id=c.project_id WHERE a.project_id = ${req.body.project_id}`;
            await common.pool.query(sql_str).then(result => {
                // console.log(result[0])
                if (result.length[0] === 0) {
                    res.send({ code: 201, message: '该项目暂未添加任务', result: [] });
                    return;
                } else {
                    res.send({ code: 200, result: result[0] });
                    return;
                }
            }).catch(err => {
                console.error(err);
            });
        } else {
            common.errorCode(res, 401, '该用户没有权限');
        }
    } else {
        common.errorCode(res, 401, 'token不存在');
    }
})

router.get('/user_list', async (req, res) => {
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
            const sql_str = 'SELECT ID, pname FROM users WHERE roleid = 1003 AND is_disabled = 0'; // 查询可分配为任务负责人的用户
            await common.pool.query(sql_str).then(result => {
                // console.log(result[0]);
                if (result[0].length === 0) {
                    common.errorCode(res, 404, '未添加项目成员用户');
                    return;
                } else {
                    res.send({ code: 200, result: result[0] });
                    return;
                }
            }).catch(err => {
                console.error(err);
            })
        } else {
            common.errorCode(res, 401, '该用户没有权限');
        }
    } else {
        common.errorCode(res, 401, '该用户没有权限');
    }
})

router.post('/add_task', async (req, res) => {
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
            if (req.body.com_percent > 100) {
                req.body.com_percent = 100;
            } else if (req.body.com_percent < 0) {
                req.body.com_percent = 0;
            }
            if (req.body.start_date > req.body.end_date) {
                common.errorCode(res, 400, '开始日期不能大于结束日期');
                return;
            } else {
                let insertId = '';
                const sql_str = `INSERT INTO tasks (task_name, description, assigned_to, project_id, start_date, end_date, status, com_percent) VALUES ('${req.body.task_name}', '${req.body.description}', ${req.body.assigned_to}, ${req.body.project_id}, '${req.body.start_date}', '${req.body.end_date}', '${req.body.status}', '${req.body.com_percent}')`;
                await common.pool.query(sql_str).then(result => {
                    // console.log(result[0]);
                    if (result[0].affectedRows === 1) {
                        insertId = result[0].insertId;
                        return;
                    } else {
                        return;
                    }
                }).catch(err => {
                    console.error(err);
                });
                if (insertId !== '') {
                    const pre_taskid_list = req.body.pre_taskid_list;
                    console.log(pre_taskid_list);
                    if (pre_taskid_list.length > 0) {
                        let sql_status = 1;
                        pre_taskid_list.forEach(async item => {
                            const sql_str2 = `INSERT INTO pre_task (task_id, pre_task_id) VALUES (${insertId}, ${item})`;
                            await common.pool.query(sql_str2).then(result => {
                                console.log(result[0]);
                                if (result[0].affectedRows === 1) {
                                    return;
                                } else {
                                    sql_status = 0;
                                    return;
                                }
                            }).catch(err => {
                                console.error(err);
                            });
                        });
                        if (sql_status === 1) {
                            res.send({ code: 200, message: '添加任务成功' });
                            common.addLog(decoded.uid, `添加任务：${req.body.task_name}`, common.getCurrentTime()); // 添加日志
                        } else {
                            return;
                        }
                    } else {
                        res.send({ code: 200, message: '添加任务成功' });
                        common.addLog(decoded.uid, `添加任务：${req.body.task_name}`, common.getCurrentTime());
                    }
                } else {
                    common.errorCode(res, 500, '添加任务失败');
                }
            }
        } else {
            common.errorCode(res, 401, '该用户没有权限');
        }
    } else {
        common.errorCode(res, 401, 'token不存在');
    }
})

// 任务详情
router.post('/task_info', async (req, res) => {
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
            let task_res = {};
            const sql_str1 = `SELECT a.*, b.pname, c.project_name FROM tasks a LEFT JOIN users b ON a.assigned_to=b.ID LEFT JOIN projects c ON a.project_id=c.project_id WHERE a.task_id = ${req.body.task_id}`;
            await common.pool.query(sql_str1).then(async (result) => {
                if (result[0].length === 0) {
                    common.errorCode(res, 404, '没有找到该任务');
                    return;
                } else {
                    task_res = result[0][0];
                    await common.pool.query(`SELECT task_id, task_name FROM tasks`).then(result => {
                        task_res.task_list = result[0];
                    }).catch(err => { console.error(err); });
                    await common.pool.query(`SELECT pre_task_id FROM pre_task WHERE task_id = ${req.body.task_id}`).then(result => {
                        // task_res.pre_task_list = result[0];
                        let arr = [];
                        result[0].forEach(item => {
                            arr.push(item.pre_task_id);
                        });
                        task_res.pre_task_list = arr;
                    }).catch(err => { console.error(err); });
                    console.log(task_res);
                    res.send({ code: 200, result: task_res });
                    return;
                }
            }).catch(err => {
                console.error(err);
                common.errorCode(res, 500, '获取任务详情失败');
                return;
            })
        } else {
            common.errorCode(res, 401, '该用户没有权限');
        }
    } else {
        common.errorCode(res, 401, 'token不存在');
    }
})

router.post('/update_task', async (req, res) => {
    const token = req.headers.authorization;
    const pre_taskid_list = req.body.pre_taskid_list;
    if (token) {
        const decoded = common.verifyToken(token, common.secretkey);
        if (decoded === 'expired') {
            common.errorCode(res, 401, '登录已过期，请重新登录');
            return;
        } else if (decoded === 'failed') {
            common.errorCode(res, 401, '登录信息错误，请重新登录');
            return;
        } else if (common.checkRole(decoded.roleid, [1002])) {
            if (req.body.com_percent > 100) {
                req.body.com_percent = 100;
            } else if (req.body.com_percent < 0) {
                req.body.com_percent = 0;
            }
            const sql_str = `UPDATE tasks SET task_name = '${req.body.task_name}', description = '${req.body.description}', assigned_to = ${req.body.assigned_to}, project_id = ${req.body.project_id}, start_date = '${req.body.start_date}', end_date = '${req.body.end_date}', status = '${req.body.status}', com_percent = '${req.body.com_percent}' WHERE task_id = ${req.body.task_id}`;
            if (req.body.start_date > req.body.end_date) {
                common.errorCode(res, 400, '开始时间不能大于结束时间');
                return;
            } else {
                await common.pool.query(sql_str).then(async (result) => {
                    // console.log(result[0].affectedRows);
                    if (result[0].affectedRows === 1) {
                        console.log('任务内容更新成功');
                        // 比对前置任务
                        let sql_status = 1;
                        const sql_str1 = `SELECT pre_task_id FROM pre_task WHERE task_id = ${req.body.task_id}`;
                        await common.pool.query(sql_str1).then(async (result) => {
                            if (result[0].length === 0) {
                                let sql_status1 = 1;
                                // 没有前置任务,插入新增前置任务数据
                                pre_taskid_list.forEach(item => {
                                    const sql_str2 = `INSERT INTO pre_task (task_id, pre_task_id) VALUES (${req.body.task_id}, ${item})`;
                                    common.pool.query(sql_str2).then(result => {
                                        // console.log(result[0]);
                                        if (result[0].affectedRows === 1) {
                                            return;
                                        } else {
                                            sql_status = 0;
                                            return;
                                        }
                                    }).catch(err => {
                                        console.error(err);
                                    });
                                })
                            } else {
                                // 存在前置任务，则先删除左右前置任务数据，再插入新增前置任务数据
                                const sql_str2 = `DELETE FROM pre_task WHERE task_id = ${req.body.task_id}`;
                                await common.pool.query(sql_str2).then(async (result) => {
                                    if (result[0].affectedRows > 0) {
                                        pre_taskid_list.forEach(item => {
                                            const sql_str3 = `INSERT INTO pre_task (task_id, pre_task_id) VALUES (${req.body.task_id}, ${item})`;
                                            common.pool.query(sql_str3).then(result => {
                                                console.log(result[0]);
                                                if (result[0].affectedRows === 1) {
                                                    return;
                                                } else {
                                                    sql_status = 0;
                                                    return;
                                                }
                                            }).catch(err => {
                                                console.error(err);
                                            })
                                        });
                                    }
                                });
                            }
                            if (sql_status === 1) {
                                res.send({ code: 200, message: '更新任务成功' });
                                common.addLog(decoded.uid, `更新任务：${req.body.task_name}`, common.getCurrentTime()); // 添加日志
                                return;
                            } else {
                                common.errorCode(res, 500, '更新任务失败');
                            return;
                            }
                        });
                    } else {
                        common.errorCode(res, 500, '更新任务失败');
                        return;
                    }
                }).catch(err => {
                    console.error(err);
                });
            }
        } else {
            common.errorCode(res, 401, '该用户没有权限');
        }
    } else {
        common.errorCode(res, 401, 'token不存在');
    }
})

router.post('/delete_task', async (req, res) => {
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
            const sql_str = `DELETE FROM tasks WHERE task_id = ${req.body.task_id}`;
            let task_name = '';
            // 获取任务名称
            await common.pool.query(`SELECT task_name FROM tasks WHERE task_id = ${req.body.task_id}`).then(result => {
                task_name = result[0][0].task_name;
            }).catch(err => {
                console.error(err);
            })
            await common.pool.query(sql_str).then(result => {
                console.log(result[0].affectedRows);
                if (result[0].affectedRows === 1) {
                    res.send({ code: 200, message: '删除任务成功' });
                    common.addLog(decoded.uid, `删除任务：${task_name}`, common.getCurrentTime()); // 添加日志
                    return;
                } else {
                    common.errorCode(res, 500, '删除任务失败');
                    return;
                }
            }).catch(err => {
                console.error(err);
            });
        } else {
            common.errorCode(res, 401, '该用户没有权限');
        }
    } else {
        common.errorCode(res, 401, 'token不存在');
    }
})

router.post('/pre_task_list', async (req, res) => {
    const token = req.headers.authorization;
    if (token) {
        const decoded = common.verifyToken(token, common.secretkey);
        if (decoded === 'expired') {
            common.errorCode(res, 401, '登录已过期，请重新登录');
        } else if (decoded === 'failed') {
            common.errorCode(res, 401, '登录信息错误，请重新登录');
        } else if (common.checkRole(decoded.roleid, [1002])) {
            const sql_str = `SELECT a.pre_task_id FROM dependencies a LEFT JOIN tasks b ON a.task_id = b.task_id WHERE a.task_id in (SELECT task_id FROM tasks WHERE project_id = ${req.body.project_id})`;
            await common.pool.query(sql_str).then(result => {
                if (result[0].length === 0) {
                    common.errorCode(res, 404, '尚未添加前置任务');
                    return;
                } else {
                    res.send({ code: 200, result: result[0] });
                    return;
                }
            })
        } else {
            common.errorCode(res, 401, '该用户没有权限');
        }
    } else {
        common.errorCode(res, 401, 'token不存在');
    }
})

router.get('/get_task_com', async (req, res) => {
    const token = req.headers.authorization;
    if (token) {
        const decoded = common.verifyToken(token, common.secretkey);
        if (decoded === 'expired') {
            common.errorCode(res, 401, '登录已过期，请重新登录');
        } else if (decoded === 'failed') {
            common.errorCode(res, 401, '登录信息错误，请重新登录');
        } else if (common.checkRole(decoded.roleid, [1003])) {
            const sql_str = `SELECT d.project_name, a.task_id, a.task_name, a.start_date, a.end_date, a.status, b.task_id AS task_id_com, b.description, c.pname FROM tasks a LEFT JOIN task_completion b ON a.task_id=b.task_id LEFT JOIN users c ON a.assigned_to=c.ID LEFT JOIN projects d ON a.project_id=d.project_id where a.assigned_to=${decoded.uid} ORDER BY a.task_id DESC`;
            await common.pool.query(sql_str).then(result => {
                console.log(result[0]);
                if (result[0].length === 0) {
                    common.errorCode(res, 404, '尚未分配任务给该用户');
                    return;
                } else {
                    if (result[0].length === 0) {
                        res.send({ code: 200, result: null });
                    // } else if (result[0][0].task_id_com === null) {
                    //     res.send({ code: 200, result: null, message: '该任务尚未填写进度汇报' });
                    } else {
                        res.send({ code: 200, result: result[0] });
                    }
                }
            }).catch(err => {
                console.error(err);
            });
        } else {
            common.errorCode(res, 401, '该用户没有权限');
        }
    } else {
        common.errorCode(res, 401, 'token不存在');
    }
})

router.post('/update_task_com', async (req, res) => {
    const token = req.headers.authorization;
    if (token) {
        const decoded = common.verifyToken(token, common.secretkey);
        if (decoded === 'expired') {
            common.errorCode(res, 401, '登录已过期，请重新登录');
        } else if (decoded === 'failed') {
            common.errorCode(res, 401, '登录信息错误，请重新登录');
        } else if (common.checkRole(decoded.roleid, [1003])) {
            console.log(req.body)
            const sql_str1 = `UPDATE task_completion SET description = '${req.body.description}' WHERE task_id = ${req.body.task_id}`;
            const sql_str2 = `INSERT INTO task_completion (task_id, description) VALUES (${req.body.task_id}, '${req.body.description}')`;
            await common.pool.query(`SELECT task_id FROM task_completion WHERE task_id=${req.body.task_id}`).then(async result => {
                console.log(result[0]);
                if (result[0].length === 0) {
                    // 插入新数据
                    await common.pool.query(sql_str2).then(result => {
                        if (result[0].affectedRows === 1) {
                            res.send({ code: 200, message: '保存任务进度成功' });
                            common.addLog(decoded.uid, `保存任务进度：${req.body.task_id}`, common.getCurrentTime()); // 添加日志
                            return;
                       } else {
                            common.errorCode(res, 500, '保存任务进度失败');
                            return;
                        }
                    }).catch(err => {
                        console.error(err);
                    })
                } else {
                    // 更新数据
                    await common.pool.query(sql_str1).then(result => {
                        if (result[0].affectedRows === 1) {
                            res.send({ code: 200, message: '更新任务进度成功' });
                        } else {
                            common.errorCode(res, 500, '更新任务进度失败');
                            return;
                        }
                    }).catch(err => {
                        console.error(err);
                    })
                }
            })
        } else {
            common.errorCode(res, 401, '该用户没有权限');
        }
    } else {
        common.errorCode(res, 401, 'token不存在');
    }
})

module.exports = router;