const bleApi = {
  data: {
    device_name: '',
    device_id: '',
    service_id: '',
    write_id: '',
    notify_id: ''
  },
  // 1.开启蓝牙设备
  openBluetooth() {
    let _this = this
    wx.openBluetoothAdapter({
      success: res => {},
      fail: () => {
        wx.showToast({
          title: `请先打开蓝牙`
        })
        setTimeout(function() {
          wx.hideToast()
        }, 2000)
      },
      complete: () => {
        wx.onBluetoothAdapterStateChange(res => {
          if (res.available) {
            _this.openBluetooth()
          }
        })
        _this.getBluetoothState()
      }
    })
  },
  // 2.获取蓝牙状态
  getBluetoothState() {
    let _this = this
    console.log(_this.data.device_id)
    if (_this.data.device_id != '') {
      _this.connectDevice()
      return
    }
    wx.getBluetoothAdapterState({
      success: res => {
        if (!!res && res.available) {
          _this.startSearchBluetooth()
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  // 3.搜索蓝牙
  startSearchBluetooth() {
    let _this = this
    wx.showLoading({
      title: '蓝牙搜索中'
    })
    wx.startBluetoothDevicesDiscovery({
      services: [],
      success: res => {
        wx.onBluetoothDeviceFound(res => {
          if (res.devices[0].name == _this.data.device_name) {
            _this.data.device_id = res.devices[0].deviceId
            wx.stopBluetoothDevicesDiscovery({
              success: res => {
                // 连接设备
                _this.connectDevice()
              }
            })
          }
        })
      }
    })
  },
  // 4.连接设备
  connectDevice() {
    let _this = this
    wx.createBLEConnection({
      deviceId: _this.data.device_id,
      success: () => {
        _this.getDeveiceServices()
      }
    })
  },
  // 5.搜索设备服务
  getDeveiceServices() {
    let _this = this
    wx.getBLEDeviceServices({
      deviceId: _this.data.device_id,
      success: res => {
        _this.data.service_id = res.services[1].uuid
        _this.getDeviceCharacteristics()
      }
    })
  },
  // 6.获取服务特征值
  getDeviceCharacteristics() {
    let _this = this
    wx.getBLEDeviceCharacteristics({
      deviceId: _this.data.device_id,
      serviceId: _this.data.service_id,
      success: res => {
        _this.data.write_id = res.characteristics[0].uuid
        _this.data.notify_id = res.characteristics[1].uuid
        _this.openNotify()
      }
    })
  },
  // 7.开启notify,监听特征值变化
  openNotify() {
    let _this = this
    wx.notifyBLECharacteristicValueChange({
      state: true,
      deviceId: _this.data.device_id,
      serviceId: _this.data.service_id,
      characteristicId: _this.data.notify_id,
      success: res => {
        wx.hideToast({
          title: `蓝牙连接成功`
        })
        setTimeout(function() {
          wx.hideToast()
        }, 2000)
      }
    })
  },
  //  接收蓝牙数据
  showBluetoothData(callback) {
    wx.onBLECharacteristicValueChange(res => {
      let msg = this.ab2hex(res.value).toUpperCase()
      callback && callback(msg)
    })
  },
  // 关闭蓝牙
  closeBluetooth() {
    wx.closeBLEConnection({
      deviceId: this.data.device_id,
      success: res => {
        wx.closeBluetoothAdapter({
          success: res => {
            console.log(res)
          }
        })
      }
    })
  },
  //  向蓝牙中写入数据
  writeCharacteristicValue(msg) {
    let _this = this
    let buffer = _this.hexStringToArrayBuffer(msg)
    wx.writeBLECharacteristicValue({
      deviceId: _this.data.device_id,
      serviceId: _this.data.service_id,
      characteristicId: _this.data.write_id,
      value: buffer,
      success: res => {},
      fail: err => {
        console.log(err)
      }
    })
  },
  // ArrayBuffer解析出16进制
  ab2hex(buffer) {
    let hexArr = Array.prototype.map.call(new Uint8Array(buffer), function(
      bit
    ) {
      return ('00' + bit.toString(16)).slice(-2)
    })
    return hexArr.join('')
  },
  // 16进制数据转ArrayBuffer
  hexStringToArrayBuffer(arr) {
    let str = this.handleCheckBit(arr)
    console.log(`发送的指令---${str}`)
    let buffer = new ArrayBuffer(str.length)
    let dataView = new DataView(buffer)
    let ind = 0
    for (var i = 0, len = str.length; i < len; i += 2) {
      let code = parseInt(str.substr(i, 2), 16)
      dataView.setUint8(ind, code)
      ind++
    }
    return buffer
  },
  // 断开蓝牙
  closeConnect() {
    let _this = this
    wx.closeBLEConnection({
      deviceId: _this.data.device_id,
      success: res => {
        console.log(`蓝牙断开成功`)
      }
    })
  }
}
export default bleApi
