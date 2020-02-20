<template>
  <div class="orange-module">
    <h3 class="module-title">请选择机构类型</h3>
    <div class="types">
      <a href="javascript:void(0);" class="item" @click="typeClick(2)" v-show="firm">
        <img src="../../assets/images/firm.png" alt="">
        <p class="txt">分公司</p>
      </a>
      <a href="javascript:void(0);" class="item" @click="typeClick(3)" v-show="project">
        <img src="../../assets/images/project.png" alt="">
        <p class="txt">项目</p>
      </a>
      <a href="javascript:void(0);" class="item" @click="typeClick(4)" v-show="sector">
        <img src="../../assets/images/sector.png" alt="">
        <p class="txt">部门</p>
      </a>
    </div>
  </div>
</template>

<script>
export default{
  props: ['parentOrgType'],
  data () {
    return {
      client: false,
      firm: false,
      project: false,
      sector: false
    }
  },
  created () {

  },
  mounted () {
    const type = this.parentOrgType
    if (type === 0) {
      this.client = true
      this.firm = false
      this.project = false
      this.sector = true
    } else if (type === 1) {
      this.client = false
      this.firm = true
      this.project = true
      this.sector = true
    } else if (type === 2) {
      this.client = false
      this.firm = false
      this.project = true
      this.sector = true
    } else if (type === 3) {
      this.client = false
      this.firm = false
      this.project = false
      this.sector = true
    } else {
      this.client = false
      this.firm = false
      this.project = false
      this.sector = false
    }
  },
  methods: {
    typeClick (type) {
      this.$emit('parentUpType', type)
    }
  },
  watch: {
    parentModType (val, oldVal) {
      if (val === 1) {
        const type = this.parentOrgType
        if (type === 0) {
          this.client = true
          this.firm = false
          this.project = false
          this.sector = true
        } else if (type === 1) {
          this.client = false
          this.firm = true
          this.project = true
          this.sector = true
        } else if (type === 2) {
          this.client = false
          this.firm = false
          this.project = true
          this.sector = true
        } else if (type === 3) {
          this.client = false
          this.firm = false
          this.project = false
          this.sector = true
        } else {
          this.client = false
          this.firm = false
          this.project = false
          this.sector = false
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .orange-module {
    width: 600px;
    margin: 0 auto;
    .module-title{
      height: 60px;
      text-align: center;
      line-height: 60px;
      font-size: 16px;
      font-weight: 600;
    }
    .types{
      padding: 20px;
      text-align: center;
      font-size: 0;
      .item{
        display: inline-block;
        width: 120px;
        padding: 10px 0;
        border-top: 1px solid #cccccc;
        border-left: 1px solid #cccccc;
        border-bottom: 1px solid #cccccc;
        img{
          text-align: center;
        }
        .txt{
          line-height: 30px;
          font-size: 14px;
          color: #333333;
          text-align: center;
        }
        &:last-of-type{
          border-right: 1px solid #cccccc;
        }
      }
    }
  }
</style>
