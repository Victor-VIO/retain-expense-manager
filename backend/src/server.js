import 'dotenv/config';
import app from './app.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set.');
  process.exit(1);
}

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Retain API running on port ${port}`));
