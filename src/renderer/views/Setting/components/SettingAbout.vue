<template lang="pug">
dt#about {{ $t('setting__about') }}
dd
  .p.small
    | 本软件完全免费，代码已开源，开源地址：
    span.hover.underline(:aria-label="$t('setting__click_open')" @click="openUrl('https://github.com/ikunshare/ikun-music-desktop#readme')") https://github.com/ikunshare/ikun-music-desktop
  .p.small
    | 最新版网盘下载地址（网盘内有Windows、Android版）：
    span.hover.underline(:aria-label="$t('setting__click_open')" @click="openUrl('https://www.lanzoui.com/s/LXMusic')") 网盘地址
    | &nbsp;&nbsp;密码：
    span.hover(:aria-label="$t('setting__click_copy')" @click="clipboardWriteText('LXMusicMod')") LXMusicMod
  .p.small
    | 仍有问题可加Telegram群组&nbsp;
    span.hover(:aria-label="$t('setting__click_open')" @click="openUrl('https://t.me/ikunshare_qun')") 点击加入
    | &nbsp;反馈
    strong (为了群主和管理的寿命，入群先看群公告)

  br
  .p.small 由于软件开发的初衷仅是为了对新技术的学习与研究，因此软件直至停止维护都将会一直保持纯净。
  .p.small
    | 目前本项目的原始发布地址只有&nbsp;
    strong GitHub
    | &nbsp;及&nbsp;
    strong 蓝奏网盘
    | &nbsp;，其他渠道均为第三方转载发布，可信度请自行鉴别。
  .p 本项目无微信公众号之类的官方账号，谨防被骗。
</template>

<script>
// import { ref, onBeforeUnmount } from '@common/utils/vueTools'
import { isShowPact } from '@renderer/store'
import { openUrl, clipboardWriteText } from '@common/utils/electron'

export default {
  name: 'SettingAbout',
  setup() {
    const handleShowPact = () => {
      isShowPact.value = true
    }
    return {
      openUrl,
      clipboardWriteText,
      handleShowPact,
    }
  },
}
</script>
