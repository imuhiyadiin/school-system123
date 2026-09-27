import hashpass from "bcryptjs";
import { Request, Response } from "express";
import prisma from "../lip/prisma";
import { generateToken } from "../secure/generate-token";
import { AuthRequest } from "../middelwere/auth";

// register user

export const registerUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, password, email, role, permissions } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedName = typeof name === "string" ? name.trim() : "";

    if (!normalizedName || typeof password !== "string" || !password.length || !normalizedEmail) {
      return res.status(400).json({
        message: "complete data name,email and password",
        status: 400,
      });
    }

    const checkEmail = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (checkEmail) {
      return res.status(400).json({
        message: "user email is already exist!..",
        status: 400,
      });
    }

    const passwordHash = hashpass.hashSync(password);

    // create data
    // findFirst where
    // update data where
    // delete where

    const selectedRole = role === "ADMIN"
      || role === "TEACHER"
      || role === "User"
      ? role
      : "STUDENT";
    const allowedPermissions = ["/dashboud/students", "/dashboud/teachers", "/dashboud/classrooms", "/dashboud/subjects", "/dashboud/exams", "/dashboud/results", "/dashboud/attendance", "/dashboud/timetable", "/dashboud/buses", "/dashboud/fees", "/dashboud/staff", "/dashboud/payroll", "/dashboud/issues", "/dashboud/users"];
    const selectedPermissions = Array.isArray(permissions)
      ? permissions.filter((permission): permission is string => typeof permission === "string" && allowedPermissions.includes(permission))
      : [];

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        username: normalizedName,
        password: passwordHash,
        role: selectedRole,
        permissions: selectedPermissions,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        role: true,
        permissions: true,
      },
    });

    const access_token = generateToken({
      email: newUser.email,
      id: newUser.id,
      role: newUser.role,
    });

    res.json({
      message: "user created success ✔️",
      user: { ...newUser, fullName: newUser.username, access_token },
    });
  } catch (error) {
    return res.status(500).json({
      message: "server error",
      status: 500,
    });
  }
};

// login user

export const userLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || typeof password !== "string" || !password.length) {
      return res.status(400).json({
        message: "enter your email and password",
        status: 400,
      });
    }

    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        message: "wrong credentials!.",
        status: 401,
      });
    }

    const dehashPass = hashpass.compareSync(password, user?.password);

    if (!dehashPass) {
      return res.status(401).json({
        message: "wrong credentials!.",
        status: 401,
      });
    }

    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.username,
      createdAt: user.createdAt,
      role: user.role,
      permissions: user.permissions,
      access_token: generateToken({
        email: user.email,
        id: user.id,
        role: user.role,
      }),
    };

    res.json({
      message: "successfully loged!.",
      user: userData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "server error",
      status: 500,
    });
  }
};

// whoami

export const whoami = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findFirst({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      message: "operation success",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "sever error",
      error,
    });
  }
};

// update user

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { fullname, name, email, password, role, permissions } = req.body;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updatedName = String(fullname ?? name ?? "").trim();
    const updatedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const validRoles = ["ADMIN", "TEACHER", "STUDENT", "CASHIER", "User"];

    if (!id || (!updatedName && !updatedEmail && !password && !role && !Array.isArray(permissions))) {
      return res.status(400).json({
        message: "Provide at least one user field to update.",
      }); 
    }

    const user = await prisma.user.findFirst({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        message: "User Not Found!!!.",
      });
    }

    if (updatedEmail && updatedEmail !== user.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email: updatedEmail } });
      if (existingEmail && existingEmail.id !== id)
        return res.status(409).json({ message: "That email is already used by another account." });
    }
    if (role && !validRoles.includes(role))
      return res.status(400).json({ message: "Invalid user role." });
    if (password !== undefined && (typeof password !== "string" || !password.length))
      return res.status(400).json({ message: "Password cannot be empty." });

    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        ...(updatedName ? { username: updatedName } : {}),
        ...(updatedEmail ? { email: updatedEmail } : {}),
        ...(password ? { password: hashpass.hashSync(password, 10) } : {}),
        ...(role ? { role } : {}),
        ...(Array.isArray(permissions)
          ? {
              permissions: permissions.filter(
                (permission): permission is string =>
                  typeof permission === "string" &&
                  ["/dashboud/students", "/dashboud/teachers", "/dashboud/classrooms", "/dashboud/subjects", "/dashboud/exams", "/dashboud/results", "/dashboud/attendance", "/dashboud/timetable", "/dashboud/buses", "/dashboud/fees", "/dashboud/staff", "/dashboud/payroll", "/dashboud/issues", "/dashboud/users"].includes(permission)
              ),
            }
          : {}),
      },
      select: { id: true, username: true, email: true, role: true, permissions: true },
    });

    res.json({
      message: "user updated success",
      user: updatedUser,
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002")
      return res.status(409).json({ message: "That email or username is already used by another account." });
    res.status(500).json({
      message: "server error",
    });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    if (req.user?.id === id) return res.status(400).json({ message: "You cannot delete your own account" });
    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted successfully" });
  } catch {
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// get all users

export const allUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json({
      result: [...users],
    });
  } catch (error) {
    res.status(500).json({
      message: "server error",
      error,
    });
  }
};

// change role

export const chanegRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id, role } = req.body;

    if (req.user?.role !== "ADMIN") {
      return res.status(405).json({
        message: "not have permission to change role",
      }); 
    }

    if (!id || !role) {
      return res.status(400).json({
        message: "complete info",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    const updateRole = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({
      message: "user role changed success",
      result: updateRole,
    });
  } catch (error) {
    error;
  }
};

export const studentLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Enter your username and password" });
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ username }, { email: username }] },
    });

    if (!user || user.role !== "STUDENT" || !hashpass.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Student credentials are incorrect" });
    }

    const access_token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      message: "Student signed in successfully",
      user: { id: user.id, email: user.email, fullName: user.username, role: user.role, access_token },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to sign in student" });
  }
};

export const logout = (_req: Request, res: Response) => {
  res.json({ message: "Signed out successfully" });
};
