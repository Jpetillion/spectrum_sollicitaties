import { config } from 'dotenv';
config();
import { executeQuery } from './server/db/client.js';

try {
  const result = await executeQuery('PRAGMA table_info(users);');
  console.log(JSON.stringify(result.rows, null, 2));
  process.exit(0);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
