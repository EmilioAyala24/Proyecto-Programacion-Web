export function errorHandler(error, _req, res, _next) {
  console.error(error)

  const statusCode = error.statusCode || 500

  res.status(statusCode).json({
    mensaje: statusCode === 500
      ? 'Ocurrió un error interno en el servidor.'
      : error.message,
  })
}
