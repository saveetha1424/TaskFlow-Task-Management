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
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;

@WebServlet("/update-profile")
public class UpdateProfileServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    protected void doPost(HttpServletRequest request,
                           HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/plain;charset=UTF-8");

        HttpSession session = request.getSession(false);

        if (session == null ||
            session.getAttribute("userEmail") == null) {

            response.getWriter().println("Unauthorized!");
            return;
        }

        String oldEmail =
                (String) session.getAttribute("userEmail");

        String name =
                request.getParameter("name");

        String email =
                request.getParameter("email");

        if (name == null || name.trim().isEmpty()
                || email == null || email.trim().isEmpty()) {

            response.getWriter().println(
                    "Please fill in all fields."
            );
            return;
        }

        name = name.trim();
        email = email.trim();

        String sql =
                "UPDATE users SET name = ?, email = ? WHERE email = ?";

        try (
            Connection con = DBConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)
        ) {

            ps.setString(1, name);
            ps.setString(2, email);
            ps.setString(3, oldEmail);

            int updated = ps.executeUpdate();

            if (updated > 0) {

                session.setAttribute("userEmail", email);

                response.getWriter().println(
                        "Profile updated successfully!"
                );

            } else {

                response.getWriter().println(
                        "Profile update failed."
                );
            }

        } catch (SQLIntegrityConstraintViolationException e) {

            response.getWriter().println(
                    "Email already exists. Please use another email."
            );

        } catch (SQLException e) {

            e.printStackTrace();

            response.getWriter().println(
                    "Unable to update profile."
            );
        }
    }
}