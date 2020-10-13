module.exports = {
  pwa: {
    name: 'Social Relief',
    manifestOptions: {
      icons: []
    },
    iconPaths: {
      favicon32: 'favicon.svg',
      favicon16: 'favicon.svg',
      appleTouchIcon: 'favicon.svg',
      maskIcon: 'favicon.svg',
      msTileImage: 'favicon.svg',
    },
    themeColor: '#EF5A24',
    msTileColor: '#EF5A24',
    appleMobileWebAppStatusBarStyle: '#EF5A24',
    workboxPluginMode: "InjectManifest",
    workboxOptions: {
      swSrc: "src/service-worker.js" // CHECK CORRECT PATH!
    }
  },
  configureWebpack:  { output: { filename: '[name].[hash].bundle.js' } },
}