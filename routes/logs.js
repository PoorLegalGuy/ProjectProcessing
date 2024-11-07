const express = require('express');
const router = express.Router();

const common = require('../common.js');

router.post('/query', async (req, res) => {
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
            try {
                // console.log(req.body);
                const [rows] = await common.pool.query(`SELECT a.*, b.pname FROM sys_log a LEFT JOIN users b ON a.userid = b.ID WHERE a.event_time BETWEEN '${req.body.log_start_time}' and '${req.body.log_end_time}' ORDER BY a.event_time DESC`);
                if (rows.length > 0) {
                    res.send({ message: '获取日志成功', data: rows });
                    common.addLog(decoded.uid, `用户 ${decoded.username} 查询日志`, common.getCurrentTime());
                    console.log(`用户 ${decoded.username} 查询日志`);
                } else {
                    common.errorCode(res, 404, '该时段无日志记录');
                }
            } catch (error) {
                common.errorCode(res, 500, 'Server error');
            }
        } else {
            common.errorCode(res, 401, '该用户没有权限');
        }
    } else {
        common.sendError(res, 'token不存在');
    }
});

module.exports = router;