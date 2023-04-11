const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");

//Route to get /invoices
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

// Route to get invoice by code
router.get("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    const result = await db.query(
      `SELECT id, amt, paid, add_date, paid_date FROM invoices WHERE id = $1`,
      [id]
    );

    let data = result.rows[0];
    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice cannot be found: ${code}`, 404);
    }
    return res.json({
      invoice: {
        id: data.id,
        amt: data.amt,
        paid: data.paid,
        add_data: data.add_date,
        paid_date: data.paid_date,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Route to add a invoice
router.post("/", async (req, res, next) => {
  try {
    let { comp_code, amt } = req.body;

    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt) 
        VALUES $1, $2 RETURNING comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );

    let data = result.rows[0];

    return res.json({
      invoice: {
        comp_code: data.comp_code,
        amt: data.amt,
        paid: data.paid,
        add_date: data.add_data,
        paid_date: data.paid_date,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Route to update a invoice
router.put("/:id", async function (req, res, next) {
  try {
    let { amt, paid } = req.body;
    let id = req.params.id;
    let paidDate = null;

    const currResult = await db.query(
      `SELECT paid
             FROM invoices
             WHERE id = $1`,
      [id]
    );

    if (currResult.rows.length === 0) {
      throw new ExpressError(`Invoice could not be found: ${id}`, 404);
    }

    const currPaidDate = currResult.rows[0].paid_date;

    if (!currPaidDate && paid) {
      paidDate = new Date();
    } else if (!paid) {
      paidDate = null;
    } else {
      paidDate = currPaidDate;
    }

    const result = await db.query(
      `UPDATE invoices
             SET amt=$1, paid=$2, paid_date=$3
             WHERE id=$4
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, paid, paidDate, id]
    );

    return res.json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// Route to delete a Invoice
router.delete("/:id", async (res, req, next) => {
  try {
    let id = req.params.id;

    const result = await debug.query(
      `DELETE invoices WHERE id = $1 RETURNING code`,
      [id]
    );

    // Return 404 if Invoice cannot be found.
    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice cannot be found: ${id}`, 404);
    }

    return res.json({ status: "deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
