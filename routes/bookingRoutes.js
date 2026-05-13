const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Booking = require("../models/booking");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function parseListQuery(req) {
  const filter = {};
  if (req.query.email) {
    filter.email = String(req.query.email).trim().toLowerCase();
  }
  if (req.query.status) {
    filter.status = String(req.query.status).trim();
  }
  const limit = Math.min(
    Math.max(parseInt(String(req.query.limit), 10) || 50, 1),
    200
  );
  const skip = Math.max(parseInt(String(req.query.skip), 10) || 0, 0);
  return { filter, limit, skip };
}

/** Create booking */
router.post("/", async (req, res) => {
  try {
    const { name, email, date, restaurant, floor, partySize, status } =
      req.body;

    if (!name || !email || !date || partySize == null) {
      return res.status(400).json({
        success: false,
        message: "name, email, date, and partySize are required",
      });
    }

    const booking = new Booking({
      name,
      email,
      date,
      restaurant: restaurant ?? "",
      floor: floor ?? "",
      partySize: Number(partySize),
      status: status ?? undefined,
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: "Booking created",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/** List bookings (optional filters: email, status, skip, limit) */
router.get("/", async (req, res) => {
  try {
    const { filter, limit, skip } = parseListQuery(req);
    const [items, total] = await Promise.all([
      Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Booking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      total,
      skip,
      limit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/** Get one booking by id */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking id",
      });
    }

    const booking = await Booking.findById(id).lean();
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/** Update booking (partial) */
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking id",
      });
    }

    const allowed = [
      "name",
      "email",
      "date",
      "restaurant",
      "floor",
      "partySize",
      "status",
    ];
    const updates = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates[key] = req.body[key];
      }
    }

    if (updates.email) {
      updates.email = String(updates.email).trim().toLowerCase();
    }

    const booking = await Booking.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      message: "Booking updated",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/** Replace full booking (same fields as create) */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking id",
      });
    }

    const { name, email, date, restaurant, floor, partySize, status } =
      req.body;

    if (!name || !email || !date || partySize == null) {
      return res.status(400).json({
        success: false,
        message: "name, email, date, and partySize are required",
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        name,
        email: String(email).trim().toLowerCase(),
        date,
        restaurant: restaurant ?? "",
        floor: floor ?? "",
        partySize: Number(partySize),
        status: status ?? "confirmed",
      },
      { new: true, runValidators: true }
    ).lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      message: "Booking replaced",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/** Delete booking */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking id",
      });
    }

    const booking = await Booking.findByIdAndDelete(id).lean();
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      message: "Booking deleted",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
