module.exports = {
  pwa: {
    name: 'Social Relief',
    iconPaths: {
      favicon32: 'favicon.svg',
      favicon16: 'favicon.svg'
    },
    themeColor: '#EF5A24',
    msTileColor: '#EF5A24',
    appleMobileWebAppCapable: '#EF5A24'
  },
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = 'Social Relief';
        return args;
      });
  }
}