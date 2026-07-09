import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('ManagerLanding Regression Test', () => {
  it('does not contain the mock account chooser UI', () => {
    const fileContent = fs.readFileSync(path.join(__dirname, 'ManagerLanding.tsx'), 'utf-8');
    expect(fileContent).not.toContain('showModal');
    expect(fileContent).not.toContain('host@oceanhotel.com');
  });
});
