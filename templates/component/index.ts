/**
 * @link https://developers.weixin.qq.com/miniprogram/dev/reference/api/Component.html
 */

Component({
  externalClasses: ['cclass'],
  options: {},
  behaviors: [],
  // 属性定义
  properties: {
    arrayProperty: {
      type: Array,
      value: [],
    },
    myProperty2: String, // 简化的定义方式
  },

  data: {}, // 私有数据，可用于模板渲染
  methods: {
    onMyButtonTap: function () {
      this.setData({
        // 更新属性和数据的方法与更新页面数据的方法类似
      });
    },
    // 内部方法建议以下划线开头
    _myPrivateMethod: function () {
      // 这里将 data.A[0].B 设为 'myPrivateData'
      this.setData({
        'A[0].B': 'myPrivateData',
      });
    },
  },
  /**
   * @link https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/lifetimes.html
   * @description
    生命周期	参数	描述	最低版本
    created	无	在组件实例刚刚被创建时执行	1.6.3
    attached	无	在组件实例进入页面节点树时执行	1.6.3
    ready	无	在组件在视图层布局完成后执行	1.6.3
    moved	无	在组件实例被移动到节点树另一个位置时执行	1.6.3
    detached	无	在组件实例被从页面节点树移除时执行	1.6.3
    error	Object Error	每当组件方法抛出错误时执行	2.4.1
   */
  lifetimes: {
    ready() {},
  },
  /**
   * @link https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/lifetimes.html#%E7%BB%84%E4%BB%B6%E6%89%80%E5%9C%A8%E9%A1%B5%E9%9D%A2%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F
   * @description
    生命周期	参数	描述	最低版本
    show	无	组件所在的页面被展示时执行	2.2.3
    hide	无	组件所在的页面被隐藏时执行	2.2.3
    resize	Object Size	组件所在的页面尺寸变化时执行	2.4.0
    routeDone	无	组件所在页面路由动画完成时执行	2.31.2
   */
  pageLifetimes: {
    show: function () {},
    hide: function () {},
  },
});
