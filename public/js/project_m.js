import func from './main.js';

// 动态加载js
const loadJs = (url, callback) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    document.body.appendChild(script);
}

// 创建项目列表页面HTML
const createProjectListHTML = (projects) => {
    let html = `
        <div class="col-md-12">
            <div class="col-md-12 d-flex justify-content-end"><button id="add_project_btn" class="btn btn-success btn-sm ms-auto" data-bs-toggle="modal" data-bs-target="#exampleModal">新建项目</button></div>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>项目名称</th>
                        <th>项目负责人</th>
                        <th>开始日期</th>
                        <th>结束日期</th>
                        <th>状态</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
    `;

    projects.forEach(project => {
        if (project.project_id == '') {
            html += `
                <tr>
                    <td>查无记录</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            `;
        } else {
            html += `
                <tr>
                    <td data-projectid="${project.project_id}">${project.project_name}</td>
                    <td>${project.pname}</td>
                    <td>${project.start_date}</td>
                    <td>${project.end_date}</td>
                    <td>${project.status}</td>
                    <td>
                        <div class="btn-group" role="group" aria-label="Basic mixed styles example">
                            <button class="btn btn-primary btn-sm edit_project_btn" data-bs-toggle="modal" data-bs-target="#exampleModal">编辑</button>
                            <button class="btn btn-secondary btn-sm details_btn" data-bs-toggle="modal" data-bs-target="#exampleModal">项目详情</button>
                        </div>
                    </td>
                </tr>
            `;
        }
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    return html;
}

// 创建项目详情页面HTML
const createProjectDetailHTML = () => {
    /////
    let html = `
    <div class="col-md-12">
        <form id="add_project_form">
            <div class="mb-3">
                <label for="project_name" class="form-label">项目名称：</label>
                <input type="text" class="form-control" id="project_name" name="project_name" placeholder="请输入项目名称" required>
            </div>
            <div class="mb-3">
                <label for="start_date" class="form-label">项目开始日期：</label>
                <input type="date" class="form-control" id="start_date" name="start_date" placeholder="请选择项目开始时间" required>
                <script>
                    document.getElementById('start_date').valueAsDate = new Date();
                </script>
            </div>
            <div class="mb-3">
                <label for="end_date" class="form-label">项目结束日期：</label>
                <input type="date" class="form-control" id="end_date" name="end_date" placeholder="请选择项目开始时间" required>
                <script>
                    document.getElementById('end_date').valueAsDate = new Date();
                </script>
            </div>
            <div class="mb-3">
                <label for="description" class="form-label">项目情况描述：</label>
                <textarea class="form-control" id="description" name="description" rows="8" placeholder="请输入项目描述"></textarea>
            </div>
            <div class="mb-3">
                <label for="status" class="form-label">项目状态：</label>
                <select class="form-select" id="status" name="status" required>
                    <option value="">请选择项目状态</option>
                    <option value="计划中">计划中</option>
                    <option value="进行中">进行中</option>
                    <option value="已完成">已完成</option>
                    <option value="已取消">已取消</option>
                </select>
            </div>
            <div class="mb-3 d-flex justify-content-center align-items-center">
                <button type="submit" class="btn btn-primary m-3" id="save_project">保存</button>
                <button type="button" class="btn btn-secondary m-3" id="cancel_add_btn" data-bs-dismiss="modal" aria-label="Close">取消</button>
            </div>
        </form>
    </div>
    `;
    return html;
}

const editProjectDetailHTML = (project) => {
    let html = `
        <form id="edit_project_form">
            <div class="mb-3">
                <label for="project_name" class="form-label">项目名称：</label>
                <input type="text" class="form-control" id="project_name" name="project_name" placeholder="请输入项目名称" required value="${project.project_name}">
            </div>
            <div class="mb-3">
                <label for="start_date" class="form-label">项目开始日期：</label>
                <input type="date" class="form-control" id="start_date" name="start_date" placeholder="请选择项目开始时间" required value="${project.start_date}">
                <script>
                    document.getElementById('start_date').valueAsDate = new Date();
                </script>
            </div>
            <div class="mb-3">
                <label for="end_date" class="form-label">项目结束日期：</label>
                <input type="date" class="form-control" id="end_date" name="end_date" placeholder="请选择项目开始时间" required value="${project.end_date}">
                <script>
                    document.getElementById('end_date').valueAsDate = new Date();
                </script>
            </div>
            <div class="mb-3">
                <label for="description" class="form-label">项目描述：</label>
                <textarea class="form-control" id="description" name="description" rows="8" placeholder="请输入项目描述">${project.description}</textarea>
                <script>
                    document.getElementById('description').value = "${project.description}";
                </script>
            </div>
            <div class="mb-3">
                <label for="status" class="form-label">项目状态：</label>
                <select class="form-select" id="status" name="status" required>
                    <option value="">请选择项目状态</option>
                    <option value="计划中" ${project.status == '计划中' ? 'selected' : ''}>计划中</option>
                    <option value="进行中" ${project.status == '进行中' ? 'selected' : ''}>进行中</option>
                    <option value="已完成" ${project.status == '已完成' ? 'selected' : ''}>已完成</option>
                    <option value="已取消" ${project.status == '已取消' ? 'selected' : ''}>已取消</option>
                </select>
            </div>
            <div class="mb-3 d-flex justify-content-center align-items-center">
                <button type="submit" class="btn btn-primary m-3" id="save_edit_btn">保存</button>
                <button type="button" class="btn btn-secondary m-3" id="cancel_edit_btn" data-bs-dismiss="modal" aria-label="Close">取消</button>
                <button type="button" class="btn btn-danger m-3" id="delete_project_btn">删除</button>
            </div>
            <input type="hidden" id="project_id" name="project_id" value="${project.project_id}">
        </form>
    `;
    return html;
}

// 项目详情HTML
const projectDetailsHTML = () => {
    let html = `<div id="chart_div"></div><div id="task_div"></div>`;
    return html;
}

// 项目任务进度汇报情况
const taskComHTML = (task) => {
    let html = `
    <table class="table table-striped">
        <thead>
            <tr>
                <th scope="col">任务名称</th>
                <th scope="col">任务状态</th>
                <th scope="col">任务开始日期</th>
                <th scope="col">任务预计完成时间</th>
                <th scope="col">任务进度汇报</th>
            </tr>
        </thead>
        <tbody>
    `;
    task.forEach(items => {
        html += `
            <tr>
                <td>${items.task_name}</td>
                <td>${items.status}</td>
                <td>${func.utcToCst(items.start_date)}</td>
                <td>${func.utcToCst(items.end_date)}</td>
                <td>
                    <button type="button" class="btn btn-primary task_com_btn" data-task_id="${items.task_id}" data-bs-toggle="modal" data-bs-target="#exampleModal2">查看</button>
                </td>
            </tr>
        `;
    })
    html += `
        </tbody>
    </table>
    `;
    return html;
}


// 处理项目管理页面事件
const projectManage = () => {
    func.chk_token(window.sessionStorage.getItem('u_token'), () => {
        // 获取项目列表
        fetch('/api/projects/list', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': window.sessionStorage.getItem('u_token')
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.message == '查询成功' || data.message == '查询成功，无数据') {
                // console.log(data.data);
                let list = data.data;
                console.log(list)
                if (data.message == '查询成功') {
                    list.forEach(items => {
                        items.start_date = func.utcToCst(items.start_date);
                        items.end_date = func.utcToCst(items.end_date);
                    });
                    // console.log(data,list);
                }
                document.getElementById('content').innerHTML = createProjectListHTML(list); // 渲染项目列表
                if (window.sessionStorage.getItem('login_role') == '项目成员') {
                    document.querySelector('#add_project_btn').classList.add('d-none');
                    document.querySelectorAll('.edit_project_btn').forEach(btn => {
                        btn.classList.add('d-none');
                    });
                }
                // 监听新建项目按钮点击事件
                document.getElementById('add_project_btn').addEventListener('click', () => {
                    // window.location.href = '#project_manage/add';
                    // func.active_nav('#project_m');
                    // func.initTittle('项目进度管理系统--项目管理');
                    projectAdd();
                });
                // 监听编辑按钮点击事件
                document.querySelectorAll('.edit_project_btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const project_id = btn.parentNode.parentNode.parentNode.children[0].dataset.projectid;
                        // console.log(project_id);
                        // window.sessionStorage.setItem('project_id', project_id);
                        // window.location.href = '#project_manage/edit';
                        projectEdit(project_id);
                    });
                });
                // 监听详情按钮点击事件
                document.querySelectorAll('.details_btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const project_id = btn.parentNode.parentNode.parentNode.children[0].dataset.projectid;
                        const project_name = btn.parentNode.parentNode.parentNode.children[0].innerHTML;
                        // console.log(project_id);
                        // window.sessionStorage.setItem('project_id', project_id);
                        // window.location.href = '#project_manage/details';
                        projectDetails(project_name, project_id);
                    });
                });
            } else {
                document.querySelector('#content').innerHTML = `<div class="alert alert-danger" role="alert">${data.message}</div>`;
            }
        })
    });
}

// 创建项目
const projectAdd = () => {
    func.chk_token(window.sessionStorage.getItem('u_token'), () => {
        // document.querySelector('#content').innerHTML = createProjectDetailHTML(); // 渲染项目详情
        document.querySelector('#exampleModalLabel').innerHTML = '新建项目';
        document.querySelector('#exampleModal .modal-body').innerHTML = createProjectDetailHTML();
        const c_title = '项目进度管理系统--项目管理';
        document.querySelector('#nav_title').innerHTML = c_title;
        document.title = c_title;
        // 监听新建项目表单提交事件
        document.querySelector('#add_project_form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            console.log(data);
            // 判断项目名称长度
            if (data.project_name.length > 20) {
                alert('项目名称长度不能超过20个字符');
                return;
            } else {
                fetch('/api/projects/add', {
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
                    if (data.message == '项目添加成功') {
                        alert(data.message);
                        document.querySelector('#cancel_add_btn').click();
                        projectManage();
                    } else {
                        alert(data.message);
                    }
                })
            }
        });
    });
}

// 项目更新function
const projectUpdate = (data) => {
    func.chk_token(window.sessionStorage.getItem('u_token'), () => {
        // 判断项目名称长度
        if (data.project_name.length > 20) {
            alert('项目名称长度不能超过20个字符');
            return;
        } else {
            fetch('/api/projects/update', {
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
                if (data.message == '项目更新成功') {
                    alert(data.message);
                    // window.location.href = '#project_manage';
                    document.querySelector('#cancel_edit_btn').click();
                    projectManage();
                } else {
                    alert(data.message);
                }
            })
        }
    });
}
// 编辑项目
const projectEdit = (project_id) => {
    func.chk_token(window.sessionStorage.getItem('u_token'), () => {
        fetch('/api/projects/editForm', {
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
            if (data.message == '查询成功') {
                let project = data.data;
                project.start_date = func.utcToCst(project.start_date);
                project.end_date = func.utcToCst(project.end_date);
                // document.querySelector('#content').innerHTML = editProjectDetailHTML(project); // 渲染项目详情
                document.querySelector('#exampleModalLabel').innerHTML = '编辑项目';
                document.querySelector('#exampleModal .modal-body').innerHTML = editProjectDetailHTML(project);
                // 监听取消按钮点击事件
                // document.querySelector('#cancel_edit_btn').addEventListener('click', () => {
                //     // window.location.href = '#project_manage';
                //     document.querySelector('#cancel_edit_btn').click();
                // });
                // 监听表单提交事件
                document.querySelector('#edit_project_form').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const formData = new FormData(document.querySelector('#edit_project_form'));
                    const data = Object.fromEntries(formData.entries());
                    console.log(data);
                    projectUpdate(data);
                });
                // 监听删除按钮点击事件
                document.querySelector('#delete_project_btn').addEventListener('click', () => {
                    if (confirm('确定删除该项目吗？')) {
                        fetch('/api/projects/delete', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': window.sessionStorage.getItem('u_token')
                            },
                            body: JSON.stringify({
                                project_id: project.project_id,
                                project_name: project.project_name
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log(data);
                            if (data.message == '项目删除成功') {
                                alert(data.message);
                                // window.location.href = '#project_manage';
                                document.querySelector('#cancel_edit_btn').click();
                                projectManage();
                            } else {
                                alert(data.message);
                            }
                        })
                    }
                });
            } else {
                // alert(data.message);
                // window.location.href = '#project_manage';
                document.querySelector('#exampleModalLabel').innerHTML = '编辑项目';
                document.querySelector('#exampleModal .modal-body').innerHTML = data.message;
            }
        })
    });
}

// 项目详情
const projectDetails = (project_name, project_id) => {
    func.chk_token(window.sessionStorage.getItem('u_token'), async () => {
        document.querySelector('#exampleModalLabel').innerHTML = project_name + ' - 项目详情';
        document.querySelector('#exampleModal .modal-body').innerHTML = projectDetailsHTML();
        let datastatus = 1,
        project_chart = [],
        taskcom_desc = [],
        error_msg = [];
        await fetch('/api/projects/details', {
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
            console.log(data)
            if (data.code == 200) {
                project_chart = data.data;
            } else {
                datastatus = 0;
            }
        }).catch(error => {
            console.log(error);
            error_msg.push(error);
        })
        await fetch('/api/projects/get_task_com', {
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
            console.log(data)
            if (data.code == 200) {
                taskcom_desc = data.data;
            } else {
                datastatus = 0;
            }
        }).catch(error => {
            console.log(error);
            error_msg.push(error);
        })
        // console.log(datastatus)
        if (datastatus == 1) {
            loadJs('https://www.gstatic.com/charts/loader.js', () => {
                google.charts.load('current', {'packages':['gantt']});
                google.charts.setOnLoadCallback(drawChart);
                function drawChart() {
                    var data = new google.visualization.DataTable();
                    data.addColumn('string', 'Task ID');
                    data.addColumn('string', 'Task Name');
                    data.addColumn('date', 'Start Date');
                    data.addColumn('date', 'End Date');
                    data.addColumn('number', 'Duration');
                    data.addColumn('number', 'Percent Complete');
                    data.addColumn('string', 'Dependencies');
                    let rows = [];
                    project_chart.forEach(element => {
                        rows.push([element.task_id.toString(), element.task_name, new Date(func.utcToCst(element.start_date)), new Date(func.utcToCst(element.end_date)), null, element.com_percent, element.pre_task])
                    });
                    // console.log(data);
                    data.addRows(rows);
                    var options = {
                        height: rows.length * 42 + 50,
                        gantt: {
                            criticalPathEnabled: true,
                            criticalPathStyle: {
                                stroke: '#e64a19',
                                strokeWidth: 3
                            }
                        }
                    };
                    var chart = new google.visualization.Gantt(document.getElementById('chart_div'));
                    chart.draw(data, options);                            
                }
                document.querySelector('#exampleModal').addEventListener('shown.bs.modal', () => {
                    if (window.location.hash == '#project_manage' && document.querySelector('#chart_div')) {
                        drawChart();
                    }
                })
                window.addEventListener('resize', () => {
                    if (window.location.hash == '#project_manage' && document.querySelector('#chart_div')) {
                        drawChart();
                    }
                })
            })
            document.querySelector('#task_div').innerHTML = taskComHTML(taskcom_desc);
            // 点击空白处隐藏甘特图详情窗口
            document.querySelector('#chart_div').addEventListener('click', () => {
                document.querySelector("#chart_div > div > div > svg > g:nth-child(10) > g").classList.add('d-none');
            })
            // 监听查看按钮点击事件
            document.querySelectorAll('.task_com_btn').forEach(element => {
                element.addEventListener('click', () => {
                    let title = element.parentNode.parentNode.children[0].innerText;
                    let desc = '暂未填写进度情况';
                    for (let i = 0; i < taskcom_desc.length; i++) {
                        if (taskcom_desc[i].task_id == element.dataset.task_id) {
                            if (taskcom_desc[i].description !== null) {
                                desc = taskcom_desc[i].description;
                            }
                            break;
                        }
                    }
                    document.querySelector('#exampleModalLabel2').innerHTML = title;
                    document.querySelector('#exampleModal2 .modal-body').innerHTML = desc;
                })
            })
        } else {
            document.querySelector('#exampleModal .modal-body').innerHTML = '<div class="alert alert-danger" role="alert">该项目未添加任务</div>';
        }
    });
}


export default { projectManage, projectAdd, projectEdit, projectDetails }