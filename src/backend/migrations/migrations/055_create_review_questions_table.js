export const up = async (connection) => {
  try {
    console.log('Running migration: Create review_questions table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS review_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_text TEXT NOT NULL,
        question_type ENUM('text', 'rating', 'multiple_choice', 'yes_no') DEFAULT 'text',
        options JSON,
        is_required BOOLEAN DEFAULT TRUE,
        category VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
    
    console.log('✅ review_questions table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop review_questions table...');
    
    await connection.execute(`DROP TABLE IF EXISTS review_questions`);
    
    console.log('✅ review_questions table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};