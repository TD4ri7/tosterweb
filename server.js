const express = require("express");
const admin = require("firebase-admin");

const app = express();

const PORT = process.env.PORT || 3000;

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

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