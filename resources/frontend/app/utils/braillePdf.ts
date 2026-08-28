import { jsPDF } from 'jspdf';

interface BraillePdfOptions {
  title?: string;
  brailleText: string;
  originalText?: string;
  filename?: string;
}

/**
 * Generates and downloads a high-resolution, print-ready A4 PDF for Braille translations.
 */
export async function downloadBraillePdf({
  title = 'Dokumen Hasil Scan',
  brailleText,
  originalText,
  filename,
}: BraillePdfOptions): Promise<void> {
  if (!brailleText || !brailleText.trim()) {
    throw new Error('Tidak ada teks Braille untuk dicetak.');
  }

  // A4 Resolution at 300 DPI for ultra-sharp printing
  const CANVAS_WIDTH = 2480;
  const CANVAS_HEIGHT = 3508;

  const MARGIN_LEFT = 180;
  const MARGIN_RIGHT = 180;
  const MARGIN_TOP = 180;
  const MARGIN_BOTTOM = 180;

  const PRINTABLE_WIDTH = CANVAS_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

  // Typography settings
  const BRAILLE_FONT_SIZE = 52;
  const BRAILLE_LINE_HEIGHT = 96;
  const BRAILLE_FONT = `${BRAILLE_FONT_SIZE}px "Segoe UI Symbol", "Apple Symbols", "DejaVu Sans", "Noto Sans Symbols", "Noto Sans Symbols2", "Arial Unicode MS", monospace, sans-serif`;

  const HEADER_START_Y = MARGIN_TOP;
  const HEADER_HEIGHT = 300;
  const CONTENT_START_Y = HEADER_START_Y + HEADER_HEIGHT + 40;
  const FOOTER_RESERVE = 160;
  const CONTENT_END_Y = CANVAS_HEIGHT - MARGIN_BOTTOM - FOOTER_RESERVE;
  const AVAILABLE_CONTENT_HEIGHT = CONTENT_END_Y - CONTENT_START_Y;

  const MAX_LINES_PER_PAGE = Math.floor(AVAILABLE_CONTENT_HEIGHT / BRAILLE_LINE_HEIGHT);

  // Helper canvas for text measurement
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  if (!measureCtx) throw new Error('Canvas 2D context tidak tersedia.');
  measureCtx.font = BRAILLE_FONT;

  // 1. Break brailleText into wrapped lines
  const rawParagraphs = brailleText.split('\n');
  const wrappedLines: string[] = [];

  for (const para of rawParagraphs) {
    if (!para.trim()) {
      wrappedLines.push(''); // Empty line for paragraph spacing
      continue;
    }

    const words = para.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = measureCtx.measureText(testLine).width;

      if (testWidth <= PRINTABLE_WIDTH) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          wrappedLines.push(currentLine);
        }

        // If the single word is still wider than printable width, wrap character-by-character
        const wordWidth = measureCtx.measureText(word).width;
        if (wordWidth > PRINTABLE_WIDTH) {
          let subWord = '';
          for (const char of word) {
            const testChar = subWord + char;
            if (measureCtx.measureText(testChar).width <= PRINTABLE_WIDTH) {
              subWord = testChar;
            } else {
              wrappedLines.push(subWord);
              subWord = char;
            }
          }
          currentLine = subWord;
        } else {
          currentLine = word;
        }
      }
    }

    if (currentLine) {
      wrappedLines.push(currentLine);
    }
  }

  // 2. Chunk wrapped lines into pages
  const pages: string[][] = [];
  let currentPageLines: string[] = [];

  for (const line of wrappedLines) {
    if (currentPageLines.length >= MAX_LINES_PER_PAGE) {
      pages.push(currentPageLines);
      currentPageLines = [];
    }
    currentPageLines.push(line);
  }
  if (currentPageLines.length > 0 || pages.length === 0) {
    pages.push(currentPageLines);
  }

  const totalPages = pages.length;
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // 3. Render each page to an offscreen canvas and append to jsPDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = CANVAS_WIDTH;
    pageCanvas.height = CANVAS_HEIGHT;
    const ctx = pageCanvas.getContext('2d');
    if (!ctx) continue;

    // Fill pure white background (ideal for printing/embossing)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // ==========================================
    // HEADER AREA
    // ==========================================
    let headerY = HEADER_START_Y;

    // Top Category / Tag
    ctx.fillStyle = '#4F46E5'; // Indigo Accent
    ctx.font = 'bold 28px "Manrope", "Segoe UI", sans-serif';
    ctx.fillText('SENSORANOTE • DOKUMEN BRAILLE SIAP CETAK', MARGIN_LEFT, headerY);

    headerY += 50;

    // Document Title
    ctx.fillStyle = '#0F172A'; // Slate 900
    ctx.font = 'bold 44px "Lexend Deca", "Segoe UI", sans-serif';
    const displayTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
    ctx.fillText(displayTitle, MARGIN_LEFT, headerY);

    headerY += 45;

    // Metadata Subtitle
    ctx.fillStyle = '#64748B'; // Slate 500
    ctx.font = '26px "Manrope", "Segoe UI", sans-serif';
    ctx.fillText(`Tanggal: ${currentDate}  |  Standar: 6-Titik Braille (Literer)  |  Halaman ${pageIdx + 1} dari ${totalPages}`, MARGIN_LEFT, headerY);

    headerY += 35;

    // Divider Line
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(MARGIN_LEFT, headerY);
    ctx.lineTo(CANVAS_WIDTH - MARGIN_RIGHT, headerY);
    ctx.stroke();

    // ==========================================
    // BRAILLE CONTENT AREA
    // ==========================================
    ctx.font = BRAILLE_FONT;
    ctx.fillStyle = '#000000'; // Deep solid black for maximum contrast
    ctx.textBaseline = 'middle';

    let contentY = CONTENT_START_Y;
    const pageLines = pages[pageIdx];

    for (const line of pageLines) {
      if (line) {
        ctx.fillText(line, MARGIN_LEFT, contentY);
      }
      contentY += BRAILLE_LINE_HEIGHT;
    }

    // ==========================================
    // FOOTER AREA
    // ==========================================
    const footerY = CANVAS_HEIGHT - MARGIN_BOTTOM;

    // Footer divider line
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(MARGIN_LEFT, footerY - 50);
    ctx.lineTo(CANVAS_WIDTH - MARGIN_RIGHT, footerY - 50);
    ctx.stroke();

    // Footer Branding
    ctx.fillStyle = '#94A3B8';
    ctx.font = '24px "Manrope", "Segoe UI", sans-serif';
    ctx.fillText('SensoraNote — Platform Pembelajaran Digital Inklusif & Aksesibel', MARGIN_LEFT, footerY);

    // Footer Page Number
    const pageStr = `Halaman ${pageIdx + 1} / ${totalPages}`;
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 26px "Manrope", "Segoe UI", sans-serif';
    const pageStrWidth = ctx.measureText(pageStr).width;
    ctx.fillText(pageStr, CANVAS_WIDTH - MARGIN_RIGHT - pageStrWidth, footerY);

    // Add page to PDF
    if (pageIdx > 0) {
      pdf.addPage('a4', 'portrait');
    }

    const imgData = pageCanvas.toDataURL('image/jpeg', 0.96);
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  }

  // Generate filename with SensoraNote branding
  const cleanTitle = title.trim().replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').substring(0, 40);
  const finalFilename = filename || `SensoraNote_Braille_${cleanTitle || 'Dokumen'}_${Date.now()}.pdf`;

  pdf.save(finalFilename);
}

/**
 * Generates and downloads a standard .BRF (Braille Ready Format) file for refreshable braille displays & embossers.
 */
export async function downloadBrailleBrf({
  title = 'Dokumen Hasil Scan',
  brailleText,
  originalText,
  filename,
}: BraillePdfOptions): Promise<void> {
  if (!brailleText || !brailleText.trim()) {
    throw new Error('Tidak ada teks Braille untuk diunduh.');
  }

  const LINE_WIDTH = 40; // Standard 40 cells per line
  const LINES_PER_PAGE = 25; // Standard 25 lines per embosser page

  // Break braille text into wrapped lines of max LINE_WIDTH
  const paragraphs = brailleText.split('\n');
  const wrappedLines: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      wrappedLines.push('');
      continue;
    }

    const words = para.split(' ');
    let currentLine = '';

    for (const word of words) {
      if (!currentLine) {
        currentLine = word;
      } else if (currentLine.length + 1 + word.length <= LINE_WIDTH) {
        currentLine += ' ' + word;
      } else {
        wrappedLines.push(currentLine);
        let remaining = word;
        while (remaining.length > LINE_WIDTH) {
          wrappedLines.push(remaining.slice(0, LINE_WIDTH));
          remaining = remaining.slice(LINE_WIDTH);
        }
        currentLine = remaining;
      }
    }
    if (currentLine) {
      wrappedLines.push(currentLine);
    }
  }

  // Chunk lines into pages separated by Form Feed (\x0C)
  const pages: string[] = [];
  let pageLines: string[] = [];

  for (const line of wrappedLines) {
    if (pageLines.length >= LINES_PER_PAGE) {
      pages.push(pageLines.join('\r\n'));
      pageLines = [];
    }
    pageLines.push(line);
  }
  if (pageLines.length > 0) {
    pages.push(pageLines.join('\r\n'));
  }

  // Join pages with Form Feed separator (\x0C) standard in .BRF files
  const brfContent = pages.join('\r\n\x0C\r\n');

  // Trigger browser download with SensoraNote branding in filename
  const blob = new Blob([brfContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const cleanTitle = title.trim().replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').substring(0, 40);
  const finalFilename = filename || `SensoraNote_Braille_${cleanTitle || 'Dokumen'}_${Date.now()}.brf`;

  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


