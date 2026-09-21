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

@WebServlet("/profile")
public class ProfileServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/plain;charset=UTF-8");

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userEmail") == null) {
            response.getWriter().println("Unauthorized!");
            return;
        }

        String email = (String) session.getAttribute("userEmail");

        String sql = "SELECT name, email FROM users WHERE email = ?";

        try (
            Connection con = DBConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)
        ) {

            ps.setString(1, email);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {

                    response.getWriter().println("Name: " + rs.getString("name"));
                    response.getWriter().println("Email: " + rs.getString("email"));

                } else {

                    response.getWriter().println("Profile not found.");

                }
            }

        } catch (SQLException e) {

            e.printStackTrace();

            response.getWriter().println("Unable to load profile.");
        }
    }
}