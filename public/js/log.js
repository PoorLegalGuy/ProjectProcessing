import func from './main.js';


// 创建日志查询Html
const createLogsHtml = (logs) => {
    let html = `
    <div class="col-md-12 text-center">
        <form class="form-inline" id="log_form">
            <div class="row justify-content-center">
                <div class="col-5 mb-3">
                    <label for="log_date">开始时间：</label>
                    <input type="datetime-local" class="form-control" id="log_start_date" name="log_start_date" required>
                </div>
                <div class="col-5 mb-3">
                    <label for="log_end_date">结束时间：</label>
                    <input type="datetime-local" class="form-control" id="log_end_date" name="log_end_date" required>
                </div>
            </div>
            <div class="mb-3">
                <button type="submit" class="btn btn-primary">查询</button>
            </div>
        </form>
    </div>
    <div id="logs_res" class="col-md-12">
    </div>
    `;
    return html;
}

// 创建日志查询结果Html
const createLogsResHtml = (logs) => {
    let html = `
    <table class="table table-striped">
        <thead>
            <tr>
                <th scope="col">操作用户</th>
                <th scope="col">时间</th>
                <th scope="col">日志内容</th>
            </tr>
        </thead>
        <tbody>
    `;
    logs.forEach(log => {
        html += `<tr><td>${log.pname}</td><td>${log.event_time}</td><td>${log.details}</td></tr>`;
    });
    html += `
        </tbody>
    </table>
    `;
    return html;
}

// 获取日志列表
const getLogsList = () => {
    func.chk_token(window.sessionStorage.getItem('u_token'), () => {
        // 加载日志查询Html
        document.querySelector('#content').innerHTML = createLogsHtml();
        // 监听日志查询表单提交
        document.querySelector('#log_form').addEventListener('submit', (e) => {
            e.preventDefault();
            let start_time = document.querySelector('#log_start_date').value;
            let end_time = document.querySelector('#log_end_date').value;
            if (start_time > end_time) {
                alert('开始时间不能大于结束时间');
                return;
            } else if (start_time == end_time) {
                alert('开始时间不能等于结束时间');
                return;
            } else if (start_time.length != 16 || end_time.length != 16) {
                alert('请选择正确的时间格式');
                return;
            } else {
                start_time = func.formatDateTime(new Date(start_time));
                end_time = func.formatDateTime(new Date(end_time));
                // console.log(start_time, end_time);
                queryLogs(start_time, end_time);
            }
        })
    })
}

const queryLogs = (start_time, end_time) => {
    fetch('/api/logs/query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': window.sessionStorage.getItem('u_token')
        },
        body: JSON.stringify({
            log_start_time: start_time,
            log_end_time: end_time
        })
    }).then(res => res.json()).then(data => {
        if (data.message == '获取日志成功') {
            // console.log(data.data);
            let logs = data.data;
            logs.forEach(log => {
                log.event_time = func.utcToCst(log.event_time, 2);
            });
            document.querySelector('#logs_res').innerHTML = createLogsResHtml(data.data);
        } else {
            document.querySelector('#logs_res').innerHTML = `<div class="alert alert-danger" role="alert">${data.message}</div>`;
            console.log(data.message);
        }
    })
}

export default { getLogsList };