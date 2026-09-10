const express = require("express");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

// Главная страница
app.get("/", async (req, res) => {
  const snapshot = await db.collection("library").get();

  let books = "";

  snapshot.forEach((doc) => {
    const data = doc.data();

    books += `
      <div style="
        border: 1px solid #ddd;
        padding: 15px;
        margin: 10px 0;
        border-radius: 10px;
      ">
        <h3>${data.title}</h3>
        <p>${data.description || ""}</p>

        ${
          data.url
            ? `<a href="${data.url}" target="_blank">Открыть</a>`
            : ""
        }

        <form method="POST" action="/delete/${doc.id}" style="margin-top:10px;">
          <button type="submit">Удалить</button>
        </form>
      </div>
    `;
  });

  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <title>Библиотека</title>
    </head>

    <body style="
      font-family: Arial;
      max-width: 700px;
      margin: 40px auto;
      padding: 20px;
    ">

      <h1>📚 Моя библиотека</h1>

      <form method="POST" action="/add" style="
        border: 1px solid #ddd;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 30px;
      ">

        <h2>Добавить</h2>

        <input
          name="title"
          placeholder="Название"
          required
          style="padding:10px;width:95%;margin-bottom:10px;"
        >

        <input
          name="description"
          placeholder="Описание"
          style="padding:10px;width:95%;margin-bottom:10px;"
        >

        <input
          name="url"
          placeholder="Ссылка"
          style="padding:10px;width:95%;margin-bottom:10px;"
        >

        <button type="submit">Добавить</button>

      </form>

      <h2>Материалы</h2>

      ${books || "<p>Библиотека пока пустая.</p>"}

    </body>
    </html>
  `);
});

// Добавление
app.post("/add", express.urlencoded({ extended: true }), async (req, res) => {
  await db.collection("library").add({
    title: req.body.title,
    description: req.body.description || "",
    url: req.body.url || "",
    createdAt: new Date()
  });

  res.redirect("/");
});

// Удаление
app.post("/delete/:id", async (req, res) => {
  await db.collection("library").doc(req.params.id).delete();

  res.redirect("/");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});