/**
 * Utilidades para manejo de fechas
 */

/**
 * Convierte una fecha del formato dd/mm/yyyy al formato ISO datetime-local
 * @param dateString - Fecha en formato "dd/mm/yyyy" o "dd/mm/yyyy HH:mm" o "YYYY-MM-DD"
 * @returns Fecha en formato "YYYY-MM-DDTHH:mm" para datetime-local input
 */
export const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  
  try {
    // Si ya está en formato ISO datetime, devolverla tal como está
    if (dateString.includes('T')) {
      return dateString.slice(0, 16); // Solo tomar YYYY-MM-DDTHH:mm
    }
    
    // Si está en formato YYYY-MM-DD (formato ISO de solo fecha)
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return `${dateString}T00:00`;
    }
    
    // Formato esperado: "dd/mm/yyyy" o "dd/mm/yyyy HH:mm"
    const parts = dateString.split(' ');
    const datePart = parts[0];
    const timePart = parts[1] || '00:00';
    
    const [day, month, year] = datePart.split('/');
    
    // Validar que tenemos los datos necesarios
    if (!day || !month || !year) {
      console.warn('Formato de fecha inválido:', dateString);
      return '';
    }
    
    // Convertir a formato ISO
    const paddedDay = day.padStart(2, '0');
    const paddedMonth = month.padStart(2, '0');
    const paddedTime = timePart.length === 5 ? timePart : '00:00';
    
    return `${year}-${paddedMonth}-${paddedDay}T${paddedTime}`;
  } catch (error) {
    console.error('Error al convertir fecha:', dateString, error);
    return '';
  }
};

/**
 * Convierte una fecha del formato datetime-local al formato dd/mm/yyyy HH:mm
 * @param dateString - Fecha en formato "YYYY-MM-DDTHH:mm"
 * @returns Fecha en formato "dd/mm/yyyy HH:mm"
 */
export const formatDateForBackend = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  
  try {
    // Si no tiene formato datetime-local, devolverla tal como está
    if (!dateString.includes('T')) {
      return dateString;
    }
    
    const [datePart, timePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-');
    const time = timePart || '00:00';
    
    return `${parseInt(day)}/${parseInt(month)}/${year} ${time}`;
  } catch (error) {
    console.error('Error al convertir fecha para backend:', dateString, error);
    return dateString;
  }
};

/**
 * Formatea una fecha para mostrar en la interfaz
 * @param dateString - Fecha en cualquier formato
 * @returns Fecha formateada para mostrar
 */
export const formatDateForDisplay = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  
  try {
    let date: Date;
    
    if (dateString.includes('/')) {
      // Formato dd/mm/yyyy o dd/mm/yyyy HH:mm
      const parts = dateString.split(' ');
      const [day, month, year] = parts[0].split('/');
      const timePart = parts[1] || '00:00';
      const [hours, minutes] = timePart.split(':');
      
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
    } else {
      // Formato ISO
      date = new Date(dateString);
    }
    
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error al formatear fecha para display:', dateString, error);
    return dateString;
  }
};
