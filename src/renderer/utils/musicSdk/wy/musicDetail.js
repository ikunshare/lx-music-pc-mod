import { httpFetch } from '../../request'
import { weapi } from './utils/crypto'
import { formatPlayTime, sizeFormate } from '../../index'

export default {
  getSinger(singers) {
    try {
      const arr = singers.map(singer => singer.name)
      return arr.join('、')
    } catch (err) {
      console.error('getSinger error:', err)
      return ''
    }
  },

  async fetchSongDetails(songId) {
    try {
      const requestObj = httpFetch(`https://music.163.com/api/song/music/detail/get?songId=${songId}`, {
        method: 'get',
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)',
          origin: 'https://music.163.com',
        },
      })

      const { body, statusCode } = await requestObj.promise
      if (statusCode !== 200 || body.code !== 200) throw new Error('获取歌曲音质信息失败')

      return body
    } catch (err) {
      console.error('Error fetching song details:', err)
      return null
    }
  },

  async filterList({ songs, privileges }) {
    try {
      const list = await Promise.all(
        songs.map(async(item, index) => {
          const types = []
          const _types = {}
          let size
          let privilege = privileges[index]

          if (privilege.id !== item.id) {
            privilege = privileges.find(p => p.id === item.id)
          }

          if (!privilege) return

          const songDetails = await this.fetchSongDetails(privilege.id)
          if (songDetails) {
            const jmSize = songDetails.data.jm?.size
            if (jmSize) {
              size = sizeFormate(jmSize)
              types.push({ type: 'master', size })
              _types.master = { size }
            }

            if (privilege.maxBrLevel === 'hires') {
              size = item.hr ? sizeFormate(item.hr.size) : null
              types.push({ type: 'flac24bit', size })
              _types.flac24bit = { size }
            }

            switch (privilege.maxbr) {
              case 999000:
                size = item.sq ? sizeFormate(item.sq.size) : null
                types.push({ type: 'flac', size })
                _types.flac = { size }
              case 320000:
                size = item.h ? sizeFormate(item.h.size) : null
                types.push({ type: '320k', size })
                _types['320k'] = { size }
              case 192000:
              case 128000:
                size = item.l ? sizeFormate(item.l.size) : null
                types.push({ type: '128k', size })
                _types['128k'] = { size }
            }

            types.reverse()
          }

          const song = {
            singer: this.getSinger(item.ar),
            name: item.name ?? '',
            albumName: item.al?.name,
            albumId: item.al?.id,
            source: 'wy',
            interval: formatPlayTime(item.dt / 1000),
            songmid: item.id,
            img: item.al?.picUrl,
            lrc: null,
            otherSource: null,
            types,
            _types,
            typeUrl: {},
          }

          return song
        }),
      )

      return list.filter(item => item !== undefined)
    } catch (err) {
      console.error('filterList error:', err)
      return []
    }
  },

  async getList(ids = [], retryNum = 0) {
    if (retryNum > 2) return Promise.reject(new Error('try max num'))

    try {
      const requestObj = httpFetch('https://music.163.com/weapi/v3/song/detail', {
        method: 'post',
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
          origin: 'https://music.163.com',
        },
        form: weapi({
          c: '[' + ids.map(id => `{"id":${id}}`).join(',') + ']',
          ids: '[' + ids.join(',') + ']',
        }),
      })

      const { body, statusCode } = await requestObj.promise
      if (statusCode !== 200 || body.code !== 200) throw new Error('获取歌曲详情失败')

      const result = await this.filterList(body)
      return { source: 'wy', list: result }
    } catch (err) {
      console.error('getList error:', err)
      if (retryNum < 2) {
        return this.getList(ids, retryNum + 1)
      } else {
        throw new Error('Failed after retrying')
      }
    }
  },
}
