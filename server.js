const express = require("express");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const app = express();

const PORT = process.env.PORT || 3000;

// Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

app.get("/", (req, res) => {
  res.send("Max Chat is running!");
});

app.get("/test-db", async (req, res) => {
  try {
    await db.collection("test").add({
      message: "Firebase works!",
      createdAt: new Date()
    });

    res.send("Firebase database works!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Firebase error");
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});