import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function importAllBatches() {
  const batchFiles = fs.readdirSync('.')
    .filter(f => f.startsWith('final-batch-'))
    .sort();

  console.log(`Found ${batchFiles.length} batch files to import`);
  console.log('');

  let totalRecords = 0;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < batchFiles.length; i++) {
    const file = batchFiles[i];
    const sql = fs.readFileSync(file, 'utf8');
    const recordCount = (sql.match(/INSERT INTO/g) || []).length;

    console.log(`[${i + 1}/${batchFiles.length}] Processing ${file} (${recordCount} records)...`);
    totalRecords += recordCount;

    try {
      const { error } = await supabase.rpc('exec_sql', { sql });

      if (error) {
        // Try executing each statement individually
        console.log(`  Batch failed, trying individual inserts...`);
        const statements = sql.split(';').filter(s => s.trim().startsWith('INSERT'));

        for (const statement of statements) {
          try {
            const { error: indivError } = await supabase.rpc('exec_sql', { sql: statement + ';' });
            if (indivError) {
              errorCount++;
              console.log(`  ❌ Error: ${indivError.message.substring(0, 100)}`);
            } else {
              successCount++;
            }
          } catch (err: any) {
            errorCount++;
          }
        }
      } else {
        successCount += recordCount;
        console.log(`  ✅ Imported ${recordCount} records`);
      }
    } catch (err: any) {
      console.error(`  ❌ Exception: ${err.message}`);
      errorCount += recordCount;
    }

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('');
  console.log('=== Import Summary ===');
  console.log(`Total batches: ${batchFiles.length}`);
  console.log(`Total records: ${totalRecords}`);
  console.log(`✅ Successfully imported: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);

  // Verify final count
  const { data, error } = await supabase
    .from('sponsor_leads')
    .select('id', { count: 'exact', head: true })
    .eq('is_historical', true)
    .eq('sponsor_id', '93110e75-235b-4586-91f2-196deca40133');

  if (!error && data !== null) {
    console.log(`\nFinal verification: ${data} RingCentral historical leads in database`);
  }
}

importAllBatches().catch(console.error);
