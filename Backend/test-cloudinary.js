/**
 * Script de prueba para verificar la configuración de Cloudinary
 * 
 * Ejecutar con: node test-cloudinary.js
 */

require('dotenv').config();
const cloudinary = require('./config/cloudinary');

console.log('🧪 Probando configuración de Cloudinary...\n');

// Verificar que las variables de entorno estén configuradas
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Error: Faltan variables de entorno de Cloudinary');
  console.log('\nAsegúrate de configurar en tu archivo .env:');
  console.log('- CLOUDINARY_CLOUD_NAME');
  console.log('- CLOUDINARY_API_KEY');
  console.log('- CLOUDINARY_API_SECRET');
  console.log('\nConsulta CLOUDINARY_SETUP.md para más información.');
  process.exit(1);
}

console.log('✅ Variables de entorno encontradas:');
console.log(`   Cloud Name: ${cloudName}`);
console.log(`   API Key: ${apiKey.substring(0, 6)}...`);
console.log(`   API Secret: ${'*'.repeat(apiSecret.length)}`);
console.log('');

// Probar conexión a Cloudinary usando el API ping
cloudinary.api.ping()
  .then(result => {
    console.log('✅ Conexión exitosa con Cloudinary!');
    console.log(`   Status: ${result.status}`);
    console.log('');
    console.log('🎉 Tu configuración de Cloudinary está lista para usar.');
    console.log('   Puedes comenzar a subir imágenes desde AdminGallery.');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error conectando con Cloudinary:');
    console.error(`   ${error.message}`);
    console.log('');
    console.log('💡 Verifica que:');
    console.log('   1. Las credenciales en .env sean correctas');
    console.log('   2. Tienes conexión a internet');
    console.log('   3. Tu cuenta de Cloudinary esté activa');
    console.log('');
    console.log('Consulta CLOUDINARY_SETUP.md para más información.');
    process.exit(1);
  });
