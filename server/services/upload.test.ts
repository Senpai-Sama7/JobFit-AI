import { describe, expect, it } from 'vitest';
import { isSupportedResume } from './upload';

describe('isSupportedResume', () => {
  it('accepts PDF and DOCX files', () => {
    expect(isSupportedResume({ mimetype: 'application/pdf', originalname: 'resume.pdf' } as any)).toBe(true);
    expect(
      isSupportedResume({ mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', originalname: 'cv.DOCX' } as any),
    ).toBe(true);
  });

  it('rejects other formats or mismatched extensions', () => {
    expect(isSupportedResume({ mimetype: 'application/pdf', originalname: 'resume.docx.exe' } as any)).toBe(false);
    expect(isSupportedResume({ mimetype: 'text/plain', originalname: 'resume.txt' } as any)).toBe(false);
  });
});
