const fs = require('fs');
const lines = fs.readFileSync('C:/Users/alok anand magada/.gemini/antigravity/brain/979885b7-92c5-4830-bb4b-243783d91883/.system_generated/tasks/task-3799.log', 'utf8').split('\n');
for (const line of lines) {
  if (line.includes('Failed to fetch')) {
    console.log(line);
  }
}
