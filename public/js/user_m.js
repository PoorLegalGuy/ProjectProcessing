import func from './main.js'


// 创建用户列表的html
const createUserListHtml = (users) => {
    let html = `
    <div class="col-md-12">
        <div class="col-md-12 d-flex justify-content-end"><button id="add_user_btn" class="btn btn-success btn-sm ms-auto" data-bs-toggle="modal" data-bs-target="#exampleModal">新增用户</button></div>
        <table id="user_table" class="table table-striped">
            <thead>
                <tr>
                    <th>用户名</th>
                    <th>姓名</th>
                    <th>角色</th>
                    <th>邮箱</th>
                    <th>状态</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
    `;
    users.forEach(user => {
        html += `
            <tr>
                <td>${user.username}</td>
                <td>${user.pname?user.pname:''}</td>
                <td>${user.roleName}</td>
                <td>${user.email}</td>
                <td>${user.is_disabled==0?'正常':'禁用'}</td>
                <td>
                    <div class="btn-group" role="group" aria-label="Basic mixed styles example">
                        <button class="btn btn-primary btn-sm edit_user_btn" data-bs-toggle="modal" data-bs-target="#exampleModal">编辑</button>
                    </div>
                </td>
            </tr>
        `;
    });
    html += `
            </tbody>
        </table></div>
    `;
    return html;
}

// 注册新用户的html
const createAddUserHtml = () => {
    const html = `
    <div class="col-md-12">
        <form id="add_user_form">
            <div class="mb-3">
                <label for="username" class="form-label">用户名</label>
                <input type="text" class="form-control" id="username" name="username" placeholder="请输入用户名" required>
            </div>
            <div class="mb-3">
                <label for="pname" class="form-label">姓名</label>
                <input type="text" class="form-control" id="pname" name="pname" placeholder="请输入姓名" required>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">密码</label>
                <input type="password" class="form-control" id="password" name="password" placeholder="请输入密码" required>
            </div>
            <div class="mb-3">
                <label for="registerConfirmPassword" class="form-label">确认密码</label>
                <input type="password" class="form-control" id="registerConfirmPassword" name="registerConfirmPassword" placeholder="请再次输入密码" required>
            </div>
            <div class="mb-3">
                <label for="uemail" class="form-label">邮箱</label>
                <input type="email" class="form-control" id="uemail" name="uemail" placeholder="请输入邮箱" required>
            </div>
            <div class="mb-3">
                <label for="urole" class="form-label">用户角色</label>
                <select class="form-select" id="urole" name="urole" required>
                    <option value="">请选择用户角色</option>
                    <option value="admin">系统管理员</option>
                    <option value="project_manager">项目经理</option>
                    <option value="project_member">项目成员</option>
                </select>
            </div>
            <div class="mb-3 d-flex justify-content-center align-items-center">
                <button type="submit" class="btn btn-primary m-3">注册</button>
                <button type="button" class="btn btn-secondary m-3" id="cancel_add_user" data-bs-dismiss="modal" aria-label="Close">取消</button>
            </div>
        </form>
    </div>
    `;
    return html;
}

// 加载编辑用户信息的html(用户名不可更改)
const createEditUserHtml = (user) => {
    // const user = JSON.parse(user_json);
    const html = `
    <div class="col-md-12">
        <form id="edit_user_form">
            <div class="mb-3">
                <label for="username" class="form-label">用户名</label>
                <input type="text" class="form-control" id="username" name="username" placeholder="请输入用户名" required value="${user.username}" readonly>
            </div>
            <div class="mb-3">
                <label for="pname" class="form-label">姓名</label>
                <input type="text" class="form-control" id="pname" name="pname" placeholder="请输入姓名" required value="${user.pname?user.pname:''}" readonly>
            </div>
            <div class="mb-3">
                <label for="urole" class="form-label">用户角色</label>
                <select class="form-select" id="urole" name="urole" required>
                    <option value="">请选择用户角色</option>
                    <option value="admin" ${user.role === '系统管理员' ? 'selected' : ''}>系统管理员</option>
                    <option value="project_manager" ${user.role === '项目经理' ? 'selected' : ''}>项目经理</option>
                    <option value="project_member" ${user.role === '项目成员' ? 'selected' : ''}>项目成员</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="uemail" class="form-label">邮箱</label>
                <input type="email" class="form-control" id="uemail" name="uemail" placeholder="请输入邮箱" required value="${user.email}">
            </div>
            <div class="mb-3">
                <label for="is_disabled" class="form-label">用户状态</label>
                <select class="form-select" id="is_disabled" name="is_disabled" required>
                    <option value="">请设置该用户状态</option>
                    <option value="1" ${user.status === '禁用' ? 'selected' : ''}>禁用</option>
                    <option value="0" ${user.status === '正常' ? 'selected' : ''}>启用</option>
                </select>
            </div>
            <div class="mb-3 d-flex justify-content-center align-items-center">
                <button type="submit" class="btn btn-primary m-3">保存</button>
                <button type="button" class="btn btn-secondary m-3" id="cancel_edit_user" data-bs-dismiss="modal" aria-label="Close">取消</button>
                <button type="button" class="btn btn-warning m-3" id="reset_password" data-bs-target="#exampleModal2" data-bs-toggle="modal">重置密码</button>
                <button type="button" class="btn btn-danger m-3" id="delete_user">删除用户</button>
            </div>
        </form>
    </div>
    `
    return html;
}

// 加载管理员重置密码页面的html
const resetPasswordHtml = (user) => {
    const html = `
    <div class="col-md-12">
        <form id="reset_password_form">
            <div class="mb-3">
                <label for="username" class="form-label">用户名</label>
                <input type="text" class="form-control" id="username" name="username" placeholder="请输入用户名"required value="${user.username}" readonly>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">密码</label>
                <input type="password" class="form-control" id="password" name="password" placeholder="请输入密码" required>
            </div>
            <div class="mb-3">
                <label for="resetConfirmPassword" class="form-label">确认密码</label>
                <input type="password" class="form-control" id="resetConfirmPassword" name="resetConfirmPassword" placeholder="请再次输入密码" required>
            </div>
            <div class="mb-3 d-flex justify-content-center align-items-center">
                <button type="submit" class="btn btn-primary m-3">重置密码</button>
                <button type="button" class="btn btn-secondary m-3" id="cancel_reset_password" data-bs-target="#exampleModal" data-bs-toggle="modal">取消</button>
            </div>
        </form>
    </div>
    `
    return html;
}

// 加载用户重置密码页面的Html
const userResetPasswordHtml = () => {
    const html = `
    <div class="row justify-content-center">
        <div class="col-6">
            <form id="user_reset_password_form">
                <div class="mb-3">
                    <label for="original_password" class="form-label">原密码</label>
                    <input type="password" class="form-control" id="original_password" name="original_password" placeholder="请输入原密码" required>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">新密码</label>
                    <input type="password" class="form-control" id="password" name="password" placeholder="请输入新密码" required>
                </div>
                <div class="mb-3">
                    <label for="resetConfirmPassword" class="form-label">确认密码</label>
                    <input type="password" class="form-control" id="resetConfirmPassword" name="resetConfirmPassword" placeholder="请再次输入密码" required>
                </div>
                <div class="mb-3 d-flex justify-content-center align-items-center">
                    <button type="submit" class="btn btn-primary m-3">重置密码</button>
                    <button type="button" class="btn btn-secondary m-3" id="cancel_user_reset_password" data-bs-dismiss="modal" aria-label="Close">取消</button>
                </div>
            </form>
        </div>

    `;
    return html;
}

// 管理员重置密码function
const resetPassword = (user) => {
    func.chk_token(window.sessionStorage.getItem('u_token'), () => {
        document.querySelector('#content').innerHTML = resetPasswordHtml(user);
    });
}


// 处理用户管理页面事件
const userManage = () => {
    func.chk_token(window.sessionStorage.getItem('u_token'), () => {
        // 使用u_token请求用户列表
        fetch('/api/users/list', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': window.sessionStorage.getItem('u_token')
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.message == '用户信息获取成功') {
                // 创建用户列表数组
                const [ users ] = [ data.userinfo ]; 
                // 加载用户管理页面
                document.querySelector('#content').innerHTML = createUserListHtml(users); //加载用户列表
                // 监听新增用户按钮
                document.querySelector('#add_user_btn').addEventListener('click', () => {
                    userRegister();
                });
                // 监听所有用户编辑按钮
                document.querySelectorAll('.edit_user_btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        // 获取该按钮所在行
                        const tr = btn.parentNode.parentNode.parentNode;
                        // console.log(tr);
                        if (tr) {
                            const user = {
                                username: tr.children[0].innerHTML,
                                pname: tr.children[1].innerHTML,
                                role: tr.children[2].innerHTML,
                                email: tr.children[3].innerHTML,
                                status: tr.children[4].innerHTML
                            }
                            // console.log(user);
                            userEdit(user);
                        }
                    });
                })
            } else {
                // alert(data.message);
                document.querySelector('#content').innerHTML = `<div class="alert alert-danger" role="alert">${data.message}</div>`;
            }
        })
        .catch(error => {
            console.error(error);
        });
    });
}

const userRegister = () => {
    // 加载注册用户页面
    func.chk_token(window.sessionStorage.getItem('u_token'), () => {        document.querySelector('#exampleModalLabel').innerHTML = '新增用户';
        document.querySelector('#exampleModal .modal-body').innerHTML = createAddUserHtml();
        // 监听注册用户表单
        document.querySelector('#add_user_form').addEventListener('submit', (e) => {
            e.preventDefault();
            // 获取表单数据
            const formData = new FormData(document.querySelector('#add_user_form'));
            const formDataObj = Object.fromEntries(formData.entries());
            console.log(formDataObj);
            if (formDataObj.password != formDataObj.registerConfirmPassword) {
                alert('两次输入的密码不一致');
                return;
            } else {
                // 发送注册用户请求
                fetch('/api/users/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': window.sessionStorage.getItem('u_token')
                    },
                    body: JSON.stringify(formDataObj)
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    alert(data.message);
                    if (data.message == '注册成功') {
                        document.querySelector('#cancel_add_user').click();
                        userManage();
                    }
                })
            }
        });
    });
}

const userEdit = (user) => {
    // 加载编辑用户页面
    func.chk_token(window.sessionStorage.getItem('u_token'), () => {
        // document.querySelector('#content').innerHTML = createEditUserHtml(user);
        document.querySelector('#exampleModalLabel').innerHTML = '编辑用户';
        document.querySelector('#exampleModal .modal-body').innerHTML = createEditUserHtml(user);
        // 监听编辑用户表单
        document.querySelector('#edit_user_form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(document.querySelector('#edit_user_form'));
            const formDataObj = Object.fromEntries(formData.entries());
            console.log(formDataObj);
            fetch('/api/users/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': window.sessionStorage.getItem('u_token')
                },
                body: JSON.stringify(formDataObj)
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                alert(data.message);
                if (data.message == '用户信息更新成功') {
                    document.querySelector('#cancel_edit_user').click();
                    userManage();
                }
            })
        })
        // 监听重置密码按钮
        document.querySelector('#reset_password').addEventListener('click', () => {
            adminPasswordReset();
        });
        // 监听删除用户按钮
        document.querySelector('#delete_user').addEventListener('click', () => {
            const user = { username: document.querySelector('#username').value };
            console.log(user);
            const confirmDeleteUser = () => {
                let result = '';
                func.chk_token(window.sessionStorage.getItem('u_token'), () => {
                    if (confirm('确定删除该用户吗？')) {
                        result = true;
                    } else {
                        result = false;
                    }
                });
                return result;
            }
            if (confirmDeleteUser()) {
                fetch('/api/users/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': window.sessionStorage.getItem('u_token')
                    },
                    body: JSON.stringify(user)
                })
                .then(response => response.json())
                .then(
                    data => {
                        console.log(data);
                        alert(data.message);
                        if (data.message == '用户删除成功') {
                            document.querySelector('#cancel_edit_user').click();
                            userManage();
                        }
                    }
                )
            }
        });
    });
}

const adminPasswordReset = () => {
    const user = { username: document.querySelector('#username').value };
    // resetPassword(user); // 加载重置密码页面
    document.querySelector('#exampleModalLabel2').innerHTML = '重置密码';
    document.querySelector('#exampleModal2 .modal-body').innerHTML = resetPasswordHtml(user);
    // 监听重置密码表单
    document.querySelector('#reset_password_form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(document.querySelector('#reset_password_form'));
        const formDataObj = Object.fromEntries(formData.entries());
        console.log(formDataObj);
        if (formDataObj.password != formDataObj.resetConfirmPassword) {
            alert('两次输入的密码不一致');
            return;
        } else {
            // 发送重置密码请求
            fetch('/api/users/admin_reset_password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': window.sessionStorage.getItem('u_token')
                },
                body: JSON.stringify(formDataObj)
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                alert(data.message);
                if (data.message == '用户密码重置成功') {
                    document.querySelector('#cancel_reset_password').click();
                }
            })
        }
    });
}

const userPasswordReset = () => {
    func.chk_token(window.sessionStorage.getItem('u_token'), () => {
        document.querySelector('#exampleModalLabel').innerHTML = '重置密码';
        document.querySelector('#exampleModal .modal-body').innerHTML = userResetPasswordHtml();
        // 监听重置密码表单提交
        document.querySelector('#user_reset_password_form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(document.querySelector('#user_reset_password_form'));
            const formDataObj = Object.fromEntries(formData.entries());
            console.log(formDataObj);
            if (formDataObj.password !== formDataObj.resetConfirmPassword) {
                alert('两次密码不一致');
                return;
            } else {
                fetch('/api/users/user_reset_password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': window.sessionStorage.getItem('u_token')
                    },
                    body: JSON.stringify(formDataObj)
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    alert(data.message);
                    if (data.message == '用户密码重置成功') {
                        document.querySelector('#cancel_user_reset_password').click();
                    }
                })
            }
        });
    });
}

export default { userManage, userRegister, userEdit, adminPasswordReset, userPasswordReset };