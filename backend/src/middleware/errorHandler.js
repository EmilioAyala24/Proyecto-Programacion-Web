export function errorHandler(error, _req, res, _next) {
  console.error(error)

  res.status(500).json({
    mensaje: 'Ocurrio un error interno en el servidor.',
  })
}
