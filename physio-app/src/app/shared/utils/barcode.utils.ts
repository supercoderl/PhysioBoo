/**
 * Code 128 (subset B) barcode as an inline SVG, for specimen and wristband labels.
 * Subset B covers printable ASCII (32-126), which includes our order/sample codes.
 */

// Bar/space widths for symbol values 0-106 (106 = STOP, which has a 7th element).
const PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112',
];
const START_B = 104;
const STOP = 106;

export function code128Svg(text: string, height = 48, moduleWidth = 1.5): string {
  const chars = [...text].filter(c => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126);
  const values = chars.map(c => c.charCodeAt(0) - 32);
  const checksum = values.reduce((sum, v, i) => sum + v * (i + 1), START_B) % 103;
  const symbols = [START_B, ...values, checksum, STOP];

  let x = 10 * moduleWidth; // quiet zone
  const bars: string[] = [];
  for (const symbol of symbols) {
    const widths = PATTERNS[symbol];
    for (let i = 0; i < widths.length; i++) {
      const w = Number(widths[i]) * moduleWidth;
      if (i % 2 === 0) bars.push(`<rect x="${x}" y="0" width="${w}" height="${height}"/>`);
      x += w;
    }
  }
  const width = x + 10 * moduleWidth;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Barcode ${text.replace(/"/g, '')}"><g fill="#000">${bars.join('')}</g></svg>`;
}
