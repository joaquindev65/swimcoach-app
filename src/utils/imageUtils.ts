/**
 * Utilería para procesar, recortar y comprimir fotos de perfil
 * de los nadadores antes de guardarlas en localStorage.
 */

export interface ProcessImageOptions {
  targetSize?: number; // Ancho y alto final en píxeles (cuadrado 1:1)
  quality?: number;    // Calidad JPEG (0.0 a 1.0)
}

/**
 * Lee un archivo de imagen, lo recorta al centro en proporción 1:1,
 * lo escala al tamaño indicado y lo comprime como JPEG data URL.
 */
export const processProfileImage = (
  file: File,
  options: ProcessImageOptions = {}
): Promise<string> => {
  const { targetSize = 320, quality = 0.82 } = options;

  return new Promise((resolve, reject) => {
    // Validar tipo de archivo
    if (!file.type || !file.type.startsWith('image/')) {
      return reject(new Error('El archivo seleccionado no es una imagen válida (debe ser JPG, PNG, WEBP, etc.).'));
    }

    // Validar tamaño máximo antes de procesar (15MB)
    const MAX_INPUT_BYTES = 15 * 1024 * 1024;
    if (file.size > MAX_INPUT_BYTES) {
      return reject(new Error('La imagen es demasiado pesada (máximo 15MB).'));
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Hubo un error al leer el archivo desde el dispositivo.'));
    };

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('No se pudo decodificar el formato de la imagen.'));
      };

      img.onload = () => {
        try {
          const naturalWidth = img.naturalWidth || img.width;
          const naturalHeight = img.naturalHeight || img.height;

          if (!naturalWidth || !naturalHeight) {
            return reject(new Error('Dimensiones de imagen inválidas.'));
          }

          // Crear canvas de tamaño cuadrado destino
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('No se pudo inicializar el procesador gráfico del navegador.'));
          }

          // Calcular recorte centrado 1:1
          const minDimension = Math.min(naturalWidth, naturalHeight);
          const sourceX = (naturalWidth - minDimension) / 2;
          const sourceY = (naturalHeight - minDimension) / 2;

          // Suavizado de imagen para máxima nitidez en reducción
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Dibujar recorte cuadrado en el canvas destino
          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            minDimension,
            minDimension,
            0,
            0,
            targetSize,
            targetSize
          );

          // Exportar como JPEG optimizado
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err: any) {
          reject(new Error(err?.message || 'Error inesperado al optimizar la imagen.'));
        }
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
};
