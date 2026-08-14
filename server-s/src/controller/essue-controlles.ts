import { Request, Response } from "express";
import prisma from "../lip/prisma";
import { AuthRequest } from "../middelwere/auth";



// Create Issue
export const createIssue = async (
  req: Request,
  res: Response
) => {
  try {
    const { studentId, classId, type, details } = req.body;

    if (!studentId || !classId || !type || !details) {
      return res.status(400).json({
        message: "Fill required data",
      });
    }

    const issue = await prisma.issue.create({
      data: {
        studentId,
        classId,
        type,
        details,
      },
    });

    res.status(201).json({
      message: "Issue created successfully",
      data: issue,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create issue",
      error,
    });
  }
};


// Get All Issues
export const getIssues = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const issues = await prisma.issue.findMany({
      where: req.user?.role === "STUDENT"
        ? {
            student: {
              userId: req.user.id,
            },
          }
        : {},
      orderBy: { id: "desc" },
      include: {
        student: true,
        classroom: true,
      },
    });

    res.status(200).json(issues);

  } catch (error) {
    res.status(500).json({
      message: "Failed to get issues",
      error,
    });
  }
};


// Get Single Issue
export const getIssue = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const issue = await prisma.issue.findUnique({
      where: {
        id,
      },
      include: {
        student: true,
        classroom: true,
      },
    });

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    res.status(200).json(issue);

  } catch (error) {
    res.status(500).json({
      message: "Failed to get issue",
      error,
    });
  }
};


// Update Issue
export const updateIssue = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const { classId, type, details, isResolved } = req.body;

    const issue = await prisma.issue.update({
      where: {
        id,
      },
      data: {
        ...(classId !== undefined ? { classId } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(details !== undefined ? { details } : {}),
        ...(isResolved !== undefined ? { isResolved } : {}),
      },
    });

    res.status(200).json({
      message: "Issue updated successfully",
      data: issue,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update issue",
      error,
    });
  }
};


// Delete Issue
export const deleteIssue = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    await prisma.issue.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      message: "Issue deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete issue",
      error,
    });
  }
};

export const resolveIssue = async (req: Request, res: Response) => {
  try {
    const issue = await prisma.issue.update({ where: { id: String(req.params.id) }, data: { isResolved: true } });
    res.status(200).json({ message: "Issue resolved successfully", issue });
  } catch (error) {
    res.status(500).json({ message: "Failed to resolve issue", error });
  }
};
