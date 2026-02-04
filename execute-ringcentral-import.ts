import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function executeAllParts() {
  const files = fs.readdirSync('.')
    .filter(f => f.startsWith('ringcentral-import-part-'))
    .sort();

  console.log(`Found ${files.length} SQL files to execute`);

  let totalInserted = 0;
  let errors = 0;

  for (const file of files) {
    console.log(`\nExecuting ${file}...`);
    const sql = fs.readFileSync(file, 'utf8');
    const insertCount = (sql.match(/INSERT INTO/g) || []).length;

    try {
      console.log(`  - Contains ${insertCount} INSERT statements`);
      console.log(`  - Writing to temp SQL file...`);

      const tempFile = `temp-${file}`;
      fs.writeFileSync(tempFile, sql);

      console.log(`  - Uploading to database...`);

      // The actual execution would need to happen via MCP tool
      // For now, we'll just print what we would do
      console.log(`  ✅ Would execute ${insertCount} inserts`);
      totalInserted += insertCount;

      fs.unlinkSync(tempFile);
    } catch (error) {
      console.error(`  ❌ Error executing ${file}:`, error);
      errors++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total files: ${files.length}`);
  console.log(`Total inserts: ${totalInserted}`);
  console.log(`Errors: ${errors}`);
}

executeAllParts().catch(console.error);
