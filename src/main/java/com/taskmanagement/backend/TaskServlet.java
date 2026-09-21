package com.taskmanagement.backend;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@WebServlet("/tasks/*")
public class TaskServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;


    // =========================
    // CREATE TASK - POST /tasks
    // =========================
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/plain");

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userEmail") == null) {

            response.getWriter().println("Unauthorized! Please login first.");
            return;
        }

        String email = (String) session.getAttribute("userEmail");

        String title = request.getParameter("title");
        String description = request.getParameter("description");
        String status = request.getParameter("status");

        try {

            Connection con = DBConnection.getConnection();

            String userSql = "SELECT id FROM users WHERE email = ?";

            PreparedStatement userPs = con.prepareStatement(userSql);
            userPs.setString(1, email);

            ResultSet rs = userPs.executeQuery();

            if (rs.next()) {

                int userId = rs.getInt("id");

                String taskSql =
                        "INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, ?)";

                PreparedStatement taskPs = con.prepareStatement(taskSql);

                taskPs.setInt(1, userId);
                taskPs.setString(2, title);
                taskPs.setString(3, description);
                taskPs.setString(4, status);

                taskPs.executeUpdate();

                response.getWriter().println("Task created successfully!");

                taskPs.close();

            } else {

                response.getWriter().println("User not found!");
            }

            rs.close();
            userPs.close();
            con.close();

        } catch (SQLException e) {

            e.printStackTrace();
            response.getWriter().println("Task creation failed!");
        }
    }


    // =========================
    // READ TASKS - GET /tasks
    // =========================
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/plain");

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userEmail") == null) {

            response.getWriter().println("Unauthorized! Please login first.");
            return;
        }

        String email = (String) session.getAttribute("userEmail");

        try {

            Connection con = DBConnection.getConnection();

            String userSql = "SELECT id FROM users WHERE email = ?";

            PreparedStatement userPs = con.prepareStatement(userSql);
            userPs.setString(1, email);

            ResultSet userRs = userPs.executeQuery();

            if (userRs.next()) {

                int userId = userRs.getInt("id");

                String pathInfo = request.getPathInfo();


                // =========================
                // GET /tasks
                // =========================
                if (pathInfo == null || pathInfo.equals("/")) {

                    String taskSql =
                            "SELECT * FROM tasks WHERE user_id = ?";

                    PreparedStatement taskPs =
                            con.prepareStatement(taskSql);

                    taskPs.setInt(1, userId);

                    ResultSet taskRs =
                            taskPs.executeQuery();

                    boolean hasTasks = false;

                    while (taskRs.next()) {

                        hasTasks = true;

                        response.getWriter().println(
                                "ID: " + taskRs.getInt("id")
                                + " | Title: " + taskRs.getString("title")
                                + " | Description: " + taskRs.getString("description")
                                + " | Status: " + taskRs.getString("status")
                                + " | Created: " + taskRs.getTimestamp("created_at")
                        );
                    }

                    if (!hasTasks) {

                        response.getWriter().println("No tasks found.");
                    }

                    taskRs.close();
                    taskPs.close();

                }


                // =========================
                // GET /tasks/:id
                // =========================
                else {

                    String idString =
                            pathInfo.substring(1);

                    try {

                        int taskId =
                                Integer.parseInt(idString);

                        String taskSql =
                                "SELECT * FROM tasks WHERE id = ? AND user_id = ?";

                        PreparedStatement taskPs =
                                con.prepareStatement(taskSql);

                        taskPs.setInt(1, taskId);
                        taskPs.setInt(2, userId);

                        ResultSet taskRs =
                                taskPs.executeQuery();

                        if (taskRs.next()) {

                            response.getWriter().println(
                                    "ID: " + taskRs.getInt("id")
                                    + " | Title: " + taskRs.getString("title")
                                    + " | Description: " + taskRs.getString("description")
                                    + " | Status: " + taskRs.getString("status")
                                    + " | Created: " + taskRs.getTimestamp("created_at")
                            );

                        } else {

                            response.getWriter().println(
                                    "Task not found!"
                            );
                        }

                        taskRs.close();
                        taskPs.close();

                    } catch (NumberFormatException e) {

                        response.getWriter().println(
                                "Invalid task ID!"
                        );
                    }
                }

            } else {

                response.getWriter().println("User not found!");
            }

            userRs.close();
            userPs.close();
            con.close();

        } catch (SQLException e) {

            e.printStackTrace();
            response.getWriter().println(
                    "Failed to fetch tasks!"
            );
        }
    }


 // =========================
 // UPDATE TASK - PUT /tasks/:id
 // =========================
 protected void doPut(HttpServletRequest request, HttpServletResponse response)
         throws ServletException, IOException {

     response.setContentType("text/plain");

     // Check login session
     HttpSession session = request.getSession(false);

     if (session == null || session.getAttribute("userEmail") == null) {

         response.getWriter().println("Unauthorized! Please login first.");
         return;
     }

     // Get logged-in user's email
     String email = (String) session.getAttribute("userEmail");

     // Get task ID from URL
     String pathInfo = request.getPathInfo();

     if (pathInfo == null || pathInfo.equals("/")) {

         response.getWriter().println("Task ID is required!");
         return;
     }

     try {

         int taskId = Integer.parseInt(pathInfo.substring(1));

         // Read request body
         String body = request.getReader().lines()
                 .reduce("", (a, b) -> a + b);

         // Convert request body into values
         String title = null;
         String description = null;
         String status = null;

         String[] parameters = body.split("&");

         for (String parameter : parameters) {

             String[] keyValue = parameter.split("=", 2);

             if (keyValue.length == 2) {

                 String key = keyValue[0];
                 String value = keyValue[1];

                 if (key.equals("title")) {
                     title = value.replace("+", " ");
                 }

                 else if (key.equals("description")) {
                     description = value.replace("+", " ");
                 }

                 else if (key.equals("status")) {
                     status = value.replace("+", " ");
                 }
             }
         }

         Connection con = DBConnection.getConnection();

         // Find user ID
         String userSql = "SELECT id FROM users WHERE email = ?";

         PreparedStatement userPs = con.prepareStatement(userSql);

         userPs.setString(1, email);

         ResultSet userRs = userPs.executeQuery();

         if (userRs.next()) {

             int userId = userRs.getInt("id");

             // Update task
             String updateSql =
                     "UPDATE tasks SET title = ?, description = ?, status = ? "
                     + "WHERE id = ? AND user_id = ?";

             PreparedStatement updatePs =
                     con.prepareStatement(updateSql);

             updatePs.setString(1, title);
             updatePs.setString(2, description);
             updatePs.setString(3, status);
             updatePs.setInt(4, taskId);
             updatePs.setInt(5, userId);

             int rowsUpdated = updatePs.executeUpdate();

             if (rowsUpdated > 0) {

                 response.getWriter().println(
                         "Task updated successfully!"
                 );

             } else {

                 response.getWriter().println(
                         "Task not found!"
                 );
             }

             updatePs.close();

         } else {

             response.getWriter().println(
                     "User not found!"
             );
         }

         userRs.close();
         userPs.close();
         con.close();

     } catch (NumberFormatException e) {

         response.getWriter().println(
                 "Invalid task ID!"
         );

     } catch (SQLException e) {

         e.printStackTrace();

         response.getWriter().println(
                 "Task update failed!"
         );
     }
 }
//=========================
//DELETE TASK - DELETE /tasks/:id
//=========================
protected void doDelete(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {

  response.setContentType("text/plain");

  // Check login session
  HttpSession session = request.getSession(false);

  if (session == null || session.getAttribute("userEmail") == null) {

      response.getWriter().println("Unauthorized! Please login first.");
      return;
  }

  // Get logged-in user's email
  String email = (String) session.getAttribute("userEmail");

  // Get task ID from URL
  String pathInfo = request.getPathInfo();

  if (pathInfo == null || pathInfo.equals("/")) {

      response.getWriter().println("Task ID is required!");
      return;
  }

  try {

      int taskId = Integer.parseInt(pathInfo.substring(1));

      Connection con = DBConnection.getConnection();

      // Find user ID
      String userSql = "SELECT id FROM users WHERE email = ?";

      PreparedStatement userPs = con.prepareStatement(userSql);

      userPs.setString(1, email);

      ResultSet userRs = userPs.executeQuery();

      if (userRs.next()) {

          int userId = userRs.getInt("id");

          // Delete task only if it belongs to logged-in user
          String deleteSql =
                  "DELETE FROM tasks WHERE id = ? AND user_id = ?";

          PreparedStatement deletePs =
                  con.prepareStatement(deleteSql);

          deletePs.setInt(1, taskId);
          deletePs.setInt(2, userId);

          int rowsDeleted = deletePs.executeUpdate();

          if (rowsDeleted > 0) {

              response.getWriter().println(
                      "Task deleted successfully!"
              );

          } else {

              response.getWriter().println(
                      "Task not found!"
              );
          }

          deletePs.close();

      } else {

          response.getWriter().println(
                  "User not found!"
          );
      }

      userRs.close();
      userPs.close();
      con.close();

  } catch (NumberFormatException e) {

      response.getWriter().println(
              "Invalid task ID!"
      );

  } catch (SQLException e) {

      e.printStackTrace();

      response.getWriter().println(
              "Task deletion failed!"
      );
  }
}
}