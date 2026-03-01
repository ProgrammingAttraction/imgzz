const express = require('express');
const Admin = require('../models/Admin');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --------------------------admin-register---------------------------
router.post("/admin/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingAdmin = await Admin.findOne({ $or: [{ name }, { email }] });
        
        if (existingAdmin) {
            return res.send({ success: false, message: "Admin with the same name or email already exists" });
        }
        
        const passwordHash = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({
            name, 
            email, 
            password: passwordHash
        });

        await newAdmin.save();
        
        const token = jwt.sign(
            { id: newAdmin._id, email: newAdmin.email, name: newAdmin.name },
            process.env.JWT_SECRET,
        );
        
        res.send({
            success: true,
            message: "Admin registered successfully", 
            token: token,
            admin: {
                id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "Server error" });
    }
});

// -----------------------------admin-login---------------------------
router.post("/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // FIX: Use findOne() instead of find() to get a single document
        const admin = await Admin.findOne({ email: email });
        
        if (!admin) {
            return res.send({ success: false, message: "Admin not found" });
        }
        
        // Check if password exists (just to be safe)
        if (!admin.password) {
            return res.send({ success: false, message: "Admin password not set" });
        }
        
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        
        if (!isPasswordValid) {
            return res.send({ success: false, message: "Invalid password" });
        }

        const token = jwt.sign(
            {
                id: admin._id,
                email: admin.email,
                name: admin.name,
            },
            process.env.JWT_SECRET,
        );

        res.send({
            success: true,
            message: "Admin logged in successfully",
            token: token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "Server error" });
    }
});

module.exports = router;