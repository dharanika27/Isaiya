import express from 'express';
import cors from 'cors';
import { searchIntentRouter } from './routes/searchIntent';
import { suggestionsRouter } from './routes/suggestions';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(searchIntentRouter);
app.use(suggestionsRouter);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`[isaiya-search-api] listening on port ${port}`);
});
