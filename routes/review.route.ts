// routes/review.ts

import express from "express";
import Review from "../modals/review.model";

const review= express.Router();

review.post("/", async (req, res) => {
  try {
    const { doctorId, patientId, rating, comment } = req.body;

    const newReview = await Review.create({
      doctorId,
      patientId,
      rating,
      comment,
    });

    res
      .status(201)
      .json({ message: "Review submitted successfully", review: newReview });
  } catch (err) {
    console.error("Submit review error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default review;
