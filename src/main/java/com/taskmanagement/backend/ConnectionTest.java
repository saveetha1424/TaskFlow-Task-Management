package com.taskmanagement.backend;

import java.sql.Connection;

public class ConnectionTest {

    public static void main(String[] args) {

        try {
            Connection con = DBConnection.getConnection();

            if (con != null) {
                System.out.println("Database connected successfully!");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}