/* =========================
   GLOBAL THEME
========================= */

(function () {
    var theme = localStorage.getItem("taskflowTheme") || "system";

    if (theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
    } else if (theme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
    } else {
        document.documentElement.setAttribute(
            "data-theme",
            window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light"
        );
    }
})();


document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       LOGIN
    ========================= */

    var loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", function (event) {

            event.preventDefault();

            var email = document.getElementById("email").value.trim();
            var password = document.getElementById("password").value;
            var message = document.getElementById("message");

            if (email === "" || password === "") {

                message.className = "message error-message";
                message.textContent =
                    "Please enter your email and password.";

                return;
            }

            message.className = "message";
            message.textContent = "Signing you in...";

            fetch("login", {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },
                body:
                    "email=" + encodeURIComponent(email) +
                    "&password=" + encodeURIComponent(password)
            })

            .then(function (response) {
                return response.text();
            })

            .then(function (result) {

                if (result.indexOf("Login successful") !== -1) {

                    message.className =
                        "message success-message";

                    message.textContent =
                        "Login successful. Opening workspace...";

                    setTimeout(function () {
                        window.location.href = "dashboard.html";
                    }, 700);

                } else {

                    message.className =
                        "message error-message";

                    message.textContent = result;
                }
            })

            .catch(function (error) {

                console.error("Login error:", error);

                message.className =
                    "message error-message";

                message.textContent =
                    "Unable to connect to the server.";
            });
        });
    }


    /* =========================
       REGISTER
    ========================= */

    var registerForm =
        document.getElementById("registerForm");

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                var name =
                    document.getElementById("name").value.trim();

                var email =
                    document.getElementById("email").value.trim();

                var password =
                    document.getElementById("password").value;

                var confirmPassword =
                    document.getElementById("confirmPassword").value;

                var message =
                    document.getElementById("message");

                message.className = "message";
                message.textContent = "";

                /* Empty field validation */

                if (
                    name === "" ||
                    email === "" ||
                    password === "" ||
                    confirmPassword === ""
                ) {

                    message.className = "message error";

                    message.textContent =
                        "Please fill in all fields.";

                    return;
                }

                /* Password validation */

                if (password !== confirmPassword) {

                    message.className = "message error";

                    message.textContent =
                        "Passwords do not match.";

                    return;
                }

                if (password.length < 6) {

                    message.className = "message error";

                    message.textContent =
                        "Password must be at least 6 characters.";

                    return;
                }

                /* Send registration request */

                var formData =
                    new URLSearchParams();

                formData.append("name", name);
                formData.append("email", email);
                formData.append("password", password);

                fetch("register", {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    },
                    body: formData.toString()
                })

                .then(function (response) {
                    return response.text();
                })

                .then(function (data) {

                    console.log(
                        "Register response:",
                        data
                    );

                    if (
                        data.indexOf(
                            "Registration successful"
                        ) !== -1
                    ) {

                        message.className =
                            "message success";

                        message.textContent =
                            "Registration successful! Redirecting...";

                        setTimeout(function () {

                            window.location.href =
                                "login.html";

                        }, 1200);

                    } else {

                        message.className =
                            "message error";

                        message.textContent = data;
                    }
                })

                .catch(function (error) {

                    console.error(
                        "Registration error:",
                        error
                    );

                    message.className =
                        "message error";

                    message.textContent =
                        "Unable to connect to the server. Please try again.";
                });
            }
        );
    }


    /* =========================
       DASHBOARD
    ========================= */

    var taskList =
        document.getElementById("taskList");

    /*
     * If this is not dashboard page,
     * stop dashboard code.
     */

    if (!taskList) {
        return;
    }


    /* =========================
       DASHBOARD ELEMENTS
    ========================= */

    var taskLoading =
        document.getElementById("taskLoading");

    var taskError =
        document.getElementById("taskError");

    var emptyTasks =
        document.getElementById("emptyTasks");

    var emptyAddTask =
        document.getElementById("emptyAddTask");

    var openTaskModal =
        document.getElementById("openTaskModal");

    var taskModal =
        document.getElementById("taskModal");

    var closeTaskModal =
        document.getElementById("closeTaskModal");

    var cancelTask =
        document.getElementById("cancelTask");

    var taskForm =
        document.getElementById("taskForm");

    var modalTitle =
        document.getElementById("modalTitle");

    var taskId =
        document.getElementById("taskId");

    var taskTitle =
        document.getElementById("taskTitle");

    var taskDescription =
        document.getElementById("taskDescription");

    var taskStatus =
        document.getElementById("taskStatus");

    var taskFormMessage =
        document.getElementById("taskFormMessage");

    var logoutButton =
        document.getElementById("logoutButton");

    var totalTasks =
        document.getElementById("totalTasks");

    var pendingTasks =
        document.getElementById("pendingTasks");

    var completedTasks =
        document.getElementById("completedTasks");

    var progressPercentage =
        document.getElementById("progressPercentage");

    var progressFill =
        document.getElementById("progressFill");

    var currentDate =
        document.getElementById("currentDate");


    /* =========================
       USER PROFILE ELEMENTS
    ========================= */

    var userName =
        document.getElementById("userName");

    var userEmail =
        document.getElementById("userEmail");

    var userAvatar =
        document.getElementById("userAvatar");

    var userGreeting =
        document.getElementById("userGreeting");


    /* =========================
       VARIABLES
    ========================= */

    var tasks = [];
    var currentFilter = "all";


    /* =========================
       DATE
    ========================= */

    if (currentDate) {

        var today = new Date();

        currentDate.textContent =
            today.toLocaleDateString(
                "en-US",
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                }
            );
    }


    /* =========================
       LOAD USER PROFILE
    ========================= */

    function loadUserProfile() {

        if (!userName || !userEmail) {
            return;
        }

        fetch("profile", {
            method: "GET"
        })

        .then(function (response) {
            return response.text();
        })

        .then(function (result) {

            console.log(
                "Profile response:",
                result
            );

            if (
                result.indexOf("Unauthorized") !== -1
            ) {

                window.location.href =
                    "login.html";

                return;
            }

            var lines =
                result.split("\n");

            var name = "";
            var email = "";

            for (
                var i = 0;
                i < lines.length;
                i++
            ) {

                var line =
                    lines[i].trim();

                /*
                 * Backend returns:
                 * Name: ...
                 * Email: ...
                 */

                if (
                    line.indexOf("Name:") === 0
                ) {

                    name =
                        line.substring(5).trim();
                }

                if (
                    line.indexOf("Email:") === 0
                ) {

                    email =
                        line.substring(6).trim();
                }
            }


            /* USER NAME */

            if (name !== "") {

                userName.textContent =
                    name;

                if (userGreeting) {

                    userGreeting.textContent =
                        ", " + name;
                }

            } else {

                userName.textContent =
                    "User";

                if (userGreeting) {

                    userGreeting.textContent =
                        "";
                }
            }


            /* USER EMAIL */

            if (email !== "") {

                userEmail.textContent =
                    email;

            } else {

                userEmail.textContent =
                    "";
            }


            /* USER AVATAR */

            if (userAvatar) {

                if (name !== "") {

                    userAvatar.textContent =
                        name.charAt(0).toUpperCase();

                } else {

                    userAvatar.textContent =
                        "U";
                }
            }
        })

        .catch(function (error) {

            console.error(
                "Profile loading error:",
                error
            );

            userName.textContent =
                "User";

            userEmail.textContent =
                "";

            if (userGreeting) {

                userGreeting.textContent =
                    "";
            }

            if (userAvatar) {

                userAvatar.textContent =
                    "U";
            }
        });
    }


    /* =========================
       OPEN MODAL
    ========================= */

    function openModal(editTask) {

        taskFormMessage.textContent = "";

        if (editTask) {

            modalTitle.textContent =
                "Edit task";

            taskId.value =
                editTask.id;

            taskTitle.value =
                editTask.title;

            taskDescription.value =
                editTask.description || "";

            taskStatus.value =
                editTask.status || "pending";

        } else {

            modalTitle.textContent =
                "Create a task";

            taskId.value = "";
            taskTitle.value = "";
            taskDescription.value = "";

            taskStatus.value =
                "pending";
        }

        taskModal.style.display =
            "flex";

        setTimeout(function () {

            taskTitle.focus();

        }, 100);
    }


    /* =========================
       CLOSE MODAL
    ========================= */

    function closeModal() {

        taskModal.style.display =
            "none";

        taskForm.reset();

        taskId.value = "";

        taskStatus.value =
            "pending";

        taskFormMessage.textContent =
            "";
    }


    /* =========================
       OPEN ADD TASK
    ========================= */

    if (openTaskModal) {

        openTaskModal.addEventListener(
            "click",
            function () {

                openModal(null);
            }
        );
    }

    if (emptyAddTask) {

        emptyAddTask.addEventListener(
            "click",
            function () {

                openModal(null);
            }
        );
    }


    /* =========================
       CLOSE MODAL
    ========================= */

    if (closeTaskModal) {

        closeTaskModal.addEventListener(
            "click",
            function () {

                closeModal();
            }
        );
    }

    if (cancelTask) {

        cancelTask.addEventListener(
            "click",
            function () {

                closeModal();
            }
        );
    }

    if (taskModal) {

        taskModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === taskModal
                ) {

                    closeModal();
                }
            }
        );
    }


    /* =========================
       CREATE / UPDATE TASK
    ========================= */

    if (taskForm) {

        taskForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                var title =
                    taskTitle.value.trim();

                var description =
                    taskDescription.value.trim();

                var status =
                    taskStatus.value;

                var id =
                    taskId.value.trim();


                if (title === "") {

                    taskFormMessage.textContent =
                        "Task title is required.";

                    return;
                }


                if (title.length > 200) {

                    taskFormMessage.textContent =
                        "Task title must be 200 characters or less.";

                    return;
                }


                if (id !== "") {

                    taskFormMessage.textContent =
                        "Updating task...";

                    updateTask(
                        id,
                        title,
                        description,
                        status
                    );

                } else {

                    taskFormMessage.textContent =
                        "Creating task...";

                    createTask(
                        title,
                        description,
                        status
                    );
                }
            }
        );
    }


    /* =========================
       CREATE TASK
    ========================= */

    function createTask(
        title,
        description,
        status
    ) {

        fetch("tasks", {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded"
            },

            body:
                "title=" +
                encodeURIComponent(title) +

                "&description=" +
                encodeURIComponent(description) +

                "&status=" +
                encodeURIComponent(status)
        })

        .then(function (response) {
            return response.text();
        })

        .then(function (result) {

            if (
                result.indexOf(
                    "Task created successfully"
                ) !== -1
            ) {

                taskFormMessage.textContent =
                    "Task created successfully!";

                setTimeout(function () {

                    closeModal();
                    loadTasks();

                }, 500);

            } else {

                taskFormMessage.textContent =
                    result;
            }
        })

        .catch(function (error) {

            console.error(
                "Create task error:",
                error
            );

            taskFormMessage.textContent =
                "Unable to create task.";
        });
    }


    /* =========================
       UPDATE TASK
    ========================= */

    function updateTask(
        id,
        title,
        description,
        status
    ) {

        fetch(
            "tasks/" +
            encodeURIComponent(id),
            {

                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body:
                    "title=" +
                    encodeURIComponent(title) +

                    "&description=" +
                    encodeURIComponent(description) +

                    "&status=" +
                    encodeURIComponent(status)
            }
        )

        .then(function (response) {
            return response.text();
        })

        .then(function (result) {

            if (
                result.indexOf(
                    "Task updated successfully"
                ) !== -1
            ) {

                taskFormMessage.textContent =
                    "Task updated successfully!";

                setTimeout(function () {

                    closeModal();
                    loadTasks();

                }, 500);

            } else {

                taskFormMessage.textContent =
                    result;
            }
        })

        .catch(function (error) {

            console.error(
                "Update task error:",
                error
            );

            taskFormMessage.textContent =
                "Unable to update task.";
        });
    }


    /* =========================
       LOAD TASKS
    ========================= */

    function loadTasks() {

        taskLoading.style.display =
            "block";

        taskError.style.display =
            "none";

        emptyTasks.style.display =
            "none";

        taskList.innerHTML = "";

        fetch("tasks", {
            method: "GET"
        })

        .then(function (response) {
            return response.text();
        })

        .then(function (result) {

            if (
                result.indexOf(
                    "Unauthorized"
                ) !== -1
            ) {

                window.location.href =
                    "login.html";

                return;
            }

            tasks =
                parseTasks(result);

            taskLoading.style.display =
                "none";

            updateStatistics();
            renderTasks();
        })

        .catch(function (error) {

            console.error(
                "Load tasks error:",
                error
            );

            taskLoading.style.display =
                "none";

            taskError.style.display =
                "block";
        });
    }


    /* =========================
       PARSE TASKS
    ========================= */

    function parseTasks(text) {

        var lines =
            text.split("\n");

        var parsedTasks = [];

        for (
            var i = 0;
            i < lines.length;
            i++
        ) {

            var line =
                lines[i].trim();

            if (
                line.indexOf("ID:") !== 0
            ) {
                continue;
            }


            var idMatch =
                line.match(
                    /ID:\s*(\d+)/
                );

            var titleMatch =
                line.match(
                    /\|\s*Title:\s*(.*?)\s*\|\s*Description:/
                );

            var descriptionMatch =
                line.match(
                    /\|\s*Description:\s*(.*?)\s*\|\s*Status:/
                );

            var statusMatch =
                line.match(
                    /\|\s*Status:\s*(.*?)\s*\|\s*Created:/
                );

            var createdMatch =
                line.match(
                    /\|\s*Created:\s*(.*)$/
                );


            var task = {

                id:
                    idMatch
                        ? idMatch[1]
                        : "",

                title:
                    titleMatch
                        ? decodeTaskText(
                            titleMatch[1]
                        )
                        : "",

                description:
                    descriptionMatch
                        ? decodeTaskText(
                            descriptionMatch[1]
                        )
                        : "",

                status:
                    statusMatch
                        ? statusMatch[1]
                            .trim()
                            .toLowerCase()
                        : "pending",

                created:
                    createdMatch
                        ? createdMatch[1]
                        : ""
            };


            parsedTasks.push(task);
        }

        return parsedTasks;
    }


    /* =========================
       RENDER TASKS
    ========================= */

    function renderTasks() {

        taskList.innerHTML = "";

        var filteredTasks = [];

        for (
            var i = 0;
            i < tasks.length;
            i++
        ) {

            if (
                currentFilter === "all" ||
                tasks[i].status === currentFilter
            ) {

                filteredTasks.push(
                    tasks[i]
                );
            }
        }


        if (
            filteredTasks.length === 0
        ) {

            emptyTasks.style.display =
                "block";

            return;
        }


        emptyTasks.style.display =
            "none";


        for (
            var j = 0;
            j < filteredTasks.length;
            j++
        ) {

            createTaskCard(
                filteredTasks[j]
            );
        }
    }


    /* =========================
       CREATE TASK CARD
    ========================= */

    function createTaskCard(task) {

        var card =
            document.createElement("div");

        card.className =
            "task-card " +
            (
                task.status === "completed"
                    ? "completed"
                    : ""
            );


        var main =
            document.createElement("div");

        main.className =
            "task-card-main";


        var check =
            document.createElement("button");

        check.type = "button";

        check.className =
            "task-check " +
            (
                task.status === "completed"
                    ? "done"
                    : ""
            );

        check.textContent =
            task.status === "completed"
                ? "✓"
                : "";


        check.addEventListener(
            "click",
            function () {

                toggleTaskStatus(task);
            }
        );


        var content =
            document.createElement("div");

        content.className =
            "task-content";


        var title =
            document.createElement("h3");

        title.textContent =
            task.title;


        var description =
            document.createElement("p");

        description.textContent =
            task.description;


        var date =
            document.createElement("span");

        date.className =
            "task-date";

        date.textContent =
            formatDate(task.created);


        content.appendChild(title);


        if (
            task.description !== ""
        ) {

            content.appendChild(
                description
            );
        }


        content.appendChild(date);

        main.appendChild(check);
        main.appendChild(content);


        var actions =
            document.createElement("div");

        actions.className =
            "task-card-actions";


        var status =
            document.createElement("span");

        status.className =
            "task-status " +
            task.status;

        status.textContent =
            task.status;


        var edit =
            document.createElement("button");

        edit.type = "button";

        edit.className =
            "task-action";

        edit.textContent =
            "Edit";


        edit.addEventListener(
            "click",
            function () {

                openModal(task);
            }
        );


        var deleteButton =
            document.createElement("button");

        deleteButton.type =
            "button";

        deleteButton.className =
            "task-action";

        deleteButton.textContent =
            "Delete";


        deleteButton.addEventListener(
            "click",
            function () {

                deleteTask(task.id);
            }
        );


        actions.appendChild(status);
        actions.appendChild(edit);
        actions.appendChild(deleteButton);


        card.appendChild(main);
        card.appendChild(actions);


        taskList.appendChild(card);
    }


    /* =========================
       STATUS UPDATE
    ========================= */

    function toggleTaskStatus(task) {

        var newStatus =
            task.status === "completed"
                ? "pending"
                : "completed";


        fetch(
            "tasks/" +
            encodeURIComponent(task.id),
            {

                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body:
                    "title=" +
                    encodeURIComponent(task.title) +

                    "&description=" +
                    encodeURIComponent(task.description) +

                    "&status=" +
                    encodeURIComponent(newStatus)
            }
        )

        .then(function (response) {
            return response.text();
        })

        .then(function (result) {

            if (
                result.indexOf(
                    "Task updated successfully"
                ) !== -1
            ) {

                loadTasks();

            } else {

                alert(result);
            }
        })

        .catch(function (error) {

            console.error(
                "Status update error:",
                error
            );

            alert(
                "Unable to update task."
            );
        });
    }


    /* =========================
       DELETE TASK
    ========================= */

    function deleteTask(id) {

        var confirmed =
            window.confirm(
                "Delete this task?"
            );


        if (!confirmed) {
            return;
        }


        fetch(
            "tasks/" +
            encodeURIComponent(id),
            {
                method: "DELETE"
            }
        )

        .then(function (response) {
            return response.text();
        })

        .then(function (result) {

            if (
                result.indexOf(
                    "Task deleted successfully"
                ) !== -1
            ) {

                loadTasks();

            } else {

                alert(result);
            }
        })

        .catch(function (error) {

            console.error(
                "Delete error:",
                error
            );

            alert(
                "Unable to delete task."
            );
        });
    }


    /* =========================
       FILTERS
    ========================= */

    var filterButtons =
        document.querySelectorAll(
            ".filter-button"
        );


    for (
        var k = 0;
        k < filterButtons.length;
        k++
    ) {

        filterButtons[k].addEventListener(
            "click",
            function () {

                for (
                    var m = 0;
                    m < filterButtons.length;
                    m++
                ) {

                    filterButtons[m]
                        .classList
                        .remove("active");
                }


                this.classList.add(
                    "active"
                );


                currentFilter =
                    this.getAttribute(
                        "data-filter"
                    );


                renderTasks();
            }
        );
    }


    /* =========================
       STATISTICS
    ========================= */

    function updateStatistics() {

        var total =
            tasks.length;

        var completed = 0;
        var pending = 0;


        for (
            var i = 0;
            i < tasks.length;
            i++
        ) {

            if (
                tasks[i].status ===
                "completed"
            ) {

                completed++;

            } else {

                pending++;
            }
        }


        var progress = 0;


        if (total > 0) {

            progress =
                Math.round(
                    (completed / total) * 100
                );
        }


        totalTasks.textContent =
            total;

        pendingTasks.textContent =
            pending;

        completedTasks.textContent =
            completed;

        progressPercentage.textContent =
            progress + "%";

        progressFill.style.width =
            progress + "%";
    }


    /* =========================
       DECODE TEXT
    ========================= */

    function decodeTaskText(text) {

        try {

            return decodeURIComponent(
                text.replace(/\+/g, " ")
            );

        } catch (error) {

            return text.replace(
                /\+/g,
                " "
            );
        }
    }


    /* =========================
       FORMAT DATE
    ========================= */

    function formatDate(dateText) {

        if (!dateText) {
            return "";
        }


        var date =
            new Date(
                dateText.replace(
                    " ",
                    "T"
                )
            );


        if (
            isNaN(date.getTime())
        ) {

            return dateText;
        }


        return date.toLocaleString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }


    /* =========================
       LOGOUT
    ========================= */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                fetch("logout", {
                    method: "GET"
                })

                .then(function () {

                    window.location.href =
                        "login.html";
                })

                .catch(function () {

                    window.location.href =
                        "login.html";
                });
            }
        );
    }


    /* =========================
       START DASHBOARD
    ========================= */

    loadUserProfile();
    loadTasks();

});