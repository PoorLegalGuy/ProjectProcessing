import func from './main.js';

const projectListHTML = (projectList) => {
    let html = `
        <div class="col-md-12">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th scope="col">项目名称</th>
                        <th scope="col">项目负责人</th>
                        <th scope="col">开始日期</th>
                        <th scope="col">操作</th>
                    </tr>
                </thead>
                <tbody>
    `;
    projectList.forEach(project => {
        html += `
                    <tr>
                        <td data-projectid="${project.project_id}">${project.project_name}</td>
                        <td>${project.pname}</td>
                        <td>${func.utcToCst(project.start_date)}</td>
                        <td>
                            <div class="btn-group" role="group" aria-label="Basic mixed styles example">
                                <button class="btn btn-primary btn-sm task_manage_btn" data-bs-toggle="modal" data-bs-target="#exampleModal">任务管理</button>
                            </div>
                        </td>
                    </tr>
        `;
    });
    html += `
                </tbody>
            </table>
        </div>
    `;
    return html;
}

const taskListHTML = (taskList) => {
    let html = `
        <div class="col-md-12">
            <div class="col-md-12 d-flex justify-content-end">
                <button id="add_task_btn" class="btn btn-success btn-sm ms-auto" data-bs-toggle="modal" data-bs-target="#exampleModal2">新建任务</button>
            </div>
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th scope="col">任务名称</th>
                        <th scope="col">负责人</th>
                        <th scope="col">开始日期</th>
                        <th scope="col">结束日期</th>
                        <th scope="col">状态</th>
                        <th scope="col">操作</th>
                    </tr>
                </thead>
                <tbody>
    `;
    if (taskList.length == 0) {
        html += `
                        <tr>
                            <td colspan="5">暂未添加任务</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
        `;
    } else {
        taskList.forEach(task => {
            html += `
                        <tr>
                            <td data-taskid="${task.task_id}">${task.task_name}</td>
                            <td>${task.pname}</td>
                            <td>${func.utcToCst(task.start_date)}</td>
                            <td>${func.utcToCst(task.end_date)}</td>
                            <td>${task.status}</td>
                            <td>
                                <div class="btn-group" role="group" aria-label="Basic mixed styles example">
                                    <button class="btn btn-primary btn-sm edit_task_btn" data-bs-toggle="modal" data-bs-target="#exampleModal2">编辑</button>
                                </div>
                            </td>
                        </tr>
            `;
        });
    }
    html += `
                </tbody>
            </table>
        </div>
    `;
    return html;
}

// 创建新建任务表单Html
const addTaskFormHTML = (project_name, project_id, user, taskList) => {
    let html = `
    <div class="col-md-12">
        <div class="mb-3"><b>项目名称：</b>${project_name}</div>
        <form id="add_task_form">
            <div class="mb-3">
                <label for="task_name" class="form-label">任务名称：</label>
                <input type="text" class="form-control" id="task_name" name="task_name" required>
            </div>
            <div class="mb-3">
                <label for="description" class="form-label">任务描述：</label>
                <textarea class="form-control" id="description" name="description" rows="5" required></textarea>
            </div>
            <div class="row">
                <div class="col mb-3">
                    <label for="start_date" class="form-label">开始日期：</label>
                    <input type="date" class="form-control" id="start_date" name="start_date" required>
                </div>
                <div class="col mb-3">
                    <label for="end_date" class="form-label">结束日期：</label>
                    <input type="date" class="form-control" id="end_date" name="end_date" required>
                </div>
            </div>
            <div class="row">
                <div class="col mb-3">
                    <label for="status" class="form-label">状态：</label>
                    <select class="form-select" id="status" name="status" required>
                        <option value="">请选择状态</option>
                        <option value="未开始">未开始</option>
                        <option value="进行中">进行中</option>
                        <option value="已完成">已完成</option>
                        <option value="已超时">已超时</option>
                    </select>
                </div>
                <div class="col mb-3">
                    <label for="com_percent" class="form-label">任务完成度(%)：</label>
                    <input type="number" class="form-control" id="com_percent" name="com_percent" value="0" required>
                </div>
            </div>
            <div class="col-6 mb-3">
                <label for="assigned_to" class="form-label">负责人：</label>
                <select class="form-select" id="assigned_to" name="assigned_to" required>
                    <option value="">请选择负责人</option>
    `;
    user.forEach(user => {
        html += `
                    <option value="${user.ID}">${user.pname}</option>
        `;
    });
    html += `
                </select>
            </div>
            <div class="mb-3">
                <p>前置任务：</p>
    `;
    if (taskList.length == 0) {
        html += `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="task-0" value="0" disabled>
                    <label class="form-check-label" for="task-0">
                        该项目未创建其他任务
                    </label>
                </div>
        `;
    } else {
        taskList.forEach(task => {
            html += `
                <div class="form-check">
                    <input class="pre_task_checkbox form-check-input" type="checkbox" id="task-${task.task_id}" value="${task.task_id}">
                    <label class="form-check-label" for="task-${task.task_id}">
                        ${task.task_name}
                    </label>
                </div>
            `;
        });    
    }
    html += `
            </div>
            <div class="mb-3 d-flex justify-content-center align-items-center">
                <button type="submit" class="btn btn-primary m-3" id="save_task">保存</button>
                <button type="button" class="btn btn-secondary m-3" id="cancel_add_btn"  data-bs-toggle="modal" data-bs-target="#exampleModal">取消</button>
            </div>
            <input type="hidden" id="project_id" name="project_id" value="${project_id}">
        </form>
    </div>
    `;
    return html;
}

const editTaskFormHTML = (project_name, project_id, task, user) => {
    let html = `
    <div class="col-md-12">
        <div class="mb-3"><b>项目名称：</b>${project_name}</div>
        <form id="edit_task_form">
            <div class="mb-3">
                <label for="task_name" class="form-label">任务名称</label>
                <input type="text" class="form-control" id="task_name" name="task_name" value="${task.task_name}" required>
                <input type="hidden" id="task_id" name="task_id" value="${task.task_id}">
                <input type="hidden" id="project_id" name="project_id" value="${project_id}">
            </div>
            <div class="mb-3">
                <label for="description" class="form-label">任务描述</label>
                <textarea class="form-control" id="description" name="description" rows="5" required>${task.description}</textarea>
            </div>
            <div class="row">
                <div class="col mb-3">
                    <label for="start_date" class="form-label">开始日期</label>
                    <input type="date" class="form-control" id="start_date" name="start_date" value="${func.utcToCst(task.start_date)}" required>
                </div>
                <div class="col mb-3">
                    <label for="end_date" class="form-label">结束日期</label>
                    <input type="date" class="form-control" id="end_date" name="end_date" value="${func.utcToCst(task.end_date)}" required>
                </div>
            </div>
            <div class="row">
                <div class="col mb-3">
                    <label for="status" class="form-label">状态</label>
                    <select class="form-select" id="status" name="status" required>
                        <option value="">请选择状态</option>
                        <option value="未开始" ${task.status == '未开始' ? 'selected' : ''}>未开始</option>
                        <option value="进行中" ${task.status == '进行中' ? 'selected' : ''}>进行中</option>
                        <option value="已完成" ${task.status == '已完成' ? 'selected' : ''}>已完成</option>
                        <option value="已超时" ${task.status == '已超时' ? 'selected' : ''}>已超时</option>
                    </select>
                </div>
                <div class="col mb-3">
                    <label for="com_percent" class="form-label">任务完成度(%)</label>
                    <input type="number" class="form-control" id="com_percent" name="com_percent" value="${task.com_percent}" required>
                </div>
            </div>
            <div class="col-6 mb-3">
                <label for="assigned_to" class="form-label">负责人</label>
                <select class="form-select" id="assigned_to" name="assigned_to" required>
                    <option value="">请选择负责人</option>
    `;
    user.forEach(user => {
        html += `
                    <option value="${user.ID}" ${task.assigned_to == user.ID ? 'selected' : ''}>${user.pname}</option>
        `;
    });
    html += `
                </select>
            </div>
            <div class="mb-3">
                <p>前置任务：</p>
    `;
    // 前置任务
    task.task_list.forEach(item => {
        html += `
                <div class="form-check">
                    <input class="pre_task_checkbox form-check-input" type="checkbox" id="task-${item.task_id}" value="${item.task_id}" ${task.pre_task_list.includes(item.task_id) ? 'checked' : ''} ${item.task_id == task.task_id ? 'disabled' : ''}>
                    <label class="form-check-label" for="task-${item.task_id}">
                        ${item.task_name}
                    </label>
                </div>
        `;
    })
    html += `
            </div>
            <div class="mb-3 d-flex justify-content-center align-items-center">
                <button type="submit" class="btn btn-primary m-3" id="save_task">保存</button>
                <button type="button" class="btn btn-secondary m-3" id="cancel_edit_btn" data-bs-toggle="modal" data-bs-target="#exampleModal">取消</button>
                <button type="button" class="btn btn-danger m-3" id="delete_task">删除</button>
            </div>
        </form>
    </div>
    `;
    return html;
}

const taskComListHTML = (task) => {
    let html = `
    <div class="col-md-12">
        <table class="table table-striped table-hover">
            <thead>
                <tr>
                    <th scope="col">项目名称</th>
                    <th scope="col">任务名称</th>
                    <th scope="col">开始日期</th>
                    <th scope="col">结束日期</th>
                    <th scope="col">状态</th>
                    <th scope="col">操作</th>
                </tr>
            </thead>
            <tbody>
    `;
    if (task == null) {
        html += `
                <tr>
                    <td colspan="6" class="text-center">暂未分配任务</td>
                </tr>
        `;
    } else {
        task.forEach(item => {
            html += `
                    <tr>
                        <td>${item.project_name}</td>
                        <td>${item.task_name}</td>
                        <td>${func.utcToCst(item.start_date)}</td>
                        <td>${func.utcToCst(item.end_date)}</td>
                        <td>${item.status}</td>
                        <td>
                            <button class="btn btn-primary btn-sm taskcom_report_btn" data-task_id="${item.task_id}" data-bs-toggle="modal" data-bs-target="#exampleModal">进度汇报</button>
                        <td>
                    </tr>
            `;
        });
    }
    html += `
            </tbody>
        </table>
    </div>
    `;
    return html;
}

const taskComReportHTML = (taskcom_desc) => {
    let html = `
    <div class="col-md-12">
        <form id="taskcom_report_form">
            <div class="mb-3">
                <label for="task_com_report" class="form-label">任务进度汇报：</label>
                <textarea class="form-control" id="task_com_report" name="task_com_report" rows="10" required>${taskcom_desc}</textarea>
            </div>
            <div class="mb-3 d-flex justify-content-center align-items-center">
                <button type="submit" class="btn btn-primary m-3" id="save_taskcom_report">保存</button>
                <button type="button" class="btn btn-secondary m-3" id="cancel_taskcom_report_btn" data-bs-dismiss="modal" aria-label="Close">取消</button>
            </div>
        </form>
    </div>
    `;
    return html;
}

const taskManage = () => {
    func.chk_token(window.sessionStorage.getItem('u_token'), () => {
        fetch('/api/tasks/project_list', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': window.sessionStorage.getItem('u_token')
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.code == 200) {
                const projectList = data.result;
                if (data.urole == 1001 || data.urole == 1002) {
                    document.querySelector('#content').innerHTML = projectListHTML(projectList); // 渲染项目列表
                    // 监听任务管理按钮
                    document.querySelectorAll('.task_manage_btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const project_id = btn.parentNode.parentNode.parentNode.querySelector('td').dataset.projectid;
                            const project_name = btn.parentNode.parentNode.parentNode.querySelector('td').innerHTML;
                            taskManagePage(project_name, project_id);
                        })
                    })
                } else if (data.urole == 1003) {
                    taskComList();
                }
            } else {
                document.querySelector('#content').innerHTML = `<div class="alert alert-danger" role="alert">${data.message}</div>`;
            }
        })
    })
}

// 任务管理
const taskManagePage = (project_name, project_id) => {
    func.chk_token(window.sessionStorage.getItem('u_token'), () => {
        fetch('/api/tasks/task_list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': window.sessionStorage.getItem('u_token')
            },
            body: JSON.stringify({
                project_id: project_id
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.code == 200 || data.code == 201) {
                // 渲染任务管理modal
                document.querySelector('#exampleModalLabel').innerHTML = project_name + ' - 任务管理';
                document.querySelector('#exampleModal .modal-body').innerHTML = taskListHTML(data.result);
                // 监听新建任务按钮
                document.querySelector('#add_task_btn').addEventListener('click', () => {
                    taskAdd(project_name, project_id);
                    // console.log(this);
                })
                // 监听任务编辑按钮
                document.querySelectorAll('.edit_task_btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const task_id = btn.parentNode.parentNode.parentNode.querySelector('td').dataset.taskid;
                        const task_name = btn.parentNode.parentNode.parentNode.querySelector('td').innerHTML;
                        taskEdit(project_name, project_id, task_name, task_id);
                    })
                })
            } else {
                return;
            }
        })
    })
}

// 新建任务
const taskAdd = (project_name, project_id) => {
    func.chk_token(window.sessionStorage.getItem('u_token'), async () => {
        // 获取可分配的负责人名单
        let user_list = [];
        await fetch('/api/tasks/user_list', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': window.sessionStorage.getItem('u_token')
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.code == 200) {
                user_list = data.result;
            } else {
                // alert(data.message);
                return;
            }
        })
        // 获取任务列表
        let task_list = [];
        await fetch('/api/tasks/task_list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': window.sessionStorage.getItem('u_token')
            },
            body: JSON.stringify({
                project_id: project_id
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.querySelector('#exampleModalLabel2').innerHTML = project_name + ' - 新建任务';
            if (data.code == 200) {
                task_list = data.result;
                // console.log(task_list);
            } else {
                // alert(data.message);
                return;
            }
        })
        if (user_list.length == 0) {
            // alert('无可分配负责人，请先添加负责人');
            document.querySelector('#exampleModal2 .modal-body').innerHTML = `<div class="alert alert-danger" role="alert">无可分配负责人，请先添加负责人</div>`;
        } else {
            document.querySelector('#exampleModal2 .modal-body').innerHTML = addTaskFormHTML(project_name, project_id, user_list, task_list);
            // 监听表单提交
            document.querySelector('#add_task_form').addEventListener('submit', async (e) => {
                e.preventDefault();
                // 提交任务信息
                const formData = new FormData(document.querySelector('#add_task_form'));
                let data = Object.fromEntries(formData.entries());
                data.pre_taskid_list = [];
                // 将所有勾选的前置任务的input value添加到data.pre_taskid_list中
                document.querySelectorAll('.pre_task_checkbox').forEach(checkbox => {
                    if (checkbox.checked) {
                        data.pre_taskid_list.push(checkbox.value);
                    }
                })
                console.log(data);
                // 判断任务名称长度
                if (data.task_name.length > 20) {
                    alert('任务名称长度不能超过20个字符');
                    return;
                } else {
                    fetch('/api/tasks/add_task', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': window.sessionStorage.getItem('u_token')
                        },
                        body: JSON.stringify(data)
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        if (data.code == 200) {
                            alert('任务添加成功');
                            document.querySelector('#cancel_add_btn').click();
                            taskManagePage(project_name, project_id);
                        } else {
                            alert(data.message);
                            return;
                        }
                    })
                }
            })
        }
    })
}

// 编辑任务
const taskEdit = (project_name, project_id, task_name, task_id) => {
    func.chk_token(window.sessionStorage.getItem('u_token'), () => {
        let user_list = [];
        // 获取可分配的负责人名单
        fetch('/api/tasks/user_list', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': window.sessionStorage.getItem('u_token')
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.code == 200) {
               user_list = data.result;
            } else {
                alert(data.message);
            }
        }).then(() => {
            fetch('/api/tasks/task_info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': window.sessionStorage.getItem('u_token')
                },
                body: JSON.stringify({
                    task_id: task_id
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.code == 200) {
                    document.querySelector('#exampleModalLabel2').innerHTML = task_name + ' - 编辑任务';
                    document.querySelector('#exampleModal2 .modal-body').innerHTML = editTaskFormHTML(project_name, project_id, data.result, user_list);
                    // 监听编辑任务表单提交事件
                    document.querySelector('#edit_task_form').addEventListener('submit', (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const data = Object.fromEntries(formData.entries());
                        data.pre_taskid_list = [];
                        document.querySelectorAll('.pre_task_checkbox').forEach(checkbox => {
                            if (checkbox.checked) {
                                data.pre_taskid_list.push(checkbox.value);
                            }
                        })
                        console.log(data);
                        // 判断任务名称长度
                        if (data.task_name.length > 20) {
                            alert('任务名称长度不能超过20个字符');
                            return;
                        } else {
                            fetch('/api/tasks/update_task', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': window.sessionStorage.getItem('u_token')
                                },
                                body: JSON.stringify(data)
                            })
                            .then(response => response.json())
                            .then(data => {
                                // console.log(data);
                                if (data.code == 200) {
                                    alert('任务更新成功');
                                    document.querySelector('#cancel_edit_btn').click();
                                    taskManagePage(project_name, project_id);
                                } else {
                                    alert(data.message);
                                    return;
                                }
                            })
                        }
                    })
                    // 监听删除任务按钮
                    document.querySelector('#delete_task').addEventListener('click', () => {
                        if (confirm('确定删除该任务吗？')) {
                            fetch('/api/tasks/delete_task', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': window.sessionStorage.getItem('u_token')
                                },
                                body: JSON.stringify({
                                    task_id: task_id
                                })
                            })
                            .then(response => response.json())
                            .then(data => {
                                console.log(data);
                                if (data.code == 200) {
                                    alert(data.message);
                                    // window.location.hash = '#task_manage/manage';
                                    document.querySelector('#cancel_edit_btn').click();
                                    taskManagePage(project_name, project_id);
                                } else {
                                    alert(data.message);
                                }
                            })
                        }
                    })
                } else {
                    alert(data.message);
                    window.location.hash = '#task_manage/manage';
                }
            })
        })
    })
}

const taskComList = () => {
    func.chk_token(window.sessionStorage.getItem('u_token'), () => {
        fetch('/api/tasks/get_task_com', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': window.sessionStorage.getItem('u_token')
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if(data.code == 200){
                document.querySelector('#content').innerHTML = taskComListHTML(data.result);
                // 监听进度汇报按钮
                document.querySelectorAll('.taskcom_report_btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const task_name = btn.parentNode.parentNode.children[1].innerHTML,
                        task_id = btn.dataset.task_id,
                        taskcom_cache = data.result;
                        taskComReport(task_name, task_id, taskcom_cache);
                    })
                })
            } else {
                document.querySelector('#content').innerHTML = `<div class="alert alert-danger" role="alert">${data.message}</div>`;
            }
        })
    })
}

const taskComReport = (task_name, task_id, taskcom_cache) => {
    func.chk_token(window.sessionStorage.getItem('u_token'), () => {      
        let taskcom_desc = null;
        console.log(taskcom_cache);
        for (let i = 0; i < taskcom_cache.length; i++) {
            // console.log(taskcom_cache[i]);
            if (taskcom_cache[i].task_id == task_id) {
                taskcom_desc = taskcom_cache[i].description ? taskcom_cache[i].description : '';
                break;
            }
        }
        // console.log(taskcom_desc);
        document.querySelector('#exampleModalLabel').innerHTML = task_name + ' - 进度汇报';
        document.querySelector('#exampleModal .modal-body').innerHTML = taskComReportHTML(taskcom_desc);

        // 监听表单提交
        document.querySelector('#taskcom_report_form').addEventListener('submit', (e) => {
            e.preventDefault();
            console.log(task_id, document.querySelector('#task_com_report').value)
            fetch('/api/tasks/update_task_com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': window.sessionStorage.getItem('u_token')
                },
                body: JSON.stringify({
                    task_id: task_id,
                    description: document.querySelector('#task_com_report').value
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.code == 200) {
                    alert('进度汇报成功');
                    document.querySelector('#cancel_taskcom_report_btn').click();
                    taskComList();
                } else {
                    alert(data.message);
                    return;
                }
            })
        })
    })
}

export default { taskManage, taskManagePage, taskAdd, taskEdit, taskComList, taskComReport }