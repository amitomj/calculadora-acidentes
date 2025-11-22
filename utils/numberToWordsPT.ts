
const unidades: string[] = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
const dezenas: string[] = ['', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const especiais: string[] = ['dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezasseis', 'dezassete', 'dezoito', 'dezanove'];
const centenas: string[] = ['', 'cem', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

function convertThreeDigits(num: number): string {
    if (num === 0) return '';
    if (num < 10) return unidades[num];
    if (num < 20) return especiais[num - 10];
    if (num < 100) {
        const d = Math.floor(num / 10);
        const u = num % 10;
        return dezenas[d] + (u > 0 ? ' e ' + unidades[u] : '');
    }
    if (num === 100) return 'cem';
    const c = Math.floor(num / 100);
    const rest = num % 100;
    return centenas[c] + (rest > 0 ? ' e ' + convertThreeDigits(rest) : '');
}

function convertInteger(num: number): string {
    if (num === 0) return 'zero';

    let parts: string[] = [];
    
    const billions = Math.floor(num / 1_000_000_000);
    num %= 1_000_000_000;
    if (billions > 0) {
        parts.push(convertThreeDigits(billions) + (billions === 1 ? ' bilião' : ' biliões'));
    }

    const millions = Math.floor(num / 1_000_000);
    num %= 1_000_000;
    if (millions > 0) {
        parts.push(convertThreeDigits(millions) + (millions === 1 ? ' milhão' : ' milhões'));
    }

    const thousands = Math.floor(num / 1000);
    num %= 1000;
    if (thousands > 0) {
        parts.push(thousands === 1 ? 'mil' : convertThreeDigits(thousands) + ' mil');
    }

    if (num > 0) {
        parts.push(convertThreeDigits(num));
    }
    
    return parts.join(' ');
}


export function numberToWordsPT(num: number): string {
    if (typeof num !== 'number') return '';

    const euros = Math.floor(num);
    const centimos = Math.round((num - euros) * 100);

    const euroStr = convertInteger(euros);
    const euroText = `${euroStr} euro${euros !== 1 ? 's' : ''}`;

    if (centimos === 0) {
        return euroText;
    }

    const centimoStr = convertInteger(centimos);
    const centimoText = `${centimoStr} cêntimo${centimos !== 1 ? 's' : ''}`;

    return `${euroText} e ${centimoText}`;
}
