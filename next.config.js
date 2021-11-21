const path = require('path')
module.exports = {
  reactStrictMode: true,
  // basePath: '/adapt',
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
    prependData: `
      $base: #403b3b
      $buttonOrange: #e28441
      $buttonBlue: #072d42
    `, // Green, Yello, Brown, Red, Grey
  },
  // exportPathMap: async function (
  //   defaultPathMap,
  //   { dev, dir, outDir, distDir, buildId }
  // ) {
  //   return {
  //     '/': { page: '/' },
  //     '/adminpanel': { page: '/adminpanel' }
  //   }
  // },
  images: {
    loader: 'imgix', // defined but not used (pictures in presale, header and foot adopt inline custom loader with google photo image)
    path: '',
  },
  // images: {
  //   domains: ['example.com'],
  // },
}