import bleApi from '../../utils/bluetooth'
Page({
  /**
   * 页面的初始数据
   */
  data: {},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    bleApi.data.device_name = ''
    bleApi.openBluetooth()
    bleApi.showBluetoothData(msg => {
      console.log(msg)
    })
  }
})
