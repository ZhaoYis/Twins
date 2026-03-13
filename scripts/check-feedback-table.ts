import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const client = postgres(process.env.POSTGRES_URL!);
  
  try {
    // Check if feedback table exists
    const result = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'feedback'
    `;
    
    if (result.length === 0) {
      console.log('Feedback table does not exist. Creating it...');
      
      // Create feedback table
      await client`
        CREATE TABLE feedback (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          email text NOT NULL,
          content text NOT NULL,
          status text DEFAULT 'pending' NOT NULL,
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        )
      `;
      
      console.log('Feedback table created successfully!');
    } else {
      console.log('Feedback table already exists.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

main();
