/**
 * Script de diagnóstico para verificar variables de entorno
 */

require('dotenv').config();

console.log('🔍 Verificando archivo .env...\n');

console.log('Todas las variables de entorno cargadas:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || '❌ NO ENCONTRADA');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY || '❌ NO ENCONTRADA');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ ENCONTRADA (oculta)' : '❌ NO ENCONTRADA');

console.log('\nOtras variables:');
console.log('DB_HOST:', process.env.DB_HOST || '❌ NO ENCONTRADA');
console.log('PORT:', process.env.PORT || '❌ NO ENCONTRADA');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ ENCONTRADA' : '❌ NO ENCONTRADA');

console.log('\n📁 Ruta del archivo .env esperada:');
console.log(require('path').join(__dirname, '.env'));

console.log('\n💡 Si las variables de Cloudinary no aparecen:');
console.log('1. Asegúrate de que el archivo Backend/.env existe');
console.log('2. Verifica que no haya espacios antes o después de los =');
console.log('3. Verifica que no haya comillas en los valores');
console.log('4. Formato correcto: CLOUDINARY_CLOUD_NAME=dictsjidg');
