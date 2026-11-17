import { Request, Response, Router } from 'express';

// Routes d'origine de l'API "hello", conservées telles quelles.
const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Hello, World!' });
});

router.get('/hello/:name', (req: Request, res: Response) => {
  res.json({ message: `Hello, ${req.params.name}!` });
});

export default router;
