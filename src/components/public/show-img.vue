<template>
  <el-dialog title="日志图片" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <div style="text-align: center; overflow-x: hidden;">
      <img :src="parentImgurl" height="380" alt="">
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default{
  props: ['parentDialog', 'parentImgurl'],
  data () {
    return {

    }
  },
  created () {

  },
  methods: {
    // 关闭
    closeClick () {
      this.$emit('parentClose')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
