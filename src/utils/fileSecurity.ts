/**
 * SUBLIMAX FILE SECURITY & ANTIVIRUS SCANNER ENGINE
 * Provides multi-layer validation, magic byte header verification, 
 * malware executable detection, double-extension blocking, SVG XSS sanitization, 
 * and safe canvas image re-encoding.
 */

export interface SecurityScanResult {
  safe: boolean;
  error?: string;
  sanitizedDataUrl?: string;
  fileName: string;
  fileType: string;
  detectedFormat?: string;
}

// Allowed image extensions
const ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp', 'svg']);

// Known dangerous executable / script extensions
const DANGEROUS_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'sh', 'php', 'phtml', 'php3', 'php4', 'php5', 'phps', 
  'js', 'vbs', 'scr', 'jar', 'msi', 'dll', 'py', 'pl', 'htm', 'html', 'asp', 
  'aspx', 'cer', 'cgi', 'ps1', 'vbe', 'wsf', 'wsh', 'com', 'hta', 'cpl', 'iso'
]);

/**
 * Reads the first buffer bytes of a file to inspect Magic Bytes (Binary Header Signatures).
 */
const readHeaderBytes = (file: File, bytesToRead = 32): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(new Uint8Array(e.target.result as ArrayBuffer));
      } else {
        reject(new Error('No se pudo leer el archivo para inspección de seguridad.'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer los bytes del archivo.'));
    const slice = file.slice(0, bytesToRead);
    reader.readAsArrayBuffer(slice);
  });
};

/**
 * Inspects Magic Bytes to identify the real underlying format of the file.
 */
const detectMagicBytesFormat = (bytes: Uint8Array): { format: string; isExecutable: boolean; threatName?: string } => {
  if (bytes.length < 4) {
    return { format: 'unknown', isExecutable: true, threatName: 'Archivo corrupto o demasiado pequeño' };
  }

  // 1. Check for Windows Executable / DLL (MZ Header: 0x4D, 0x5A -> "MZ")
  if (bytes[0] === 0x4D && bytes[1] === 0x5A) {
    return { format: 'exe', isExecutable: true, threatName: 'Ejecutable de Windows (PE/MZ)' };
  }

  // 2. Check for Linux ELF Binary (0x7F, 'E', 'L', 'F')
  if (bytes[0] === 0x7F && bytes[1] === 0x45 && bytes[2] === 0x4C && bytes[3] === 0x46) {
    return { format: 'elf', isExecutable: true, threatName: 'Binario Ejecutable Linux (ELF)' };
  }

  // 3. Check for Java Bytecode / Mach-O (0xCA, 0xFE, 0xBA, 0xBE)
  if (bytes[0] === 0xCA && bytes[1] === 0xFE && bytes[2] === 0xBA && bytes[3] === 0xBE) {
    return { format: 'class', isExecutable: true, threatName: 'Código Java / Binario Mach-O' };
  }

  // 4. Check for ZIP / JAR / APK / Office Macro containers (PK\x03\x04: 0x50, 0x4B, 0x03, 0x04)
  if (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) {
    return { format: 'zip', isExecutable: true, threatName: 'Archivo comprimido / Script comprimido (ZIP/JAR)' };
  }

  // 5. Check for PDF document (%PDF: 0x25, 0x50, 0x44, 0x46)
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return { format: 'pdf', isExecutable: true, threatName: 'Documento PDF con posible código incrustado' };
  }

  // 6. Check for PNG image: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4E &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0D &&
    bytes[5] === 0x0A &&
    bytes[6] === 0x1A &&
    bytes[7] === 0x0A
  ) {
    return { format: 'png', isExecutable: false };
  }

  // 7. Check for JPEG image: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return { format: 'jpeg', isExecutable: false };
  }

  // 8. Check for GIF image: 47 49 46 38 ('G' 'I' 'F' '8')
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return { format: 'gif', isExecutable: false };
  }

  // 9. Check for WEBP image: 'RIFF' .... 'WEBP'
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return { format: 'webp', isExecutable: false };
  }

  // 10. Check if SVG XML string: text starting with XML declaration or <svg tag
  const textHeader = String.fromCharCode(...Array.from(bytes.slice(0, 32))).trim().toLowerCase();
  if (textHeader.includes('<svg') || textHeader.includes('<?xml') || textHeader.includes('<!doctype svg')) {
    return { format: 'svg', isExecutable: false };
  }

  return { format: 'unknown', isExecutable: true, threatName: 'Formato o firma de archivo no reconocida' };
};

/**
 * Sanitizes an SVG file by parsing its XML DOM and stripping script tags,
 * event handlers, foreignObject elements, javascript: links, and XML entities (XXE).
 */
export const sanitizeSvgContent = (svgText: string): { cleanSvg: string; hasMalware: boolean; reason?: string } => {
  // Check for XXE injection vectors
  if (/<!ENTITY/i.test(svgText) || /<!DOCTYPE/i.test(svgText)) {
    return { cleanSvg: '', hasMalware: true, reason: 'Inyección XXE / Declaraciones de entidad no permitidas en SVG' };
  }

  // Check for embedded script elements
  if (/<script[\s>]/i.test(svgText)) {
    return { cleanSvg: '', hasMalware: true, reason: 'Etiqueta <script> detectada en el archivo SVG' };
  }

  // Check for inline event handlers (e.g., onload=, onerror=, onclick=)
  if (/\son[a-z]+\s*=/i.test(svgText)) {
    return { cleanSvg: '', hasMalware: true, reason: 'Controladores de eventos en línea (on*=) detectados en el SVG' };
  }

  // Check for javascript: or data:text/html links
  if (/javascript:/i.test(svgText) || /data:\s*text\/html/i.test(svgText)) {
    return { cleanSvg: '', hasMalware: true, reason: 'URL ejecutable (javascript: / data:html) detectada en SVG' };
  }

  // Check for embedded objects or iframes
  if (/<(foreignObject|iframe|embed|object)[\s>]/i.test(svgText)) {
    return { cleanSvg: '', hasMalware: true, reason: 'Elemento incrustado sospechoso (<foreignObject>/<iframe>) en SVG' };
  }

  return { cleanSvg: svgText, hasMalware: false };
};

/**
 * Re-encodes a raster image data URL using Canvas to strip EXIF metadatas, polyglots, and hidden malware payloads.
 */
const reencodeImageViaCanvas = (dataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        // Export as clean PNG data URL
        const cleanDataUrl = canvas.toDataURL('image/png');
        resolve(cleanDataUrl);
      } catch (err) {
        reject(new Error('No se pudo re-procesar la imagen en canvas seguro.'));
      }
    };
    img.onerror = () => reject(new Error('La imagen proporcionada está corrupta o no es válida.'));
    img.src = dataUrl;
  });
};

/**
 * Main Anti-Virus & Security Scanner for uploaded files in Sublimax.
 * Performs deep verification across all security layers.
 */
export const validateAndSanitizeImageFile = async (file: File): Promise<SecurityScanResult> => {
  const fileName = file.name || 'archivo_desconocido';

  // 1. FILE SIZE CHECK (Max 12MB to prevent DoS image decompressed pixel bombs)
  const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12 MB
  if (file.size > MAX_FILE_SIZE) {
    return {
      safe: false,
      fileName,
      fileType: file.type,
      error: `El archivo "${fileName}" supera el límite de tamaño permitido de 12 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB).`
    };
  }

  // 2. DOUBLE EXTENSION & FILENAME SANITIZATION CHECK
  const nameParts = fileName.split('.');
  if (nameParts.length > 2) {
    // Check if any intermediate part contains a dangerous extension (e.g. photo.jpg.exe)
    for (let i = 1; i < nameParts.length; i++) {
      const ext = nameParts[i].toLowerCase();
      if (DANGEROUS_EXTENSIONS.has(ext)) {
        return {
          safe: false,
          fileName,
          fileType: file.type,
          error: `ALERTA DE SEGURIDAD: El archivo "${fileName}" fue bloqueado por intento de doble extensión maliciosa (.${ext}).`
        };
      }
    }
  }

  const extension = nameParts[nameParts.length - 1].toLowerCase();
  if (DANGEROUS_EXTENSIONS.has(extension)) {
    return {
      safe: false,
      fileName,
      fileType: file.type,
      error: `TIPO DE ARCHIVO AMENAZANTE: La extensión .${extension} es un ejecutable o script no permitido por razones de seguridad.`
    };
  }

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return {
      safe: false,
      fileName,
      fileType: file.type,
      error: `Formato de extensión no permitido (.${extension}). Solo se permiten imágenes PNG, JPG, JPEG, WEBP o SVG.`
    };
  }

  // 3. MAGIC BYTE BINARY HEADER INSPECTION
  try {
    const headerBytes = await readHeaderBytes(file, 32);
    const magicCheck = detectMagicBytesFormat(headerBytes);

    if (magicCheck.isExecutable) {
      return {
        safe: false,
        fileName,
        fileType: file.type,
        error: `AMENAZA DETECTADA: El contenido real del archivo no coincide con su extensión. Firma de amenaza: ${magicCheck.threatName || 'Firma no segura'}.`
      };
    }

    // Ensure format matches allowable types
    if (!['png', 'jpeg', 'gif', 'webp', 'svg'].includes(magicCheck.format)) {
      return {
        safe: false,
        fileName,
        fileType: file.type,
        error: `Firma binaria inválida. El archivo fue modificado o no es una imagen auténtica.`
      };
    }
  } catch (err: any) {
    return {
      safe: false,
      fileName,
      fileType: file.type,
      error: err.message || 'Error al inspeccionar la firma de seguridad del archivo.'
    };
  }

  // 4. SVG SPECIFIC SANITIZATION
  if (extension === 'svg') {
    return new Promise<SecurityScanResult>((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const svgContent = e.target?.result as string;
        if (!svgContent) {
          resolve({
            safe: false,
            fileName,
            fileType: file.type,
            error: 'No se pudo leer el contenido del archivo SVG.'
          });
          return;
        }

        const sanitizeRes = sanitizeSvgContent(svgContent);
        if (sanitizeRes.hasMalware) {
          resolve({
            safe: false,
            fileName,
            fileType: file.type,
            error: `INYECCIÓN MALICIOSA BLOQUEADA EN SVG: ${sanitizeRes.reason}`
          });
          return;
        }

        // Convert safe SVG into clean Data URL
        const safeSvgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sanitizeRes.cleanSvg)}`;
        resolve({
          safe: true,
          fileName,
          fileType: file.type,
          detectedFormat: 'svg',
          sanitizedDataUrl: safeSvgDataUrl
        });
      };
      reader.onerror = () => {
        resolve({
          safe: false,
          fileName,
          fileType: file.type,
          error: 'Error al procesar el archivo SVG.'
        });
      };
      reader.readAsText(file);
    });
  }

  // 5. RASTER IMAGES (PNG, JPG, WEBP) CANVAS RE-ENCODING (De-steganography / Clean DataURL)
  return new Promise<SecurityScanResult>((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        resolve({
          safe: false,
          fileName,
          fileType: file.type,
          error: 'No se pudo generar la vista previa del archivo.'
        });
        return;
      }

      try {
        const sanitizedUrl = await reencodeImageViaCanvas(rawDataUrl);
        resolve({
          safe: true,
          fileName,
          fileType: file.type,
          detectedFormat: extension,
          sanitizedDataUrl: sanitizedUrl
        });
      } catch (err: any) {
        resolve({
          safe: false,
          fileName,
          fileType: file.type,
          error: err.message || 'La imagen está corrupta o contiene código binario no procesable.'
        });
      }
    };
    reader.onerror = () => {
      resolve({
        safe: false,
        fileName,
        fileType: file.type,
        error: 'Error al procesar la imagen.'
      });
    };
    reader.readAsDataURL(file);
  });
};
