process.on('exit', () => {
  try {
    require('fs').unlinkSync('database.sqlite');
    console.log('Database reset scheduled for next startup');
  } catch (e) {
    console.log('Could not delete database:', e.message);
  }
});
