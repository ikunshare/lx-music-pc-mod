import { httpFetch } from '../../request'
import { decodeLyric, lrcTools } from './util'
import { decodeName } from '../../index'

const buf_key = Buffer.from('yeelion')
const buf_key_len = buf_key.length
const buildParams = (id, isGetLyricx) => {
  let params = `user=12345,web,web,web&requester=localhost&req=1&rid=MUSIC_${id}`
  if (isGetLyricx) params += '&lrcx=1'
  const buf_str = Buffer.from(params)
  const buf_str_len = buf_str.length
  const output = new Uint16Array(buf_str_len)
  let i = 0
  while (i < buf_str_len) {
    let j = 0
    while (j < buf_key_len && i < buf_str_len) {
      output[i] = buf_key[j] ^ buf_str[i]
      i++
      j++
    }
  }
  return Buffer.from(output).toString('base64')
}

const timeExp = /^\[([\d:.]*)\]{1}/g
const existTimeExp = /\[\d{1,2}:.*\d{1,4}\]/
const lyricxTag = /^<-?\d+,-?\d+>/
export default {
  sortLrcArr(arr) {
    const lrcSet = new Set()
    let lrc = []
    let lrcT = []

    let isLyricx = false
    for (const item of arr) {
      if (lrcSet.has(item.time)) {
        if (lrc.length < 2) continue
        const tItem = lrc.pop()
        tItem.time = lrc[lrc.length - 1].time
        lrcT.push(tItem)
        lrc.push(item)
      } else {
        lrc.push(item)
        lrcSet.add(item.time)
      }
      if (!isLyricx && lyricxTag.test(item.text)) isLyricx = true
    }

    if (!isLyricx && lrcT.length > lrc.length * 0.3 && lrc.length - lrcT.length > 6) {
      throw new Error('failed')
    }

    return {
      lrc,
      lrcT,
    }
  },
  transformLrc(tags, lrclist) {
    return `${tags.join('\n')}\n${lrclist ? lrclist.map(l => `[${l.time}]${l.text}\n`).join('') : '暂无歌词'}`
  },
  parseLrc(lrc) {
    const lines = lrc.split(/\r\n|\r|\n/)
    let tags = []
    let lrcArr = []
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      let result = timeExp.exec(line)
      if (result) {
        const text = line.replace(timeExp, '').trim()
        let time = RegExp.$1
        if (/\.\d\d$/.test(time)) time += '0'
        lrcArr.push({
          time,
          text,
        })
      } else if (lrcTools.rxps.tagLine.test(line)) {
        tags.push(line)
      }
    }
    const lrcInfo = this.sortLrcArr(lrcArr)
    return {
      lyric: decodeName(this.transformLrc(tags, lrcInfo.lrc)),
      tlyric: lrcInfo.lrcT.length ? decodeName(this.transformLrc(tags, lrcInfo.lrcT)) : '',
    }
  },
  getLyric(musicInfo, isGetLyricx = true) {
    // this.getLyric2(musicInfo)
    const requestObj = httpFetch(`http://newlyric.kuwo.cn/newlyric.lrc?${buildParams(musicInfo.songmid, isGetLyricx)}`)
    requestObj.promise = requestObj.promise.then(({ statusCode, body, raw }) => {
      if (statusCode != 200) return Promise.reject(new Error(JSON.stringify(body)))
      return decodeLyric({ lrcBase64: raw.toString('base64'), isGetLyricx }).then(base64Data => {
        let lrcInfo
        // console.log(Buffer.from(base64Data, 'base64').toString())
        try {
          lrcInfo = this.parseLrc(Buffer.from(base64Data, 'base64').toString())
        } catch (err) {
          return Promise.reject(new Error('Get lyric failed'))
        }
        // console.log(lrcInfo)
        if (lrcInfo.tlyric) lrcInfo.tlyric = lrcInfo.tlyric.replace(lrcTools.rxps.wordTimeAll, '')
        try {
          lrcInfo.lxlyric = lrcTools.parse(lrcInfo.lyric)
        } catch {
          lrcInfo.lxlyric = ''
        }
        lrcInfo.lyric = lrcInfo.lyric.replace(lrcTools.rxps.wordTimeAll, '')
        if (!existTimeExp.test(lrcInfo.lyric)) return Promise.reject(new Error('Get lyric failed'))
        // console.log(lrcInfo)
        return lrcInfo
      })
    })
    return requestObj
  },
}
