/**
 * Utilidades para manejo de imágenes
 */

const API_BASE_URL = '/api/v1';

/**
 * Construye la URL completa para una imagen de evento
 * @param imageUrl - URL de la imagen devuelta por el servidor (ej: "/uploads/images/abc123.jpg")
 * @returns URL completa para mostrar la imagen
 */
export const getImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  
  // Si ya es una URL completa, la devolvemos tal como está
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Si empieza con /uploads, extraemos el nombre del archivo y construimos la URL del endpoint
  if (imageUrl.startsWith('/uploads/images/')) {
    const filename = imageUrl.replace('/uploads/images/', '');
    return `${API_BASE_URL}/eventos/eventos/image/${filename}`;
  }
  
  // Si empieza con /uploads, construimos la URL completa
  if (imageUrl.startsWith('/uploads/')) {
    return `${API_BASE_URL}/eventos/eventos/image/${imageUrl.split('/').pop()}`;
  }
  
  // Si es solo el nombre del archivo
  return `${API_BASE_URL}/eventos/eventos/image/${imageUrl}`;
};

/**
 * Valida si una URL de imagen es válida
 * @param imageUrl URL de la imagen
 * @returns true si es válida
 */
export const isValidImageUrl = (imageUrl: string | null | undefined): boolean => {
  if (!imageUrl) return false;
  
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const lowercaseUrl = imageUrl.toLowerCase();
  
  return validExtensions.some(ext => lowercaseUrl.includes(ext));
};

/**
 * Obtiene la URL procesada para una imagen
 * @param imageUrl URL de la imagen
 * @returns URL procesada o null
 */
export const getProcessedImageUrl = (imageUrl: string | null | undefined): string | null => {
  return getImageUrl(imageUrl);
};
