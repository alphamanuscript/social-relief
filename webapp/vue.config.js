module.exports = {
  pwa: {
    name: 'Social Relief',
    iconPaths: {
      favicon32: 'favicon.svg',
      favicon16: 'favicon.svg',
      appleTouchIcon: 'favicon.svg',
      maskIcon: 'favicon.svg',
      msTileImage: 'favicon.svg',
    },
    themeColor: '#EF5A24',
    msTileColor: '#EF5A24',
    appleMobileWebAppStatusBarStyle: '#EF5A24'
  },
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = 'Social Relief';
        args[0].appleTouchIcon = 'favicon.svg';
        args[0].maskIcon = 'favicon.svg';
        args[0].msTileImage = 'favicon.svg';
        return args;
      });
  }
}