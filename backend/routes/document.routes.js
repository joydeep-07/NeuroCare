const express = require("express");
const {
  uploadDocument,
  getDocuments,
  deleteDocument,
} = require("../controllers/document.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

router.post("/upload", uploadDocument);
router.get("/", getDocuments);
router.delete("/:id", deleteDocument);

module.exports = router;
