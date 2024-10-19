// Support qualitys: 128k 320k flac wav

const sources: Array<{
  id: string
  name: string
  disabled: boolean
  supportQualitys: Partial<Record<LX.OnlineSource, LX.Quality[]>>
}> = [
  {
    id: 'ikun_zj',
    name: 'ikun公益音源',
    disabled: false,
    supportQualitys: {
      kw: ['128k', '320k', 'flac', 'flac24bit'],
      kg: ['128k', '320k', 'flac', 'flac24bit'],
      tx: ['128k', '320k', 'flac', 'flac24bit', 'master'],
      wy: ['128k', '320k', 'flac', 'flac24bit', 'master'],
    },
  },
  // {
  // id: 'ikun_cf',
  // name: 'ikun公益音源（美国Cloudflare节点）',
  // disabled: false,
  // supportQualitys: {
  // kg: ['128k', '320k', 'flac', 'flac24bit', 'master'],
  // tx: ['128k', '320k', 'flac', 'flac24bit', 'master'],
  // wy: ['128k', '320k', 'flac', 'flac24bit', 'master'],
  // },
  // },
]

export default sources
