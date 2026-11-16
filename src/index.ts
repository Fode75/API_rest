import express, { Request, Response } from "express";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Hello, World!" });
});

app.get("/hello/:name", (req: Request, res: Response) => {
  res.json({ message: `Hello, ${req.params.name}!` });
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
