/**
 * @link https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html
 */

Page({
  data: {
    nbTitle: '标题',
    nbLoading: false,
    nbFrontColor: '#000000',
    nbBackgroundColor: '#ffffff',
    text: 'This is page data.',
  },
  // customData: {
  //   hi: 'MINA',
  // },
  // Event handler.
  viewTap() {
    this.setData(
      {
        text: 'Set some data for updating view.',
      },
      // function () {
      //   // this is setData callback
      // },
    );
  },

  /**
   * @link https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%9B%9E%E8%B0%83%E5%87%BD%E6%95%B0
   * @description
      onLoad	function			生命周期回调—监听页面加载
      onShow	function			生命周期回调—监听页面显示
      onReady	function			生命周期回调—监听页面初次渲染完成
      onHide	function			生命周期回调—监听页面隐藏
      onUnload	function			生命周期回调—监听页面卸载
      onRouteDone	function			生命周期回调—监听路由动画完成
      onSaveExitState	function			页面销毁前保留状态回调
    */
  onLoad(options) {
    const stack = getCurrentPages();
    const me = stack[stack.length - 1];
    console.log(me, this.route);
    // Do some initialize when page load.
  },

  /**
   * @link * https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#%E9%A1%B5%E9%9D%A2%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86%E5%87%BD%E6%95%B0
   * @description 页面事件处理函数
      onPullDownRefresh	function			监听用户下拉动作
      onReachBottom	function			页面上拉触底事件的处理函数
      onShareAppMessage	function			用户点击右上角转发
      onShareTimeline	function			用户点击右上角转发到朋友圈
      onAddToFavorites	function			用户点击右上角收藏
      onPageScroll	function			页面滚动触发事件的处理函数
      onResize	function			页面尺寸改变时触发，详见 响应显示区域变化
      onTabItemTap	function			当前是 tab 页时，点击 tab 时触发
   */
  onPageScrol() {},
  onTabItemTap(item) {
    console.log(item.index);
    console.log(item.pagePath);
    console.log(item.text);
  },
});
