import jwt from "jsonwebtoken";
import admin from "../models/adminModel.js";

export const registerAdmin = async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;

    // Validate required fields
    if (!name) return res.status(400).send({ message: "Name is required" });
    if (!password)
      return res.status(400).send({ message: "Password is required" });
    if (!role || !["admin", "subadmin"].includes(role)) {
      return res.status(400).send({
        message: "Role is required and must be either 'admin' or 'subadmin'",
      });
    }

    // Check if the user already exists by name
    const existingUser = await admin.findOne({ name });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "This name is already registered",
      });
    }

    // Create new admin document
    const newAdmin = new admin({
      name,
      password,
      role,
      ...(phone && { phone }),
    });

    // Save the admin
    const savedAdmin = await newAdmin.save();

    res.status(201).send({
      success: true,
      message: "Admin registered successfully",
      user: savedAdmin,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).send({
      success: false,
      message: "Error in creating admin",
      error: error.message,
    });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).send({
        success: false,
        message: "Invalid user name or password",
      });
    }

    const user = await admin.findOne({ name });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Name is not registered",
      });
    }

    // Compare plain text password
    if (password !== user.password) {
      return res.status(401).send({
        success: false,
        message: "Invalid password",
      });
    }

    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).send({
      success: true,
      message: "Login successfully",
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        password: user.password,
        slug: user.slug, // Include slug in the response
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await admin.find();
    res.status(200).send({
      success: true,
      message: "All admins fetched successfully",
      admins,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in fetching admins",
      error,
    });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate if ID exists
    if (!id) {
      return res.status(400).send({
        success: false,
        message: "Admin ID is required",
      });
    }

    // Validate the ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        success: false,
        message: "Invalid admin ID format",
      });
    }

    // Create update object with only provided fields
    const updateFields = {};
    if (updateData.name) updateFields.name = updateData.name;
    if (updateData.phone) updateFields.phone = updateData.phone;
    if (updateData.password) updateFields.password = updateData.password;
    if (updateData.role) {
      if (!["admin", "subadmin"].includes(updateData.role)) {
        return res.status(400).send({
          success: false,
          message: "Role must be either 'admin' or 'subadmin'",
        });
      }
      updateFields.role = updateData.role;
    }

    const updatedAdmin = await admin.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedAdmin) {
      return res.status(404).send({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Admin updated successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error("Error in updating admin:", error);
    res.status(500).send({
      success: false,
      message: "Error in updating admin",
      error: error.message,
    });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if ID exists
    if (!id) {
      return res.status(400).send({
        success: false,
        message: "Admin ID is required",
      });
    }

    // Validate the ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        success: false,
        message: "Invalid admin ID format",
      });
    }

    const deletedAdmin = await admin.findByIdAndDelete(id);

    if (!deletedAdmin) {
      return res.status(404).send({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Admin deleted successfully",
      admin: deletedAdmin,
    });
  } catch (error) {
    console.error("Error in deleting admin:", error);
    res.status(500).send({
      success: false,
      message: "Error in deleting admin",
      error: error.message,
    });
  }
};
