import apiSourceInfo from './api-source-info'
import { apiSource, userApi } from '@renderer/store'
import api_ikun_zj_tx from './tx/api-ikun'
import api_ikun_zj_kg from './kg/api-ikun'
import api_ikun_zj_kw from './kw/api-ikun'
// import api_ikun_zj_mg from './mg/api-ikun'
import api_ikun_zj_wy from './wy/api-ikun'
// import api_ikun_cf_tx from './tx/api-ikun_us'
// import api_ikun_cf_kg from './kg/api-ikun_us'
// import api_ikun_cf_wy from './wy/api-ikun_us'

const allApi = {
  ikun_zj_tx: api_ikun_zj_tx,
  ikun_zj_kg: api_ikun_zj_kg,
  ikun_zj_kw: api_ikun_zj_kw,
  // ikun_zj_mg: api_ikun_zj_mg,
  ikun_zj_wy: api_ikun_zj_wy,
  // ikun_cf_tx: api_ikun_cf_tx,
  // ikun_cf_kg: api_ikun_cf_kg,
  // ikun_cf_wy: api_ikun_cf_wy,
}

const apiList = {}
const supportQuality = {}

for (const api of apiSourceInfo) {
  supportQuality[api.id] = api.supportQualitys
  for (const source of Object.keys(api.supportQualitys)) {
    apiList[`${api.id}_api_${source}`] = allApi[`${api.id}_${source}`]
  }
}

const getAPI = source => apiList[`${apiSource.value}_api_${source}`]

const apis = source => {
  if (/^user_api/.test(apiSource.value)) return userApi.apis[source]
  let api = getAPI(source)
  if (api) return api
  throw new Error('Api is not found')
}

export { apis, supportQuality }
