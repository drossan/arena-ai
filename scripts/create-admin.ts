/**
 * SETUP SCRIPT - Crear primer usuario admin
 *
 * Ejecutar este script en la consola del navegador cuando estés en http://localhost:3001
 * Solo funciona si no hay usuarios en la base de datos.
 *
 * Uso:
 * 1. Abre http://localhost:3001 en el navegador
 * 2. Abre la consola del navegador (F12)
 * 3. Copia y pega este script
 * 4. Presiona Enter
 */

(async function createFirstAdmin() {
  const username = prompt('Nombre de usuario para el admin:', 'admin')
  if (!username) return

  const password = prompt('Contraseña:', 'admin123')
  if (!password) return

  const displayName = prompt('Nombre para mostrar:', 'Administrador')
  if (!displayName) return

  try {
    // Usar fetchMutation directamente desde la ventana global
    const result = await window.convexClient.mutation('users:register', {
      username,
      password,
      displayName,
    })

    if (result.success) {
      alert(`✅ Usuario admin creado:\nUsuario: ${username}\n\nYa puedes hacer login.`)
      console.log('Admin creado:', result)
    }
  } catch (error: any) {
    if (error.message.includes('ya existe')) {
      alert('❌ Ya existe un usuario admin. Usa /admin/login o contacta al administrador.')
    } else {
      alert('❌ Error: ' + error.message)
    }
    console.error('Error:', error)
  }
})()
