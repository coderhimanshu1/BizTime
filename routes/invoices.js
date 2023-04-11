const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");

//
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT comp_code 
           FROM invoices`
    );

    return res.json({ invoices: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
