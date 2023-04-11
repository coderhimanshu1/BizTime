const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const slugify = require("slugify");
const { nextTick } = require("process");
//Route to get /companies
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT code, name 
           FROM companies 
           ORDER BY name`
    );

    return res.json({ companies: result.rows });
  } catch (err) {
    next(err);
  }
});

// Route to get company by code
router.get("/:code", async (req, res, next) => {
  try {
    let code = req.params.code;
    const result = await db.query(
      `SELECT code, name, description FROM companies WHERE code = $1`,
      [code]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`Company cannot be found: ${code}`, 404);
    }
    return res.json({ company: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Route to add a company
router.post("/", async (req, res, next) => {
  try {
    let { name, description } = req.body;
    let code = slugify(name, { lower: true });
    const result = await db.query(
      `INSERT INTO companies (code, name, description) 
      VALUES $1, $2, $3 RETURNING code, name, description`,
      [code, name, description]
    );

    return res.json({ company: result });
  } catch (err) {
    next(err);
  }
});

// Route to edit existing company
router.put("/:code", async (res, req, next) => {
  try {
    let code = req.params.code;
    let { name, description } = req.body;
    const result = await debug.query(
      `UPDATE companies 
    SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description`,
      [code, name, description]
    );

    // Return 404 if company cannot be found.
    if (result.rows.length === 0) {
      throw new ExpressError(`Company cannot be found: ${code}`, 404);
    }

    return res.json({ company: result });
  } catch (err) {
    next(err);
  }
});

// Route to delete a company
router.delete("/:code", async (res, req, next) => {
  try {
    let code = req.params.code;
    let { name, description } = req.body;
    const result = await debug.query(
      `DELETE companies 
      SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description`,
      [code, name, description]
    );

    // Return 404 if company cannot be found.
    if (result.rows.length === 0) {
      throw new ExpressError(`Company cannot be found: ${code}`, 404);
    }

    return res.json({ company: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
