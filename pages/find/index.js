// pages/find/index.js
const app = getApp();
let https = require('../../utils/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    motto: '古诗文小助手',
    user_id: 0,
    current_page:1,
    total_page:0,
    tags: ['科普','故事','问与答'],
    pins: null,
    imgUrls: null,
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    animationData:{},
    userInfo: app.globalData.userInfo
  },
  // 获取用户id
  getUserId: function () {
    let user = wx.getStorageSync('user');
    if (user && user.user_id) {
      let user_id = user ? user.user_id : 0;
      this.setData({
        user_id: user_id
      });
    }
  },
  addNew: function () {
    let that = this;
    if (that.data.user_id < 1) {
      wx.showModal({
        title: '提示',
        content: '登录后才可以操作哦！',
        success: function (res) {
          if (res.confirm) {
            wx.reLaunch({
              url: '/pages/me/index'
            });
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/find/new/index'
      })
    }
  },
  deletePin: (e)=>{
    console.log(e);
    let id = e.target.dataset.id;
    wx.request({
      url: 'https://xuegushi.cn/wxxcx/pin/' + id + '/update' + '?user_id=' + wx.getStorageSync('user').user_id+'&wx_token=' + wx.getStorageSync('wx_token'),
      success: (res)=>{
        console.log(res);
        if(res.data && res.data.status){
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 1000
          })
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/find/index'
            });
          }, 1000)
        }else if(!res.data || (res && !res.data.status)){
          wx.showToast({
            title: '删除失败',
            icon: 'none',
            duration: 1000
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUserId();
    wx.showLoading({
      title: '加载中',
    });
    wx.request({
      url: 'https://xuegushi.cn/wxxcx/getSliderImages',
      success: res =>{
        if(res.data){
          console.log('----------success------------');
          this.setData({
            imgUrls: res.data
          });
          wx.hideLoading();
          this.getPins(this);
        }
      }
    })
  },
  getPins: (th)=>{
    let that = th;
    wx.showNavigationBarLoading();
    wx.request({
      url: 'https://xuegushi.cn/wxxcx/getPins',
      success: res => {
        if (res.data) {
          console.log('----------get PIns------------');
          // console.log(res.data);
          that.setData({
            pins: res.data.data,
            current_page: res.data.current_page,
            total_page: res.data.last_page
          });
          wx.hideNavigationBarLoading();
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.setNavigationBarTitle({
      title: '想法'
    });
    let animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 500,
      timingFunction: "ease",
      delay: 0
    });
    animation.scale(1.3,1.3).step();
    this.setData({
      animationData: animation.export()
    });
    setTimeout(function () {
      animation.scale(1,1).step();
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 500)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
   
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getPins(this);
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.last_page<this.data.current_page){
      return false;
    }
    wx.showNavigationBarLoading();
    let that = this;
    // Do something when page reach bottom.
    wx.request({
      url: 'https://xuegushi.cn/wxxcx/getPins',
      data: {
        page: that.data.current_page+1
      },
      success: res =>{
        if(res.data){
          console.log('----------success------------');
          this.setData({
            pins: that.data.pins.concat(res.data.data),
            current_page: res.data.current_page,
            last_page: res.data.last_page
          });
          wx.hideNavigationBarLoading()
        }
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '发现',
      path: '/pages/find/index',
      // imageUrl:'/images/poem.png',
      success: function(res) {
        // 转发成功
        console.log('转发成功！')
      },
      fail: function(res) {
        // 转发失败
      }
    }
  }
});