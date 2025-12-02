/**
 * Parser otimizado para campos de cartão de crédito
 * Usa debounce e validação eficiente para evitar jank na UI
 */

// ===== REGEX COMPILADAS (CACHE) =====
const CARD_NUMBER_REGEX = /^\d{0,19}$/;
const CVV_REGEX = /^\d{0,4}$/;
const EXPIRY_REGEX = /^(0[1-9]|1[0-2])\/\d{0,2}$/;

/**
 * Valida número de cartão (Luhn algorithm)
 * 
 * @param {string} cardNumber - Número do cartão
 * @returns {boolean} true se válido
 */
export function validateCardNumber(cardNumber) {
    if (!cardNumber) return false;
    // Remover espaços
    const cleaned = cardNumber.replace(/\s/g, '');
    
    // Verificar formato básico
    if (!CARD_NUMBER_REGEX.test(cleaned) || cleaned.length < 13) {
        return false;
    }
    
    // Algoritmo de Luhn
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i], 10);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

/**
 * Formata número de cartão com espaços
 * 
 * @param {string} cardNumber - Número do cartão
 * @returns {string} Número formatado
 */
export function formatCardNumber(cardNumber) {
    if (!cardNumber) return '';
    const cleaned = cardNumber.replace(/\D/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
}

/**
 * Valida CVV
 * 
 * @param {string} cvv - CVV
 * @returns {boolean} true se válido
 */
export function validateCVV(cvv) {
    return CVV_REGEX.test(cvv) && cvv.length >= 3;
}

/**
 * Valida data de expiração
 * 
 * @param {string} expiry - Data de expiração (MM/YY)
 * @returns {boolean} true se válido
 */
export function validateExpiry(expiry) {
    if (!EXPIRY_REGEX.test(expiry)) {
        return false;
    }
    
    const [month, year] = expiry.split('/');
    if (!month || !year || year.length < 2) return false;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const expiryYear = parseInt(year, 10);
    const expiryMonth = parseInt(month, 10);
    
    if (expiryYear < currentYear) {
        return false;
    }
    
    if (expiryYear === currentYear && expiryMonth < currentMonth) {
        return false;
    }
    
    return true;
}

/**
 * Debounce para validação
 * 
 * @param {Function} func - Função a executar
 * @param {number} delay - Delay em ms
 * @returns {Function} Função com debounce
 */
export function debounce(func, delay = 300) {
    let timeoutId;
    
    return function debounced(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * Parser de cartão de crédito otimizado
 * 
 * @param {Object} data - Dados do cartão
 * @returns {Object} Dados parseados e validados
 */
export function parseCardData(data) {
    return {
        cardNumber: formatCardNumber(data.cardNumber || ''),
        cardNumberValid: validateCardNumber(data.cardNumber || ''),
        cvv: data.cvv || '',
        cvvValid: validateCVV(data.cvv || ''),
        expiry: data.expiry || '',
        expiryValid: validateExpiry(data.expiry || ''),
        holderName: (data.holderName || '').toUpperCase(),
    };
}